import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import Reports from './pages/Reports';
import ScanDetail from './pages/ScanDetail';
import { useAuthStore } from './store/authStore';
import TermsModal from './components/TermsModal';
import GhostPreloader from './components/GhostPreloader';
import SpectralBackground from './components/SpectralBackground';

const ProtectedRoute = ({ children }) => {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (user && !user.termsAccepted) {
        return <TermsModal />;
    }
    return children;
};

const PublicRoute = ({ children }) => {
    const token = useAuthStore((state) => state.token);
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const HomeRedirect = () => {
    const token = useAuthStore((state) => state.token);
    return <Navigate to={token ? "/dashboard" : "/login"} replace />;
};

function App() {
    const [isAppLoaded, setIsAppLoaded] = useState(false);

    return (
        <>
            {!isAppLoaded && <GhostPreloader onComplete={() => setIsAppLoaded(true)} />}
            
            {/* The live Three.js Spectral Ghost canvas starts rendering in the background after the preloader */}
            <SpectralBackground />
            
            <Router>
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/domains" element={
                        <ProtectedRoute>
                            <Domains />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports/:id" element={
                        <ProtectedRoute>
                            <ScanDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;

