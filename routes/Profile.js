// routes/Profile.js
import express from "express";
import User from "../models/User.js"; // Make sure this model exists

const router = express.Router();

// Example GET route to confirm it works
router.get("/", async (req, res) => {
  try {
    const users = await User.find().limit(3);
    res.json({
      success: true,
      message: "✅ Profile route working!",
      users,
    });
  } catch (error) {
    console.error("Error in /api/profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
