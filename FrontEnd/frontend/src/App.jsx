import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import { Loader2 } from 'lucide-react';
import './App.css';

// Lazy load page components to split massive packages (Monaco, Recharts, react-pdf)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const EditResume = lazy(() => import('./pages/EditResume'));
const AtsChecker = lazy(() => import('./pages/AtsChecker'));
const QuickScore = lazy(() => import('./pages/QuickScore'));
const JobMatch = lazy(() => import('./pages/JobMatch'));
const FormatCheck = lazy(() => import('./pages/FormatCheck'));

const Features = lazy(() => import('./pages/Features'));
const About = lazy(() => import('./pages/About'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Login = lazy(() => import('./pages/Login'));
const Team = lazy(() => import('./pages/Team'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const CreateScratch = lazy(() => import('./pages/create/CreateScratch'));
const CreateImport = lazy(() => import('./pages/create/CreateImport'));
const CreateLinkedin = lazy(() => import('./pages/create/CreateLinkedin'));
const CreatePrompt = lazy(() => import('./pages/create/CreatePrompt'));

// 404 Not Found Component
const NotFound = () => (
  <div className="relative min-h-[70vh] flex items-center justify-center px-6 py-20 overflow-hidden bg-slate-50 font-['DM_Sans',_'Inter',_sans-serif]">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[5%] right-[-8%] w-[420px] h-[420px] rounded-full bg-teal-300/15 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[480px] h-[480px] rounded-full bg-indigo-300/10 blur-[140px]" />
    </div>

    <div className="relative z-10 w-full max-w-lg text-center">
      <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/60 rounded-[2rem] p-8 md:p-10">
        <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[40px] text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>
            explore_off
          </span>
        </div>

        <p className="text-[11px] font-bold tracking-[0.2em] text-teal-700 uppercase bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full mb-4 inline-block">
          Error 404
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 font-['Space_Grotesk',_sans-serif]">
          Page not found
        </h1>

        <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist, was moved, or the link may be broken.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm no-underline shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Back to home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm no-underline hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Contact support
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
          <Link to="/create-resume/prompt" className="hover:text-teal-600 no-underline transition-colors">AI Builder</Link>
          <span className="text-slate-300">·</span>
          <Link to="/ats-checker/quick-score" className="hover:text-teal-600 no-underline transition-colors">ATS Checker</Link>
          <span className="text-slate-300">·</span>
          <Link to="/features" className="hover:text-teal-600 no-underline transition-colors">Features</Link>
        </div>
      </div>
    </div>
  </div>
);

// Fallback Page Loader during route chunk loading
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
    background: { default: '#ffffff' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
});

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  React.useEffect(() => {
    // Preload route chunks in the background after initial render has settled
    const preloadRoutes = () => {
      import('./pages/EditResume').catch(() => {});
      import('./pages/AtsChecker').catch(() => {});
      import('./pages/Login').catch(() => {});
      import('./pages/create/CreateScratch').catch(() => {});
      import('./pages/create/CreateImport').catch(() => {});
      import('./pages/create/CreateLinkedin').catch(() => {});
      import('./pages/create/CreatePrompt').catch(() => {});
      import('./pages/Features').catch(() => {});
      import('./pages/About').catch(() => {});
    };

    const timer = setTimeout(preloadRoutes, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {!isHome && <Navbar />}
      <Box component="main" sx={{ width: '100%', flex: 1, mt: 0 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/generate" element={<Navigate to="/create-resume/prompt" replace />} />
            <Route path="/create-resume/scratch" element={<CreateScratch />} />
            <Route path="/create-resume/import" element={<CreateImport />} />
            <Route path="/create-resume/linkedin" element={<CreateLinkedin />} />
            <Route path="/create-resume/prompt" element={<CreatePrompt />} />
            <Route path="/edit-resume" element={
              <ProtectedRoute>
                <ResumeProvider>
                  <EditResume />
                </ResumeProvider>
              </ProtectedRoute>
            } />
            <Route path="/ats-checker" element={<Navigate to="/ats-checker/quick-score" replace />} />
            <Route path="/ats-checker/quick-score" element={<QuickScore />} />
            <Route path="/ats-checker/job-match" element={<JobMatch />} />

            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/team" element={<Team />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
      <CookieConsent />
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <Router>
            <AppContent />
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
