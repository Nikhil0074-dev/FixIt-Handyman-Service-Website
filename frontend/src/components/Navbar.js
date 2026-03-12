import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🔧</span>
          <span className="logo-text">Fix<span className="logo-accent">It</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/providers" className={`nav-link ${isActive('/providers') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Providers</Link>

          {!user ? (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-btn" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <div className="nav-user">
                <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
