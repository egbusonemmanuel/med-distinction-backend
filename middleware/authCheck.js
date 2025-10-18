import User from "../models/user.js";

export async function checkAccess(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Admins or subscribed users get full access
    if (user.role === "admin" || user.subscriptionActive) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ error: "Upgrade to access this feature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Auth check failed" });
  }
}
