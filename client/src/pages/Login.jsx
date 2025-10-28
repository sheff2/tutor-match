import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student', // 'student' | 'tutor'
    bio: '',
    hourlyRate: '',
    subjects: '', // comma-separated
    yearsExperience: '',
    location: '',
    onlineOnly: 'true', // string for input, convert to boolean
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Safely parse JSON from a fetch Response
  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      setError('Login is not implemented yet. Please use Sign Up.');
      return;
    }

    try {
      setSubmitting(true);
      const { name, email, password, role } = formData;

      if (!name || !email || !password) {
        setError('Name, email, and password are required.');
        return;
      }

      if (role === 'tutor') {
        // Build tutor payload
        const payload = {
          name,
          email,
          password,
          bio: formData.bio || undefined,
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
          subjects: formData.subjects
            ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean)
            : undefined,
          yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : undefined,
          location: formData.location || undefined,
          onlineOnly: formData.onlineOnly === 'true',
        };

        const res = await fetch('/api/tutors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data?.error || 'Failed to create tutor');
        }

        const data = await res.json();
        setSuccess('Tutor account created!');
        // Navigate to the new tutor profile
        navigate(`/tutor/${data?.tutor?.id ?? ''}`);
        return;
      }

      // Default: student/admin go through /api/users
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || 'Failed to create user');
      }

      setSuccess('Account created!');
      navigate('/tutors');
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={styles.page}>
      {/* Header brand/logo to return home */}
      <header style={styles.header}>
        <Link to="/" style={styles.brand} aria-label="Go to home">
          Tutor-Match
        </Link>
      </header>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Log in to continue to Tutor-Match' : 'Sign up to get started'}
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.field}>
                <label htmlFor="name" style={styles.label}>Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            )}

            {!isLogin && (
              <div style={styles.field}>
                <label htmlFor="role" style={styles.label}>I am a</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
            )}

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {/* Tutor-only extra fields */}
            {!isLogin && formData.role === 'tutor' && (
              <>
                <div style={styles.field}>
                  <label htmlFor="bio" style={styles.label}>Bio (optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>
                <div style={styles.row}>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label htmlFor="hourlyRate" style={styles.label}>Hourly Rate (optional)</label>
                    <input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label htmlFor="yearsExperience" style={styles.label}>Years Experience (optional)</label>
                    <input
                      id="yearsExperience"
                      name="yearsExperience"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.field}>
                  <label htmlFor="subjects" style={styles.label}>Subjects (comma-separated, optional)</label>
                  <input
                    id="subjects"
                    name="subjects"
                    type="text"
                    placeholder="e.g., Calculus, COP3530, React"
                    value={formData.subjects}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.row}>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label htmlFor="location" style={styles.label}>Location (optional)</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label htmlFor="onlineOnly" style={styles.label}>Online Only?</label>
                    <select
                      id="onlineOnly"
                      name="onlineOnly"
                      value={formData.onlineOnly}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={submitting}>
              {submitting ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          <div style={styles.toggle}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={styles.toggleBtn}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #EBF2FF 0%, #FFFFFF 100%)',
    padding: '24px',
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 24,
  },
  brand: {
    fontWeight: 700,
    letterSpacing: 0.3,
    color: 'var(--text)',
    textDecoration: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
  },
  card: {
    background: 'var(--card)',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    margin: '0 0 8px',
    color: 'var(--text)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--muted)',
    textAlign: 'center',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text)',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid var(--border)',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    marginTop: '8px',
    width: '100%',
  },
  toggle: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--muted)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    padding: '0',
  },
};
