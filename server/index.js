import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./schema/User.js";
import TutorProfile from "./schema/TutorProfile.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// simple routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tutor-match", time: new Date().toISOString() });
});

// Get all tutors with their profiles
app.get("/api/tutors", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().toLowerCase();
    
    // Find all users with role 'tutor' and populate their profiles
    let query = { role: "tutor" };
    
    if (q) {
      // Search by name or subjects
      query = {
        role: "tutor",
        $or: [
          { name: { $regex: q, $options: 'i' } },
        ]
      };
    }
    
    const tutors = await User.find(query).lean();
    
    // Get tutor profiles for each user
    const tutorsWithProfiles = await Promise.all(
      tutors.map(async (tutor) => {
        const profile = await TutorProfile.findOne({ userId: tutor._id }).lean();
        return {
          id: tutor._id,
          name: tutor.name,
          email: tutor.email,
          bio: profile?.bio || "No bio available",
          hourlyRate: profile?.hourlyRate || 0,
          courses: profile?.subjects || [],
          rating: 4.5, // TODO: Calculate from bookings/reviews
          yearsExperience: profile?.yearsExperience || 0,
          avatarUrl: tutor.avatarUrl,
        };
      })
    );
    
    res.json({ results: tutorsWithProfiles });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ error: "Failed to fetch tutors" });
  }
});

// Fallback: sample tutors if DB is empty
const sampleTutors = [
  { id: 1, name: "Alex Kim", courses: ["CIS4301", "COP3530"], rating: 4.9 },
  { id: 2, name: "Priya Patel", courses: ["MAC2312", "STA4241"], rating: 4.7 },
  { id: 3, name: "Diego Lopez", courses: ["CAP4641", "CEN3031"], rating: 4.8 },
];

app.get("/api/tutors/sample", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  const results = sampleTutors.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.courses.some(c => c.toLowerCase().includes(q))
  );
  res.json({ results });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
