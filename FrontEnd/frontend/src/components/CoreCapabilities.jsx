import React, { useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, FileCode, Bot, RefreshCw, XCircle, CheckCircle2, 
  Check, User, Braces, FileText, Radar, FileSymlink, ArrowLeftRight, ArrowRight 
} from 'lucide-react';

/* ── Mouse-glow bento card ── */
export const GlassCard = ({ children, className = '' }) => {
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

/* ── Reusable feature icon component with premium duotone rendering ── */
export const FeatureIcon = ({ icon: Icon, variant = 'mint' }) => {
  return (
    <div className="feature-icon-chip">
      <Icon className="w-[22px] h-[22px]" fill="rgba(13, 148, 136, 0.35)" strokeWidth={2} />
    </div>
  );
};

/* ── Reusable feature text card component ── */
export const FeatureText = ({ icon, eyebrow, heading, description }) => {
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

const CoreCapabilities = () => {
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

  return (
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
  );
};

export default CoreCapabilities;
