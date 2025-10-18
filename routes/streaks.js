// routes/streak.js
import express from "express";
import User from "../models/user.js";
import { startOfDay, subDays, isSameDay } from "date-fns";

const router = express.Router();

router.post("/update-streak", async (req, res) => {
  try {
    const { email } = req.body; // identify user
    if (!email) return res.status(400).json({ error: "Email required" });

    let user = await User.findOne({ email });
    const today = startOfDay(new Date());

    if (!user) {
      // first-time user
      user = new User({
        email,
        streak: 1,
        lastLogin: today
      });
      await user.save();
      return res.json({ streak: 1 });
    }

    const lastLogin = user.lastLogin ? startOfDay(new Date(user.lastLogin)) : null;
    let newStreak = user.streak;

    if (!lastLogin || !isSameDay(lastLogin, today)) {
      if (lastLogin && isSameDay(lastLogin, subDays(today, 1))) {
        newStreak = user.streak + 1; // consecutive day
      } else {
        newStreak = 1; // missed day
      }
      user.streak = newStreak;
      user.lastLogin = today;
      await user.save();
    }

    res.json({ streak: user.streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
