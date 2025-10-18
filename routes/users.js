import express from "express";
import User from "../models/User.js";
import { checkAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all users (admin only)
router.get("/", checkAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Approve user (set active)
router.patch("/:id/activate", checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true, role: "user" },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User activated ✅", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to activate user" });
  }
});

// ✅ Deactivate user
router.patch("/:id/deactivate", checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deactivated ❌", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;
