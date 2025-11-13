import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../schema/User.js";
import TutorProfile from "../schema/TutorProfile.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  console.log('[AUTH] Register attempt:', { email: req.body.email, name: req.body.name, role: req.body.role });

  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      console.log('[AUTH] Validation failed - missing fields');
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    // Check if user already exists
    console.log('[AUTH] Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[AUTH] User already exists');
      return res.status(400).json({ error: "User with this email already exists" });
    }
    console.log('[AUTH] No existing user found');

    // Hash password
    console.log('[AUTH] Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('[AUTH] Password hashed');

    // Create new user
    console.log('[AUTH] Creating new user...');
    const user = new User({
      email,
      passwordHash,
      name,
      role: role || "student", // Default to student if not specified
      createdAt: new Date(),
    });

    await user.save();
    console.log('[AUTH] User saved to database:', user._id);

    // If registering as a tutor, create an empty or provided TutorProfile immediately
    if ((role || 'student') === 'tutor') {
      try {
        const {
          bio = '',
          hourlyRate,
          subjects,
          yearsExperience,
          location,
          onlineOnly,
        } = req.body || {};

        const profileDoc = new TutorProfile({
          userId: user._id,
          bio,
          hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : (hourlyRate ? Number(hourlyRate) : undefined),
          subjects: Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()).filter(Boolean) : []),
          yearsExperience: typeof yearsExperience === 'number' ? yearsExperience : (yearsExperience ? Number(yearsExperience) : undefined),
          location,
          onlineOnly: typeof onlineOnly === 'boolean' ? onlineOnly : true,
        });
        await profileDoc.save();
        console.log('[AUTH] Tutor profile created for', user._id);
      } catch (e) {
        console.warn('[AUTH] Tutor profile creation failed but user created:', e?.message);
        // Do not fail overall registration if profile creation fails
      }
    }

    // Generate JWT token
    console.log('[AUTH] Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log('[AUTH] JWT token generated');

    // Return user info and token (excluding password hash)
    const response = {
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
    console.log('[AUTH] Registration successful, sending response');
    res.status(201).json(response);
  } catch (error) {
    console.error("[AUTH] Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  console.log('[AUTH] Login attempt:', { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user info and token
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get current user (verify token)
router.get("/me", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("Verify token error:", error);
    res.status(500).json({ error: "Failed to verify token" });
  }
});

// Logout (client-side will remove token, this is just for consistency)
router.post("/logout", (_req, res) => {
  // In JWT authentication, logout is typically handled client-side by removing the token
  // This endpoint exists for consistency and future enhancements (e.g., token blacklisting)
  res.json({ message: "Logout successful" });
});

export default router;
