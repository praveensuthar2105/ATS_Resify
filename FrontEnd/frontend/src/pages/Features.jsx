import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, Code2, ShieldCheck, MessageSquareText, RefreshCw,
  BarChart3, FileUp, ArrowRight, Zap, Layers, PenTool, Target
} from 'lucide-react';

/* ─── Feature data ─── */
const HERO_PILLS = [
  'AI Content Engine',
  'Live LaTeX → PDF',
  'ATS Keyword Analysis',
  'Real-time Sync',
  'Job-Match Gap Analysis',
];

const PRIMARY_FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Advanced AI generates professional summaries, experience bullets, project descriptions, and skill recommendations tailored to your target role.',
    accent: 'from-violet-500/20 to-indigo-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    materialIcon: 'auto_awesome',
  },
  {
    icon: Code2,
    title: 'Live LaTeX Editor',
    description: 'Full-featured Monaco-based LaTeX editor with syntax highlighting, auto-completion, and instant server-side PDF compilation.',
    accent: 'from-sky-500/20 to-cyan-500/20',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
    materialIcon: 'code',
  },
  {
    icon: ShieldCheck,
    title: 'ATS Score Checker',
    description: 'Upload your resume to get an AI-powered ATS compatibility score with keyword analysis, formatting checks, and actionable recommendations.',
    accent: 'from-emerald-500/20 to-teal-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    materialIcon: 'verified',
  },
];

const SECONDARY_FEATURES = [
  {
    icon: MessageSquareText,
    title: 'AI Resume Agent',
    description: 'Interactive chat agent that improves bullet points, analyzes job matches, and tailors content to specific job descriptions.',
    materialIcon: 'smart_toy',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Sync',
    description: 'WebSocket-powered live synchronization between form editor, JSON editor, and LaTeX code. Edit in any mode — all views stay in sync.',
    materialIcon: 'sync',
  },
  {
    icon: BarChart3,
    title: 'Job-Match Gap Analysis',
    description: 'Upload target job descriptions to analyze keyword match rates, identifying critical skill gaps and missing resume keywords instantly.',
    materialIcon: 'analytics',
  },
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    icon: FileUp,
    title: 'Enter your details',
    description: 'Fill in your experience, education, skills, and projects using our guided form — or let AI generate content from scratch.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'AI optimizes your content',
    description: 'Our AI creates impactful bullet points, professional summaries, and optimizes your content for ATS keyword matching.',
  },
  {
    num: '03',
    icon: PenTool,
    title: 'Fine-tune & export PDF',
    description: 'Polish in the LaTeX editor, check your ATS score, and download a beautifully typeset PDF — ready to submit.',
  },
];

const CAPABILITIES = [
  { icon: 'edit_note', label: 'Guided Form Builder' },
  { icon: 'psychology', label: 'AI Bullet Improver' },
  { icon: 'upload_file', label: 'PDF/DOCX Import' },
  { icon: 'tune', label: 'Template Engine' },
  { icon: 'content_copy', label: 'Multi-Resume Support' },
  { icon: 'security', label: 'Encrypted Storage' },
  { icon: 'speed', label: 'Instant PDF Compile' },
  { icon: 'compare', label: 'Side-by-Side Preview' },
];

