// routes/exams.js
import express from "express";
import Exam from "../models/Exam.js";
const router = express.Router();

// Get all exams
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find().populate("questions");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// Create exam
router.post("/", async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: "Failed to create exam" });
  }
});

export default router;
