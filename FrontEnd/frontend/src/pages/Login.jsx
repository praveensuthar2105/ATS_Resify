import React from 'react';
import { useLocation } from 'react-router-dom';
import { API_ROOT_URL } from '../services/api';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleGoogleLogin = () => {
        // Store the 'from' path to redirect back after OAuth callback
        localStorage.setItem('redirectAfterAuth', from);
        // Directly connect to the backend for Google OAuth
        window.location.href = `${API_ROOT_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col items-center justify-center font-mono uppercase selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
            <SEO
                title="Login - ATS Resify"
                description="Sign in to ATS Resify to build, analyze, and optimize your professional resume with AI."
            />
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
            </Helmet>

            <main className="w-full max-w-lg px-4 flex flex-col items-center pt-16 pb-20">
                {/* LOGIN BOX */}
                <div className="w-full bg-[#f8f8f8] border-2 border-black p-8 md:p-12 relative shadow-[8px_8px_0px_0px_#000000]">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#39ff14]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff14]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#39ff14]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#39ff14]"></div>

                    <div className="text-center mb-8 border-b-2 border-black pb-8">
                        <div className="w-16 h-16 bg-black text-[#39ff14] flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-[4px_4px_0px_0px_#39ff14]">
                            C_
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tighter uppercase relative inline-block">
                            System <span className="text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>Login</span>
                        </h1>
                        <p className="text-sm font-bold text-gray-700 tracking-wide">
                            Authenticate to access your workspace.
                        </p>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div className="flex items-start gap-4 p-4 border-2 border-transparent hover:border-[#39ff14] transition-colors bg-white">
                            <span className="material-symbols-outlined text-[#39ff14] bg-black p-1">auto_awesome</span>
                            <div>
                                <h3 className="text-sm font-bold uppercase mb-1">AI Generation</h3>
                                <p className="text-xs text-gray-600 font-bold lowercase">Create tailored resumes instantly</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border-2 border-transparent hover:border-[#39ff14] transition-colors bg-white">
                            <span className="material-symbols-outlined text-[#39ff14] bg-black p-1">fact_check</span>
                            <div>
                                <h3 className="text-sm font-bold uppercase mb-1">ATS Checking</h3>
                                <p className="text-xs text-gray-600 font-bold lowercase">Verify against tracking systems</p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full bg-[#39ff14] text-black font-bold text-lg py-4 border-2 border-black hover:bg-black hover:text-[#39ff14] shadow-[4px_4px_0px_0px_#000000] active:shadow-none transition-all duration-300 flex items-center justify-center gap-3 group"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="w-6 h-6 border-2 border-transparent group-hover:border-[#39ff14] bg-white p-[2px] rounded-sm transition-colors" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Authenticate with Google
                    </button>

                    <div className="mt-8 text-center text-xs text-gray-600 font-bold leading-relaxed lowercase">
                        by signing in, you agree to our <a href="/terms" className="text-black underline decoration-2 decoration-[#39ff14] hover:bg-[#39ff14] transition-colors">terms</a> and <a href="/privacy" className="text-black underline decoration-2 decoration-[#39ff14] hover:bg-[#39ff14] transition-colors">privacy policy</a>.
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
