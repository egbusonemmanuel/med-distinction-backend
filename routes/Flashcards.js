import express from "express";
import Flashcard from "../models/Flashcard.js";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const cards = await Flashcard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch {
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { front, back, topic, color } = req.body;
    const card = new Flashcard({ front, back, topic, color });
    await card.save();
    res.status(201).json(card);
  } catch {
    res.status(500).json({ error: "Failed to add flashcard" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete flashcard" });
  }
});

export default router;
