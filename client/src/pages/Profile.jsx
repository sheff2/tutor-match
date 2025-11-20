import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

function InlineBioEditor({ initialBio, onSaved, onCancel, isTutor = false }) {
  const { updateUserProfile, updateTutorProfile } = useAuth();
  const [bio, setBio] = useState(initialBio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setBio(initialBio || '');
  }, [initialBio]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const res = isTutor 
        ? await updateTutorProfile({ bio })
        : await updateUserProfile({ bio });
        
      setSaving(false);
      if (res.success) {
        setMessage('Saved');
        if (onSaved) onSaved(res);
      } else {
        setMessage(res.error || 'Save failed');
      }
    } catch {
      setSaving(false);
      setMessage('Save failed');
    }
  };

  return (
    <>
      <textarea 
        value={bio} 
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        placeholder="Tell us about yourself..."
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #cbd5e0',
          fontSize: 14,
          lineHeight: 1.6,
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        {message && <span style={{ fontSize: 13, color: message === 'Saved' ? '#38a169' : '#e53e3e', marginRight: 'auto' }}>{message}</span>}
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ 
            fontSize: 13,
            padding: '6px 12px',
            background: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 8,
          }}
        >
          Cancel
        </button>
        <button 
          onClick={save} 
          disabled={saving} 
          className="btn"
          style={{ 
            fontSize: 13,
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </>
  );
}

