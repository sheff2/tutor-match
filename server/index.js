import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "./config/db.js";
import User from "./schema/User.js";
import TutorProfile from "./schema/TutorProfile.js";
import Booking from "./schema/Bookings.js";
import Slot from "./schema/TimeSlots.js";
import Review from "./schema/Review.js";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/auth.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Request logging middleware (after body parser)
app.use((req, res, next) => {
  console.log(` [${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyLog = { ...req.body };
    if (bodyLog.password) bodyLog.password = '***';
    console.log('   Body:', bodyLog);
  }
  next();
});

// Connect to MongoDB
connectDB();

// Auth routes
app.use("/api/auth", authRoutes);

// simple routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tutor-match", time: new Date().toISOString() });
});
app.patch('/api/users/me', verifyToken, async (req, res) => {
  try {
    // Allow updating avatarUrl and/or bio
    const { avatarUrl, bio } = req.body;

    if ((avatarUrl === undefined || avatarUrl === null || (typeof avatarUrl === 'string' && !avatarUrl.trim()))
        && (bio === undefined || bio === null)) {
      return res.status(400).json({ error: 'Provide avatarUrl and/or bio to update' });
    }

    const update = {};
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (bio !== undefined) update.bio = bio;

    const user = await User
      .findByIdAndUpdate(req.user.userId, update, { new: true })
      .select('_id name email role avatarUrl bio');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// Get all tutors with their profiles (protected route)
app.get("/api/tutors", verifyToken, async (req, res) => {
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
        
        // Calculate average rating from reviews
        const reviews = await Review.find({ revieweeId: tutor._id }).lean();
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        
        return {
          id: tutor._id,
          name: tutor.name,
          email: tutor.email,
          bio: profile?.bio || "No bio available",
          hourlyRate: profile?.hourlyRate || 0,
          courses: profile?.subjects || [],
          rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
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

// Get current tutor profile (merged user + tutor profile)
app.get('/api/tutors/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user || user.role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    const profile = await TutorProfile.findOne({ userId: user._id }).lean();
    res.json({
      tutor: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: profile?.bio || '',
        hourlyRate: profile?.hourlyRate || null,
        subjects: profile?.subjects || [],
        yearsExperience: profile?.yearsExperience || null,
        location: profile?.location || '',
        onlineOnly: profile?.onlineOnly ?? true,
      }
    });
  } catch (e) {
    console.error('Fetch tutor me error', e);
    res.status(500).json({ error: 'Failed to load tutor profile' });
  }
});

// Update (finish) current tutor profile
app.patch('/api/tutors/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user || user.role !== 'tutor') {
      return res.status(403).json({ error: 'Not a tutor account' });
    }
    const { bio, hourlyRate, subjects, yearsExperience, location, onlineOnly } = req.body;

    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (hourlyRate !== undefined) update.hourlyRate = hourlyRate;
    if (subjects !== undefined) update.subjects = subjects;
    if (yearsExperience !== undefined) update.yearsExperience = yearsExperience;
    if (location !== undefined) update.location = location;
    if (onlineOnly !== undefined) update.onlineOnly = onlineOnly;

    const profile = await TutorProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { upsert: true, new: true }
    ).lean();

    res.json({
      tutor: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: profile.bio,
        hourlyRate: profile.hourlyRate,
        subjects: profile.subjects,
        yearsExperience: profile.yearsExperience,
        location: profile.location,
        onlineOnly: profile.onlineOnly,
      }
    });
  } catch (e) {
    console.error('Update tutor profile error', e);
    res.status(500).json({ error: 'Failed to update tutor profile' });
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
     const saltRounds = 10;
     const passwordHash = await bcrypt.hash(password, saltRounds);
    
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
  const session = await mongoose.startSession();
  
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
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Start transaction
    session.startTransaction();
    
    // Create User
    const [user] = await User.create([{
      role: "tutor",
      email,
      passwordHash,
      name,
      avatarUrl,
      skills: subjects,
    }], { session });
    
    // Create TutorProfile
    const [tutorProfile] = await TutorProfile.create([{
      userId: user._id,
      bio,
      hourlyRate,
      subjects,
      yearsExperience,
      location,
      onlineOnly,
    }], { session });
    
    await session.commitTransaction();
    
    res.status(201).json({
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
    if (session && session.inTransaction()) {
      await session.abortTransaction();
}
    console.error("Error creating tutor:", error);
    res.status(500).json({ error: "Failed to create tutor" });
  } finally {
    if (session) session.endSession();
  }
});

// Bookings
// Create a booking (student creates a booking with a tutor)
app.post('/api/bookings', verifyToken, async (req, res) => {
  try {
    const { tutorId, slotId, price } = req.body;
    const studentId = req.user.userId;

    if (!tutorId || !slotId) {
      return res.status(400).json({ error: 'tutorId and slotId are required' });
    }

    // Ensure tutor exists
    const tutor = await User.findById(tutorId).lean();
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(400).json({ error: 'Invalid tutorId' });
    }

    // Reserve the slot atomically: only mark as booked if currently not booked
    const slot = await Slot.findOneAndUpdate({ _id: slotId, isBooked: false }, { $set: { isBooked: true } }, { new: true });
    if (!slot) {
      return res.status(400).json({ error: 'Slot is already booked or does not exist' });
    }

    // Calculate price based on slot duration and tutor's hourly rate if not provided
    let bookingPrice = price;
    if (!bookingPrice) {
      const tutorProfile = await TutorProfile.findOne({ userId: tutorId }).lean();
      if (tutorProfile?.hourlyRate && slot?.start && slot?.end) {
        // Calculate duration in hours
        const durationMs = new Date(slot.end) - new Date(slot.start);
        const durationHours = durationMs / (1000 * 60 * 60);
        // Calculate total price
        bookingPrice = Math.round(tutorProfile.hourlyRate * durationHours * 100) / 100; // Round to 2 decimal places
      }
    }

    const booking = await Booking.create({
      tutorId,
      studentId,
      slotId,
      price: bookingPrice,
    });

    res.status(201).json({ booking });
  } catch (e) {
    console.error('Create booking error', e);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get bookings for current user (student or tutor)
app.get('/api/bookings/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let query = {};
    if (user.role === 'tutor') query.tutorId = user._id;
    else query.studentId = user._id;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('tutorId', 'name email avatarUrl _id')
      .populate('studentId', 'name email avatarUrl _id')
      .populate('slotId')
      .lean();

    res.json({ bookings });
  } catch (e) {
    console.error('Fetch bookings error', e);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

  // List available slots for a tutor (or all slots)
  app.get('/api/slots', verifyToken, async (req, res) => {
    try {
        const tutorId = req.query.tutorId;
        const includeBooked = (req.query.includeBooked || '').toString().toLowerCase() === 'true' || req.query.includeBooked === '1';
        const q = {};
        if (tutorId) q.tutorId = tutorId;
        // Only return non-booked slots by default, unless includeBooked is set
        if (!includeBooked) q.isBooked = false;

      const slots = await Slot.find(q).sort({ start: 1 }).lean();
      res.json({ slots });
    } catch (e) {
      console.error('Fetch slots error', e);
      res.status(500).json({ error: 'Failed to load slots' });
    }
  });

  // Create a slot (tutor only)
  app.post('/api/slots', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).lean();
      if (!user || user.role !== 'tutor') return res.status(403).json({ error: 'Only tutors can create slots' });

      const { start, end } = req.body;
      if (!start || !end) return res.status(400).json({ error: 'start and end are required' });

      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s) || isNaN(e) || s >= e) return res.status(400).json({ error: 'Invalid start/end times' });

      const slot = await Slot.create({ tutorId: user._id, start: s, end: e });
      res.status(201).json({ slot });
    } catch (err) {
      console.error('Create slot error', err);
      res.status(500).json({ error: 'Failed to create slot' });
    }
  });

  app.post('/api/slots/bulk', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).lean();
      if (!user || user.role !== 'tutor') {
        return res.status(403).json({ error: 'Only tutors can create slots' });
      }

      const { slots, startDate: bulkStartDate, endDate: bulkEndDate } = req.body;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ error: 'Slots array is required' });
      }

      const slotsToInsert = slots.map(slot => ({
        tutorId: user._id,
        start: slot.start,
        end: slot.end,
      }));

      const createdSlots = await Slot.insertMany(slotsToInsert);
      res.status(201).json({ slots: createdSlots });
    } catch (error) {
      console.error('Bulk create slots error', error);
      res.status(400).json({ error: 'Failed to create slots', details: error.message });
    }
  });

  // Update a slot (tutor only, owner)
  app.patch('/api/slots/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const slot = await Slot.findById(id);
      if (!slot) return res.status(404).json({ error: 'Slot not found' });
      if (String(slot.tutorId) !== String(userId)) return res.status(403).json({ error: 'Not authorized' });

      const { start, end, isBooked } = req.body;
      if (start !== undefined) {
        const s = new Date(start);
        if (isNaN(s)) return res.status(400).json({ error: 'Invalid start' });
        slot.start = s;
      }
      if (end !== undefined) {
        const e = new Date(end);
        if (isNaN(e)) return res.status(400).json({ error: 'Invalid end' });
        slot.end = e;
      }
      if (isBooked !== undefined) slot.isBooked = !!isBooked;

      await slot.save();
      res.json({ slot });
    } catch (err) {
      console.error('Update slot error', err);
      res.status(500).json({ error: 'Failed to update slot' });
    }
  });

  // Delete a slot (tutor only, owner)
  app.delete('/api/slots/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const slot = await Slot.findById(id);
      if (!slot) return res.status(404).json({ error: 'Slot not found' });
      if (String(slot.tutorId) !== String(userId)) return res.status(403).json({ error: 'Not authorized' });

      await slot.deleteOne();
      res.json({ ok: true });
    } catch (err) {
      console.error('Delete slot error', err);
      res.status(500).json({ error: 'Failed to delete slot' });
    }
  });

// Update a booking (status, notes, times) - only tutor or student involved can change
app.patch('/api/bookings/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const allowed = ['status', 'price'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Only tutor or student on the booking can modify
    if (String(booking.tutorId) !== String(userId) && String(booking.studentId) !== String(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(booking, update);
    await booking.save();

    // If booking was canceled (or declined), free the slot
    if (update.status && ['cancelled', 'declined'].includes(String(update.status).toLowerCase())) {
      try {
        if (booking.slotId) await Slot.findByIdAndUpdate(booking.slotId, { $set: { isBooked: false } });
      } catch (e) {
        console.error('Failed to free slot after booking status change', e);
      }
    }

    res.json({ booking });
  } catch (e) {
    console.error('Update booking error', e);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Reviews
// Create a review for a completed booking
app.post('/api/reviews', verifyToken, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const reviewerId = req.user.userId;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'bookingId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    // Verify user is part of the booking
    const isTutor = String(booking.tutorId) === String(reviewerId);
    const isStudent = String(booking.studentId) === String(reviewerId);
    
    if (!isTutor && !isStudent) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }

    // Determine who is being reviewed
    const revieweeId = isTutor ? booking.studentId : booking.tutorId;

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId, reviewerId }).lean();
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this booking' });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      reviewerId,
      revieweeId,
      rating,
      comment: comment || '',
    });

    // Populate reviewer and reviewee info
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatarUrl')
      .populate('revieweeId', 'name avatarUrl')
      .lean();

    res.status(201).json({ review: populatedReview });
  } catch (e) {
    console.error('Create review error', e);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a user (tutors typically)
app.get('/api/reviews/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ revieweeId: userId })
      .sort({ createdAt: -1 })
      .populate('reviewerId', 'name avatarUrl')
      .populate('bookingId')
      .lean();

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ 
      reviews, 
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length 
    });
  } catch (e) {
    console.error('Fetch reviews error', e);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Get review for a specific booking by current user
app.get('/api/reviews/booking/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reviewerId = req.user.userId;

    const review = await Review.findOne({ bookingId, reviewerId })
      .populate('reviewerId', 'name avatarUrl')
      .populate('revieweeId', 'name avatarUrl')
      .lean();

    res.json({ review });
  } catch (e) {
    console.error('Fetch booking review error', e);
    res.status(500).json({ error: 'Failed to load review' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
