import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../schema/User.js';
import TutorProfile from '../schema/TutorProfile.js';

dotenv.config();

const tutors = [
  {
    name: 'Alex Kim',
    email: 'alex.kim@example.com',
    password: 'password123',
    bio: 'UF CS grad, passionate about data structures and algorithms.',
    hourlyRate: 40,
    subjects: ['CIS4301', 'COP3530', 'Data Structures'],
    yearsExperience: 3,
    location: 'Gainesville, FL',
    onlineOnly: false,
    avatarUrl: ''
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    password: 'password123',
    bio: 'Math wiz specializing in calculus and statistics.',
    hourlyRate: 35,
    subjects: ['MAC2312', 'STA4241', 'Calculus II', 'Stats'],
    yearsExperience: 4,
    location: 'Remote',
    onlineOnly: true,
    avatarUrl: ''
  },
  {
    name: 'Diego Lopez',
    email: 'diego.lopez@example.com',
    password: 'password123',
    bio: 'AI/ML enthusiast with hands-on projects in Python.',
    hourlyRate: 45,
    subjects: ['CAP4641', 'CEN3031', 'Machine Learning'],
    yearsExperience: 5,
    location: 'Gainesville, FL',
    onlineOnly: false,
    avatarUrl: ''
  },
  {
    name: 'Sara Nguyen',
    email: 'sara.nguyen@example.com',
    password: 'password123',
    bio: 'Physics and linear algebra tutor with a practical approach.',
    hourlyRate: 38,
    subjects: ['PHY2048', 'Linear Algebra'],
    yearsExperience: 2,
    location: 'Remote',
    onlineOnly: true,
    avatarUrl: ''
  },
  {
    name: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    password: 'password123',
    bio: 'Full-stack dev mentor for web technologies.',
    hourlyRate: 50,
    subjects: ['Web Dev', 'React', 'Node.js'],
    yearsExperience: 6,
    location: 'Gainesville, FL',
    onlineOnly: false,
    avatarUrl: ''
  }
];

function hashPassword(pw) {
  // Keep consistent with server logic (simple base64 for demo)
  return Buffer.from(pw).toString('base64');
}

async function upsertTutor(tutor) {
  const existingUser = await User.findOne({ email: tutor.email });

  if (existingUser) {
    // Update existing tutor user and profile
    await User.updateOne(
      { _id: existingUser._id },
      { $set: { name: tutor.name, avatarUrl: tutor.avatarUrl, skills: tutor.subjects, role: 'tutor' } }
    );

    await TutorProfile.updateOne(
      { userId: existingUser._id },
      {
        $set: {
          bio: tutor.bio,
          hourlyRate: tutor.hourlyRate,
          subjects: tutor.subjects,
          yearsExperience: tutor.yearsExperience,
          location: tutor.location,
          onlineOnly: tutor.onlineOnly,
        }
      },
      { upsert: true }
    );

    console.log(`Updated tutor: ${tutor.name} (${tutor.email})`);
    return { action: 'updated', email: tutor.email };
  }

  // Create new user + tutor profile (no transaction on standalone)
  const user = await User.create({
    role: 'tutor',
    email: tutor.email,
    passwordHash: hashPassword(tutor.password),
    name: tutor.name,
    avatarUrl: tutor.avatarUrl,
    skills: tutor.subjects,
  });

  await TutorProfile.create({
    userId: user._id,
    bio: tutor.bio,
    hourlyRate: tutor.hourlyRate,
    subjects: tutor.subjects,
    yearsExperience: tutor.yearsExperience,
    location: tutor.location,
    onlineOnly: tutor.onlineOnly,
  });

  console.log(`Inserted tutor: ${tutor.name} (${tutor.email})`);
  return { action: 'inserted', email: tutor.email };
}

async function run() {
  try {
    await connectDB();
    let inserted = 0, updated = 0, failed = 0;
    for (const t of tutors) {
      try {
        const res = await upsertTutor(t);
        if (res.action === 'inserted') inserted += 1; else updated += 1;
      } catch {
        failed += 1;
      }
    }
    console.log(`\nSeed complete → inserted: ${inserted}, updated: ${updated}, failed: ${failed}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

run();
