import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// simple routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tutor-match", time: new Date().toISOString() });
});

const sampleTutors = [
  { id: 1, name: "Alex Kim", courses: ["CIS4301", "COP3530"], rating: 4.9 },
  { id: 2, name: "Priya Patel", courses: ["MAC2312", "STA4241"], rating: 4.7 },
  { id: 3, name: "Diego Lopez", courses: ["CAP4641", "CEN3031"], rating: 4.8 },
];

app.get("/api/tutors", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  const results = sampleTutors.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.courses.some(c => c.toLowerCase().includes(q))
  );
  res.json({ results });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
