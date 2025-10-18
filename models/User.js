import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  hasPaid: { type: Boolean, default: false },
  paid: { type: Boolean, default: false }, // For backward compatibility
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Use this pattern to avoid OverwriteModelError
export default mongoose.models.User || mongoose.model("User", userSchema);
