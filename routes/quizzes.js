// =====================
// Imports
// =====================
import express from "express";
import multer from "multer";
import PDFParser from "pdf2json";
import { CohereClient } from "cohere-ai";
import Quiz from "../models/Quiz.js";

// =====================
// Initialize
// =====================
const router = express.Router();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// =====================
// Multer setup (store file in memory)
// =====================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// =====================
// Generate quiz from uploaded PDF
// =====================
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create a new PDFParser instance
    const pdfParser = new PDFParser();

    // Define handler when PDF is ready
    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        // Extract text content from each page
        const pdfText = pdfData.formImage.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n");

        // Keep text within Cohere’s input limit
        const text = pdfText.slice(0, 5000);

        // Build Cohere prompt
        const prompt = `
          You are a medical learning assistant.
          Based on the following text, generate 5 multiple-choice quiz questions.
          Each question must have:
          - A clear question
          - Four options (A, B, C, D)
          - The correct answer indicated
          Format the output strictly as JSON like this:
          [
            {
              "question": "...",
              "options": ["A...", "B...", "C...", "D..."],
              "answer": "A"
            }
          ]

          Text:
          ${text}
        `;

        // Generate with Cohere
        const response = await cohere.generate({
          model: "command-r-plus",
          prompt,
          max_tokens: 800,
          temperature: 0.7,
        });

        const aiOutput = response.generations[0].text.trim();

        // Parse AI response safely
        let quizData;
        try {
          quizData = JSON.parse(aiOutput);
        } catch (err) {
          console.error("⚠️ AI output not valid JSON:", aiOutput);
          return res.status(500).json({
            error: "AI returned invalid JSON format. Please try again.",
          });
        }

        // Save quiz to MongoDB
        const newQuiz = new Quiz({
          title: req.file.originalname.replace(".pdf", ""),
          questions: quizData,
        });
        await newQuiz.save();

        res.json({ success: true, quiz: newQuiz });
      } catch (err) {
        console.error("❌ Error processing PDF:", err);
        res.status(500).json({ error: "Failed to process PDF file" });
      }
    });

    // Handle PDF parse error
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF parsing error:", errData.parserError);
      res.status(500).json({ error: "Error reading PDF file" });
    });

    // Start parsing from buffer
    pdfParser.parseBuffer(req.file.buffer);
  } catch (err) {
    console.error("❌ Error generating quiz:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// =====================
// Get all quizzes
// =====================
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error("❌ Error fetching quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// =====================
// Get a single quiz by ID
// =====================
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json({ quiz });
  } catch (err) {
    console.error("❌ Error fetching quiz:", err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

export default router;
