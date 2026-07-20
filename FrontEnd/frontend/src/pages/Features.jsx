import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Sparkles, FileUp, Briefcase, PenTool, 
  Percent, Target, Layers, FileCode,
  Radar, Bot, RefreshCw, FileSymlink,
  ArrowRight, ArrowUpRight
} from 'lucide-react';

const useReveal = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setTimeout(() => el.classList.add('visible'), delay);
          obs.unobserve(el); 
        } 
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
};

const RevealDiv = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className={`reveal-row ${className}`}>
      {children}
    </div>
  );
};

const featuresData = [
  {
    id: "create",
    category: "Create",
    tagline: "Start your journey.",
    description: "Four intelligent ways to begin building a resume that lands interviews. Choose your starting point and let the AI handle the heavy lifting.",
    accent: "bg-teal-500",
    textAccent: "text-teal-600",
    bgAccent: "bg-teal-50/50",
    items: [
      { title: "Start from scratch", desc: "Build step by step with guided prompts. Perfect for fresh starts.", icon: PenTool, route: "/create-resume/scratch" },
      { title: "Import existing", desc: "Upload a PDF or Word file. We'll extract and restructure it perfectly for ATS.", icon: FileUp, route: "/create-resume/import" },
      { title: "LinkedIn Sync", desc: "Connect your profile and pull your entire work history in one click.", icon: Briefcase, route: "/create-resume/linkedin" },
      { title: "AI Prompt", desc: "Describe your dream job. Our AI will draft a fully formatted first version instantly.", icon: Sparkles, route: "/create-resume/prompt" },
    ]
  },
  {
    id: "analyze",
    category: "Analyze",
    tagline: "Beat the robots.",
    description: "Know exactly why your resume passes or fails automated screening before you even hit the apply button.",
    accent: "bg-emerald-500",
    textAccent: "text-emerald-600",
    bgAccent: "bg-emerald-50/50",
    items: [
      { title: "Quick Score", desc: "Upload your resume for an instant parsing and formatting score. Fix issues before recruiters see them.", icon: Percent, route: "/ats-checker/quick-score" },
      { title: "Job Matching", desc: "Paste any job description to see exactly which keywords you're missing.", icon: Target, route: "/ats-checker/job-match" }
    ],
  },
  {
    id: "engine",
    category: "Engine",
    tagline: "Under the hood.",
    description: "The technical precision and advanced AI models that make ATS Resify the most powerful builder available.",
    accent: "bg-cyan-500",
    textAccent: "text-cyan-600",
    bgAccent: "bg-cyan-50/50",
    items: [
      { title: "Intelligent Bullet Writer", desc: "Converts plain descriptions into executive-quality bullet points with quantified impact.", icon: Sparkles, route: null },
      { title: "LaTeX Compilation", desc: "Instant on-the-fly PDF rendering ensuring clean structural compliance and precise typesetting.", icon: FileCode, route: null },
      { title: "Parser & Scorer", desc: "Re-reads your compiled PDF to instantly check for structural formatting errors.", icon: Radar, route: null },
      { title: "AI Agent", desc: "Interactive chat assistant that tailors content to target job descriptions.", icon: Bot, route: null },
      { title: "Real-Time Sync", desc: "Zero-latency synchronization between the visual form editor, structured JSON, and raw LaTeX.", icon: RefreshCw, route: null },
      { title: "Smart Legacy Import", desc: "Converts existing PDF or Word resumes into clean, structured profiles ready for instant optimization.", icon: FileSymlink, route: null },
    ]
  }
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 selection:bg-teal-200">
      <SEO
        title="Features — ATS Resify"
        description="Explore the technical capabilities of ATS Resify."
      />
      
      {/* ─── EDITORIAL HERO ─── */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto border-b border-slate-200/60">
        <div className="max-w-3xl">
          <RevealDiv>
            <div className="flex items-center gap-3 mb-8 text-sm font-bold tracking-widest text-teal-600/70 uppercase">
              <span className="w-8 h-[1px] bg-teal-600/30"></span>
              Feature Index
            </div>
          </RevealDiv>
          
          <RevealDiv delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8 text-slate-900">
              Engineered for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">the modern job search.</span>
            </h1>
          </RevealDiv>
          
          <RevealDiv delay={200}>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
              A comprehensive suite of AI writing tools, real-time LaTeX compilation, and ATS parsers designed to bypass filters and land interviews.
            </p>
          </RevealDiv>
        </div>
      </section>

      {/* ─── STICKY SPLIT LAYOUT ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {featuresData.map((section, index) => (
          <section 
            key={section.id} 
            className={`flex flex-col lg:flex-row relative items-start py-24 ${index !== featuresData.length - 1 ? 'border-b border-slate-200/60' : ''}`}
          >
            {/* Left Side: Sticky Category Info */}
            <div className="lg:w-5/12 lg:sticky lg:top-32 lg:pr-12 mb-12 lg:mb-0">
              <RevealDiv>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${section.bgAccent} ${section.textAccent} text-xs font-bold tracking-wide uppercase mb-6`}>
                  0{index + 1} — {section.category}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
                  {section.tagline}
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                  {section.description}
                </p>
              </RevealDiv>
            </div>

            {/* Right Side: Scrollable Feature Cards */}
            <div className="lg:w-7/12 flex flex-col gap-6">
              {section.items.map((item, idx) => (
                <RevealDiv key={idx} delay={idx * 100}>
                  <div 
                    onClick={() => item.route && navigate(item.route)}
                    className={`group relative overflow-hidden bg-white rounded-3xl border border-slate-200/60 p-8 transition-all duration-500 ${item.route ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-slate-300' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                      <div className="flex-1">
                        <div className={`w-12 h-12 rounded-2xl ${section.bgAccent} ${section.textAccent} flex items-center justify-center mb-6`}>
                          <item.icon className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-black transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 text-base leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      
                      {item.route && (
                        <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300 shrink-0">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    
                    {/* Subtle hover accent line at bottom */}
                    {item.route && (
                      <div className={`absolute bottom-0 left-0 h-1 w-full scale-x-0 origin-left ${section.accent} transition-transform duration-500 group-hover:scale-x-100`} />
                    )}
                  </div>
                </RevealDiv>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ─── MINIMAL CLOSING CTA ─── */}
      <section className="border-t border-slate-200/60 mt-12 bg-white">
        <RevealDiv>
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-8">
              Your next role awaits.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/create-resume/scratch')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-400 text-white shadow-[0_0_20px_rgb(20,184,166,0.3)] hover:shadow-[0_0_30px_rgb(20,184,166,0.5)] text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/ats-checker/quick-score')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                Scan Existing Resume
              </button>
            </div>
          </div>
        </RevealDiv>
      </section>

    </div>
  );
};

export default Features;
