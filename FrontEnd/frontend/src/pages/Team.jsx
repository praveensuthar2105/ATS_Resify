import React from 'react';
import './Team.css';

const Team = () => {
    const teamMembers = [
        {
            name: 'Praveen Suthar',
            role: 'Full Stack Developer',
            bio: 'Passionate about building scalable web applications with modern technologies. Led the architecture and development of the ATS Resify platform.',
            avatar: 'PS',
            color: '#6366f1',
            skills: ['Spring Boot', 'React', 'AI Integration', 'System Design'],
            github: 'https://github.com/praveensuthar2105',
            linkedin: '#',
        },
    ];

    const techStack = [
        { category: 'Frontend', items: ['React 18', 'Vite', 'Material UI', 'Monaco Editor'], color: '#3b82f6' },
        { category: 'Backend', items: ['Spring Boot 3.5', 'Spring Security', 'JPA / Hibernate', 'WebSocket'], color: '#22c55e' },
        { category: 'AI & APIs', items: ['Google Gemini 2.0', 'LaTeX (pdflatex)', 'ATS Scoring', 'PDF Extraction'], color: '#a855f7' },
        { category: 'Infrastructure', items: ['MySQL 8', 'Redis', 'OAuth 2.0 / JWT', 'MiKTeX'], color: '#f97316' },
    ];

    return (
        <div className="team-page">
            {/* Hero */}
            <section className="team-hero">
                <span className="team-badge">OUR TEAM</span>
                <h1 className="team-title">Meet the <span className="gradient-text">Builders</span></h1>
                <p className="team-subtitle">
                    The people behind ATS Resify — building smarter tools for job seekers worldwide.
                </p>
            </section>

            {/* Team Members */}
            <section className="team-members-section">
                {teamMembers.map((member, index) => (
                    <div key={index} className="team-member-card">
                        <div className="member-avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}dd)` }}>
                            {member.avatar}
                        </div>
                        <div className="member-info">
                            <h2>{member.name}</h2>
                            <span className="member-role" style={{ color: member.color }}>{member.role}</span>
                            <p className="member-bio">{member.bio}</p>
                            <div className="member-skills">
                                {member.skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                            <div className="member-socials">
                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                                    GitHub
                                </a>
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Tech Stack */}
            <section className="tech-stack-section">
                <h2 className="section-title">Technology Stack</h2>
                <p className="section-subtitle">The tools and frameworks powering ATS Resify</p>
                <div className="tech-grid">
                    {techStack.map((stack, index) => (
                        <div key={index} className="tech-card">
                            <div className="tech-header" style={{ borderColor: stack.color }}>
                                <span className="tech-dot" style={{ background: stack.color }}></span>
                                <h3>{stack.category}</h3>
                            </div>
                            <ul className="tech-items">
                                {stack.items.map((item, idx) => (
                                    <li key={idx}>
                                        <span className="tech-bullet" style={{ background: stack.color }}></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="team-cta">
                <h2>Want to Contribute?</h2>
                <p>ATS Resify is an open-source project. We welcome contributions, ideas, and feedback from the community.</p>
                <a href="https://github.com/praveensuthar2105/AI_Powered_Resume_Builder" target="_blank" rel="noopener noreferrer" className="cta-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                    View on GitHub
                </a>
            </section>
        </div>
    );
};

export default Team;
