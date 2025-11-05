import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
const { logout } = useAuth();
const navigate = useNavigate();

useEffect(() => {
// Clear auth, then go home. Since /logout is public, ProtectedRoute won’t interfere.
logout();
navigate('/', { replace: true });
}, [logout, navigate]);

return null; // or a tiny “Signing you out…” spinner if you like
}