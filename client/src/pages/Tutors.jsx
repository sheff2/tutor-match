// client/src/pages/Tutors.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      // Use Vite dev proxy for API calls
      const response = await fetch(`/api/tutors`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }
      
      const data = await response.json();
      // If DB has no tutors yet, fall back to the sample endpoint
      let results = Array.isArray(data?.results) && data.results.length > 0
        ? data.results
        : null;

      if (!results) {
        try {
          const sampleRes = await fetch(`/api/tutors/sample`);
          if (sampleRes.ok) {
            const sampleData = await sampleRes.json();
            results = Array.isArray(sampleData?.results) ? sampleData.results : [];
          } else {
            results = [];
          }
        } catch {
          results = [];
        }
      }

      setTutors(results);
    } catch (err) {
      console.error("Error fetching tutors:", err);
      setError(err.message);
      // show empty state on error
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
          <Link to="/login" style={styles.link}>Login</Link>
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
                      <div style={styles.rating}>⭐ {tutor.rating}</div>
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
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" },
  header: {
    width: "100%",
    padding: "16px 24px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--card)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: { fontWeight: 700, letterSpacing: 0.3, color: "var(--text)", textDecoration: "none" },
  nav: { display: "flex", gap: 16 },
  link: { color: "var(--text)", textDecoration: "none", transition: "color 0.2s" },
  main: { flex: "1 0 auto", padding: "40px 24px" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  title: { fontSize: "36px", margin: "0 0 8px", color: "var(--text)", textAlign: "center" },
  subtitle: { fontSize: "16px", color: "var(--muted)", textAlign: "center", marginBottom: "40px" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px", color: "var(--muted)" },
  error: {
    textAlign: "center",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#FFF3CD",
    color: "#856404",
    borderRadius: "8px",
    border: "1px solid #FFEAA7",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "box-shadow 0.2s, transform 0.05s",
    cursor: "pointer",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tutorName: { fontSize: "20px", margin: 0, color: "var(--text)" },
  rating: { fontSize: "14px", color: "var(--text)" },
  bio: { fontSize: "14px", color: "var(--muted)", margin: 0, lineHeight: 1.5 },
  courses: { display: "flex", flexWrap: "wrap", gap: "8px" },
  courseBadge: {
    background: "#EBF2FF",
    color: "var(--primary)",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: "8px", paddingTop: "12px", borderTop: "1px solid var(--border)",
  },
  rate: { fontSize: "18px", fontWeight: 600, color: "var(--text)" },
  bookBtn: { fontSize: "14px", padding: "8px 16px" },
  footer: {
    flex: "0 0 auto", borderTop: "1px solid var(--border)",
    padding: "24px", textAlign: "center", background: "var(--card)",
  },
  footerText: { margin: 0, fontSize: "12px", color: "var(--muted)" },
};