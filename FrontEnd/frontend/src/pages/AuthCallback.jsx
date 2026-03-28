import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, API_ROOT_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('INITIALIZING CONNECTION...');
  const { login } = useAuth();
  const isProcessing = useRef(false);

  const code = searchParams.get('code');

  useEffect(() => {
    // Guard against multiple executions (Strict Mode, re-renders, or race conditions)
    if (!code || isProcessing.current) return;
    
    // Mark as processing immediately
    isProcessing.current = true;

    setStatus('EXCHANGING AUTHORIZATION CODE...');

    // Exchange the one-time code for JWT + user info
    fetch(`${API_ROOT_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(res => {
        if (!res.ok) {
          // If the backend returns 401/400, it usually means the code was already used
          // or has expired.
          throw new Error('CODE EXCHANGE FAILED. THE CODE MAY HAVE EXPIRED.');
        }
        return res.json();
      })
      .then(data => {
        const { token, name, email } = data;
        setStatus('TOKEN RECEIVED. FETCHING USER PROFILE...');

        // Fetch user details to get role
        return fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(res => {
            if (!res.ok) throw new Error('FAILED TO FETCH USER DETAILS');
            return res.json();
          })
          .then(userData => {
            setStatus('AUTHENTICATION COMPLETE. REDIRECTING...');
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
            setStatus('AUTHENTICATION COMPLETE (DEFAULT ROLE). REDIRECTING...');
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
        setError(err.message || 'AUTHENTICATION FAILED. PLEASE TRY AGAIN.');
        // Reset processing if it was a network error so user can potentially retry
        // But for auth codes, they are usually one-time use anyway.
      });
  }, [code, navigate, login]);


  return (
    <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono uppercase selection:bg-[#39ff14] selection:text-black mt-[-64px]" style={{ fontFamily: "'Space Mono', monospace" }}>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .cursor-blink {
            animation: blink 1s step-end infinite;
          }
        `}</style>
      </Helmet>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#000000] border-4 border-black p-8 shadow-[8px_8px_0px_0px_#39ff14]">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-[#39ff14] pb-4">
            <span className="material-symbols-outlined text-[#39ff14] text-3xl">api</span>
            <h1 className="text-[#39ff14] font-bold text-xl tracking-widest">SYSTEM_AUTH</h1>
          </div>

          <div className="space-y-4 font-bold">
            {error ? (
              <div className="text-red-500 bg-red-950/30 p-4 border border-red-500">
                <span className="mr-2">[ERROR]</span>
                {error}
                <div className="mt-4 pt-4 border-t border-red-500/30">
                  <a href="/login" className="text-white hover:text-red-500 underline decoration-red-500 underline-offset-4">
                    (&larr; RETURN TO LOGIN)
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="text-[#39ff14]">
                  <span className="mr-2 text-white">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                  OAUTH_CALLBACK_INITIATED
                </div>
                <div className="text-[#39ff14]">
                  <span className="mr-2 text-white">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                  {status}
                </div>
                <div className="text-white pt-4">
                  <span className="mr-2">&gt;</span>
                  <span className="bg-[#39ff14] w-3 h-5 inline-block cursor-blink translate-y-1"></span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthCallback;
