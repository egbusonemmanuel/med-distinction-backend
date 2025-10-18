import mongoose from "mongoose";

const QuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QuizResult", QuizResultSchema);
