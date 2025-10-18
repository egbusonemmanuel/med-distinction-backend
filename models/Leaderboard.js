// models/Leaderboard.js
import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Supabase UUID
  totalXP: { type: Number, default: 0 },
});

export default mongoose.model("Leaderboard", leaderboardSchema);