/* ─── Intersection Observer hook ─── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const RevealDiv = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-row ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════ */

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fdfb] via-[#eefbf7] to-[#d5f5ec] relative overflow-hidden">
      <SEO
        title="Features — ATS Resify"
        description="Explore the tools behind ATS Resify: AI generation, real-time LaTeX editing, ATS score checking, and interactive resume chat."
      />
      <Helmet>
        <style>{`
          .feature-card-glow {
            position: relative;
            overflow: hidden;
          }
          .feature-card-glow::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.4s ease;
            border-radius: inherit;
            pointer-events: none;
          }
          .feature-card-glow:hover::before {
            opacity: 1;
          }
          .workflow-line {
            background: linear-gradient(to bottom, #14B8A6, #0D948800);
          }
        `}</style>
      </Helmet>

      {/* Ambient blobs */}
      <div className="absolute top-[-5%] right-[-8%] w-[600px] h-[600px] rounded-full bg-teal-300/12 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-200/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-200/10 blur-[100px] pointer-events-none" />

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center relative z-10">
        <RevealDiv>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
            Platform Capabilities
          </span>
        </RevealDiv>

        <RevealDiv delay={80}>
          <h1 className="text-4xl md:text-[56px] font-bold text-slate-800 tracking-tight leading-[1.1] mb-5">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] bg-clip-text text-transparent">
              land the interview
            </span>
          </h1>
        </RevealDiv>

        <RevealDiv delay={150}>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            AI-powered content generation, professional LaTeX typesetting, ATS optimization,
            and real-time collaboration — everything in one platform.
          </p>
        </RevealDiv>

        <RevealDiv delay={220}>
          <div className="flex flex-wrap justify-center gap-2.5 mb-4">
            {HERO_PILLS.map((pill) => (
              <span
                key={pill}
                className="text-[12px] font-semibold text-slate-600 bg-white/70 border border-slate-200/60 px-4 py-2 rounded-full backdrop-blur-sm hover:border-[#14B8A6]/40 hover:text-[#0D9488] transition-all cursor-default"
              >
                {pill}
              </span>
            ))}
          </div>
        </RevealDiv>
      </section>

      {/* ─── PRIMARY FEATURES (Bento cards) ─── */}
      <section className="px-6 max-w-6xl mx-auto pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRIMARY_FEATURES.map((feat, i) => (
            <RevealDiv key={feat.title} delay={i * 100}>
              <div className={`feature-card-glow group rounded-3xl p-8 h-full bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_48px_rgba(13,148,136,0.1)] hover:border-[#14B8A6]/25 transition-all duration-400`}>
                <div className={`w-12 h-12 ${feat.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`material-symbols-outlined ${feat.iconColor}`} style={{ fontSize: '24px' }}>
                    {feat.materialIcon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 tracking-tight">{feat.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ─── SECONDARY FEATURES (Horizontal cards) ─── */}
      <section className="px-6 max-w-6xl mx-auto pb-28 relative z-10">
        <RevealDiv>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-3">
              And much more under the hood
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Every feature is built to work together seamlessly, giving you a competitive edge.
            </p>
          </div>
        </RevealDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SECONDARY_FEATURES.map((feat, i) => (
            <RevealDiv key={feat.title} delay={i * 80}>
              <div className="group rounded-2xl p-6 bg-white/50 backdrop-blur-xl border border-slate-200/60 hover:border-[#14B8A6]/25 hover:bg-white/70 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/8 flex items-center justify-center mb-4 group-hover:bg-[#14B8A6]/15 transition-colors">
                  <span className="material-symbols-outlined text-[#0D9488]" style={{ fontSize: '20px' }}>
                    {feat.materialIcon}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ─── CAPABILITIES RIBBON ─── */}
      <section className="px-6 max-w-6xl mx-auto pb-28 relative z-10">
        <RevealDiv>
          <div className="rounded-3xl bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_rgba(15,23,42,0.04)] p-8 md:p-10">
            <h3 className="text-xs font-bold text-[#0D9488] uppercase tracking-widest mb-6 text-center">
              Built-in capabilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50/60 border border-slate-100/80 hover:border-[#14B8A6]/20 hover:bg-[#14B8A6]/4 transition-all group"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0D9488] transition-colors" style={{ fontSize: '20px' }}>
                    {cap.icon}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                    {cap.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RevealDiv>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-6 max-w-5xl mx-auto pb-32 relative z-10">
        <RevealDiv>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-4 py-2 rounded-full mb-5">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>route</span>
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Three steps to your best resume
            </h2>
          </div>
        </RevealDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#14B8A6]/0 via-[#14B8A6]/30 to-[#14B8A6]/0 z-0" />

          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <RevealDiv key={step.num} delay={i * 120}>
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Step circle */}
                  <div className="w-[72px] h-[72px] rounded-full bg-white border-2 border-[#14B8A6]/20 flex items-center justify-center mb-6 shadow-[0_4px_20px_rgba(13,148,136,0.08)] relative">
                    <Icon className="w-6 h-6 text-[#0D9488]" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0D9488] text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2.5">{step.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-[260px]">{step.description}</p>
                </div>
              </RevealDiv>
            );
          })}
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="px-6 max-w-4xl mx-auto pb-24 relative z-10">
        <RevealDiv>
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 md:p-14 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#14B8A6]/15 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[200px] h-[200px] rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 relative z-10">
              Ready to build a resume that gets past ATS?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8 relative z-10">
              Start from scratch or import an existing resume. Our AI handles the heavy lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <button
                onClick={() => navigate('/create-resume/scratch')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-slate-900 bg-white rounded-full hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] transition-all cursor-pointer border-none"
              >
                Start From Scratch <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/create-resume/import')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white/90 bg-white/10 border border-white/15 rounded-full hover:bg-white/15 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Import Existing Resume
              </button>
            </div>
          </div>
        </RevealDiv>
      </section>
    </div>
  );
};

export default Features;
