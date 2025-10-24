// =====================
// Load env variables first
// =====================
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";
import multer from "multer";
import { CohereClient } from "cohere-ai";

import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import quizRoutes from "./routes/quizzes.js";
import competitionRoutes from "./routes/competitions.js";
import examRoutes from "./routes/exams.js";
import courseRoutes from "./routes/courses.js";
import flashcardRoutes from "./routes/flashcards.js";

import profileRoutes from "./routes/Profile.js";
import Leaderboard from "./models/Leaderboard.js";
import Group from "./models/Group.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

// =====================
// Middleware
// =====================
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// =====================
// CORS Configuration
// =====================
const allowedOrigins = [
  "https://med-distinction-frontend-production-e171.up.railway.app",
  "http://localhost:5173",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// =====================
// MongoDB & GridFS
// =====================
const mongoURI = process.env.MONGO_URI;
let gridFSBucket = null;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

mongoose.connection.once("open", () => {
  gridFSBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
  console.log("✅ GridFS ready");
});

// =====================
// File Upload
// =====================
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/library/upload", upload.single("file"), async (req, res) => {
  try {
    if (!gridFSBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = gridFSBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    readableStream.pipe(uploadStream).on("finish", () =>
      res.json({ message: "File uploaded successfully", id: uploadStream.id })
    );
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

app.get("/api/library", async (req, res) => {
  try {
    if (!gridFSBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const files = await gridFSBucket.find().toArray();
    if (!files.length) return res.json([]);
    const formattedFiles = files.map(file => ({
      filename: file.filename,
      contentType: file.contentType,
      uploadDate: file.uploadDate,
      id: file._id,
      url: `/api/library/file/${file._id}`,
    }));
    res.json(formattedFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch library files" });
  }
});

app.get("/api/library/file/:id", async (req, res) => {
  try {
    if (!gridFSBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const { ObjectId } = await import("mongodb");
    const fileId = new ObjectId(req.params.id);
    const fileCursor = await gridFSBucket.find({ _id: fileId }).toArray();
    if (!fileCursor.length) return res.status(404).json({ error: "File not found" });
    const file = fileCursor[0];
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);
    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// =====================
// AI (Cohere)
// =====================
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const response = await cohere.chat({
      model: "command-r",
      message: prompt,
      temperature: 0.7,
    });
    const reply = response?.message?.content?.[0]?.text || "⚠️ No AI response generated.";
    res.json({ success: true, reply });
  } catch (err) {
    console.error("❌ Cohere API Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// =====================
// API Routes
// =====================
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/leaderboard", async (_, res) => res.json(await Leaderboard.find().sort({ xp: -1 })));
app.get("/api/groups", async (_, res) => res.json(await Group.find()));

// =====================
// Serve React Frontend
// =====================
const frontendBuildPath = path.join(__dirname, "frontend", "dist"); // or "build" if using create-react-app
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});
