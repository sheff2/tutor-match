import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Tutors from './pages/Tutors';
import TutorProfile from './pages/TutorProfile';
import Profile from './pages/Profile';
import Logout from './pages/Logout';

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
            path="/tutor/:id"
            element={
            <ProtectedRoute>
            <TutorProfile />
            </ProtectedRoute>
            }
            />
        <Route path="/tutor/:id" element={<TutorProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}