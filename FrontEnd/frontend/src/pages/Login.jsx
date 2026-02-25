import React from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import './Login.css';

const Login = () => {
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleGoogleLogin = () => {
        // Store the 'from' path to redirect back after OAuth callback
        // Directly connect to the native HTTPS AWS backend
        window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="login-page">
            <div className="login-circles">
                <div className="login-circle blob-1"></div>
                <div className="login-circle blob-2"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1>Welcome to <span className="logo-accent">ATS Resify</span></h1>
                    <p>The ultimate platform to build, analyze, and optimize your professional path.</p>
                </div>

                <div className="login-content">
                    <div className="login-benefits">
                        <div className="benefit-item">
                            <span className="benefit-icon">✨</span>
                            <span>AI-Powered Resume Generation</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">📊</span>
                            <span>Advanced ATS Compliance Check</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">🚀</span>
                            <span>Career-Optimized Suggestions</span>
                        </div>
                    </div>

                    <button className="google-login-btn" onClick={handleGoogleLogin}>
                        <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                <div className="login-footer">
                    By signing in, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
};

export default Login;
