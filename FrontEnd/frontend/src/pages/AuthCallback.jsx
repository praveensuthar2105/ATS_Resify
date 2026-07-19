import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, API_ROOT_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { AuroraBackground } from '../components/AuroraBackground';
import { Loader2, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const isProcessing = useRef(false);

  const code = searchParams.get('code');

  useEffect(() => {
    // Guard against multiple executions (Strict Mode, re-renders, or race conditions)
    if (!code || isProcessing.current) return;
    
    // Mark as processing immediately
    isProcessing.current = true;

    // Exchange the one-time code for JWT + user info
    fetch(`${API_ROOT_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Verification failed. The link or session may have expired.');
        }
        return res.json();
      })
      .then(data => {
        const { token, name, email } = data;

        // Fetch user details to get role
        return fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => {
            if (!res.ok) throw new Error('FAILED TO FETCH USER DETAILS');
            return res.json();
          })
          .then(userData => {
            login({
              token,
              name,
              email,
              role: userData.role || 'USER'
            });

            const redirectTo = localStorage.getItem('redirectAfterAuth') || '/';
            localStorage.removeItem('redirectAfterAuth');

            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 500);
          })
          .catch(err => {
            console.warn('Could not fetch user role, defaulting to USER:', err.message);
            login({
              token,
              name,
              email,
              role: 'USER'
            });

            const redirectTo = localStorage.getItem('redirectAfterAuth') || '/';
            localStorage.removeItem('redirectAfterAuth');

            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 500);
          });
      })
      .catch(err => {
        console.error('Code exchange error:', err);
        setError(err.message || 'Authentication failed. Please try signing in again.');
      });
  }, [code, navigate, login]);

  return (
    <AuroraBackground className="min-h-screen flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Verifying Session | ATS Resify</title>
      </Helmet>

      <main className="w-full max-w-md mx-auto flex flex-col items-center relative z-10">
        <div 
          className="w-full p-8 text-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(20, 180, 140, 0.16)',
            boxShadow: '0 24px 64px -16px rgba(20, 100, 80, 0.22), 0 8px 24px -12px rgba(13, 148, 136, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            borderRadius: '24px'
          }}
        >
          {error ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2 font-sans">
                Sign in failed
              </h2>
              <p className="text-sm text-slate-500 mb-6 font-sans leading-relaxed">
                {error}
              </p>
              <a 
                href="/login" 
                className="w-full bg-[#1A2E28] hover:bg-[#14241f] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 block text-sm font-sans no-underline cursor-pointer shadow-sm"
              >
                Return to Login
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium text-sm font-sans">
                Signing you in...
              </p>
            </div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
};

export default AuthCallback;
