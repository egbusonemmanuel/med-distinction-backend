// models/Quiz.js
import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String },
  difficulty: { type: String, default: "medium" },
  questions: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", QuizSchema);
