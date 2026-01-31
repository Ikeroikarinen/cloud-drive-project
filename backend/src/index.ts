import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import docsRouter from "./routes/documents";
import publicRouter from "./routes/public";



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/docs", docsRouter);
app.use("/api/public", publicRouter);



app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env");
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
import { requireAuth } from "./middleware/auth";

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ ok: true, userId: (req as any).userId });
});
