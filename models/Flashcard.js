import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    topic: { type: String, default: "General" },
    color: { type: String, default: "#6b5b95" },
  },
  { timestamps: true }
);

export default mongoose.model("Flashcard", flashcardSchema);
