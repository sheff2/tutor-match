import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

// Use proxy for API calls (vite will forward /api to backend)
const API_BASE = '';

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleLogout = () => navigate('/logout');

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/tutors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }
      
      const data = await response.json();
      const results =
        Array.isArray(data?.results) && data.results.length > 0
          ? data.results
          : [];

      setTutors(results);
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setError(err.message);
      // fallback to empty array on error
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.brand}>Tutor-Match</Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/tutors" style={styles.link}>Find Tutors</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <Link to="/bookings" style={styles.link}>My Bookings</Link>
          <span style={styles.userName}>Hi, {user?.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </nav>
      </header>

      <main style={styles.main}>
        <div className="container" style={styles.container}>
          <h1 style={styles.title}>Find Your Tutor</h1>
          <p style={styles.subtitle}>
            Browse available tutors and find the perfect match for your course.
          </p>

          {loading && <div style={styles.loading}>Loading tutors...</div>}

          {error && !loading && (
            <div style={styles.error}>
              {error} - Showing sample data instead.
            </div>
          )}

          {!loading && (
            <div style={styles.grid}>
              {tutors.map((tutor) => (
                <Link
                  key={tutor.id}
                  to={`/tutor/${tutor.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.tutorName}>{tutor.name}</h3>
                      <div style={styles.rating}>
                        {tutor.rating ? (
                          <StarRating rating={tutor.rating} size={16} />
                        ) : (
                          <span style={{ fontSize: 13, color: '#718096' }}>No reviews yet</span>
                        )}
                      </div>
                    </div>

                    <p style={styles.bio}>{tutor.bio}</p>

                    <div style={styles.courses}>
                      {tutor.courses?.map((course, idx) => (
                        <span key={idx} style={styles.courseBadge}>
                          {course}
                        </span>
                      ))}
                    </div>

                    <div style={styles.cardFooter}>
                      <span style={styles.rate}>${tutor.hourlyRate}/hr</span>
                      <button
                        className="btn btn-primary"
                        style={styles.bookBtn}
                        //onClick={(e) => e.preventDefault()} // keep Link navigation
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <div className="container">
          <p style={styles.footerText}>© {new Date().getFullYear()} Tutor-Match</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7fafc" },
  header: {
    width: "100%",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderBottom: "1px solid #e2e8f0",
  },
  brand: {
    fontWeight: 700,
    letterSpacing: 0.3,
    color: '#667eea',
    textDecoration: 'none',
    fontSize: 20,
  },
  nav: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  link: {
    color: '#4a5568',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontSize: 15,
  },
  userName: {
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  main: {
    flex: '1 0 auto',
    padding: '40px 24px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '36px',
    margin: '0 0 8px',
    color: '#2d3748',
    textAlign: 'center',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '40px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#718096',
  },
  error: {
    textAlign: "center",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#FFF3CD",
    color: "#856404",
    borderRadius: "8px",
    border: "1px solid #FFEAA7",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tutorName: { fontSize: "20px", margin: 0, color: "#2d3748", fontWeight: 600 },
  rating: { fontSize: "14px", color: "#4a5568" },
  bio: { fontSize: "14px", color: "#718096", margin: 0, lineHeight: 1.6 },
  courses: { display: "flex", flexWrap: "wrap", gap: "8px" },
  courseBadge: {
    background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
    color: "#667eea",
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: 600,
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #e2e8f0",
  },
  rate: { fontSize: "18px", fontWeight: 700, color: "#2d3748" },
  bookBtn: { 
    fontSize: "14px", 
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    flex: "0 0 auto", 
    borderTop: "1px solid #e2e8f0",
    padding: "24px", 
    textAlign: "center", 
    background: "#fff",
  },
  footerText: { margin: 0, fontSize: "12px", color: "#718096" },
};