import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ROOT_URL } from '../services/api';
import SEO from '../components/SEO';
import Logo from '../components/Logo';
import { AuroraBackground } from '../components/AuroraBackground';
import { Sparkles, Target } from 'lucide-react';
import gsap from 'gsap';

const Login = () => {
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const containerRef = useRef(null);
    const searchParams = new URLSearchParams(location.search);
    const oauthError = searchParams.get('error');
    const oauthMessage = searchParams.get('message');

    const handleGoogleLogin = () => {
        // Store the 'from' path to redirect back after OAuth callback
        localStorage.setItem('redirectAfterAuth', from);
        // Directly connect to the backend for Google OAuth
        window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`;
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // 1. Fade and scale in the login card smoothly
            tl.fromTo('.login-card', 
                { opacity: 0, y: 40, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8 }
            );

            // 2. Stagger slide-in of card header elements (logo, welcome text)
            tl.fromTo('.login-header-item',
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
                '-=0.45'
            );

            // 3. Stagger fade-in/slide-in of feature items
            tl.fromTo('.feature-item',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.45, stagger: 0.1 },
                '-=0.3'
            );

            // 4. Scale and pop-in the google login button
            tl.fromTo('.google-btn',
                { opacity: 0, y: 15, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.5)' },
                '-=0.2'
            );

            // 5. Soft fade-in for legal terms links
            tl.fromTo('.login-footer',
                { opacity: 0 },
                { opacity: 1, duration: 0.5 },
                '-=0.25'
            );

            // 6. Bind interactive hover macro-animations via GSAP
            const btn = document.querySelector('.google-btn');
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    gsap.to(btn, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power2.out' });
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <AuroraBackground className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 p-4">
            <SEO
                title="Login - ATS Resify"
                description="Sign in to ATS Resify to build, analyze, and optimize your professional resume with AI."
            />

            <main ref={containerRef} className="w-full max-w-md mx-auto flex flex-col items-center relative z-10">
                {/* LOGIN CARD */}
                <div 
                    className="w-full p-6 md:p-8 login-card"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(20, 180, 140, 0.16)',
                        boxShadow: '0 24px 64px -16px rgba(20, 100, 80, 0.22), 0 8px 24px -12px rgba(13, 148, 136, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                        borderRadius: '24px'
                    }}
                >
                    <div className="text-center mb-6 border-b border-slate-100 pb-4 flex flex-col items-center">
                        <div className="login-header-item">
                            <Logo className="mb-3" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 font-sans tracking-tight login-header-item">
                            Welcome back
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans max-w-[280px] login-header-item">
                            Sign in to access your resumes and continue where you left off.
                        </p>
                    </div>

                    {/* Features Showcase */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-white/70 shadow-sm hover:border-[#14B8A6]/20 transition-all duration-300 feature-item">
                            <div className="feature-icon-chip">
                                <Sparkles className="w-[18px] h-[18px]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-0.5">AI Generation</h3>
                                <p className="text-xs text-slate-500">Create tailored resumes instantly</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-white/70 shadow-sm hover:border-[#14B8A6]/20 transition-all duration-300 feature-item">
                            <div className="feature-icon-chip">
                                <Target className="w-[18px] h-[18px]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-0.5">ATS Checking</h3>
                                <p className="text-xs text-slate-500">Verify against tracking systems</p>
                            </div>
                        </div>
                    </div>

                    {oauthError && (
                        <div
                            className="mb-4 rounded-xl border px-3 py-2.5 text-left"
                            style={{
                                background: 'rgba(239, 68, 68, 0.06)',
                                borderColor: 'rgba(239, 68, 68, 0.22)',
                            }}
                            role="alert"
                        >
                            <p className="text-xs font-semibold text-rose-700 font-sans">
                                Sign-in failed. Please try again.
                            </p>
                            {oauthMessage && (
                                <p className="text-[11px] text-rose-600/90 mt-1 font-sans break-words">
                                    {oauthMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <button
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm py-2.5 px-4 rounded-xl border border-[rgba(20,40,35,0.15)] shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer google-btn"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="mt-6 text-center text-xs text-slate-400 leading-relaxed font-sans login-footer">
                        By signing in, you agree to our <a href="/terms" className="text-[#14B8A6] hover:text-[#0d9488] hover:underline font-medium transition-colors">Terms</a> and <a href="/privacy" className="text-[#14B8A6] hover:text-[#0d9488] hover:underline font-medium transition-colors">Privacy Policy</a>.
                    </div>
                </div>
            </main>
        </AuroraBackground>
    );
};

export default Login;
