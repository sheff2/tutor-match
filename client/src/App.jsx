import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Tutors from './pages/Tutors';
import TutorProfile from './pages/TutorProfile';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Bookings from './pages/Bookings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tutors"
            element={
              <ProtectedRoute>
                <Tutors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/:id"
            element={
            <ProtectedRoute>
            <TutorProfile />
            </ProtectedRoute>
            }
            />
        {/** Removed duplicate unprotected /tutor/:id route that could cause double fetch & flicker */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}