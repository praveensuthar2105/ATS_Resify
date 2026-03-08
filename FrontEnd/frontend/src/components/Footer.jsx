import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brutal-black border-t-2 border-brutal-white p-8 md:p-16 font-mono uppercase text-brutal-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-8">
              <RouterLink to="/" className="flex items-center gap-3 no-underline">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
                <span className="text-2xl font-black text-brutal-white tracking-tighter">RESIFY</span>
              </RouterLink>
            </div>
            <p className="text-xs leading-relaxed lowercase mb-8 text-slate-500">
              THE WORLD'S MOST ADVANCED AI-POWERED RESUME BUILDER HELPING PROFESSIONALS GET HIRED FASTER.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 border border-brutal-white flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors text-brutal-white no-underline"
                aria-label="Share"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a
                href="mailto:contact@atsresify.me"
                className="w-10 h-10 border border-brutal-white flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors text-brutal-white no-underline"
                aria-label="Email"
              >
                <span className="material-symbols-outlined text-sm">alternate_email</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-brutal-white font-black mb-8 text-sm">[ PRODUCT ]</h4>
            <ul className="space-y-4 text-[11px] font-bold list-none p-0 m-0">
              <li>
                <RouterLink to="/features" className="text-brutal-white no-underline hover:underline transition-all">
                  FEATURES
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/ats-checker" className="text-brutal-white no-underline hover:underline transition-all">
                  ATS CHECKER
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/generate" className="text-brutal-white no-underline hover:underline transition-all">
                  TEMPLATES
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/about" className="text-brutal-white no-underline hover:underline transition-all">
                  ABOUT
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-brutal-white font-black mb-8 text-sm">[ RESOURCES ]</h4>
            <ul className="space-y-4 text-[11px] font-bold list-none p-0 m-0">
              <li>
                <RouterLink to="/team" className="text-brutal-white no-underline hover:underline transition-all">
                  TEAM
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/feedback" className="text-brutal-white no-underline hover:underline transition-all">
                  FEEDBACK
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="text-brutal-white no-underline hover:underline transition-all">
                  SUPPORT
                </RouterLink>
              </li>
              <li>
                <a href="#" className="text-brutal-white no-underline hover:underline transition-all">API</a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-brutal-white font-black mb-8 text-sm">[ COMPANY ]</h4>
            <ul className="space-y-4 text-[11px] font-bold list-none p-0 m-0">
              <li>
                <RouterLink to="/about" className="text-brutal-white no-underline hover:underline transition-all">
                  ABOUT US
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/privacy" className="text-brutal-white no-underline hover:underline transition-all">
                  PRIVACY POLICY
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/terms" className="text-brutal-white no-underline hover:underline transition-all">
                  TERMS OF SERVICE
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/contact" className="text-brutal-white no-underline hover:underline transition-all">
                  CONTACT
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brutal-white flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold opacity-60">
          <p className="m-0">© {new Date().getFullYear()} ATS RESIFY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <span>LOC: ENGLISH (US)</span>
            <span>SYSTEM: OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
