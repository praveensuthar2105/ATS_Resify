import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { API_ROOT_URL } from '../services/api';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // null | 'create' | 'ats'
  const [mobileExpanded, setMobileExpanded] = useState({ create: false, ats: false });
  
  const userMenuRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    if (token && name && email) setUser({ name, email });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogin = () => { window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`; };
  const handleLogout = () => {
    ['authToken', 'userName', 'userEmail', 'userRole'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const initials = (n) => n ? n.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleMouseEnter = (menuName) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const createResumeOptions = [
    {
      title: 'Start from scratch',
      description: 'Build step by step with guided prompts',
      icon: 'note_add',
      route: '/create-resume/scratch'
    },
    {
      title: 'Import existing resume',
      description: "Upload a PDF or Word file — we'll restructure it for ATS",
      icon: 'upload_file',
      route: '/create-resume/import'
    },
    {
      title: 'Import from LinkedIn',
      description: 'Pull your experience directly from your profile',
      icon: 'work',
      route: '/create-resume/linkedin'
    },
    {
      title: 'Generate from a prompt',
      description: 'Describe your background — AI drafts the first version',
      icon: 'auto_awesome',
      route: '/create-resume/prompt'
    }
  ];

  const atsCheckerOptions = [
    {
      title: 'Quick ATS score',
      description: 'Upload your resume for an instant parsing and formatting score',
      icon: 'percent',
      route: '/ats-checker/quick-score'
    },
    {
      title: 'Match against a job description',
      description: "Paste a job posting to see exactly which keywords you're missing",
      icon: 'tag',
      route: '/ats-checker/job-match'
    }
  ];

  const isActive = (path) => location.pathname === path;
  const isCreateActive = location.pathname.startsWith('/create-resume') || location.pathname.startsWith('/edit-resume');
  const isAtsActive = location.pathname.startsWith('/ats-checker');

  return (
    <header
      className="sticky top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-out pt-3 pb-0 px-4 sm:px-6"
    >
      {/* ── Glass Container Anchor ── */}
      <div
        className="max-w-[1200px] mx-auto transition-all duration-500 ease-out rounded-2xl px-5 sm:px-6 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(20, 100, 80, 0.08)',
          borderTop: '1px solid rgba(255, 255, 255, 0.7)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.7)',
          borderRight: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: scrolled ? '0 10px 25px -5px rgba(20, 100, 80, 0.08)' : '0 1px 3px rgba(20, 100, 80, 0.04)'
        }}
      >
        {/* ── Logo ── */}
        <Logo onClick={() => setMobileNavOpen(false)} />

        {/* ── Desktop Nav Links & Dropdowns ── */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {/* Home Link */}
          <RouterLink
            to="/"
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 no-underline cursor-pointer ${
              isActive('/')
                ? 'bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 font-bold shadow-sm'
                : 'text-slate-600 hover:text-[#0F1115] hover:bg-slate-100/80 border border-transparent'
            }`}
          >
            Home
          </RouterLink>

          {/* Create Resume Dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('create')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'create' ? null : 'create')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-all duration-300 cursor-pointer ${
                isCreateActive || activeDropdown === 'create'
                  ? 'font-bold shadow-sm'
                  : 'font-semibold text-slate-600 hover:text-[#0F1115] hover:bg-slate-100/80 border-transparent bg-transparent'
              }`}
              style={isCreateActive || activeDropdown === 'create' ? {
                backgroundColor: 'rgba(20, 180, 140, 0.12)',
                color: 'rgb(20, 180, 140)',
                border: 'none'
              } : { border: '1px solid transparent' }}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ color: isCreateActive || activeDropdown === 'create' ? 'rgb(20, 180, 140)' : '#14B8A6' }}>auto_awesome</span>
              Create Resume
              <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${activeDropdown === 'create' ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Create Resume Mega-Menu Panel */}
            <div
              className={`absolute top-[calc(100%+10px)] -left-20 min-w-[540px] glass-panel-tier-3 p-4 z-[1001] transition-all duration-200 origin-top ${
                activeDropdown === 'create'
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-98 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] mb-3 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                Select creation flow
              </div>
              <div className="grid grid-cols-2 gap-2">
                {createResumeOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate(opt.route);
                    }}
                    className="group/item flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#14B8A6]/30 hover:bg-[#14B8A6]/8 transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] flex items-center justify-center flex-shrink-0 group-hover/item:scale-108 group-hover/item:bg-[#14B8A6] group-hover/item:text-white transition-all duration-200">
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F1115] group-hover/item:text-[#0D9488] transition-colors">{opt.title}</div>
                      <div className="text-xs text-slate-500 leading-snug mt-0.5">{opt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ATS Checker Dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('ats')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'ats' ? null : 'ats')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-all duration-300 cursor-pointer ${
                isAtsActive || activeDropdown === 'ats'
                  ? 'font-bold shadow-sm'
                  : 'font-semibold text-slate-600 hover:text-[#0F1115] hover:bg-slate-100/80 border-transparent bg-transparent'
              }`}
              style={isAtsActive || activeDropdown === 'ats' ? {
                backgroundColor: 'rgba(20, 180, 140, 0.12)',
                color: 'rgb(20, 180, 140)',
                border: 'none'
              } : { border: '1px solid transparent' }}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ color: isAtsActive || activeDropdown === 'ats' ? 'rgb(20, 180, 140)' : '#14B8A6' }}>query_stats</span>
              ATS Checker
              <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${activeDropdown === 'ats' ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* ATS Checker Mega-Menu Panel */}
            <div
              className={`absolute top-[calc(100%+10px)] -left-12 min-w-[360px] glass-panel-tier-3 p-3 z-[1001] transition-all duration-200 origin-top ${
                activeDropdown === 'ats'
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-98 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] mb-2 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                Analysis modes
              </div>
              <div className="flex flex-col gap-1.5">
                {atsCheckerOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate(opt.route);
                    }}
                    className="group/item flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-[#14B8A6]/30 hover:bg-[#14B8A6]/8 transition-all duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] flex items-center justify-center flex-shrink-0 group-hover/item:scale-108 group-hover/item:bg-[#14B8A6] group-hover/item:text-white transition-all duration-200">
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F1115] group-hover/item:text-[#0D9488] transition-colors">{opt.title}</div>
                      <div className="text-xs text-slate-500 leading-snug mt-0.5">{opt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Link */}
          <RouterLink
            to="/features"
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 no-underline cursor-pointer ${
              isActive('/features')
                ? 'bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 font-bold shadow-sm'
                : 'text-slate-600 hover:text-[#0F1115] hover:bg-slate-100/80 border border-transparent'
            }`}
          >
            Features
          </RouterLink>


        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/70 shadow-sm cursor-pointer transition-all duration-300 hover:border-[#14B8A6] hover:shadow-md"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-[#0F1115] text-[#14B8A6] flex items-center justify-center font-bold text-xs border border-[#14B8A6]/30">
                  {initials(user.name)}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-slate-800">{user.name.split(' ')[0]}</span>
                <span className="material-symbols-outlined text-slate-400 text-lg transition-transform duration-300" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
              </button>

              {/* User Account Dropdown */}
              <div className={`absolute top-[calc(100%+8px)] right-0 min-w-[260px] bg-white/90 backdrop-blur-2xl rounded-2xl p-2 z-[1001] border border-slate-200/80 shadow-xl transition-all duration-300 origin-top-right ${
                userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="p-3 mb-1 flex items-center gap-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-[#0F1115] text-[#14B8A6] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[#14B8A6]/30">
                    {initials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-slate-900 truncate">{user.name}</span>
                    <span className="text-xs text-slate-400 truncate">{user.email}</span>
                  </div>
                </div>
                <RouterLink to="/create-resume/scratch" onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium no-underline transition-all duration-200 hover:bg-[#14B8A6]/10 hover:text-[#0D9488]">
                  <span className="material-symbols-outlined text-[#14B8A6] text-lg">auto_awesome</span>
                  Create new resume
                </RouterLink>
                <RouterLink to="/ats-checker?mode=score" onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 text-sm font-medium no-underline transition-all duration-200 hover:bg-[#14B8A6]/10 hover:text-[#0D9488]">
                  <span className="material-symbols-outlined text-[#14B8A6] text-lg">query_stats</span>
                  Check ATS score
                </RouterLink>
                <div className="h-px bg-slate-200/60 my-1" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 text-sm font-medium bg-transparent border-none cursor-pointer transition-all duration-200 hover:bg-rose-50">
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={handleLogin}
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0F1115] bg-transparent border-none cursor-pointer transition-colors duration-200">
                Sign in
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-[#0F1115] border border-white/10 shadow-md shadow-slate-900/20 hover:bg-[#1A1D24] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="material-symbols-outlined text-base text-[#14B8A6]">auto_awesome</span>
                Get started free
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/70 text-slate-700 cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-sm"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-xl">{mobileNavOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Nav Sheet ── */}
      <div className={`lg:hidden absolute left-4 right-4 top-[calc(100%+8px)] bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/80 shadow-2xl transition-all duration-300 origin-top overflow-hidden ${
        mobileNavOpen ? 'opacity-100 scale-y-100 max-h-[85vh] overflow-y-auto pointer-events-auto' : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'
      }`}>
        <div className="p-5 flex flex-col gap-3">
          {/* Home */}
          <RouterLink
            to="/"
            onClick={() => setMobileNavOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
              isActive('/') ? 'bg-[#14B8A6]/10 text-[#14B8A6] font-bold border border-[#14B8A6]/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Home
          </RouterLink>

          {/* Create Resume Accordion */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setMobileExpanded({ ...mobileExpanded, create: !mobileExpanded.create })}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 bg-transparent border-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#14B8A6]">auto_awesome</span>
                Create Resume
              </div>
              <span className={`material-symbols-outlined text-base transition-transform duration-200 ${mobileExpanded.create ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {mobileExpanded.create && (
              <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5 border-t border-slate-100 bg-white/60">
                {createResumeOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setMobileNavOpen(false);
                      navigate(opt.route);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-[#0D9488] mt-0.5">{opt.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight">{opt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ATS Checker Accordion */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setMobileExpanded({ ...mobileExpanded, ats: !mobileExpanded.ats })}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 bg-transparent border-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#14B8A6]">query_stats</span>
                ATS Checker
              </div>
              <span className={`material-symbols-outlined text-base transition-transform duration-200 ${mobileExpanded.ats ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {mobileExpanded.ats && (
              <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5 border-t border-slate-100 bg-white/60">
                {atsCheckerOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setMobileNavOpen(false);
                      navigate(opt.route);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-[#0D9488] mt-0.5">{opt.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight">{opt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <RouterLink
            to="/features"
            onClick={() => setMobileNavOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
              isActive('/features') ? 'bg-[#14B8A6]/10 text-[#14B8A6] font-bold border border-[#14B8A6]/20' : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <span className="material-symbols-outlined text-lg">star</span>
            Features
          </RouterLink>

          <div className="h-px bg-slate-200/60 my-1" />

          {user ? (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0F1115] text-[#14B8A6] font-bold flex items-center justify-center text-xs border border-[#14B8A6]/30">{initials(user.name)}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-xs font-semibold cursor-pointer transition-all hover:bg-rose-100">Sign out</button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#0F1115] flex items-center justify-center gap-2 border border-white/10 shadow-md cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="material-symbols-outlined text-base text-[#14B8A6]">auto_awesome</span>
              Get started free
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
