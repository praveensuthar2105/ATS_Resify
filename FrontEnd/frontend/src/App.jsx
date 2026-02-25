import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ResumeDashboard from './components/ResumeDashboard';
import LandingPage from './pages/LandingPage';
import GenerateResume from './pages/GenerateResume';
import EditResume from './pages/EditResume';
import AtsChecker from './pages/AtsChecker';
import Features from './pages/Features';
import About from './pages/About';
import AuthCallback from './pages/AuthCallback';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Team from './pages/Team';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

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
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ width: '100%', flex: 1, mt: '70px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/generate" element={<GenerateResume />} />
          <Route path="/edit-resume" element={<EditResume />} />
          <Route path="/ats-checker" element={<AtsChecker />} />
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
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
