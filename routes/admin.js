// routes/admin.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// =====================
// Load admin emails safely
// =====================
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
  : [];

if (ADMIN_EMAILS.length === 0) {
  console.warn("⚠️ ADMIN_EMAILS not set in .env");
}

// =====================
// Middleware to check admin access
// =====================
const isAdmin = (req, res, next) => {
  const userEmail = req.headers["x-user-email"]; // assume frontend sends user email in headers
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

// =====================
// List all unpaid users
// =====================
router.get("/unpaid-users", isAdmin, async (req, res) => {
  try {
    const unpaidUsers = await User.find({ paid: false }).select(
      "email name paid"
    );
    res.json(unpaidUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch unpaid users" });
  }
});

// =====================
// Toggle user's payment status
// =====================
router.post("/toggle-payment/:userId", isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.paid = !user.paid;
    await user.save();

    res.json({
      message: `User payment status updated to ${user.paid}`,
      user: { id: user._id, email: user.email, paid: user.paid },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle payment status" });
  }
});

export default router;



