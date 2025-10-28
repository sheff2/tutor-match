// client/src/data/dummyTutors.js

// simple helpers to make a few future ISO timestamps
const now = new Date();
const inHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);
const iso = (d) => d.toISOString();

export const dummyTutors = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    bio: "Computer Science major with 2 years of tutoring experience.",
    hourlyRate: 25,
    courses: ["CS 101", "CS 201"],
    rating: 4.8,
    yearsExperience: 2,
    avatarUrl: null,
    slots: [
      { id: "s1", start: iso(inHours(4)), end: iso(inHours(5)), isBooked: false },
      { id: "s2", start: iso(inHours(8)), end: iso(inHours(9)), isBooked: false },
      { id: "s3", start: iso(inHours(12)), end: iso(inHours(13)), isBooked: true },
    ],
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@example.com",
    bio: "Math enthusiast helping students ace calculus and linear algebra.",
    hourlyRate: 30,
    courses: ["MATH 150", "MATH 250"],
    rating: 4.9,
    yearsExperience: 3,
    avatarUrl: null,
    slots: [
      { id: "m1", start: iso(inHours(2)), end: iso(inHours(3)), isBooked: false },
      { id: "m2", start: iso(inHours(6)), end: iso(inHours(7)), isBooked: false },
      { id: "m3", start: iso(inHours(10)), end: iso(inHours(11)), isBooked: false },
    ],
  },
];