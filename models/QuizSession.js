// models/QuizSession.js
import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedAnswer: String,
  isCorrect: Boolean,
});

const QuizSessionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  answers: [AnswerSchema],
  score: Number,
  completedAt: { type: Date, default: Date.now },
});

export default mongoose.model("QuizSession", QuizSessionSchema);
