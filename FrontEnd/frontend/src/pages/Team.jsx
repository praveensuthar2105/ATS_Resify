import React from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
const Team = () => {
    const teamMembers = [
        {
            name: 'Praveen Suthar',
            role: 'Full Stack Developer',
            bio: 'Passionate about building scalable web applications with modern technologies. Led the architecture and development of the ATS Resify platform.',
            avatar: 'PS',
            color: '#39ff14', // Swapped indigo for neon green to match theme
            skills: ['Spring Boot', 'React', 'AI Integration', 'System Design'],
            github: 'https://github.com/praveensuthar2105',
            linkedin: '#',
        },
    ];

    const techStack = [
        { category: 'Frontend', items: ['React 18', 'Vite', 'Tailwind', 'Monaco Editor'], color: '#39ff14' },
        { category: 'Backend', items: ['Spring Boot 3.5', 'Spring Security', 'JPA / Hibernate', 'WebSocket'], color: '#39ff14' },
        { category: 'AI & APIs', items: ['Google Gemini 2.0', 'LaTeX (pdflatex)', 'ATS Scoring', 'PDF Extraction'], color: '#39ff14' },
        { category: 'Infrastructure', items: ['MySQL 8', 'Redis', 'OAuth 2.0 / JWT', 'MiKTeX'], color: '#39ff14' },
    ];

    return (
        <div className="bg-[#ffffff] text-black min-h-screen flex flex-col font-mono selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
            <SEO
                title="Our Team - ATS Resify"
                description="Meet the builders behind ATS Resify. Discover the full stack developers and the technology stack powering our AI-driven resume tools."
            />
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
            </Helmet>

            <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* HERO */}
                <section className="text-center max-w-4xl mx-auto mb-20 relative">
                    <div className="inline-block border border-black bg-black text-[#39ff14] px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6 shadow-[1.5px 1.5px 0px 0px #39ff14]">
                        OUR TEAM
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter uppercase relative inline-block">
                        Meet the <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>Builders</span>
                        <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-black"></div>
                    </h1>
                    <p className="mt-8 text-gray-700 text-lg max-w-2xl mx-auto font-bold uppercase tracking-wide">
                        The people behind ATS Resify — building smarter tools for job seekers worldwide. _
                    </p>
                </section>

                {/* TEAM MEMBERS */}
                <section className="mb-20">
                    <div className="grid grid-cols-1 gap-12 justify-items-center">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="max-w-2xl w-full bg-[#f8f8f8] border border-black p-8 relative flex flex-col md:flex-row gap-8 items-center shadow-[4px_4px_0px_0px_#000000]">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#39ff14]"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#39ff14]"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#39ff14]"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#39ff14]"></div>

                                <div className="w-32 h-32 md:w-48 md:h-48 border border-black bg-black text-[#39ff14] flex items-center justify-center text-5xl md:text-7xl font-bold shrink-0 shadow-[2px_2px_0px_0px_#39ff14]">
                                    {member.avatar}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-bold uppercase mb-2">{member.name}</h2>
                                    <span className="inline-block border border-black bg-[#39ff14] text-black px-3 py-1 text-xs font-bold uppercase mb-4">
                                        {member.role}
                                    </span>
                                    <p className="font-bold text-sm text-gray-700 mb-6 leading-relaxed">
                                        {member.bio}
                                    </p>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                                        {member.skills.map((skill, idx) => (
                                            <span key={idx} className="bg-white border border-black px-2 py-1 text-xs font-bold uppercase text-black">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 justify-center md:justify-start">
                                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black text-[#39ff14] border border-black px-4 py-2 text-sm font-bold uppercase border hover:bg-white hover:text-black transition-colors shadow-[1.5px 1.5px 0px 0px #39ff14]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                                            GitHub
                                        </a>
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#39ff14] border border-black px-4 py-2 text-black text-sm font-bold uppercase hover:bg-black hover:text-[#39ff14] transition-colors shadow-[1.5px 1.5px 0px 0px #000000]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TECH STACK */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold uppercase mb-2 border-b-2 border-black inline-block pb-2">
                        <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>/</span>Technology Stack
                    </h2>
                    <p className="font-bold text-gray-700 uppercase mb-8">The frameworks powering ATS Resify</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {techStack.map((stack, index) => (
                            <div key={index} className="border border-black bg-white p-6 shadow-[2px_2px_0px_0px_#000000] hover:-translate-y-1 transition-transform group">
                                <div className="flex items-center gap-2 mb-4 border-b border-black pb-2">
                                    <span className="w-3 h-3 bg-[#39ff14] border border-black relative top-[1px]"></span>
                                    <h3 className="font-bold uppercase text-lg">{stack.category}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {stack.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm font-bold text-gray-800">
                                            <span className="text-[#39ff14] mt-[2px]">&gt;</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center bg-black text-[#39ff14] border border-black p-12 shadow-[4px_4px_0px_0px_#39ff14] relative overflow-hidden group">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase mb-4">Want to Contribute?</h2>
                        <p className="text-white font-bold mb-8 max-w-xl mx-auto uppercase tracking-wide">
                            ATS Resify is an open-source project. We welcome contributions, ideas, and feedback from the community.
                        </p>
                        <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-[#39ff14] text-black font-bold text-lg uppercase px-8 py-4 border border-[#39ff14] hover:bg-black hover:text-[#39ff14] transition-colors cursor-pointer w-full sm:w-auto">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                            View on GitHub
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Team;
