import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract token, name, and email from URL parameters
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    if (token && name && email) {
      // Fetch user details to get role
      fetch('http://localhost:8081/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        // Store token and user info in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', data.role || 'USER');

        console.log('✅ Login successful!');
        console.log('Token:', token);
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Role:', data.role);

        // Redirect to home page after 1 second
        setTimeout(() => {
          navigate('/');
          // Reload to update navbar with user info
          window.location.reload();
        }, 1000);
      })
      .catch(err => {
        console.error('Error fetching user details:', err);
        // Still store basic info even if role fetch fails
        localStorage.setItem('authToken', token);
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', 'USER');
        
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      });
    } else {
      setError('Invalid authentication response. Missing token or user information.');
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing login...
      </Typography>
    </Box>
  );
};

export default AuthCallback;
