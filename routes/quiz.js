import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const quizSchema = new mongoose.Schema(
  {
    title: String,
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
