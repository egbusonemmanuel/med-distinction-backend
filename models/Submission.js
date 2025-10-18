// models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: String,
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  answers: [mongoose.Schema.Types.Mixed],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Submission", submissionSchema);
