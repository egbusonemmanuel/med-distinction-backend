// backend/models/LibraryItem.js
import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "book", "audio"], required: true },
    fileUrl: { type: String, required: true }, // URL or path to file
  },
  { timestamps: true }
);

export default mongoose.model("LibraryItem", libraryItemSchema);
