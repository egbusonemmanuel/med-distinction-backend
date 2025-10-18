// models/Exam.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }], // reuse quiz questions
  startTime: Date,
  endTime: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Exam", examSchema);
