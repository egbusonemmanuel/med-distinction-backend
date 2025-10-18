import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  flashcard: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" },
  nextReview: { type: Date, default: Date.now }, // When card should be shown next
  interval: { type: Number, default: 1 },        // Days till next review
  ease: { type: Number, default: 2.5 },          // Ease factor (like Anki)
  correctStreak: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
