import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import StarRating from "../components/StarRating";


const API_BASE = '';


export default function TutorProfile() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [bookingMsg, setBookingMsg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
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
          
          // Fetch reviews for this tutor
          try {
            const reviewsRes = await fetch(`${API_BASE}/api/reviews/${foundTutor.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const reviewsData = await reviewsRes.json();
            if (reviewsRes.ok) {
              setReviews(reviewsData.reviews || []);
              setAvgRating(reviewsData.avgRating || 0);
              setTotalReviews(reviewsData.totalReviews || 0);
            }
          } catch (e) {
            console.error('Failed to fetch reviews', e);
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
            <h1 style={{ color: "#1a202c", fontSize: 28 }}>Loading...</h1>
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
            <h1 style={{ color: "#1a202c", fontSize: 28 }}>Tutor not found</h1>
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
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <Avatar name={tutor.name} src={tutor.avatarUrl} size={80} />
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, color: "#1a202c", fontSize: 32, fontWeight: 700 }}>{tutor.name}</h1>
                <div style={{ color: "#718096", marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 15 }}>
                  {avgRating > 0 ? (
                    <>
                      <StarRating rating={avgRating} size={18} />
                      {totalReviews > 0 && (
                        <span>({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                      )}
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                  <span>• {tutor.yearsExperience} yrs experience</span>
                </div>
                <div style={{ marginTop: 12, fontSize: 24, fontWeight: 700, color: "#667eea" }}>
                  ${tutor.hourlyRate}/hr
                </div>
              </div>
            </div>

            <p style={{ marginTop: 24, color: "#4a5568", lineHeight: 1.7, fontSize: 15 }}>{tutor.bio}</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
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
                    <div style={{ fontWeight: 600, color: "#2d3748", fontSize: 15 }}>
                      {fmt(s.start)} – {fmt(s.end)}
                    </div>
                    <div style={{ fontSize: 13, color: s.isBooked ? "#c05621" : "#38a169", marginTop: 6, fontWeight: 600 }}>
                      {s.isBooked ? "Booked" : "Available"}
                    </div>
                    <button
                      disabled={s.isBooked}
                      style={{
                        marginTop: 14,
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: s.isBooked ? "1px solid #cbd5e0" : "none",
                        background: s.isBooked ? "#f7fafc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: s.isBooked ? "#a0aec0" : "#fff",
                        cursor: s.isBooked ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        width: '100%',
                        transition: 'all 0.2s',
                        boxShadow: s.isBooked ? 'none' : '0 2px 4px rgba(102,126,234,0.3)',
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
              <p style={{ color: "#718096", fontSize: 14 }}>No available time slots yet</p>
            )}
            {bookingMsg && <p style={{ marginTop: 16, color: '#667eea', fontWeight: 600, fontSize: 14 }}>{bookingMsg}</p>}
          </section>

          {/* Reviews Section */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Reviews {totalReviews > 0 && `(${totalReviews})`}</h2>
            {reviews && reviews.length > 0 ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {reviews.map((review) => (
                  <div key={review._id} style={styles.reviewCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 15 }}>
                          {review.reviewerId?.name || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={16} showNumber={false} />
                    </div>
                    {review.comment && (
                      <p style={{ margin: 0, color: '#4a5568', lineHeight: 1.7, fontSize: 14 }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#718096", fontSize: 14 }}>No reviews yet</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: "100vh", 
    display: "flex", 
    flexDirection: "column", 
    background: "#f7fafc",
    fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial',
  },
  header: {
    width: "100%", 
    padding: "16px 32px", 
    borderBottom: "1px solid #e2e8f0",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    background: "#fff", 
    position: "sticky", 
    top: 0, 
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  brand: { 
    fontWeight: 700, 
    letterSpacing: 0.3, 
    color: "#667eea", 
    textDecoration: "none",
    fontSize: 20,
  },
  nav: { display: "flex", gap: 16 },
  link: { 
    color: "#4a5568", 
    textDecoration: "none",
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  main: { 
    flex: "1 0 auto", 
    padding: "40px 32px",
    background: "#f7fafc",
  },
  container: { 
    maxWidth: 1100, 
    margin: "0 auto",
  },
  backLink: { 
    textDecoration: "none", 
    color: "#667eea",
    fontSize: 14,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'color 0.2s',
  },
  profileCard: {
    marginTop: 20, 
    padding: 32, 
    borderRadius: 16,
    border: "1px solid #e2e8f0", 
    background: "#fff",
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  badge: {
    background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)", 
    color: "#667eea", 
    padding: "6px 14px",
    borderRadius: 20, 
    fontSize: 13, 
    fontWeight: 600,
  },
  section: { 
    marginTop: 32,
    background: '#fff',
    padding: 28,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  h2: { 
    margin: "0 0 20px", 
    color: "#1a202c",
    fontSize: 22,
    fontWeight: 700,
  },
  slotGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
    gap: 16,
  },
  slotCard: { 
    border: "1px solid #e2e8f0", 
    background: "#fff", 
    borderRadius: 12, 
    padding: 18,
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  reviewCard: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  ratingStars: {
    color: '#f59e0b',
    fontSize: 18,
    letterSpacing: 2,
  },
  avatar: {
    width: 56, 
    height: 56, 
    borderRadius: "50%", 
    display: "grid", 
    placeItems: "center",
    background: "#e5e7eb", 
    color: "#111827", 
    fontWeight: 700, 
    fontSize: 22,
  },
};