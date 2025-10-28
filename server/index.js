import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./schema/User.js";
import TutorProfile from "./schema/TutorProfile.js";
import mongoose from "mongoose";

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

// Get a single tutor by id with profile
app.get("/api/tutors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const user = await User.findOne({ _id: id, role: "tutor" }).lean();
    if (!user) return res.status(404).json({ error: "Tutor not found" });

    const profile = await TutorProfile.findOne({ userId: user._id }).lean();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: profile?.bio || "No bio available",
      hourlyRate: profile?.hourlyRate || 0,
      subjects: profile?.subjects || [],
      yearsExperience: profile?.yearsExperience || 0,
      location: profile?.location,
      onlineOnly: profile?.onlineOnly ?? true,
      avatarUrl: user.avatarUrl,
      rating: 4.5,
    });
  } catch (error) {
    console.error("Error fetching tutor by id:", error);
    return res.status(500).json({ error: "Failed to fetch tutor" });
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

// general user creation
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role, avatarUrl } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }
    
    // Validate role (tutors use different route)
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Use /api/tutors endpoint for tutor registration." });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    
    // Hash password
    const passwordHash = Buffer.from(password).toString("base64");
    
    // Create user
    const user = await User.create({
      role,
      email,
      passwordHash,
      name,
      avatarUrl,
    });
    
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
    
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// tutors only, creates their user also
app.post("/api/tutors", async (req, res) => {
  try {
    const { name, email, password, bio, hourlyRate, subjects, yearsExperience, location, onlineOnly, avatarUrl } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    // Hash password
    const passwordHash = Buffer.from(password).toString("base64");

    // In production, use transactions; in dev, skip to support standalone Mongo
    const useTransactions = process.env.NODE_ENV === "production" && process.env.DEV_NO_TX !== "true";

    if (useTransactions) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const [user] = await User.create([
          {
            role: "tutor",
            email,
            passwordHash,
            name,
            avatarUrl,
            skills: subjects,
          },
        ], { session });

        const [tutorProfile] = await TutorProfile.create([
          {
            userId: user._id,
            bio,
            hourlyRate,
            subjects,
            yearsExperience,
            location,
            onlineOnly,
          },
        ], { session });

        await session.commitTransaction();

        return res.status(201).json({
          message: "Tutor created successfully",
          tutor: {
            id: user._id,
            name: user.name,
            email: user.email,
            bio: tutorProfile.bio,
            hourlyRate: tutorProfile.hourlyRate,
            subjects: tutorProfile.subjects,
            yearsExperience: tutorProfile.yearsExperience,
            location: tutorProfile.location,
            onlineOnly: tutorProfile.onlineOnly,
            avatarUrl: user.avatarUrl,
          },
        });
      } catch (error) {
        try { await session.abortTransaction(); } catch (_) {}
        console.error("Error creating tutor (tx):", error);
        return res.status(500).json({ error: "Failed to create tutor" });
      } finally {
        session.endSession();
      }
    } else {
      // No transaction path (dev/local)
      const user = await User.create({
        role: "tutor",
        email,
        passwordHash,
        name,
        avatarUrl,
        skills: subjects,
      });

      const tutorProfile = await TutorProfile.create({
        userId: user._id,
        bio,
        hourlyRate,
        subjects,
        yearsExperience,
        location,
        onlineOnly,
      });

      return res.status(201).json({
        message: "Tutor created successfully",
        tutor: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: tutorProfile.bio,
          hourlyRate: tutorProfile.hourlyRate,
          subjects: tutorProfile.subjects,
          yearsExperience: tutorProfile.yearsExperience,
          location: tutorProfile.location,
          onlineOnly: tutorProfile.onlineOnly,
          avatarUrl: user.avatarUrl,
        },
      });
    }
  } catch (error) {
    console.error("Error creating tutor:", error);
    res.status(500).json({ error: "Failed to create tutor" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
