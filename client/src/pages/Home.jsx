import { Link } from 'react-router-dom';
import {useAuth} from "../context/AuthContext";
import Avatar from "../components/Avatar";
import {useState, useRef, useEffect} from 'react'; 
export default function Home() {
  const { user } = useAuth(); // section to see if authenticated
  // because you couldn't go to tutors on the homepage if you were logged
  // in so i fixed that here
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  const isAuthenticated = !!user;
  useEffect(() => {
    function handleClick(e) {
      if (!menuRef.current || !avatarRef.current) return;
      if (
        menuOpen &&
        !menuRef.current.contains(e.target) &&
        !avatarRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
}, [menuOpen]);
  return (
    <div style={styles.page}>
      <header style={styles.header}>

        {/* left side */}
        <Link to="/" style={styles.brand}>Tutor-Match</Link>

        {/* center portion */}
        <nav style={styles.nav}>
          <a href="#about" style={styles.link}>About</a>
          <a href="#how" style={styles.link}>How it works</a>
          <a href="#contact" style={styles.link}>Contact</a>
          <Link to="/tutors" style={styles.link}>Find Tutors</Link>
        </nav>

        {/* auth/navigation right side */}
        <nav style={styles.nav}> 
          {isAuthenticated ? (
            <div style={styles.menuWrapper}>
              <button
                ref={avatarRef}
                onClick={() => setMenuOpen(o => !o)}
                style={styles.avatarButton}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="Open user menu"
              >
                <Avatar src={user?.avatarUrl} name={user?.name} size={36} />
              </button>

              {menuOpen && (
                <div ref={menuRef} style={styles.dropdown} role="menu">
                  <Link
                    to="/profile"
                    style={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div style={styles.divider} />
                  <Link
                    to="/logout"
                    style={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.link}>Login</Link>
          )}

        </nav>
      </header>

      {/* Full-bleed hero using Soft UI gradient */}
      <section style={styles.hero} className="bg-gradient-primary">
        <div className="container" style={styles.heroInner}>
          <h1 style={{ ...styles.title, color: '#1f3b6aff' }}>Welcome to Tutor-Match</h1>
          <p style={{ ...styles.subtitle, color: 'rgba(110, 121, 174, 0.9)' }}>
            Find help fast. A clean, simple space for students and tutors.
          </p>
          <div style={styles.ctaRow}>
            <Link className="btn btn-primary shadow-soft-lg" to={isAuthenticated ? '/tutors' : '/login'}> Get Started </Link>
            <a className="btn btn-secondary" href="#how">Learn more</a>
          </div>
        </div>
      </section>

      <main style={styles.main}>
        <section id="about" className="container" style={styles.section}>
          <div className="card-soft rounded-lg" style={{ padding: 24 }}>
            <h2 style={styles.h2}>What is Tutor-Match?</h2>
            <p style={styles.p}>
              Tutor-Match connects students with peer tutors for specific courses.
              We're starting simple — clear information and an easy flow — and will add features as we go.
            </p>
          </div>
        </section>

        <section id="how" className="container" style={styles.section}>
          <div className="card-soft rounded-lg" style={{ padding: 24 }}>
            <h2 style={styles.h2}>How it works</h2>
            <ol style={styles.list}>
              <li>Students browse available tutors and sessions.</li>
              <li>Tutors list courses they can help with and their availability.</li>
              <li>Both sides agree on a time and meet online or in person.</li>
            </ol>
          </div>
        </section>
      </main>

      <footer id="contact" style={styles.footer}>
        <div className="container">
          <h2 style={styles.h2}>Contact</h2>
          <p style={styles.p}>
            Questions or feedback? Email <a href="mailto:hello@tutor-match.local" style={styles.a}>hello@tutor-match.local</a>.
          </p>
          <div style={styles.copy}>© {new Date().getFullYear()} Tutor-Match</div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#2d3748', background: '#f7fafc' },

  header: {
    width: '100%',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderBottom: '1px solid #e2e8f0',
  },
  brand: { fontWeight: 700, letterSpacing: 0.3, color: '#667eea', textDecoration: 'none', fontSize: 20 },
  nav: { display: 'flex', gap: 16, alignItems: 'center' },
  link: { color: '#4a5568', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' },

  hero: {
    width: '100%',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(180deg, #EBF2FF 0%, #FFFFFF 100%)',
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    padding: '56px 24px',
  },
  heroInner: { textAlign: 'center', maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 48, margin: 0, color: '#1f3b6a', fontWeight: 700 },
  subtitle: { fontSize: 18, color: '#6e79ae', marginTop: 16, marginBottom: 32, lineHeight: 1.6 },
  ctaRow: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },

  main: { flex: '1 0 auto' },
  section: { padding: '40px 0' },
  h2: { margin: '0 0 16px', fontSize: 28, color: '#2d3748', fontWeight: 700 },
  p: { margin: '8px 0 0', color: '#718096', lineHeight: 1.6, fontSize: 16 },
  list: { margin: '16px 0 0 24px', color: '#718096', lineHeight: 1.8, fontSize: 16 },

  footer: {
    flex: '0 0 auto',
    borderTop: '1px solid #e2e8f0',
    padding: '32px 24px',
    textAlign: 'center',
    background: '#fff',
  },
  menuWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  avatarButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    minWidth: 160,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
  },
  dropdownItem: {
    textDecoration: 'none',
    color: '#2d3748',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background 0.15s',
  },
  dropdownItemHover: {
    background: '#f7fafc',
  },
  divider: {
    margin: '6px 0',
    borderTop: '1px solid #e2e8f0',
  },
  a: { color: '#667eea', textDecoration: 'none', fontWeight: 500 },
  copy: { marginTop: 12, fontSize: 12, color: '#718096' },
};
