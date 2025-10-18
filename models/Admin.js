import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "admin" }
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