function TutorDetailsInlineEditor({ initial = {}, onSaved, onCancel }) {
  const { updateTutorProfile } = useAuth();
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate ?? '');
  const [subjects, setSubjects] = useState((initial.subjects || initial.courses || []).join(', '));
  const [onlineOnly, setOnlineOnly] = useState(!!initial.onlineOnly);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true);
    setMsg('');
    const payload = {
      hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate),
      subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
      onlineOnly,
    };

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
      const res = await updateTutorProfile(payload);
      if (res.success) {
        setMsg('Saved');
        if (onSaved && res.tutor) onSaved(res.tutor);
      } else {
        setMsg(res.error || 'Save failed');
      }
    } catch (err) {
      console.error('Tutor profile save error', err);
      setMsg('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    infoRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 16, 
      padding: '14px 0', 
      borderBottom: '1px solid #f7fafc',
    },
    infoLabel: { 
      minWidth: 140, 
      color: '#718096', 
      fontSize: 14,
      fontWeight: 600,
    },
    infoValue: { flex: 1, fontSize: 15, color: '#2d3748', fontWeight: 500 },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: 6,
      border: '1px solid #cbd5e0',
      fontSize: 14,
      fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial',
    }
  };

  return (
    <>
      <div style={styles.infoRow}>
        <div style={styles.infoLabel}>Hourly Rate</div>
        <input
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          style={styles.input}
          min="0"
          placeholder="Enter hourly rate"
        />
      </div>
      <div style={styles.infoRow}>
        <div style={styles.infoLabel}>Subjects</div>
        <input
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          style={styles.input}
          placeholder="Enter subjects (comma-separated)"
        />
      </div>
      <div style={styles.infoRow}>
        <div style={styles.infoLabel}>Online</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="checkbox" 
            checked={onlineOnly} 
            onChange={(e) => setOnlineOnly(e.target.checked)} 
          />
          <span style={{ fontSize: 14, color: '#4a5568' }}>Online sessions only</span>
        </label>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button 
          onClick={onCancel} 
          className="btn"
          style={{ 
            fontSize: 13, 
            padding: '8px 16px',
            background: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button 
          onClick={save} 
          disabled={saving}
          className="btn"
          style={{ 
            fontSize: 13, 
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {msg && <div style={{ marginTop: 8, color: msg === 'Saved' ? '#38a169' : '#e53e3e', fontSize: 13 }}>{msg}</div>}
    </>
  );
}

function TutorProfileEditor({ initial = {}, onSaved }) {
  const { updateTutorProfile } = useAuth();
  const [bio, setBio] = useState(initial.bio || '');
  const [hourlyRate, setHourlyRate] = useState(initial.hourlyRate ?? '');
  const [subjects, setSubjects] = useState((initial.subjects || []).join(', '));
  const [onlineOnly, setOnlineOnly] = useState(!!initial.onlineOnly);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setBio(initial.bio || '');
    setHourlyRate(initial.hourlyRate ?? '');
    setSubjects((initial.subjects || []).join(', '));
    setOnlineOnly(!!initial.onlineOnly);
  }, [initial]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    const payload = {
      bio,
      hourlyRate: hourlyRate === '' ? undefined : Number(hourlyRate),
      subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
      onlineOnly,
    };

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
      const res = await updateTutorProfile(payload);
      if (res.success) {
        setMsg('Saved');
        if (onSaved && res.tutor) onSaved(res.tutor);
      } else {
        setMsg(res.error || 'Save failed');
      }
    } catch (err) {
      console.error('Tutor profile save error', err);
      setMsg('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 12, background: 'var(--card)', border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Edit tutor profile</h3>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
        <div style={{ flex: '0 0 160px' }}>
          <label>Hourly rate (USD)</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            style={{ width: '100%' }}
            min="0"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label>Subjects (comma-separated)</label>
          <input
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
          Online only
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <div style={{ color: msg === 'Saved' ? 'green' : 'crimson' }}>{msg}</div>}
      </div>
    </div>
  );
}
 
 
export default function Profile() {
  const { user, logout, loading: authLoading } = useAuth();
  const [tutorCard, setTutorCard] = useState(null);
  const [editing, setEditing] = useState(null); // 'student' | 'tutor' | null
  const [tutorLoading, setTutorLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  
  // Fetch tutor card only if role === tutor, after auth context ready
  useEffect(() => {
    const fetchTutorCard = async () => {
      if (!user || user.role !== 'tutor') return;
      setTutorLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/tutors', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          const mine = (json.results || []).find(t => String(t.id) === String(user.id));
          if (mine) setTutorCard(mine);
        }
        // fetch this tutor's slots
        try {
          setSlotsLoading(true);
          const sres = await fetch(`/api/slots?tutorId=${user?.id}&includeBooked=true`, { headers: { Authorization: `Bearer ${token}` } });
          if (sres.ok) {
            const sj = await sres.json();
            setSlots(sj.slots || []);
          }
        } catch (e) {
          console.error('Failed to fetch slots', e);
        } finally {
          setSlotsLoading(false);
        }
        // fetch bookings to check if tutor can edit profile
        try {
          const bres = await fetch('/api/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
          if (bres.ok) {
            const bj = await bres.json();
            setBookings(bj.bookings || []);
          }
        } catch (e) {
          console.error('Failed to fetch bookings', e);
        }
      } catch (e) {
        setErr(e?.message || 'Failed to load tutor data');
      } finally {
        setTutorLoading(false);
      }
    };
    if (!authLoading) fetchTutorCard();
  }, [authLoading, user]);

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  // While auth is hydrating, block render entirely to prevent flicker
  if (authLoading) return null;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.brand}>Tutor-Match</Link>
        <nav style={styles.nav}>
          <Link to="/tutors" style={styles.link}>Find Tutors</Link>
          <button onClick={handleLogout} style={styles.logout}>Log out</button>
        </nav>
      </header>

      {/* Profile cover */}
      <div style={styles.cover} />

      <main style={styles.main}>
        <div style={styles.containerGrid}>
          {/* Left column: avatar card */}
          <aside style={styles.leftCard}>
            <div style={styles.avatarLarge}>
              <Avatar src={user?.avatarUrl} name={user?.name} size={150} />
            </div>
            <h2 style={styles.name}>{user?.name}</h2>

            {/* show tutor stats only for tutors */}
            {user?.role === 'tutor' && (
              <div style={styles.stats}>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>{tutorCard?.rating ?? '—'}</span>
                  <div style={styles.statLabel}>Rating</div>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>{tutorCard?.yearsExperience ?? '—'}</span>
                  <div style={styles.statLabel}>Years Exp</div>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>{(tutorCard?.courses || []).length || '—'}</span>
                  <div style={styles.statLabel}>Subjects</div>
                </div>
              </div>
            )}

            {/* Inline bio on the left card - only for students */}
            {user?.role !== 'tutor' && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <div style={{ color: '#718096', fontSize: 12, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>About</div>
                {editing === 'bio' ? (
                  <InlineBioEditor 
                    initialBio={user?.bio} 
                    onSaved={() => setEditing(null)} 
                    onCancel={() => setEditing(null)} 
                    isTutor={false}
                  />
                ) : (
                  <div>
                    <div style={{ marginBottom: 12, lineHeight: 1.6, color: '#4a5568' }}>{user?.bio || 'No bio yet.'}</div>
                    <button 
                      onClick={() => setEditing('bio')} 
                      className="btn" 
                      style={{ 
                        fontSize: 13, 
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                      }}
                    >
                      Edit Bio
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <Link to="/tutors" className="btn btn-primary" style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '12px',
                fontWeight: 600,
                borderRadius: 10,
              }}>Browse Tutors</Link>
            </div>
            
            {user?.role === 'tutor' && (
              <div style={{ marginTop: 12 }}>
                <Link to="/bookings" className="btn" style={{ 
                  width: '100%',
                  padding: '12px',
                  fontWeight: 600,
                  borderRadius: 10,
                  border: '2px solid #667eea',
                  color: '#667eea',
                  background: '#fff',
                }}>My Bookings</Link>
              </div>
            )}
          </aside>

          {/* Right column: details */}
          <section style={styles.rightColumn}>
            {err && <div style={styles.error}>{err}</div>}
            {tutorLoading && <div style={{ marginBottom: 12, color: 'var(--muted)' }}>Loading tutor details…</div>}

            {/* Card: Basic info */}
            <div style={styles.infoCard}>
                <div style={styles.infoRow}><div style={styles.infoLabel}>Name</div><div style={styles.infoValue}>{user?.name || '—'}</div></div>
                <div style={styles.infoRow}><div style={styles.infoLabel}>Email</div><div style={styles.infoValue}>{user?.email || '—'}</div></div>
            </div>

            {/* Tutor details */}
            {user?.role === 'tutor' && (
              <>
                <div style={styles.infoCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={styles.sectionTitle}>Tutor details</div>
                  </div>
                  {editing === 'tutor' ? (
                    <TutorDetailsInlineEditor 
                      initial={tutorCard} 
                      onSaved={(t) => { setTutorCard(t); setEditing(null); }}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <>
                      <div style={styles.infoRow}><div style={styles.infoLabel}>Hourly Rate</div><div style={styles.infoValue}>{tutorCard?.hourlyRate ? `$${tutorCard.hourlyRate}/hr` : '—'}</div></div>
                      <div style={styles.infoRow}><div style={styles.infoLabel}>Subjects</div><div style={styles.infoValue}>{(tutorCard?.courses || []).join(', ') || '—'}</div></div>
                      <div style={styles.infoRow}><div style={styles.infoLabel}>Online</div><div style={styles.infoValue}>{tutorCard?.onlineOnly ? 'Yes' : 'No'}</div></div>
                      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'declined');
                            if (activeBookings.length > 0) {
                              setErr('Cannot edit profile details because you have existing bookings.');
                            } else {
                              setErr(null);
                              setEditing('tutor');
                            }
                          }} 
                          className="btn"
                          style={{ 
                            fontSize: 13, 
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          Edit Details
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Tutor bio section */}
                <div style={styles.infoCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={styles.sectionTitle}>Bio</div>
                  </div>
                  {editing === 'tutorBio' ? (
                    <InlineBioEditor 
                      initialBio={tutorCard?.bio} 
                      onSaved={(res) => {
                        if (res.tutor) setTutorCard(res.tutor);
                        setEditing(null);
                      }} 
                      onCancel={() => setEditing(null)} 
                      isTutor={true}
                    />
                  ) : (
                    <>
                      <div style={{ marginBottom: 12, lineHeight: 1.6, color: '#4a5568' }}>
                        {tutorCard?.bio || 'No bio yet.'}
                      </div>
                      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setEditing('tutorBio')} 
                          className="btn"
                          style={{ 
                            fontSize: 13, 
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          Edit Bio
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Tutor slot management */}
            {user?.role === 'tutor' && (
              <div style={styles.infoCard}>
                <div style={styles.sectionTitle}>Manage availability</div>
                <TutorSlotsManager slots={slots} loading={slotsLoading} onChange={(next) => setSlots(next)} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );

}
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f7fafc',
    color: 'var(--text)',
    fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial',
  },
  header: {
    width: '100%',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderBottom: '1px solid #e2e8f0',
  },
  brand: { fontWeight: 700, letterSpacing: 0.3, color: '#667eea', textDecoration: 'none', fontSize: 20 },
  nav: { display: 'flex', gap: 16, alignItems: 'center' },
  link: { 
    color: '#4a5568', 
    textDecoration: 'none', 
    fontWeight: 500,
    transition: 'color 0.2s',
    ':hover': { color: '#667eea' }
  },
  logout: { 
    border: 'none', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    padding: '8px 16px', 
    borderRadius: 8, 
    color: '#fff', 
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'transform 0.2s',
  },

  cover: {
    height: 200,
    background: 'linear-gradient(135deg, #a4edffff 0%, #f4d9ffff 100%)',
    position: 'relative',
    overflow: 'hidden',
  },

  main: { 
    flex: '1 0 auto', 
    padding: '0 32px 48px', 
    maxWidth: '1280px', 
    margin: '-80px auto 0', 
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  containerGrid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' },

  leftCard: { 
    background: '#fff', 
    borderRadius: 20, 
    padding: 32, 
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    position: 'sticky',
    top: 100,
  },
  avatarLarge: { 
    width: 160, 
    height: 160, 
    margin: '-80px auto 20px',
    border: '6px solid #fff',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    background: '#fff',
  },
  name: { margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1a202c' },
  role: { color: '#718096', marginTop: 0, fontSize: 14, fontWeight: 500 },
  stats: { 
    display: 'flex', 
    gap: 16, 
    justifyContent: 'space-around', 
    marginTop: 24,
    padding: '20px 0',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
  },
  statItem: { 
    flex: 1, 
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#667eea',
    display: 'block',
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: '#718096', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 },

  rightColumn: {},
  infoCard: { 
    background: '#fff', 
    borderRadius: 16, 
    padding: 28, 
    marginBottom: 24,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  infoRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 16, 
    padding: '14px 0', 
    borderBottom: '1px solid #f7fafc',
  },
  infoLabel: { 
    minWidth: 140, 
    color: '#718096', 
    fontSize: 14,
    fontWeight: 600,
  },
  infoValue: { flex: 1, fontSize: 15, color: '#2d3748', fontWeight: 500 },
  sectionTitle: { 
    fontSize: 18, 
    marginBottom: 20, 
    fontWeight: 700,
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  error: { 
    textAlign: 'center', 
    background: '#fff5f5', 
    color: '#c53030', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
    border: '1px solid #feb2b2',
  },
  dayToggle: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 10,
    border: '2px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 13,
    transition: 'all 0.2s',
  },
  formSection: {
    background: '#f7fafc',
    padding: 24,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
  },
  formSectionTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 17,
    fontWeight: 700,
    color: '#2d3748',
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#4a5568',
    marginBottom: 8,
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e0',
    background: '#fff',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial',
    transition: 'border-color 0.2s',
  }
};

function TutorSlotsManager({ slots: initial = [], loading, onChange }) {
  const token = localStorage.getItem('token');
  const [slots, setSlots] = useState(initial || []);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  // State for bulk creation
  const [bulkStartDate, setBulkStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulkEndDate, setBulkEndDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [bulkStartTime, setBulkStartTime] = useState('09:00');
  const [bulkEndTime, setBulkEndTime] = useState('17:00');
  const [bulkDays, setBulkDays] = useState({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false });
  const [bulkSaving, setBulkSaving] = useState(false);


  useEffect(() => setSlots(initial || []), [initial]);

  const handleCreate = async () => {
    setErr(null);
    if (!start || !end) return setErr('Start and end are required');
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || s >= e) return setErr('Invalid times');
    setSaving(true);
    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ start: s.toISOString(), end: e.toISOString() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to create slot');
      const next = [j.slot, ...slots].sort((a, b) => new Date(b.start) - new Date(a.start));
      setSlots(next);
      if (onChange) onChange(next);
      setStart(''); setEnd('');
    } catch (e) {
      setErr(e.message || 'Create failed');
    } finally { setSaving(false); }
  };

  const handleBulkCreate = async () => {
    setErr(null);
    setBulkSaving(true);

    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const selectedDays = Object.keys(bulkDays).filter(d => bulkDays[d]).map(d => dayMap[d]);
    
    if (selectedDays.length === 0) {
      setErr('Please select at least one day.');
      setBulkSaving(false);
      return;
    }

    const slotsToCreate = [];
    const endDate = new Date(bulkEndDate);
    let currentDate = new Date(bulkStartDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      if (selectedDays.includes(currentDate.getDay())) {
        const [startHour, startMinute] = bulkStartTime.split(':').map(Number);
        const [endHour, endMinute] = bulkEndTime.split(':').map(Number);

        const startDate = new Date(currentDate);
        startDate.setHours(startHour, startMinute, 0, 0);

        const slotEndDate = new Date(currentDate);
        slotEndDate.setHours(endHour, endMinute, 0, 0);

        if (startDate < slotEndDate) {
          slotsToCreate.push({ start: startDate.toISOString(), end: slotEndDate.toISOString() });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slotsToCreate.length === 0) {
      setErr('No slots to create in the selected range.');
      setBulkSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slots: slotsToCreate, startDate: bulkStartDate, endDate: bulkEndDate }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to create slots');
      const next = [...j.slots, ...slots].sort((a, b) => new Date(b.start) - new Date(a.start));
      setSlots(next);
      if (onChange) onChange(next);
    } catch (e) {
      setErr(e.message || 'Bulk create failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/slots/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      const next = slots.filter(s => String(s._id || s.id) !== String(id));
      setSlots(next);
      if (onChange) onChange(next);
    } catch (e) {
      setErr(e.message || 'Delete failed');
    }
  };

  const handleDayToggle = (day) => {
    setBulkDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div>
      {/* Bulk Create Form */}
      <div style={styles.formSection}>
        <h4 style={styles.formSectionTitle}>Create recurring slots</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={styles.label}>Start date</label>
            <input type="date" value={bulkStartDate} onChange={e => setBulkStartDate(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>End date</label>
            <input type="date" value={bulkEndDate} onChange={e => setBulkEndDate(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Start time</label>
            <input type="time" value={bulkStartTime} onChange={e => setBulkStartTime(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>End time</label>
            <input type="time" value={bulkEndTime} onChange={e => setBulkEndTime(e.target.value)} style={styles.input} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>On days</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {Object.keys(bulkDays).map(day => (
              <button
                key={day}
                onClick={() => handleDayToggle(day)}
                style={{
                  ...styles.dayToggle,
                  background: bulkDays[day] ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                  color: bulkDays[day] ? '#fff' : '#4a5568',
                  borderColor: bulkDays[day] ? 'transparent' : '#cbd5e0',
                  border: bulkDays[day] ? 'none' : '1px solid #cbd5e0',
                }}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handleBulkCreate} 
          disabled={bulkSaving} 
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: bulkSaving ? 0.6 : 1,
          }}
        >
          {bulkSaving ? 'Creating...' : `Create recurring slots`}
        </button>
      </div>

      {/* Single Slot Form */}
      <div style={{...styles.formSection, marginTop: 20}}>
        <h4 style={styles.formSectionTitle}>Create single slot</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={styles.label}>Start</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>End</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} style={styles.input} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <button 
              onClick={handleCreate} 
              disabled={saving} 
              className="btn"
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Creating...' : 'Create single slot'}
            </button>
          </div>
        </div>
      </div>
      
      {err && <div style={{ color: 'crimson', marginTop: 12, background: 'rgba(255,0,0,0.05)', padding: 10, borderRadius: 8 }}>{err}</div>}

      {/* Slots List */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>My Availability</h4>
        {loading ? (
          <div>Loading slots...</div>
        ) : slots.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '12px 0' }}>No availability yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {slots.map(s => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: s.isBooked ? '#f0f0f0' : 'transparent', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{new Date(s.start).toLocaleString()}</div>
                  {s.isBooked && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Booked</span>}
                </div>
                <button 
                  onClick={() => handleDelete(s._id)} 
                  className="btn" 
                  style={{ 
                    background: 'transparent', 
                    color: '#e53e3e', 
                    padding: '6px 12px',
                    fontSize: 13,
                    border: '1px solid #e53e3e',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
