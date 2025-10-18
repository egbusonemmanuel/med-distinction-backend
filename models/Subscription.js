// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
  status: { type: String, enum: ["pending", "active", "rejected"], default: "pending" },
  proofUrl: String, // where screenshot/receipt is stored
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
});

export default mongoose.model("Subscription", SubscriptionSchema);
