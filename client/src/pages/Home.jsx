import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>Tutor-Match</div>
        <nav style={styles.nav}>
          <Link to="/tutors" style={styles.link}>Find Tutors</Link>
          <a href="#about" style={styles.link}>About</a>
          <a href="#how" style={styles.link}>How it works</a>
          <a href="#contact" style={styles.link}>Contact</a>
        </nav>
      </header>

      {/* Full-bleed hero with soft blue gradient */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <h1 style={styles.title}>Welcome to Tutor-Match</h1>
          <p style={styles.subtitle}>
            Find help fast. A clean, simple space for students and tutors.
          </p>
          <div style={styles.ctaRow}>
            <Link className="btn btn-primary" to="/login">Get Started</Link>
            <a className="btn btn-secondary" href="#how">Learn more</a>
          </div>
        </div>
      </section>

      <main style={styles.main}>
        <section id="about" className="container" style={styles.section}>
          <h2 style={styles.h2}>What is Tutor-Match?</h2>
          <p style={styles.p}>
            Tutor-Match connects students with peer tutors for specific courses.
            We're starting simple — clear information and an easy flow — and will add features as we go.
          </p>
        </section>

        <section id="how" className="container" style={styles.section}>
          <h2 style={styles.h2}>How it works</h2>
          <ol style={styles.list}>
            <li>Students browse available tutors and sessions.</li>
            <li>Tutors list courses they can help with and their availability.</li>
            <li>Both sides agree on a time and meet online or in person.</li>
          </ol>
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
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text)', background: 'var(--bg)' },

  header: {
    width: '100%',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--card)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: { fontWeight: 700, letterSpacing: 0.3, color: 'var(--text)' },
  nav: { display: 'flex', gap: 16 },
  link: { color: 'var(--text)', textDecoration: 'none' },

  hero: {
    width: '100%',
    borderBottom: '1px solid var(--border)',
    background: 'linear-gradient(180deg, #EBF2FF 0%, #FFFFFF 100%)',
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    padding: '56px 24px',
  },
  heroInner: { textAlign: 'center' },
  title: { fontSize: 48, margin: 0, color: 'var(--text)' },
  subtitle: { fontSize: 18, color: 'var(--muted)', marginTop: 12, marginBottom: 24 },
  ctaRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },

  main: { flex: '1 0 auto' },
  section: { padding: '40px 0' },
  h2: { margin: '0 0 8px', fontSize: 24, color: 'var(--text)' },
  p: { margin: '8px 0 0', color: 'var(--muted)' },
  list: { margin: '8px 0 0 18px', color: 'var(--muted)' },

  footer: {
    flex: '0 0 auto',
    borderTop: '1px solid var(--border)',
    padding: '32px 24px',
    textAlign: 'center',
    background: 'var(--card)',
  },
  a: { color: 'var(--primary)' },
  copy: { marginTop: 12, fontSize: 12, color: 'var(--muted)' },
};
