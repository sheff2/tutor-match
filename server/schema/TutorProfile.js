import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bio: String,
  hourlyRate: Number,
  subjects: [String], // ["Math", "Physics"]
  yearsExperience: Number,
  location: String,   // optional
  onlineOnly: { type: Boolean, default: true },
});

export default mongoose.model("TutorProfile", tutorProfileSchema);
