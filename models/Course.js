// models/Course.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    deadline: { type: Date }, // can be null if no deadline
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    documents: [{ type: String }], // IDs or URLs
    assignments: [assignmentSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Course name
    description: { type: String, required: true }, // AI-generated or manual
    category: { type: String, default: "Medical" }, // e.g., "Cardiology"
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [{ type: String }],
    content: { type: String }, // markdown/HTML outline
    duration: { type: String },
    createdBy: { type: String, default: "AI" },
    isPublished: { type: Boolean, default: true },

    // NEW
    curriculum: [moduleSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
