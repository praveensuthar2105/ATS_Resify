import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import { Sparkles, FileCode, ScanSearch, Bot, RefreshCw, FileUp, ChevronLeft, ChevronRight, ArrowDown, XCircle, CheckCircle2, Check, User, Braces, FileText, Radar, FileSymlink, ArrowLeftRight, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BackgroundGradientAnimation } from '../components/ui/background-gradient-animation';

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

/* ── Mouse-glow bento card ── */
const GlassCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} className={`frost-card ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
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

/* ── Reusable feature icon component with premium duotone rendering ── */
const FeatureIcon = ({ icon: Icon, variant = 'mint' }) => {
  return (
    <div className="feature-icon-chip">
      <Icon className="w-[22px] h-[22px]" fill="rgba(13, 148, 136, 0.35)" strokeWidth={2} />
    </div>
  );
};

/* ── Reusable feature text card component ── */
const FeatureText = ({ icon, eyebrow, heading, description }) => {
  return (
    <div className="feature-text flex-1 text-left">
      <div className="flex items-center gap-3 mb-3">
        <FeatureIcon icon={icon} />
        <span className="eyebrow text-[#14B8A6] font-bold uppercase tracking-wider text-xs font-mono">{eyebrow}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3 font-sans">{heading}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-sans">{description}</p>
    </div>
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

          <div className="flex flex-col gap-24">
            
            {/* Feature 1: Intelligent Bullet Writer */}
            <div className="feature-row reveal-row" data-index="1">
              <FeatureText
                icon={Sparkles}
                eyebrow="01 — AI Writing"
                heading="Intelligent Bullet Writer"
                description="Converts plain experience descriptions into executive-quality bullet points with quantified impact and ATS-targeted action verbs."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/40 border border-red-100/60 text-xs text-slate-500 line-through">
                      <span className="px-2 py-1 rounded-md bg-red-50 border border-red-200/50 text-red-600 font-bold uppercase text-[9px] flex items-center gap-1.5 flex-shrink-0 shadow-sm">
                        <XCircle className="w-3 h-3 text-red-500 fill-red-100/50" /> Before
                      </span>
                      <span className="pt-0.5">"Worked on company database"</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 text-xs text-slate-800 font-medium leading-relaxed">
                      <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200/50 text-emerald-700 font-bold uppercase text-[9px] flex items-center gap-1.5 flex-shrink-0 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100/50" /> After
                      </span>
                      <span className="pt-0.5">"Migrated large PostgreSQL database to partitioned architecture, eliminating transaction deadlocks"</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Feature 2: LaTeX Compilation */}
            <div className="feature-row-reverse reveal-row" data-index="2">
              <FeatureText
                icon={FileCode}
                eyebrow="02 — Typesetting"
                heading="LaTeX Compilation"
                description="Instant on-the-fly PDF rendering via cloud LaTeX ensuring clean structural compliance and precise typesetting."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Cloud Compiler
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">Standard PDF/A</span>
                    </div>
                    
                    <div className="p-3.5 rounded-lg bg-slate-900/5 border border-slate-200/50 font-mono text-[10px] text-slate-600 leading-relaxed">
                      <span className="text-[#0D9488] font-semibold">\resumeSubheading</span>{"{Acme Corp}"}{"{Software Engineer}"}
                      <br />
                      <span className="text-slate-400 pl-4">// Compiled bullet:</span>
                      <br />
                      <span className="text-[#0D9488] font-semibold pl-4">\resumeItem</span>{"{Optimized Redis caching, cutting API latency by 42%}"}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                      <span>Compilation complete (242ms) · 0 warnings</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Feature 3: Real-Time ATS Parser & Scorer */}
            <div className="feature-row reveal-row" data-index="3">
              <FeatureText
                icon={Radar}
                eyebrow="03 — Parsing"
                heading="Real-Time ATS Parser & Scorer"
                description="Re-reads your compiled PDF to instantly check for structural formatting errors, missing keywords, and Section weight discrepancies."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span className="text-slate-500 font-mono">Parser Diagnostic</span>
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[9px] uppercase">ATS Active</span>
                    </div>

                    <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/5 border border-slate-200/50">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-600 font-medium">ATS Match Rate:</span>
                        <span className="text-emerald-600 font-bold">95% (Excellent)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-2 text-emerald-800 font-medium bg-emerald-50/30 border border-emerald-100/40 py-1.5 px-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        Section Weights
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 font-medium bg-emerald-50/30 border border-emerald-100/40 py-1.5 px-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        Action Verbs
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 font-medium bg-emerald-50/30 border border-emerald-100/40 py-1.5 px-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        Contact Info
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 font-medium bg-emerald-50/30 border border-emerald-100/40 py-1.5 px-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        PDF/A Format
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Feature 4: AI Resume Agent */}
            <div className="feature-row-reverse reveal-row" data-index="4">
              <FeatureText
                icon={Bot}
                eyebrow="04 — Assistant"
                heading="AI Resume Agent"
                description="An interactive chat assistant right alongside your editor that tailors content to target job descriptions and highlights skill gaps."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-3 text-[11px]">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-slate-700 flex items-start gap-2.5 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-slate-200/85 border border-slate-350 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 leading-relaxed">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Applicant</div>
                        "Tailor my resume experience points to target a Senior DevOps Engineer role."
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#E6F8F3] to-[#BFEFE3] border border-[#14B8A6]/20 p-3 rounded-2xl text-teal-900 flex items-start gap-2.5 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                        <Bot className="w-3.5 h-3.5" fill="rgba(255,255,255,0.2)" />
                      </div>
                      <div className="flex-1 leading-relaxed">
                        <div className="text-[10px] text-teal-700 font-bold uppercase tracking-wider mb-0.5">Resume AI</div>
                        "Analyzing profile... Injected Terraform, AWS ECS pipelines, and Dockerized scaling metrics to match target keywords."
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Feature 5: Real-Time Sync */}
            <div className="feature-row reveal-row" data-index="5">
              <FeatureText
                icon={RefreshCw}
                eyebrow="05 — Synchronization"
                heading="Real-Time Sync"
                description="Zero-latency synchronization between the visual form editor, structured JSON, and raw LaTeX compiler outputs."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full font-mono text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 flex items-center gap-1.5 shadow-sm font-semibold text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> Form
                      </span>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-teal-500 animate-pulse flex-shrink-0" />
                      <span className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/30 text-teal-700 font-bold flex items-center gap-1.5 shadow-sm">
                        <Braces className="w-3.5 h-3.5 text-teal-500" /> JSON
                      </span>
                      <ArrowLeftRight className="w-3.5 h-3.5 text-teal-500 animate-pulse flex-shrink-0" />
                      <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 flex items-center gap-1.5 shadow-sm font-semibold text-slate-700">
                        <FileCode className="w-3.5 h-3.5 text-slate-400" /> LaTeX
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#14B8A6] to-transparent animate-pulse-travel" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Active Stream
                      </span>
                      <span>Sync delay: 12ms</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Feature 6: Smart Legacy Import */}
            <div className="feature-row-reverse reveal-row" data-index="6">
              <FeatureText
                icon={FileSymlink}
                eyebrow="06 — Conversion"
                heading="Smart Legacy Import"
                description="Converts existing PDF or Word resumes into clean, structured profiles ready for instant optimization."
              />
              <div className="feature-visual flex-1 w-full">
                <GlassCard className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full font-mono text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 flex items-center gap-1.5 shadow-sm font-semibold text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> PDF / Word
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-500 animate-pulse flex-shrink-0" />
                      <span className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/30 text-teal-700 font-bold flex items-center gap-1.5 shadow-sm">
                        <FileCode className="w-3.5 h-3.5 text-teal-500" /> LaTeX
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#14B8A6] to-transparent animate-pulse-travel" />
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-900/5 border border-slate-200/50 text-[10px] font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>Parser status:</span>
                        <span className="text-emerald-600 font-bold">100% Parsed</span>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        • Found 5 Experience items · 2 Education items
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

          </div>
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
