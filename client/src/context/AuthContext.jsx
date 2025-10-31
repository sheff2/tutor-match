import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Use proxy for API calls (vite will forward /api to backend)
const API_BASE = '';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, role = 'student') => {
    setError(null);
    console.log('[FRONTEND] Register request:', { email, name, role });

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      console.log('[FRONTEND] Register response status:', response.status, response.statusText);
      console.log('[FRONTEND] Register response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('[FRONTEND] Register raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('[FRONTEND] Register parsed JSON:', data);
      } catch (parseError) {
        console.error('[FRONTEND] Failed to parse JSON:', parseError);
        console.error('[FRONTEND] Response text was:', responseText);
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    setError(null);
    console.log('[FRONTEND] Login request:', { email });

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('[FRONTEND] Login response status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('[FRONTEND] Login raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('[FRONTEND] Login parsed JSON:', data);
      } catch (parseError) {
        console.error('[FRONTEND] Failed to parse JSON:', parseError);
        console.error('[FRONTEND] Response text was:', responseText);
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
