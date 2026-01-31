import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import crypto from "crypto";
import { DocumentModel } from "../models/Document";
import { UserModel } from "../models/User";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

const LOCK_TTL_MS = 10 * 60 * 1000;

function asString(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

function mustUserId(req: AuthedRequest): string {
  const id = asString((req as any).userId);
  if (!id) throw new Error("Missing userId (auth middleware?)");
  return id;
}

function param(req: AuthedRequest, key: string): string {
  return asString((req.params as any)[key]);
}

function isValidId(id: string) {
  return mongoose.isValidObjectId(id);
}

function lockExpired(lockedAt: Date | null | undefined) {
  if (!lockedAt) return true;
  return Date.now() - lockedAt.getTime() > LOCK_TTL_MS;
}

const createSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().optional()
});

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  content: z.string().optional()
});

const shareSchema = z.object({
  isPublic: z.boolean()
});

const addEditorSchema = z.object({
  email: z.string().email()
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const ownerId = mustUserId(req);

  const doc = await DocumentModel.create({
    ownerId,
    title: parsed.data.title,
    content: parsed.data.content ?? "",
    editorIds: [],
    isPublic: false,
    publicToken: null,
    lockedBy: null,
    lockedAt: null
  });

  res.status(201).json(doc);
});

router.get("/", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);

  const docs = await DocumentModel.find({
    $or: [{ ownerId: userId }, { editorIds: userId }]
  })
    .select("_id title ownerId createdAt updatedAt isPublic publicToken")
    .sort({ updatedAt: -1 });

  res.json(docs);
});

router.get("/:id", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  const isEditor = (doc.editorIds ?? []).map(String).includes(userId);

  if (!isOwner && !isEditor) return res.status(403).json({ error: "No access" });

  res.json(doc);
});

router.patch("/:id", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  const isEditor = (doc.editorIds ?? []).map(String).includes(userId);
  if (!isOwner && !isEditor) return res.status(403).json({ error: "No access" });

  if (doc.lockedBy && String(doc.lockedBy) !== userId && !lockExpired(doc.lockedAt)) {
    return res.status(409).json({
      error: "Document is being edited by another user",
      lockedBy: String(doc.lockedBy),
      lockedAt: doc.lockedAt
    });
  }

  if (parsed.data.title !== undefined) doc.title = parsed.data.title;
  if (parsed.data.content !== undefined) doc.content = parsed.data.content;

  await doc.save();
  res.json(doc);
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  if (!isOwner) return res.status(403).json({ error: "Only owner can delete" });

  await doc.deleteOne();
  res.json({ ok: true });
});

router.post("/:id/share", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = shareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  if (!isOwner) return res.status(403).json({ error: "Only owner can share" });

  doc.isPublic = parsed.data.isPublic;

  if (doc.isPublic && !doc.publicToken) {
    doc.publicToken = crypto.randomBytes(16).toString("hex");
  }

  await doc.save();
  res.json({ isPublic: doc.isPublic, publicToken: doc.publicToken });
});

router.post("/:id/editors", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = addEditorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  if (!isOwner) return res.status(403).json({ error: "Only owner can manage editors" });

  const target = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
  if (!target) return res.status(404).json({ error: "User not found" });

  const targetId = String(target._id);
  if (targetId === userId) return res.status(400).json({ error: "Owner already has access" });

  const current = (doc.editorIds ?? []).map(String);
  if (!current.includes(targetId)) {
    doc.editorIds.push(target._id);
    await doc.save();
  }

  res.json({ ok: true, editorIds: doc.editorIds.map(String) });
});

router.delete("/:id/editors/:editorId", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");
  const editorId = param(req, "editorId");

  if (!isValidId(id) || !isValidId(editorId)) return res.status(400).json({ error: "Invalid id" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  if (!isOwner) return res.status(403).json({ error: "Only owner can manage editors" });

  doc.editorIds = (doc.editorIds ?? []).filter((x: any) => String(x) !== editorId);
  await doc.save();

  res.json({ ok: true, editorIds: doc.editorIds.map(String) });
});

router.post("/:id/lock", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  const isEditor = (doc.editorIds ?? []).map(String).includes(userId);
  if (!isOwner && !isEditor) return res.status(403).json({ error: "No access" });

  if (doc.lockedBy && String(doc.lockedBy) !== userId && !lockExpired(doc.lockedAt)) {
    return res.status(409).json({
      error: "Document is being edited by another user",
      lockedBy: String(doc.lockedBy),
      lockedAt: doc.lockedAt
    });
  }

  doc.lockedBy = new mongoose.Types.ObjectId(userId);
  doc.lockedAt = new Date();
  await doc.save();

  res.json({ ok: true, lockedBy: String(doc.lockedBy), lockedAt: doc.lockedAt });
});

router.post("/:id/unlock", async (req: AuthedRequest, res) => {
  const userId = mustUserId(req);
  const id = param(req, "id");

  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const doc = await DocumentModel.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = String(doc.ownerId) === userId;
  const isLocker = doc.lockedBy && String(doc.lockedBy) === userId;
  if (!isOwner && !isLocker) return res.status(403).json({ error: "No permission to unlock" });

  doc.lockedBy = null;
  doc.lockedAt = null;
  await doc.save();

  res.json({ ok: true });
});

export default router;
