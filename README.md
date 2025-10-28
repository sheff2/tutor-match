# tutor-match
Find and list tutoring services by course

## Dev setup

Prereqs
- Node.js 18+
- MongoDB Community (local) or MongoDB Atlas

Install deps
- Server: `cd server && npm install`
- Client: `cd client && npm install`

Environment
- Server env is local-only and gitignored. Create `server/.env`:
	- Example (local Mongo + custom port):
		- `PORT=5050`
		- `MONGODB_URI=mongodb://127.0.0.1:27017/tutor-match`
		- `JWT_SECRET=dev_local_secret_change_me`
- Client uses Vite proxy. Create `client/.env` only if your API is NOT on 5000:
	- `VITE_API_PORT=5050`
	- If your API runs on 5000 (team default), you can skip `client/.env`.

Run
1) Start API: `npm -C server run dev`
2) Start client: `npm -C client run dev` → http://localhost:5173

Seed data (optional)
- `npm -C server run seed` to insert/update several tutors for demo.

## API

- GET `/api/health` → service status
- GET `/api/tutors` → list tutors (merged user + profile)
- GET `/api/tutors/:id` → single tutor by id
- GET `/api/tutors/sample` → sample tutors (fallback when DB empty)
- POST `/api/users` → create student/admin: `{ name, email, password, role }`
- POST `/api/tutors` → create tutor + profile: `{ name, email, password, bio?, hourlyRate?, subjects?, yearsExperience?, location?, onlineOnly? }`

Notes
- In development, POST `/api/tutors` skips MongoDB transactions so it works with a standalone local MongoDB. In production, transactions are used.

## Frontend

- Tutors list: `/tutors` (uses Vite proxy to call `/api/tutors`)
- Tutor profile: `/tutor/:id` (calls `/api/tutors/:id`)
- Sign Up: `/login` → switch to "Sign Up"; supports Student or Tutor creation

## Ports and common issues

- Team default API port is 5000. The client proxy defaults to 5000.
- If macOS AirPlay Receiver is using 5000 (symptom: 403 Forbidden from AirTunes), either:
	- Disable AirPlay Receiver (System Settings → AirPlay & Handoff), or
	- Use a different API port locally (e.g., 5050) and set `client/.env` → `VITE_API_PORT=5050`.

## Postman quick start

POST create tutor (headers: `Content-Type: application/json`):
```
POST http://localhost:5050/api/tutors
{
	"name": "Taylor Brooks",
	"email": "taylor.brooks@example.com",
	"password": "password123",
	"bio": "CS tutor focused on systems and networks.",
	"hourlyRate": 42,
	"subjects": ["Operating Systems", "Networks"],
	"yearsExperience": 4,
	"location": "Gainesville, FL",
	"onlineOnly": false,
	"avatarUrl": ""
}
```

Then open http://localhost:5173/tutors and click into the new tutor profile.
