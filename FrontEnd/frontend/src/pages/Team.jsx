import React from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Database, Brain, Server } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Team = () => {
    const navigate = useNavigate();

    const teamMembers = [
        {
            name: 'Praveen Suthar',
            role: 'Full Stack Developer',
            bio: 'Passionate about building scalable web applications with modern technologies. Led the architecture and development of the ATS Resify platform.',
            initials: 'PS',
            skills: ['Spring Boot', 'React', 'AI Integration', 'System Design'],
            github: 'https://github.com/praveensuthar2105',
            linkedin: '#',
        },
    ];

    const techStack = [
        { category: 'Frontend', icon: Code2, items: ['React 18', 'Vite', 'TailwindCSS', 'Lucide Icons'], color: 'text-blue-600', bg: 'bg-blue-50' },
        { category: 'Backend', icon: Server, items: ['Spring Boot 3.3', 'Spring Security', 'JPA / Hibernate', 'REST APIs'], color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { category: 'AI & Tools', icon: Brain, items: ['Google Gemini 2.0', 'LaTeX (MiKTeX)', 'ATS Algorithms', 'PDFBox'], color: 'text-purple-600', bg: 'bg-purple-50' },
        { category: 'Infrastructure', icon: Database, items: ['MySQL 8.0', 'OAuth 2.0', 'JWT Auth', 'Cloud Deployment'], color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20 pt-28 px-6 relative overflow-hidden">
            <SEO
                title="Our Team | ATS Resify"
                description="Meet the builders behind ATS Resify. Discover the full stack developers and the technology stack powering our AI-driven resume tools."
            />
            
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/5 blur-[150px]" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-all shadow-sm">
                            <ArrowLeft className="w-4 h-4" /> 
                        </div>
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* HERO */}
                <section className="text-center max-w-4xl mx-auto mb-20">
                    <span className="text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-3 py-1.5 rounded-full mb-6 inline-block">
                        Our Team
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">Builders</span>
                    </h1>
                    <p className="mt-6 text-slate-500 text-lg max-w-2xl mx-auto">
                        The people behind ATS Resify — building smarter tools for job seekers worldwide.
                    </p>
                </section>

                {/* TEAM MEMBERS */}
                <section className="mb-24">
                    <div className="grid grid-cols-1 gap-12 justify-items-center">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="max-w-3xl w-full bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group flex flex-col md:flex-row gap-10 items-center">
                                {/* Gradient Orb */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 -z-10 group-hover:bg-teal-100 transition-colors duration-700" />
                                
                                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 p-1 shrink-0 shadow-lg shadow-teal-500/20">
                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl font-black text-slate-800">
                                        {member.initials}
                                    </div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-block bg-teal-50 text-teal-700 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                        {member.role}
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{member.name}</h2>
                                    <p className="text-slate-500 leading-relaxed mb-6">
                                        {member.bio}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                                        {member.skills.map((skill, idx) => (
                                            <span key={idx} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
                                            <GithubIcon className="w-4 h-4" /> GitHub
                                        </a>
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                                            <LinkedinIcon className="w-4 h-4" /> LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TECH STACK */}
                <section className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                            Technology Stack
                        </h2>
                        <p className="text-slate-500">The modern frameworks powering ATS Resify</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {techStack.map((stack, index) => {
                            const Icon = stack.icon;
                            return (
                                <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${stack.bg} ${stack.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">{stack.category}</h3>
                                    <ul className="space-y-3">
                                        {stack.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Thousands of Job Seekers</h2>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
                            ATS Resify is built to help you land interviews faster. Start creating professional, ATS-optimized resumes today — no setup required.
                        </p>
                        <a href="/create-resume" className="inline-flex items-center justify-center gap-2 bg-teal-500 text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/25">
                            Get Started Free
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Team;
