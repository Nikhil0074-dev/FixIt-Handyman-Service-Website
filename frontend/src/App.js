import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Login, Register } from './pages/Login';
import Services from './pages/Services';
import { BookingPage, BookingDetail } from './pages/BookingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Dashboard.Admin';
import './App.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🔧</span>
            <span className="logo-text">Fix<span className="logo-accent">It</span></span>
            <p>Professional home services at your doorstep</p>
          </div>
          <div className="footer-links">
            <div><h4>Services</h4><a href="/services">Plumbing</a><a href="/services">Electrical</a><a href="/services">Cleaning</a></div>
            <div><h4>Company</h4><a href="/">About</a><a href="/">Careers</a><a href="/">Contact</a></div>
            <div><h4>Support</h4><a href="/">Help Center</a><a href="/">Privacy Policy</a><a href="/">Terms</a></div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 FixIt. All rights reserved.</div>
      </footer>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "'DM Sans', sans-serif", fontSize: '14px' } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
