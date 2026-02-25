import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const baseLinks = [
    { to: '/', label: 'Home' },
    { to: '/generate', label: 'Create Resume' },
    { to: '/ats-checker', label: 'ATS Checker' },
    { to: '/features', label: 'Features' },
  ];

  const currentRole = localStorage.getItem('userRole');
  const links = currentRole === 'ADMIN'
    ? [...baseLinks, { to: '/admin', label: 'Admin Panel' }]
    : baseLinks;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo - clicks to home */}
        <RouterLink to="/" className="navbar-logo" onClick={() => setMobileNavOpen(false)}>
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="17" cy="17" r="4" fill="#818cf8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 17l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="logo-text">ATS Resify</span>
        </RouterLink>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          {links.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </RouterLink>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="user-menu" ref={menuRef}>
                <button className="user-button" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="user-avatar">{getInitials(user.name)}</div>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <svg className="user-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{getInitials(user.name)}</div>
                      <div className="dropdown-info">
                        <span className="dropdown-name">{user.name}</span>
                        <span className="dropdown-email">{user.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <RouterLink to="/generate" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Create Resume
                    </RouterLink>
                    <RouterLink to="/ats-checker" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      ATS Checker
                    </RouterLink>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="btn-signup" onClick={handleLogin}>
              Get Started
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            className={`mobile-menu-btn ${mobileNavOpen ? 'open' : ''}`}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <div className="mobile-nav">
          {links.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </RouterLink>
          ))}
          {user ? (
            <div className="mobile-auth-section">
              <div className="mobile-user-info">
                <div className="avatar">{getInitials(user.name)}</div>
                <span className="user-name">{user.name}</span>
              </div>
              <button className="btn-logout-mobile" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="mobile-auth-btns">
              <button className="btn-signup" onClick={handleLogin}>Get Started</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
