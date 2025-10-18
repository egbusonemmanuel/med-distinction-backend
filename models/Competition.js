// models/Competition.js
import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Competition", competitionSchema);
