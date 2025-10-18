// routes/leaderboard.js
import express from "express";
import Leaderboard from "../models/leaderboard.js";
import { supabase } from "../supabaseClient.js"; // ✅ make sure this is set up

const router = express.Router();

// ✅ Update leaderboard (when user finishes quiz/exam/competition)
router.post("/update", async (req, res) => {
  try {
    const { userId, score } = req.body; // Supabase UUID & earned score

    if (!userId || !score) {
      return res.status(400).json({ error: "userId and score are required" });
    }

    const entry = await Leaderboard.findOneAndUpdate(
      { userId },
      { $inc: { totalXP: score } },
      { new: true, upsert: true }
    );

    res.json(entry);
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({ error: "Failed to update leaderboard" });
  }
});

// ✅ Get leaderboard with usernames from Supabase
router.get("/", async (req, res) => {
  try {
    const entries = await Leaderboard.find().sort({ totalXP: -1 }).limit(20);

    // fetch profile info from Supabase for each user
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", entry.userId)
          .single();

        return {
          userId: entry.userId,
          username: data?.username || "Anonymous",
          fullName: data?.full_name || null,
          avatarUrl: data?.avatar_url || null,
          totalXP: entry.totalXP,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
