import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReturnHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            p: 4,
            bgcolor: '#f9fafb',
          }}
        >
          <Box sx={{ fontSize: '72px', mb: 2 }}>⚠️</Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
            Oops! Something went wrong.
          </Typography>
          <Typography sx={{ color: '#6b7280', mb: 4, maxWidth: '600px' }}>
            An unexpected error has occurred. We apologize for the inconvenience.
            Please try again or return to the home page.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={this.handleTryAgain}
              sx={{
                color: '#6366f1',
                borderColor: '#6366f1',
                '&:hover': {
                  borderColor: '#4f46e5',
                  bgcolor: 'rgba(99, 102, 241, 0.04)',
                },
              }}
            >
              Try Again
            </Button>
            <Button
              variant="contained"
              onClick={this.handleReturnHome}
              sx={{
                bgcolor: '#6366f1',
                '&:hover': {
                  bgcolor: '#4f46e5',
                },
              }}
            >
              Return to Home
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
