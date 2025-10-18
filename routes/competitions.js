// routes/competitions.js
import express from "express";
import CompetitionResult from "../models/Competitionresult.js";

const router = express.Router();

// Submit score
router.post("/submit", async (req, res) => {
  try {
    const { quizId, groupId, score } = req.body;
    if (!quizId || !groupId || score === undefined) {
      return res.status(400).json({ error: "quizId, groupId, and score required" });
    }

    const result = new CompetitionResult({ quizId, groupId, score });
    await result.save();

    res.json({ message: "Score submitted successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

// Leaderboard
router.get("/leaderboard/:quizId", async (req, res) => {
  try {
    const results = await CompetitionResult.find({ quizId: req.params.quizId })
      .sort({ score: -1 })
      .populate("groupId", "name"); // if groupId is ObjectId
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
