import { Router } from "express";
import { DocumentModel } from "../models/Document";

const router = Router();

// GET /api/public/:token  -> read-only view
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  const doc = await DocumentModel.findOne({ publicToken: token, isPublic: true })
    .select("_id title content createdAt updatedAt");

  if (!doc) return res.status(404).json({ error: "Not found" });

  res.json(doc);
});

export default router;
