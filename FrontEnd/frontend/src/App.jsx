import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import GenerateResume from './pages/GenerateResume';
import EditResume from './pages/EditResume';
import AtsChecker from './pages/AtsChecker';
import Features from './pages/Features';
import About from './pages/About';
import AuthCallback from './pages/AuthCallback';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: { default: '#ffffff' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box component="main" sx={{ width: '100%', flex: 1, mt: '70px' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/generate" element={<GenerateResume />} />
              <Route path="/edit-resume" element={<EditResume />} />
              <Route path="/ats-checker" element={<AtsChecker />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

