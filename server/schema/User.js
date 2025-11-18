import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "tutor", "admin"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: String,
  
  bio: { type: String, default: '' },
  skills: [String], // optional for tutors
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
