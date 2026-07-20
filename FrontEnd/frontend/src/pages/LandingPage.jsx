import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import { Sparkles, ScanSearch, ArrowDown, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BackgroundGradientAnimation } from '../components/ui/background-gradient-animation';
import CoreCapabilities, { GlassCard, FeatureIcon, FeatureText } from '../components/CoreCapabilities';

/* ── Scroll-reveal hook ── */
const useReveal = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* ── Reusable secondary glassmorphism button ── */
const SecondaryButton = ({ onClick, children, icon: Icon, className = '' }) => {
  return (
    <button onClick={onClick} className={`cta-secondary ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />}
      {children}
    </button>
  );
};



const LandingPage = () => {
  const navigate = useNavigate();

  /* ── Typing animation for hero ── */
  const phrases = [
    'a Product Manager position at Stripe',
    'a Senior React Developer role at Google',
    'a Data Engineer opening at Netflix',
    'a DevOps Lead role at Cloudflare',
  ];
  const [typed, setTyped] = useState(phrases[0]);

  useEffect(() => {
    let isMounted = true;
    let currentPhraseIdx = 0;
    let currentText = phrases[0];
    let isDeleting = false;
    let typingSpeed = 50;

    const loop = async () => {
      while (isMounted) {
        const fullPhrase = phrases[currentPhraseIdx];
        
        if (isDeleting) {
          currentText = fullPhrase.substring(0, currentText.length - 1);
          setTyped(currentText);
          typingSpeed = 25;
          
          if (currentText === '') {
            isDeleting = false;
            currentPhraseIdx = (currentPhraseIdx + 1) % phrases.length;
            typingSpeed = 400;
          }
        } else {
          currentText = fullPhrase.substring(0, currentText.length + 1);
          setTyped(currentText);
          typingSpeed = 55;
          
          if (currentText === fullPhrase) {
            isDeleting = true;
            typingSpeed = 2400;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
      }
    };

    const initialTimeout = setTimeout(() => {
      if (isMounted) {
        isDeleting = true;
        loop();
      }
    }, 2400);

    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
    };
  }, []);

  /* ── ATS Simulator state & scroll-triggered count-up ── */
  const [simActive, setSimActive] = useState(false);
  const [simScore, setSimScore] = useState(35);
  const [simPhase, setSimPhase] = useState(0); // 0=idle, 1=processing, 2=done
  const [demoVisible, setDemoVisible] = useState(false);
  const simRef = useRef(null);

  /* ── Hero gauge count-up state ── */
  const [heroScore, setHeroScore] = useState(0);
  useEffect(() => {
    let s = 0;
    const t = setInterval(() => {
      s += 3;
      if (s >= 98) { s = 98; clearInterval(t); }
      setHeroScore(s);
    }, 25);
    return () => clearInterval(t);
  }, []);

  /* ── Scroll-reveal hooks ── */
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useRef(null);
  const r5 = useReveal();

  useEffect(() => {
    const el = r4.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('visible');
        setDemoVisible(true);
        // Start count-up from 0 to 35
        let s = 0;
        const t = setInterval(() => {
          s += 2;
          if (s >= 35) { s = 35; clearInterval(t); }
          setSimScore(s);
        }, 30);
        obs.unobserve(el);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const runSimulator = useCallback(() => {
    if (simPhase !== 0) return;
    setSimActive(true);
    setSimPhase(1);
    // 800ms of processing before animating score up to 95
    setTimeout(() => {
      setSimPhase(2);
      let s = simScore || 35;
      const interval = setInterval(() => {
        s += Math.random() * 6 + 2;
        if (s >= 95) { s = 95; clearInterval(interval); }
        setSimScore(Math.round(s));
      }, 35);
    }, 800);
  }, [simPhase, simScore]);

  const resetSimulator = useCallback(() => {
    setSimActive(false);
    setSimPhase(0);
    setSimScore(35);
  }, []);

  /* ── Scan line animation ref ── */
  const [scanY, setScanY] = useState(0);
  useEffect(() => {
    let frame;
    const animate = () => {
      setScanY(prev => (prev + 0.4) % 100);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  }, []);

  // Scroll reveal observer for features vertical timeline rows
  useEffect(() => {
    const rows = document.querySelectorAll('.reveal-row');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    rows.forEach(r => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scoreColor = simScore >= 80 ? '#10B981' : simScore >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="landing-root">
      <SEO title="ATS Resify — AI Resume Builder & ATS Score Checker" description="Build ATS-optimized resumes with AI. Free forever." href="https://atsresify.me/" />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ATS Resify",
            "url": "https://atsresify.me/",
            "description": "Free AI resume builder and ATS score checker",
          })}
        </script>
      </Helmet>

      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(247, 253, 251)"
        gradientBackgroundEnd="rgb(213, 245, 236)"
        firstColor="18, 194, 150"
        secondColor="52, 211, 175"
        thirdColor="16, 160, 130"
        fourthColor="130, 235, 200"
        fifthColor="80, 220, 190"
        pointerColor="18, 194, 150"
        size="80%"
        blendingValue="hard-light"
        containerClassName="hero"
      >
        <Navbar />
        <div className="hero-content">
          
          {/* Hero Section */}
          <section className="hero-section" ref={r1}>
        <div className="hero-container max-w-[1100px] mx-auto px-6 text-center relative z-10">
          <div className="hero-eyebrow-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-teal-800 font-semibold text-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            AI Career Suite — free & unlimited
          </div>
          
          <h1 className="hero-h1 font-medium">
            Your resume, rewritten for <span className="hero-gradient-text font-black tracking-tight">the algorithms</span>
          </h1>
          <p className="hero-p text-slate-800 font-medium max-w-2xl mx-auto">
            Build a resume tailored for <strong>{typed}</strong>
          </p>

          {/* Split Pane Hero Panel */}
          <div className="hero-dashboard mt-8 text-left">
            {/* Left Pane - Text input simulator */}
            <div className="dash-pane dash-left">
              <div className="pane-header">
                <span className="pane-tab">experience_input.txt</span>
                <span className="pane-title">→ resume.tex</span>
              </div>
              <div className="pane-body">
                <div className="code-block-wrap">
                  <div className="code-block input-block">
                    <span className="code-label">INPUT</span>
                    <p className="code-text font-mono text-[11px] leading-relaxed text-slate-500">
                      <span className="text-slate-400 font-normal">// Your plain text</span><br/>
                      I <span className="text-teal-600 font-semibold">managed</span> our team's website and <span className="text-teal-600 font-semibold">fixed</span> a lot of performance issues with the database and frontend.<span className="cursor-blink" />
                    </p>
                  </div>
                  
                  {/* AI Enhancement indicator */}
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#0D9488] animate-subtle-pulse">
                    <ArrowDown className="w-4 h-4" />
                    AI Enhancement
                  </div>

                  <div className="code-block output-block">
                    <span className="code-label code-label-success">LATEX OUTPUT</span>
                    <code className="font-mono text-[11px] leading-relaxed text-slate-600">
                      <span className="text-teal-700 font-bold">\resumeItem</span>{'{'}Architected Redis caching layer, reducing P95 API latency by <span className="text-teal font-bold font-sans">42%</span> and eliminating <span className="text-teal font-bold font-sans">99.4%</span> of PostgreSQL deadlocks across 3 production clusters.{'}'}
                    </code>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono text-slate-400 mt-auto">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                    AI Writer active
                  </span>
                  <span>42% latency cut · 0 deadlocks</span>
                </div>
              </div>
            </div>

            {/* Right Pane - PDF Preview / Scorer */}
            <div className="dash-pane dash-right">
              <div className="pane-header">
                <span className="pane-tab">preview_compiled.pdf</span>
                <span className="pane-status"><span className="pane-status-dot bg-[#14B8A6]" />LIVE</span>
              </div>
              <div className="pane-body flex flex-col justify-between p-5 relative">
                
                {/* Compiled PDF Sheet */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100 flex-1 flex flex-col justify-between min-h-[300px] text-left">
                  <div className="text-center pb-2 border-b border-slate-100">
                    <h4 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider">John Developer</h4>
                    <p className="text-[9px] text-slate-400 font-mono">john@example.com · (555) 123-4567 · github.com/john</p>
                  </div>
                  
                  <div className="flex-1 py-3 flex flex-col gap-2.5">
                    <div className="border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-[9px] text-slate-800 uppercase tracking-wider block mb-1">Experience</span>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[9px] text-slate-700">Senior Software Engineer — Acme Corp</span>
                        <span className="text-[8px] text-slate-400 font-mono">Jun 2022 – Present</span>
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        <div className="h-1 bg-slate-200/50 rounded-full w-[95%]" />
                        <div className="h-1 bg-slate-200/50 rounded-full w-[90%]" />
                        <div className="h-1 bg-slate-200/50 rounded-full w-[85%]" />
                      </div>
                    </div>

                    <div className="border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-[9px] text-slate-800 uppercase tracking-wider block mb-1">Education</span>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[9px] text-slate-700">B.S. Computer Science — MIT</span>
                        <span className="text-[8px] text-slate-400 font-mono">2018 – 2022</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-[9px] text-slate-800 uppercase tracking-wider block mb-1">Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'].map((s) => (
                          <span key={s} className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score gauge overlay inside preview */}
                <div className="absolute bottom-16 right-8 bg-white rounded-full shadow-[0_12px_36px_rgba(15,23,42,0.15)] p-1.5 border border-slate-100 flex items-center justify-center z-20">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(20, 184, 166, 0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#14B8A6" strokeWidth="8"
                        strokeDasharray={`${(heroScore / 100) * 263.8} 263.8`}
                        strokeLinecap="round" transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold font-sans text-teal-600">{heroScore}</span>
                      <span className="text-[6px] text-slate-400 font-bold uppercase">ATS Score</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400 mt-auto">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                    PDF/A-1a Compiled
                  </span>
                  <span>Page 1 of 1 · 100% Vector</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-ctas">
            <button onClick={() => navigate('/create-resume/prompt')} className="cta-primary">
              <Sparkles className="w-4 h-4 text-white" />
              Build my resume
            </button>
            <SecondaryButton onClick={() => navigate('/ats-checker')} icon={ScanSearch}>
              Check ATS score
            </SecondaryButton>
          </div>
          <p className="hero-footnote">No signup required · Export to PDF · Always free</p>
        </div>
      </section>

      {/* METRICS BAR */}
      <section className="metrics-bar" aria-label="Key Performance Indicators">
        <div ref={r2} className="reveal metrics-inner">
          {[
            { val: 'ATS-Ready', label: 'Tested PDF/A formatting' },
            { val: '<30s', label: 'Average compilation time' },
            { val: 'Optimized', label: 'Targeted keyword matching' },
            { val: '$0', label: 'Forever free — no paywalls' },
          ].map((m, i) => (
            <div key={i} className="metric-item flex flex-col justify-between items-center h-full text-center">
              <div className="metric-val text-[#14B8A6]">{m.val}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </BackgroundGradientAnimation>

      {/* VERTICAL TIMELINE SHOWCASE */}
      <section className="feature-showcase bg-transparent py-20 overflow-hidden" ref={r3} aria-label="Key Capabilities">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-24">
            <span className="section-eyebrow">CORE CAPABILITIES</span>
            <h2 className="section-h2">An AI career toolkit built for technical precision</h2>
          </div>

          <CoreCapabilities />
        </div>
      </section>

      {/* GAMIFIED ATS SCORE SIMULATOR */}
      <section className="simulator-section">
        <div ref={r4} className="reveal simulator-wrapper">
          <div className="section-eyebrow">LIVE DEMONSTRATION</div>
          <h2 className="section-h2">Watch AI optimize a bullet in real time</h2>

          <div className="sim-panel">
            <div className="sim-content">
              {/* Left — text transformation */}
              <div className="sim-text-area">
                <div className={`sim-input-block ${simPhase >= 1 ? 'sim-fade-out' : ''}`}>
                  <span className="sim-label sim-label-red">Raw input · ATS Score: <strong>35%</strong></span>
                  <p className="sim-raw-text">"I was in charge of our company website"</p>
                </div>

                {simPhase >= 1 && (
                  <div className={`sim-processing ${simPhase === 2 ? 'sim-done' : ''}`}>
                    {simPhase === 1 && (
                      <div className="sim-spinner-wrap">
                        <div className="sim-spinner" />
                        <span className="sim-spinner-text">AI analyzing and optimizing...</span>
                      </div>
                    )}
                    {simPhase === 2 && (
                      <div className="sim-output-block mt-4 pt-4 border-t border-slate-200/60">
                        <span className="sim-label sim-label-green">Optimized · ATS Score: <strong>95%</strong></span>
                        <p className="sim-optimized-text font-sans">
                          "Engineered a high-performance React web application serving 50K+ monthly users, implementing code-splitting and lazy loading strategies that reduced initial bundle size by 62% and boosted Core Web Vitals engagement metrics by 42%"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  {simPhase === 0 && (
                    <button onClick={runSimulator} className="sim-trigger-btn flex items-center justify-center gap-1.5 mx-auto">
                      <Play className="w-4 h-4 fill-current" />
                      Run AI optimization
                    </button>
                  )}
                  {simPhase === 2 && (
                    <button onClick={resetSimulator} className="sim-reset-btn flex items-center justify-center gap-1.5 mx-auto">
                      <RotateCcw className="w-4 h-4" />
                      Reset demo
                    </button>
                  )}
                </div>
              </div>

              {/* Right — Score gauge */}
              <div className="sim-gauge-area">
                <svg viewBox="0 0 160 160" className="sim-gauge-svg">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="8" />
                  <circle cx="80" cy="80" r="68" fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${(simScore / 100) * 427.3} 427.3`}
                    strokeLinecap="round" transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease' }} />
                </svg>
                <div className="sim-gauge-center">
                  <span className="sim-gauge-number" style={{ color: scoreColor }}>{simScore}</span>
                  <span className="sim-gauge-label">ATS Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA — Frosted Glass */}
      <section className="cta-section">
        <div ref={r5} className="reveal cta-wrapper">
          <div className="cta-panel">
            <div className="cta-glow cta-glow-1" />
            <div className="cta-glow cta-glow-2" />
            <div className="cta-inner">
              <h2 className="cta-h2">Ready to build a resume that actually gets read?</h2>
              <p className="cta-sub text-slate-500">Join thousands landing interviews at companies they thought were out of reach.</p>
              <div className="cta-btns">
                <button onClick={() => navigate('/create-resume/prompt')} className="cta-primary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Start building — it's free
                </button>
                <SecondaryButton onClick={() => navigate('/ats-checker')} icon={ScanSearch}>
                  Check my current score
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
