import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Tutors from './pages/Tutors';
import TutorProfile from './pages/TutorProfile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/tutor/:id" element={<TutorProfile />} />
      </Routes>
    </Router>
  );
}