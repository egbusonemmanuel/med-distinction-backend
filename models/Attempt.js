// models/Attempt.js
import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["quiz", "exam"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Quiz or Exam
  answers: [
    {
      questionId: String,
      selected: String,
      correct: Boolean
    }
  ],
  score: { type: Number, default: 0 },
  durationSec: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Attempt", AttemptSchema);
