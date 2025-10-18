import mongoose from "mongoose";

const CompetitionResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  score: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("CompetitionResult", CompetitionResultSchema);
