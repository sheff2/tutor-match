import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, revieweeId, revieweeName }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [bookingReviews, setBookingReviews] = useState({}); // Map of bookingId -> review
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Fetch existing reviews for all bookings
    const fetchReviews = async () => {
      const reviews = {};
      for (const booking of bookings) {
        try {
          const res = await fetch(`/api/reviews/booking/${booking._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.review) {
            reviews[booking._id] = data.review;
          }
        } catch (err) {
          console.error('Failed to fetch review for booking', booking._id, err);
        }
      }
      setBookingReviews(reviews);
    };

    if (bookings.length > 0) {
      fetchReviews();
    }
  }, [bookings, token]);

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

  const handleSelectTutor = (id) => {
    setSelectedTutor(id);
    setIsDropdownOpen(false);
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

  const handleMarkComplete = async (bookingId) => {
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark as complete');
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenReviewModal = (booking) => {
    // Determine who to review based on current user role
    const revieweeId = String(booking.tutorId._id || booking.tutorId.id) === String(user.id) 
      ? booking.studentId._id || booking.studentId.id
      : booking.tutorId._id || booking.tutorId.id;
    
    const revieweeName = String(booking.tutorId._id || booking.tutorId.id) === String(user.id)
      ? booking.studentId.name
      : booking.tutorId.name;

    setReviewModal({
      bookingId: booking._id,
      revieweeId,
      revieweeName,
    });
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    
    setSubmittingReview(true);
    setError(null);
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reviewModal.bookingId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      
      // Update local state with new review
      setBookingReviews(prev => ({
        ...prev,
        [reviewModal.bookingId]: data.review,
      }));
      
      // Close modal
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingReview(false);
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
                  {bookings.map((b) => {
                    const hasReview = bookingReviews[b._id];
                    const canReview = b.status === 'completed' && !hasReview;
                    const canMarkComplete = b.status === 'requested' || b.status === 'accepted';
                    
                    return (
                    <div key={b._id} style={styles.bookingCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          {b.tutorId ? (
                            <Link 
                              to={`/tutor/${b.tutorId._id}`} 
                              style={{ fontWeight: 700, fontSize: 16, color: '#667eea', textDecoration: 'none', transition: 'color 0.2s' }}
                              onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                              onMouseLeave={(e) => e.target.style.color = '#667eea'}
                            >
                              {b.tutorId.name}
                            </Link>
                          ) : (
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#2d3748' }}>—</div>
                          )}
                          <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>{fmt(b.createdAt)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#667eea' }}>
                            {b.price ? `$${b.price}` : '—'}
                          </div>
                          <div style={{ fontSize: 13, color: '#718096', marginTop: 4, textTransform: 'capitalize' }}>{b.status}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, fontSize: 14 }}>
                        <span style={{ color: '#4a5568' }}>
                          <strong>Slot:</strong> {b.slotId ? new Date(b.slotId.start).toLocaleString() : '—'}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button onClick={() => handleCancelBooking(b._id)} style={styles.cancelButton}>Cancel</button>
                        )}
                        {canMarkComplete && (
                          <button onClick={() => handleMarkComplete(b._id)} style={styles.completeButton}>
                            Mark Complete
                          </button>
                        )}
                        {canReview && (
                          <button onClick={() => handleOpenReviewModal(b)} style={styles.reviewButton}>
                            Leave Review
                          </button>
                        )}
                        {hasReview && (
                          <div style={styles.reviewedBadge}>
                            <StarRating rating={hasReview.rating} size={14} showNumber={false} />
                            <span style={{ marginLeft: 4 }}>Reviewed</span>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside style={styles.right}>
            <div style={styles.panel}>
              <h3 style={{ marginTop: 0 }}>Book a tutor</h3>

              <label style={styles.label}>Choose tutor</label>
              <div style={styles.customSelect} ref={dropdownRef}>
                <div 
                  style={styles.selectTrigger} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedTutor ? (
                    (() => {
                      const tutor = tutors.find(t => t.id === selectedTutor);
                      return (
                        <div style={styles.selectedTutor}>
                          <div style={styles.tutorAvatar}>
                            {tutor.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={styles.tutorName}>{tutor.name}</div>
                            <div style={styles.tutorInfo}>
                              {tutor.courses?.slice(0, 2).join(', ')} • ${tutor.hourlyRate}/hr
                            </div>
                          </div>
                          <svg style={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={styles.placeholder}>
                      <span>Select a tutor...</span>
                      <svg style={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
                
                {isDropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    {tutors.length === 0 ? (
                      <div style={styles.dropdownEmpty}>No tutors available</div>
                    ) : (
                      tutors.map((tutor) => (
                        <div key={tutor.id}>
                          <div 
                            style={{
                              ...styles.dropdownItem,
                              ...(selectedTutor === tutor.id ? styles.dropdownItemSelected : {})
                            }}
                            onClick={() => handleSelectTutor(tutor.id)}
                          >
                            <div style={styles.tutorAvatar}>
                              {tutor.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={styles.tutorName}>{tutor.name}</div>
                              <div style={styles.tutorInfo}>
                                {tutor.courses?.slice(0, 2).join(', ')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={styles.tutorPrice}>${tutor.hourlyRate}/hr</div>
                              <Link
                                to={`/tutor/${tutor.id}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  fontSize: 12,
                                  color: '#667eea',
                                  textDecoration: 'none',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  border: '1px solid #667eea',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = '#667eea';
                                  e.target.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = '#667eea';
                                }}
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

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

      {/* Review Modal */}
      {reviewModal && (
        <div style={styles.modalOverlay} onClick={() => setReviewModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Review {reviewModal.revieweeName}</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      ...styles.starButton,
                      color: star <= reviewRating ? '#f59e0b' : '#cbd5e0',
                      fontSize: 32,
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Share your experience..."
                style={styles.textarea}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setReviewModal(null)} 
                style={styles.secondary}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview} 
                style={styles.primary}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  customSelect: {
    position: 'relative',
    width: '100%',
  },
  selectTrigger: {
    width: '100%',
    padding: '12px',
    borderRadius: 8,
    border: '1px solid #cbd5e0',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#a0aec0',
    }
  },
  selectedTutor: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#718096',
    fontSize: 14,
  },
  chevron: {
    color: '#718096',
    transition: 'transform 0.2s',
  },
  tutorAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  tutorName: {
    fontWeight: 600,
    fontSize: 14,
    color: '#2d3748',
  },
  tutorInfo: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  tutorPrice: {
    fontWeight: 700,
    fontSize: 14,
    color: '#667eea',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    maxHeight: 320,
    overflowY: 'auto',
    zIndex: 100,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid #f7fafc',
    ':hover': {
      background: '#f7fafc',
    }
  },
  dropdownItemSelected: {
    background: '#f0f4ff',
  },
  dropdownEmpty: {
    padding: 16,
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
  },
  slotCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' },
  primary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: 8, padding: '10px 16px', border: 'none', cursor: 'pointer', fontWeight: 600 },
  secondary: { background: 'transparent', border: '1px solid #cbd5e0', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', color: '#4a5568' },
  error: { color: '#e53e3e', marginBottom: 8, fontSize: 14 },
  cancelButton: {
    background: '#fff',
    color: '#e53e3e',
    border: '1.5px solid #e53e3e',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  completeButton: {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(56,161,105,0.2)',
  },
  reviewButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  reviewedBadge: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 500,
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    transition: 'transform 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e0',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
};
