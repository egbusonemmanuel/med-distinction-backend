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
import flashcardRoutes from "./routes/Flashcards.js";

import Leaderboard from "./models/Leaderboard.js";
import Group from "./models/Group.js";
import profileRoutes from "./routes/Profile.js";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(helmet());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin: [
      "https://med-learn-frontend.vercel.app",
      "https://med-learn.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));
app.use("/api/profile", profileRoutes);


// =====================
// MongoDB
// =====================
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/medlearn";
let gridFSBucket = null;

mongoose.connect(mongoURI).catch((err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  gridFSBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("✅ MongoDB connected & GridFS ready");
});

// =====================
// File Upload (GridFS)
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
  } catch {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// =====================
// Other Routes
// =====================
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/flashcards", flashcardRoutes);

// Leaderboard + Groups
app.get("/api/leaderboard", async (_, res) => res.json(await Leaderboard.find().sort({ xp: -1 })));
app.get("/api/groups", async (_, res) => res.json(await Group.find()));

// =====================
// Cohere AI
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
// Get Library Files (GridFS)
// =====================
app.get("/api/library", async (req, res) => {
  try {
    if (!gridFSBucket) return res.status(500).json({ error: "GridFS not initialized" });

    // List all files in the uploads bucket
    const files = await gridFSBucket.find().toArray();

    if (!files || files.length === 0) {
      return res.status(200).json([]); // no files uploaded yet
    }

    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
      uploadDate: file.uploadDate,
      id: file._id,
      url: `/api/library/file/${file._id}`, // download URL
    }));

    res.status(200).json(formattedFiles);
  } catch (error) {
    console.error("❌ Error fetching library files:", error);
    res.status(500).json({ error: "Failed to fetch library files" });
  }
});

// =====================
// Download/Stream File
// =====================
app.get("/api/library/file/:id", async (req, res) => {
  try {
    if (!gridFSBucket) return res.status(500).json({ error: "GridFS not initialized" });

    const { ObjectId } = await import("mongodb");
    const fileId = new ObjectId(req.params.id);

    const fileCursor = await gridFSBucket.find({ _id: fileId }).toArray();
    if (fileCursor.length === 0) return res.status(404).json({ error: "File not found" });

    const file = fileCursor[0];
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = gridFSBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});



// =====================
// Serve Frontend (for Railway)
// =====================
//const distPath = path.join(process.cwd(), "dist");

// Serve static frontend files
//app.use(express.static(distPath));

// Catch-all route for SPA (React Router)
//app.use((req, res) => {
//  res.sendFile(path.join(distPath, "index.html"));});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
