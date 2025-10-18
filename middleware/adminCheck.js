// middleware/admincheck.js
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import Admin from "../models/Admin.js"; // assuming you created this model

// Create Supabase client using env vars
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const checkAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the Supabase session/user
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid Supabase token" });
    }

    const user = data.user;

    // Option A: Check against ADMIN_UUID
    if (user.id === process.env.ADMIN_UUID) {
      return next();
    }

    // Option B: Check MongoDB Admins collection
    const admin = await Admin.findOne({ email: user.email });
    if (!admin) {
      return res.status(403).json({ error: "Access denied: Not an admin" });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "Server error during admin check" });
  }
};
