import { useState } from 'react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log(isLogin ? 'Logging in...' : 'Signing up...', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={styles.page}>
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

            <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
              {isLogin ? 'Log In' : 'Sign Up'}
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
