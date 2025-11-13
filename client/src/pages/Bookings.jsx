import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch('/api/tutors', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load tutors');
      const data = await res.json();
      setTutors(data.results || []);
    } catch (err) {
      console.error('Failed to load tutors', err);
    }
  };

  const fetchSlots = async (tutorId) => {
    setSlots([]);
    setError(null);
    try {
      const res = await fetch(`/api/slots?tutorId=${tutorId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load slots');
      setSlots(data.slots || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectTutor = (e) => {
    const id = e.target.value;
    setSelectedTutor(id);
    if (id) fetchSlots(id);
    else setSlots([]);
  };

  const handleBook = async (slotId) => {
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tutorId: selectedTutor, slotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      // refresh bookings and slots
      await fetchBookings();
      await fetchSlots(selectedTutor);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
      // Refresh bookings to reflect the change
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const fmt = (iso) => new Date(iso).toLocaleString();

  return (
    <div style={styles.page}>
      <header style={styles.appHeader}>
        <Link to="/" style={styles.brand}>Tutor-Match</Link>
        <nav style={styles.nav}>
          <Link to="/tutors" style={styles.link}>Find Tutors</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <span style={styles.userName}>Hi, {user?.name}!</span>
          <Link to="/logout" style={styles.logoutBtn}>Logout</Link>
        </nav>
      </header>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Bookings</h1>
          <div style={styles.controls}>Manage and create bookings</div>
        </header>

        <div style={styles.grid}>
          <section style={styles.left}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={{ margin: 0 }}>My bookings</h2>
                <div style={styles.badge}>{bookings.length}</div>
              </div>

              {loading ? (
                <div style={styles.empty}>Loading bookings…</div>
              ) : bookings.length === 0 ? (
                <div style={styles.empty}>You don't have any bookings yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {bookings.map((b) => (
                    <div key={b._id} style={styles.bookingCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: '#2d3748' }}>{b.tutorId?.name || '—'}</div>
                          <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>{fmt(b.createdAt)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#667eea' }}>
                            {b.price ? `$${b.price}` : '—'}
                          </div>
                          <div style={{ fontSize: 13, color: '#718096', marginTop: 4, textTransform: 'capitalize' }}>{b.status}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4a5568' }}>
                          <strong>Slot:</strong> {b.slotId ? new Date(b.slotId.start).toLocaleString() : '—'}
                        </span>
                        {b.status !== 'cancelled' && (
                          <button onClick={() => handleCancelBooking(b._id)} style={styles.cancelButton}>Cancel</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside style={styles.right}>
            <div style={styles.panel}>
              <h3 style={{ marginTop: 0 }}>Book a tutor</h3>

              <label style={styles.label}>Choose tutor</label>
              <select value={selectedTutor} onChange={handleSelectTutor} style={styles.select}>
                <option value="">-- select a tutor --</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.courses?.slice(0,2).join(', ')} — ${t.hourlyRate}/hr
                  </option>
                ))}
              </select>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 600, color: '#2d3748' }}>Available slots</div>
                {error && <div style={styles.error}>{error}</div>}
                {slots.length === 0 ? (
                  <div style={styles.empty}>No slots available for this tutor.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {slots.map((s) => {
                      const selectedTutorObj = tutors.find(t => t.id === selectedTutor);
                      // Calculate duration and total price
                      let durationHours = 0;
                      let totalPrice = 0;
                      if (s.start && s.end) {
                        const durationMs = new Date(s.end) - new Date(s.start);
                        durationHours = durationMs / (1000 * 60 * 60);
                        if (selectedTutorObj?.hourlyRate) {
                          totalPrice = Math.round(selectedTutorObj.hourlyRate * durationHours * 100) / 100;
                        }
                      }
                      
                      return (
                        <div key={s._id} style={styles.slotCard}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: '#2d3748' }}>{fmt(s.start)}</div>
                            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
                              Ends: {new Date(s.end).toLocaleTimeString()}
                              {durationHours > 0 && ` (${durationHours}h)`}
                            </div>
                            {totalPrice > 0 && (
                              <div style={{ fontSize: 16, color: '#667eea', fontWeight: 700, marginTop: 6 }}>
                                Total: ${totalPrice}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button 
                              className="btn btn-primary" 
                              style={styles.primary} 
                              onClick={() => handleBook(s._id)} 
                              disabled={s.isBooked || !selectedTutor}
                            >
                              {s.isBooked ? 'Booked' : 'Book'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f7fafc', minHeight: '100vh' },
  appHeader: {
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
    textDecoration: 'none',
  },
  container: { maxWidth: 1100, margin: '0 auto', padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { margin: 0, fontSize: 28, color: '#2d3748', fontWeight: 700 },
  controls: { color: '#718096' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 },
  left: {},
  right: {},
  panel: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600 },
  bookingCard: { borderRadius: 10, padding: 16, border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  empty: { color: '#718096', padding: 12 },
  label: { fontSize: 13, color: '#718096', display: 'block', marginBottom: 6, fontWeight: 500 },
  select: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e0', fontSize: 14 },
  slotCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' },
  primary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 8, padding: '10px 16px', border: 'none', cursor: 'pointer', fontWeight: 600 },
  secondary: { background: 'transparent', border: '1px solid #cbd5e0', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: '#4a5568' },
  error: { color: '#e53e3e', marginBottom: 8, fontSize: 14 },
  cancelButton: {
    background: '#e53e3e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
  }
};
