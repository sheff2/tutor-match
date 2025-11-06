import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
const { user: ctxUser, logout, loading: authLoading } = useAuth();
const [me, setMe] = useState(null);
const [tutorCard, setTutorCard] = useState(null);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState(null);
const navigate = useNavigate();

useEffect(() => {
const load = async () => {
try {
const token = localStorage.getItem('token');
if (!token) {
// ProtectedRoute will redirect to /login when not authenticated
return;
}
    // Always refresh "me" from the API
    const meRes = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meRes.ok) {
      throw new Error(`Failed to load profile (${meRes.status})`);
    }

    const meJson = await meRes.json();
    setMe(meJson.user);

    // If the user is a tutor, fetch the tutors list and find our own card
    if (meJson.user?.role === 'tutor') {
      const tutorsRes = await fetch('/api/tutors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (tutorsRes.ok) {
        const tutorsJson = await tutorsRes.json();
        const mine = (tutorsJson?.results || []).find(t => String(t.id) === String(meJson.user.id));
        if (mine) setTutorCard(mine);
      }
    }
  } catch (e) {
    setErr(e?.message || 'Failed to load profile');
  } finally {
    setLoading(false);
  }
};

if (!authLoading) load();
}, [authLoading]);
const handleLogout = () => {
// Go home first, then clear auth so ProtectedRoute doesn’t bounce you to /login
navigate('/', { replace: true });
logout();
};
if (authLoading || loading) {
return (
<div style={styles.page}>
<header style={styles.header}>
<Link to="/" style={styles.brand}>Tutor-Match</Link>
<nav style={styles.nav}>
<Link to="/tutors" style={styles.link}>Find Tutors</Link>
</nav>
</header>
<main style={styles.main}>
<div className="container" style={styles.container}>
<h1 style={styles.title}>Loading...</h1>
</div>
</main>
</div>
);
}

return (
<div style={styles.page}>
<header style={styles.header}>
<Link to="/" style={styles.brand}>Tutor-Match</Link>
<nav style={styles.nav}>
<Link to="/tutors" style={styles.link}>Find Tutors</Link>
<button onClick={handleLogout} style={styles.logout}>Log out</button>
</nav>
</header>
  <main style={styles.main}>
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>Your Profile</h1>

      {err && <div style={styles.error}>{err}</div>}

      {!err && (
        <div style={styles.card}>
          <div style={styles.row}><strong>Name:</strong> {me?.name || '—'}</div>
          <div style={styles.row}><strong>Email:</strong> {me?.email || '—'}</div>
          <div style={styles.row}><strong>Role:</strong> {me?.role || '—'}</div>

          {me?.role === 'tutor' && (
            <>
              <div style={styles.row}><strong>Bio:</strong> {tutorCard?.bio || '—'}</div>
              <div style={styles.row}><strong>Hourly Rate:</strong> {tutorCard?.hourlyRate ? `$${tutorCard.hourlyRate}/hr` : '—'}</div>
              <div style={styles.row}><strong>Subjects:</strong> {(tutorCard?.courses || []).join(', ') || '—'}</div>
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <Link to="/tutors" className="btn btn-primary">Browse Tutors</Link>
          </div>
        </div>
      )}
    </div>
  </main>
</div>
);
}
const styles = {
page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
header: { width: '100%', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', position: 'sticky', top: 0, zIndex: 10 },
brand: { fontWeight: 700, letterSpacing: 0.3, color: 'var(--text)', textDecoration: 'none' },
nav: { display: 'flex', gap: 16, alignItems: 'center' },
link: { color: 'var(--text)', textDecoration: 'none' },
logout: { border: '1px solid var(--border)', background: 'var(--card)', padding: '6px 12px', borderRadius: 6, color: 'var(--text)', cursor: 'pointer' },
main: { flex: '1 0 auto', padding: '40px 24px' },
container: { maxWidth: 800, margin: '0 auto' },
title: { fontSize: 32, margin: 0, color: 'var(--text)', textAlign: 'center' },
error: { textAlign: 'center', background: '#ffe5e5', color: '#a00', padding: 12, borderRadius: 8, marginTop: 16 },
card: { marginTop: 24, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, color: 'var(--text)' },
row: { marginTop: 8 },
};