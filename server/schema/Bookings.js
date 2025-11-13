import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
  },
  status: {
    type: String,
    enum: ["requested", "accepted", "declined", "canceled", "cancelled", "completed"],
    default: "requested",
  },
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
