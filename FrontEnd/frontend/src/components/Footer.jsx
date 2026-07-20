import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Logo from './Logo';

const productLinks = [
  { label: 'AI Resume Builder', to: '/create-resume/prompt' },
  { label: 'ATS Score Checker', to: '/ats-checker' },
  { label: 'All Features', to: '/features' },
  { label: 'LaTeX Editor', to: '/edit-resume' },
];

const resourceLinks = [
  { label: 'About', to: '/about' },
  { label: 'Our Team', to: '/team' },
  { label: 'Feedback', to: '/feedback' },
  { label: 'Support', to: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Contact', to: '/contact' },
];

const linkClass =
  'text-slate-500 hover:text-[#14B8A6] no-underline transition-colors duration-200 font-medium';

const Footer = () => {
  return (
    <footer className="relative bg-white/60 backdrop-blur-xl font-['DM_Sans',_'Inter',_sans-serif]">
      {/* Soft gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#14B8A6]/30 to-transparent" />

      <div className="max-w-[1300px] mx-auto px-6 pt-16 pb-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* ── Brand Column ── */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <Logo className="mb-4" />

              <p className="text-sm leading-relaxed text-slate-500 max-w-sm mb-6">
                The modern AI career suite engineered to help professionals, engineers, and students
                craft resumes that pass automated screening and land dream interviews faster.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href="mailto:praveensuthar1863@gmail.com"
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] border border-[#E2E8F0] flex items-center justify-center transition-all duration-200 text-slate-600 no-underline shadow-sm hover:scale-105"
                aria-label="Email Contact"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] border border-[#E2E8F0] flex items-center justify-center transition-all duration-200 text-slate-600 no-underline shadow-sm hover:scale-105"
                aria-label="Share"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
            </div>
          </div>

          {/* ── Product Column ── */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-5 font-['Space_Grotesk',_sans-serif]">
              Product
            </h4>
            <ul className="space-y-3 text-sm list-none p-0 m-0">
              {productLinks.map(({ label, to }) => (
                <li key={label}>
                  <RouterLink to={to} className={linkClass}>
                    {label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources Column ── */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-5 font-['Space_Grotesk',_sans-serif]">
              Resources
            </h4>
            <ul className="space-y-3 text-sm list-none p-0 m-0">
              {resourceLinks.map(({ label, to }) => (
                <li key={label}>
                  <RouterLink to={to} className={linkClass}>
                    {label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal Column ── */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-5 font-['Space_Grotesk',_sans-serif]">
              Legal
            </h4>
            <ul className="space-y-3 text-sm list-none p-0 m-0">
              {legalLinks.map(({ label, to }) => (
                <li key={label}>
                  <RouterLink to={to} className={linkClass}>
                    {label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
          <p className="m-0">© {new Date().getFullYear()} ATS Resify. Built for career success with modern AI.</p>
          <div className="flex items-center gap-6">
            {/* Live status indicator */}
            <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              All Systems Operational
            </span>
            <span className="text-slate-400">English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
