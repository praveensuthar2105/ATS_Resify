import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
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
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    p: 4
  }}>
    <Box sx={{ fontSize: '72px', mb: 2 }}>🔍</Box>
    <Box component="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 1, color: '#1f2937' }}>
      Page Not Found
    </Box>
    <Box sx={{ color: '#6b7280', mb: 3 }}>
      The page you're looking for doesn't exist or has been moved.
    </Box>
    <Link to="/" style={{
      color: '#6366f1',
      textDecoration: 'none',
      fontWeight: 600,
      padding: '12px 24px',
      border: '2px solid #6366f1',
      borderRadius: '8px',
      transition: 'all 0.2s'
    }}>
      ← Back to Home
    </Link>
  </Box>
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
                <EditResume />
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
