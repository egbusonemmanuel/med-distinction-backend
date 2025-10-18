import express from "express";
import Course from "../models/Course.js";
import { CohereClient } from "cohere-ai";

const router = express.Router();

// ✅ Initialize Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// =====================
// GET all courses
// =====================
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// =====================
// POST generate course with Cohere AI
// =====================
router.post("/generate", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    console.log(`🧠 Generating course for topic: ${topic}`);

    const modelCandidates = [
      "command-r-plus-08-2024",
      "command-light-08-2024",
      "c4ai-aya-23-08",
    ];

    let reply = "";
    let success = false;
    let errorMsg = "";

    for (const model of modelCandidates) {
      try {
        console.log(`🧩 Trying model: ${model}`);
        const response = await cohere.chat({
          model,
          message: `Generate a structured medical course on "${topic}".
          The response must include:
          - Title
          - Category
          - Description
          Make it detailed, professional, and formatted for medical education.`,
          temperature: 0.7,
        });

        reply =
          response?.message?.content?.[0]?.text ||
          response?.text ||
          "⚠️ No AI response received.";

        success = true;
        break;
      } catch (err) {
        console.warn(`⚠️ Model ${model} failed: ${err.body?.message || err.message}`);
        errorMsg = err.body?.message || err.message;
      }
    }

    if (!success) {
      throw new Error(`All models failed. Last error: ${errorMsg}`);
    }

    const lines = reply.split("\n").filter(Boolean);
    const title =
      lines.find((l) => l.toLowerCase().includes("title"))?.split(":")[1]?.trim() ||
      topic;
    const category =
      lines.find((l) => l.toLowerCase().includes("category"))?.split(":")[1]?.trim() ||
      "General Medicine";
    const description =
      lines.find((l) => l.toLowerCase().includes("description"))?.split(":")[1]?.trim() ||
      reply;

    // 🗑 Delete all previous courses
    await Course.deleteMany({});

    // Create and save new course
    const newCourse = new Course({
      title,
      category,
      description,
      content: reply,
    });
    await newCourse.save();

    console.log("✅ Course generated and saved:", newCourse.title);

    res.json({
      success: true,
      course: newCourse,
    });
  } catch (err) {
    console.error("❌ Cohere Chat API error:", err);
    res.status(500).json({
      error:
        err.body?.message ||
        err.message ||
        "AI course generation failed. Try again later.",
    });
  }
});

// =====================
// GET single course by ID
// =====================
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("❌ Error fetching single course:", err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// =====================
// DELETE a course by ID ✅
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log(`🗑️ Course deleted: ${course.title}`);

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;

