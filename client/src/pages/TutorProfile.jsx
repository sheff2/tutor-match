import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";


const API_BASE = '';


export default function TutorProfile() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [bookingMsg, setBookingMsg] = useState(null);
  function Header() {
    return (
    <header style={styles.header}>
    <Link to="/" style={styles.brand}>Tutor-Match</Link>
    <nav style={styles.nav}>
    <Link to="/" style={styles.link}>Home</Link>
    <Link to="/tutors" style={styles.link}>Find Tutors</Link>
    </nav>
    <nav style={styles.nav}>
    <Link to="/profile" style={styles.link}>Profile</Link>
    <Link to="/logout" style={styles.link}>Logout</Link>
    </nav>
    </header>
    );
    }
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/tutors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
        const data = await response.json();
        
        // Find the tutor by id from the results
        const foundTutor = data.results.find((t) => t.id.toString() === id);
        setTutor(foundTutor || null);
        // fetch slots for this tutor separately
        if (foundTutor) {
          try {
            const slotsRes = await fetch(`${API_BASE}/api/slots?tutorId=${foundTutor.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const slotsData = await slotsRes.json();
            if (slotsRes.ok) setSlots(slotsData.slots || []);
          } catch (e) {
            console.error('Failed to fetch slots', e);
          }
        }
      } catch (err) {
        console.error("Error fetching tutor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <main style={styles.main}>
          <div style={styles.container}>
            <h1>Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

    if (!tutor) {
    return (
      <div style={styles.page}>
        <Header />
        <main style={styles.main}>
          <div style={styles.container}>
            <h1 style={{ color: "var(--text)" }}>Tutor not found</h1>
            <Link to="/tutors" style={styles.backLink}>← Back to tutors</Link>
          </div>
        </main>
      </div>
    );
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.container}>
          <Link to="/tutors" style={styles.backLink}>← Back to tutors</Link>

          <div style={styles.profileCard}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Avatar name={tutor.name} src={tutor.avatarUrl} size={56} />
              <div>
                <h1 style={{ margin: 0, color: "var(--text)" }}>{tutor.name}</h1>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  ⭐ {tutor.rating} • {tutor.yearsExperience} yrs experience
                </div>
                <div style={{ marginTop: 6, fontWeight: 600, color: "var(--text)" }}>
                  ${tutor.hourlyRate}/hr
                </div>
              </div>
            </div>

            <p style={{ marginTop: 16, color: "var(--text)" }}>{tutor.bio}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {tutor.courses && tutor.courses.map((c) => (
                <span key={c} style={styles.badge}>{c}</span>
              ))}
            </div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.h2}>Available time slots</h2>
            {slots && slots.length > 0 ? (
              <div style={styles.slotGrid}>
                {slots.map((s) => (
                  <div key={s._id || s.id} style={styles.slotCard}>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>
                      {fmt(s.start)} – {fmt(s.end)}
                    </div>
                    <div style={{ fontSize: 12, color: s.isBooked ? "#b45309" : "#047857" }}>
                      {s.isBooked ? "Booked" : "Available"}
                    </div>
                    <button
                      disabled={s.isBooked}
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: s.isBooked ? "#eee" : "var(--card)",
                        cursor: s.isBooked ? "not-allowed" : "pointer",
                      }}
                      onClick={async () => {
                        try {
                          setBookingMsg(null);
                          const res = await fetch('/api/bookings', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({ tutorId: tutor.id, slotId: s._id || s.id }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Booking failed');
                          setBookingMsg('Booking created — check My Bookings');
                          // refresh slots
                          const slotsRes = await fetch(`${API_BASE}/api/slots?tutorId=${tutor.id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                          });
                          const slotsData = await slotsRes.json();
                          if (slotsRes.ok) setSlots(slotsData.slots || []);
                        } catch (e) {
                          console.error('Booking error', e);
                          setBookingMsg(e.message || 'Booking failed');
                        }
                      }}
                    >
                      {s.isBooked ? "Not available" : "Book this slot"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>No available time slots yet</p>
            )}
            {bookingMsg && <p style={{ marginTop: 12, color: 'var(--primary)' }}>{bookingMsg}</p>}
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" },
  header: {
    width: "100%", padding: "16px 24px", borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "var(--card)", position: "sticky", top: 0, zIndex: 10,
  },
  brand: { fontWeight: 700, letterSpacing: 0.3, color: "var(--text)", textDecoration: "none" },
  nav: { display: "flex", gap: 16 },
  link: { color: "var(--text)", textDecoration: "none" },
  main: { flex: "1 0 auto", padding: "40px 24px" },
  container: { maxWidth: 1000, margin: "0 auto" },
  backLink: { textDecoration: "none", color: "var(--primary)" },
  profileCard: {
    marginTop: 16, padding: 20, borderRadius: 12,
    border: "1px solid var(--border)", background: "var(--card)",
  },
  badge: {
    background: "#EBF2FF", color: "var(--primary)", padding: "4px 10px",
    borderRadius: 12, fontSize: 12, fontWeight: 500,
  },
  section: { marginTop: 24 },
  h2: { margin: "0 0 12px", color: "var(--text)" },
  slotGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  slotCard: { border: "1px solid var(--border)", background: "var(--card)", borderRadius: 10, padding: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center",
    background: "#e5e7eb", color: "#111827", fontWeight: 700, fontSize: 22,
  },
};