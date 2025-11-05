import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student', // default
    });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
          );
      }

      if (result.success) {
        navigate(formData.role === 'tutor' ? '/profile' : '/tutors');
      } else {
        setErrorMessage(result.error || 'Authentication failed');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
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

          {errorMessage && (
            <div style={styles.error}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.field}>
                <label style={styles.label}>Sign up as</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                    />{' '}
                    Student
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="tutor"
                      checked={formData.role === 'tutor'}
                      onChange={handleChange}
                    />{' '}
                    Tutor
                  </label>
                </div>
              </div>
            )}
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
                  autoComplete="name"
                />
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

            <button
              type="submit"
              className="btn btn-primary"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
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
  error: {
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: '#fee',
    color: '#c33',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '16px',
    border: '1px solid #fcc',
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
