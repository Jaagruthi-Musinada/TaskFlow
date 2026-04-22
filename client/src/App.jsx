import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import OAuthSuccess from './pages/OAuthSuccess';
import VerifyEmail from './pages/VerifyEmail';

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>; // Or a nice spinner
    return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return !token ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                    <Route path="/oauth-success" element={<OAuthSuccess />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
