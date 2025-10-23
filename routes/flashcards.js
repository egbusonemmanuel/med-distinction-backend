// backend/routes/flashcards.js
import express from "express";
import Flashcard from "../models/Flashcard.js"; // Adjust if your model path is different

const router = express.Router();

// GET all flashcards, sorted by newest first
router.get("/", async (req, res) => {
  try {
    const cards = await Flashcard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    console.error("Error fetching flashcards:", err);
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

// POST a new flashcard
router.post("/", async (req, res) => {
  try {
    const { front, back, topic, color } = req.body;
    const card = new Flashcard({ front, back, topic, color });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    console.error("Error adding flashcard:", err);
    res.status(500).json({ error: "Failed to add flashcard" });
  }
});

// DELETE a flashcard by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Flashcard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Flashcard not found" });
    res.json({ message: "Flashcard deleted successfully" });
  } catch (err) {
    console.error("Error deleting flashcard:", err);
    res.status(500).json({ error: "Failed to delete flashcard" });
  }
});

export default router;
