import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
});

export default mongoose.model("Slot", slotSchema);
