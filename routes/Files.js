// routes/files.js
import express from "express";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import multer from "multer";
import { Readable } from "stream";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

let gfsBucket;
mongoose.connection.on("open", () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

/**
 * Upload file to GridFS
 * returns { success: true, fileId, filename, contentType }
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!gfsBucket) return res.status(500).json({ error: "GridFS not initialized" });

    const readable = Readable.from(req.file.buffer);
    const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: req.body.metadata || {},
    });

    readable.pipe(uploadStream)
      .on("error", (err) => {
        console.error("GridFS upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      })
      .on("finish", (file) => {
        res.json({
          success: true,
          fileId: file._id,
          filename: file.filename,
          contentType: file.contentType,
        });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// List GridFS files
router.get("/", async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const files = await gfsBucket.find().toArray();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Download file by id
router.get("/:id", async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const files = await gfsBucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: "File not found" });

    res.set("Content-Type", files[0].contentType || "application/octet-stream");
    gfsBucket.openDownloadStream(objectId).pipe(res);
  } catch (err) {
    console.error("File download error:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Delete file
router.delete("/:id", async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).json({ error: "GridFS not initialized" });
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    await gfsBucket.delete(objectId);
    res.json({ success: true });
  } catch (err) {
    console.error("GridFS delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
