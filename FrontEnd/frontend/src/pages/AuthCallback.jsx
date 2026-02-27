import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { API_BASE_URL, API_ROOT_URL } from '../services/api';

import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('Invalid authentication response. Missing authorization code.');
      return;
    }

    // Exchange the one-time code for JWT + user info
    fetch(`${API_ROOT_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Code exchange failed. The code may have expired.');
        }
        return res.json();
      })
      .then(data => {
        const { token, name, email } = data;

        // Fetch user details to get role
        return fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(userData => {
            login({
              token,
              name,
              email,
              role: userData.role || 'USER'
            });

            console.log('✅ Login successful!');

            const redirectTo = localStorage.getItem('redirectAfterAuth') || '/';
            localStorage.removeItem('redirectAfterAuth');

            setTimeout(() => {
              navigate(redirectTo);
            }, 500);
          })
          .catch(err => {
            console.error('Error fetching user details:', err);
            login({
              token,
              name,
              email,
              role: 'USER'
            });

            const redirectTo = localStorage.getItem('redirectAfterAuth') || '/';
            localStorage.removeItem('redirectAfterAuth');

            setTimeout(() => {
              navigate(redirectTo);
            }, 500);
          });
      })
      .catch(err => {
        console.error('Code exchange error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      });
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

