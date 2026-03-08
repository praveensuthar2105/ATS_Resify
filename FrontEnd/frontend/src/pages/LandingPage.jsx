// ═══════════════════════════════════════════
// FILE: LandingPage.jsx
// REDESIGNED TO MATCH: Google Stitch Design
// ═══════════════════════════════════════════
// SECTIONS INCLUDED:
// - Scanline overlay
// - Hero (12-col grid: heading + wireframe cube)
// - Features (3-col brutalist grid)
// - Stats bar (horizontal scroll)
// - CTA (centered box with corner accents)
//
// LOGIC PRESERVED:
// - useNavigate (react-router-dom)
// - SEO component + Helmet structured data
// - All navigation handlers
//
// COLORS USED:
// - Background: #ffffff (brutal-black)
// - Text: #000000 (brutal-white)
// - Accent: #39ff14 (neon-green)
// - Muted: slate-700
// ═══════════════════════════════════════════

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page grid-bg font-mono uppercase bg-brutal-black text-brutal-white">
      <SEO
        title="Free AI Resume Builder & ATS Checker"
        description="Build professional, ATS-optimized resumes with AI in minutes. Check your ATS score, edit with a live LaTeX editor, and export PDF resumes for free."
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ATS Resify",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "215"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is ATS Resify completely free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! ATS Resify is completely free for generating resumes, checking ATS scores, and exporting high-quality PDFs."
                }
              },
              {
                "@type": "Question",
                "name": "How does the ATS score work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our advanced AI analyzes your resume against industry-standard ATS algorithms to check keyword optimization, formatting issues, and provides actionable recommendations to improve your score."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      {/* Scanline Overlay */}
      <div className="scanline"></div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="min-h-[80vh] flex items-center border-b-2 border-brutal-white">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Side */}
          <div className="lg:col-span-7 p-8 lg:p-16 border-r-0 lg:border-r-2 border-brutal-white flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green text-black mb-8 w-fit text-xs font-black">
              [ SYSTEM STATUS: READY ] AI-POWERED RESUME BUILDER
            </div>
            <h1 className="text-4xl md:text-7xl font-black leading-none mb-10 tracking-tight">
              BUILD A RESUME<br />
              THAT <span className="text-neon-green underline">BEATS THE BOTS.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-700 mb-12 max-w-2xl lowercase leading-tight">
              &gt; OPTIMIZE YOUR CAREER PATH WITH AI-DRIVEN ATS ANALYSIS AND PROFESSIONAL TEMPLATES DESIGNED FOR MODERN RECRUITMENT CYCLES.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-6">
              <button
                onClick={() => navigate('/generate')}
                className="px-8 py-5 bg-brutal-white text-brutal-black font-black text-lg brutal-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                CREATE YOUR RESUME
              </button>
              <button
                onClick={() => navigate('/ats-checker')}
                className="px-8 py-5 border-2 border-brutal-white text-brutal-white font-black text-lg hover:bg-neon-green hover:text-black transition-all"
              >
                CHECK ATS SCORE
              </button>
            </div>
          </div>

          {/* Right Side — Resume Preview */}
          <div className="lg:col-span-5 p-12 bg-brutal-black flex items-center justify-center relative">
            <div className="w-full aspect-[3/4] brutal-border bg-black/40 relative overflow-hidden group shadow-2xl">
              {/* Main Resume Image */}
              <img
                src="/resume-preview.png"
                alt="Resume Preview"
                className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-all duration-700 scale-[1.05] group-hover:scale-100"
              />

              {/* Premium Subtle Accents */}
              <div className="absolute inset-0 border-4 border-brutal-white/5 pointer-events-none group-hover:border-neon-green/10 transition-colors duration-500"></div>
              <div className="absolute top-4 left-4 flex gap-1 pointer-events-none">
                <div className="w-1 h-1 bg-neon-green animate-pulse"></div>
                <div className="w-1 h-1 bg-neon-green/40"></div>
                <div className="w-1 h-1 bg-neon-green/20"></div>
              </div>

              {/* HUD Labels */}
              <div className="absolute bottom-4 right-4 text-[10px] text-brutal-white font-mono flex flex-col items-end opacity-40 group-hover:opacity-80 transition-opacity">
                <span>PREVIEW_MODE: HIGH_RES</span>
                <span>ID: 8A3-CV-PRV</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="border-b-2 border-brutal-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Header Card */}
          <div className="p-8 lg:p-12 border-b-2 border-r-0 md:border-r-2 border-brutal-white bg-brutal-white text-brutal-black flex flex-col">
            <h2 className="text-3xl font-black mb-4 text-brutal-black">ENGINEERED FOR SUCCESS</h2>
            <p className="text-sm font-bold lowercase leading-tight text-brutal-black">
              POWERFUL TOOLS DESIGNED TO GET YOUR RESUME IN FRONT OF REAL HIRING MANAGERS.
            </p>
          </div>

          {/* Feature: AI Optimization */}
          <div className="p-8 lg:p-12 border-b-2 border-r-0 lg:border-r-2 border-brutal-white flex flex-col group hover:bg-neon-green transition-colors">
            <div className="w-12 h-12 brutal-border flex items-center justify-center mb-8 border-brutal-white">
              <span className="material-symbols-outlined text-brutal-white group-hover:text-black">auto_awesome</span>
            </div>
            <h3 className="text-xl font-black mb-4">AI OPTIMIZATION</h3>
            <p className="text-xs lowercase leading-relaxed opacity-80 text-slate-700">
              LEVERAGE CUTTING-EDGE AI TO TAILOR YOUR RESUME FOR ANY JOB DESCRIPTION INSTANTLY, MATCHING KEYWORDS AND PHRASING PRECISELY.
            </p>
          </div>

          {/* Feature: Smart Analysis */}
          <div className="p-8 lg:p-12 border-b-2 border-brutal-white flex flex-col group hover:bg-neon-green transition-colors">
            <div className="w-12 h-12 brutal-border flex items-center justify-center mb-8 border-brutal-white">
              <span className="material-symbols-outlined text-brutal-white group-hover:text-black">query_stats</span>
            </div>
            <h3 className="text-xl font-black mb-4">SMART ANALYSIS</h3>
            <p className="text-xs lowercase leading-relaxed opacity-80 text-slate-700">
              GET DETAILED FEEDBACK ON HOW YOUR RESUME PERFORMS AGAINST ATS ALGORITHMS BEFORE YOU HIT SEND ON YOUR APPLICATION.
            </p>
          </div>

          {/* Feature: Premium Templates (full-width) */}
          <div className="p-8 lg:p-12 md:col-span-2 lg:col-span-3 border-r-0 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-neon-green transition-colors">
            <div className="w-16 h-16 brutal-border flex items-center justify-center shrink-0 border-brutal-white">
              <span className="material-symbols-outlined text-3xl text-brutal-white group-hover:text-black">description</span>
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">PREMIUM TEMPLATES</h3>
              <p className="text-sm lowercase max-w-3xl opacity-80 text-slate-700">
                CHOOSE FROM A COLLECTION OF PROFESSIONALLY DESIGNED, RECRUITER-APPROVED TEMPLATES THAT LOOK GREAT AND SCAN PERFECTLY.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="bg-brutal-black border-b-2 border-brutal-white overflow-x-hidden">
        <div className="flex divide-x-2 divide-brutal-white whitespace-nowrap overflow-x-auto py-12">
          <div className="px-16 text-center flex-shrink-0">
            <p className="text-6xl font-black text-neon-green mb-2">500K+</p>
            <p className="text-[10px] font-black tracking-[0.2em]">RESUMES CREATED</p>
          </div>
          <div className="px-16 text-center flex-shrink-0">
            <p className="text-6xl font-black text-neon-green mb-2">92%</p>
            <p className="text-[10px] font-black tracking-[0.2em]">INTERVIEW RATE</p>
          </div>
          <div className="px-16 text-center flex-shrink-0">
            <p className="text-6xl font-black text-neon-green mb-2">4.9/5</p>
            <p className="text-[10px] font-black tracking-[0.2em]">USER RATING</p>
          </div>
          <div className="px-16 text-center flex-shrink-0">
            <p className="text-6xl font-black text-neon-green mb-2">200+</p>
            <p className="text-[10px] font-black tracking-[0.2em]">ATS SYSTEMS</p>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 px-6 bg-brutal-black">
        <div className="max-w-4xl mx-auto brutal-border p-12 md:p-16 text-center bg-brutal-black relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-neon-green border-2 border-brutal-white"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-neon-green border-2 border-brutal-white"></div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-none">
            READY TO LAND YOUR<br />
            <span className="bg-neon-green text-black px-2">DREAM JOB?</span>
          </h2>
          <p className="text-slate-700 text-sm mb-12 max-w-xl mx-auto lowercase">
            JOIN THOUSANDS OF JOB SEEKERS WHO BYPASSED THE BOTS AND SECURED THEIR SPOT IN THE INTERVIEW ROOM.
          </p>
          <button
            onClick={() => navigate('/generate')}
            className="w-full sm:w-auto bg-neon-green text-black font-black px-12 py-6 text-xl brutal-shadow-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all border-2 border-brutal-white mb-8"
          >
            GET STARTED NOW — IT'S FREE
          </button>
          <p className="text-brutal-white text-[10px] font-bold tracking-widest">
            NO CREDIT CARD REQUIRED. CANCEL ANYTIME.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
