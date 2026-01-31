import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserModel } from "../models/User";
import { signToken } from "../utils/jwt";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(200)
});

const loginSchema = z.object({
  login: z.string().min(1), // email OR username
  password: z.string().min(1)
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { email, username, password } = parsed.data;

  const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(409).json({ error: "Email or username already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, username, passwordHash });

  const token = signToken({ userId: String(user._id) });
  res.status(201).json({
    token,
    user: { id: String(user._id), email: user.email, username: user.username }
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { login, password } = parsed.data;

  const user = await UserModel.findOne({
    $or: [{ email: login.toLowerCase() }, { username: login }]
  });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ userId: String(user._id) });
  res.json({
    token,
    user: { id: String(user._id), email: user.email, username: user.username }
  });
});

export default router;
