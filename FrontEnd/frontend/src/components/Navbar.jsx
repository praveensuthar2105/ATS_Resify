import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { API_ROOT_URL } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (token && name && email) {
      setUser({ name, email });
    }
  }, []);

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
    window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
    setMenuOpen(false);
    // Full page refresh to clear all state and force re-authentication
    window.location.href = '/';
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
    <header className="fixed top-0 left-0 right-0 h-16 z-[1000] bg-brutal-black border-b-2 border-brutal-white font-mono uppercase">
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <RouterLink to="/" className="flex items-center no-underline gap-3" onClick={() => setMobileNavOpen(false)}>
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          <span className="text-xl font-black tracking-tighter text-brutal-white">ATS RESIFY</span>
        </RouterLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              className={`text-xs font-bold hover:text-neon-green underline decoration-2 underline-offset-4 no-underline transition-colors ${location.pathname === link.to ? 'text-neon-green' : 'text-brutal-white'
                }`}
              style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}
            >
              {link.label}
            </RouterLink>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center gap-2 px-2 py-1 bg-transparent border border-brutal-white cursor-pointer transition-all hover:border-neon-green"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <div className="w-8 h-8 bg-neon-green text-black flex items-center justify-center font-bold text-xs">
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-brutal-white">{user.name.split(' ')[0]}</span>
                  <svg className="text-brutal-white" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="dropdown-menu absolute top-[calc(100%+8px)] right-0 min-w-[240px] bg-brutal-black border-2 border-brutal-white z-[1001] overflow-hidden">
                    <div className="p-4 flex items-center gap-3 border-b border-brutal-white/30">
                      <div className="w-10 h-10 bg-neon-green text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-brutal-white">{user.name}</span>
                        <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
                      </div>
                    </div>
                    <RouterLink
                      to="/generate"
                      className="w-full flex items-center gap-3 px-4 py-3 text-brutal-white text-xs font-bold no-underline transition-all hover:bg-neon-green hover:text-black"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      CREATE RESUME
                    </RouterLink>
                    <RouterLink
                      to="/ats-checker"
                      className="w-full flex items-center gap-3 px-4 py-3 text-brutal-white text-xs font-bold no-underline transition-all hover:bg-neon-green hover:text-black"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      ATS CHECKER
                    </RouterLink>
                    <div className="h-px bg-brutal-white/20"></div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 text-xs font-bold bg-transparent border-none cursor-pointer transition-all hover:bg-red-500/20 uppercase font-mono"
                      onClick={handleLogout}
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      LOGOUT
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="hidden sm:block text-xs font-bold text-brutal-white hover:text-neon-green bg-transparent border-none cursor-pointer transition-colors uppercase font-mono"
                onClick={handleLogin}
              >
                Log In
              </button>
              <button
                className="bg-neon-green text-black text-xs font-black px-4 py-2 brutal-shadow-white border border-brutal-white cursor-pointer transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none uppercase font-mono"
                onClick={handleLogin}
              >
                GET STARTED
              </button>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            className={`mobile-menu-btn flex md:hidden flex-col justify-center items-center gap-[5px] w-10 h-10 bg-transparent border border-brutal-white cursor-pointer p-0 transition-all ${mobileNavOpen ? 'open' : ''}`}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-[18px] h-[2px] bg-brutal-white transition-all"></span>
            <span className="block w-[18px] h-[2px] bg-brutal-white transition-all"></span>
            <span className="block w-[18px] h-[2px] bg-brutal-white transition-all"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <div className="flex md:hidden flex-col bg-brutal-black border-b-2 border-brutal-white p-4">
          {links.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 text-xs font-bold no-underline transition-all hover:bg-neon-green hover:text-black ${location.pathname === link.to ? 'text-neon-green' : 'text-brutal-white'
                }`}
            >
              {link.label}
            </RouterLink>
          ))}
          {user ? (
            <div className="flex items-center justify-between gap-3 mt-2 pt-3 px-4 border-t border-brutal-white/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neon-green text-black text-xs font-bold flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <span className="text-xs font-bold text-brutal-white">{user.name}</span>
              </div>
              <button
                className="px-3 py-2 bg-red-500/20 text-red-400 border-none text-xs font-bold cursor-pointer transition-all hover:bg-red-500/30 uppercase font-mono"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-2 pt-3 px-4 border-t border-brutal-white/20">
              <button
                className="flex-1 bg-neon-green text-black text-xs font-black py-3 border border-brutal-white cursor-pointer transition-all uppercase font-mono"
                onClick={handleLogin}
              >
                GET STARTED
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
