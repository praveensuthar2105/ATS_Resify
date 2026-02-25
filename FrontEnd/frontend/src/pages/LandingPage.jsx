import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Icons as SVG components
const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
  </svg>
);

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.58.67 3 1.73 4.01L12 22l6.27-10.49A5.49 5.49 0 0 0 20 7.5 5.5 5.5 0 0 0 14.5 2h-5z" />
  </svg>
);

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const SyncIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ExportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SparkleIcon />,
      title: 'AI-Powered Content',
      description: 'Advanced AI generates professional summaries, experience bullets, and project descriptions tailored to your target role.',
      color: '#a855f7'
    },
    {
      icon: <CodeIcon />,
      title: 'Live LaTeX Editor',
      description: 'Full-featured Monaco-based LaTeX editor with instant server-side PDF compilation. Edit code and see your resume rendered in real time.',
      color: '#6366f1'
    },
    {
      icon: <CheckCircleIcon />,
      title: 'ATS Score Checker',
      description: 'Upload your resume and get an instant ATS score with keyword analysis, formatting checks, and actionable AI recommendations.',
      color: '#22c55e'
    },
    {
      icon: <SyncIcon />,
      title: 'Real-time Sync',
      description: 'WebSocket-powered live synchronization between form editor, JSON view, and LaTeX code. Edit in any mode — all stay in sync.',
      color: '#f97316'
    },
    {
      icon: <ChatIcon />,
      title: 'AI Resume Agent',
      description: 'Interactive AI chat agent for bullet improvement, job matching, keyword gap analysis, and content tailoring to specific job descriptions.',
      color: '#ec4899'
    },
    {
      icon: <ExportIcon />,
      title: 'One-Click PDF Export',
      description: 'Server-side LaTeX compilation generates pixel-perfect PDF resumes instantly. Download and apply with confidence.',
      color: '#06b6d4'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      text: 'The AI agent helped me tailor my resume for each job posting. I landed 3 interviews in a week!',
      avatar: 'SJ',
      color: '#6366f1'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      text: 'The LaTeX editor with real-time preview is incredible. My resume looks professionally typeset without any effort.',
      avatar: 'MC',
      color: '#f97316'
    },
    {
      name: 'Emma Davis',
      role: 'Marketing Manager',
      text: 'The ATS checker scored my resume at 92% after just a few AI-suggested tweaks. Highly recommended!',
      avatar: 'ED',
      color: '#22c55e'
    }
  ];



  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <SparkleIcon />
          <span>ATS RESIFY</span>
        </div>

        <h1 className="hero-title">
          Build ATS-Ready Resumes<br />
          <span className="gradient-text">with AI</span>
        </h1>

        <p className="hero-subtitle">
          Generate professional resumes using advanced AI, edit in a live LaTeX editor,
          check your ATS score, and export pixel-perfect PDFs — all in one platform.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate('/generate')}>
            <span className="btn-icon">✨</span>
            Start Building Now
          </button>
          <button className="btn-secondary" onClick={() => navigate('/ats-checker')}>
            Check ATS Score
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">Smart AI</span>
            <span className="stat-label">Content Generation</span>
          </div>
          <div className="stat">
            <span className="stat-number">LaTeX</span>
            <span className="stat-label">Professional Typesetting</span>
          </div>
          <div className="stat">
            <span className="stat-number">Real-time</span>
            <span className="stat-label">Live Preview & Sync</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Land the Job</h2>
          <p>From AI-generated content to LaTeX typesetting and ATS optimization — our platform covers every step of resume building.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to a job-winning resume.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-badge">Step 1</div>
            <div className="step-icon-circle" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h3>Enter Your Details</h3>
            <p>Fill in your experience, education, and skills using our guided form — or paste existing content for AI enhancement.</p>
            <span className="step-tag">Form Editor + JSON</span>
          </div>

          <div className="step-connector" aria-hidden="true">
            <svg width="48" height="24" viewBox="0 0 48 24">
              <path d="M0 12h38" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M34 6l8 6-8 6" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="step-card">
            <div className="step-badge">Step 2</div>
            <div className="step-icon-circle" style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>AI Generates &amp; Optimizes</h3>
            <p>Our AI transforms your input into impactful bullet points, generates professional summaries, and optimizes for ATS keywords.</p>
            <span className="step-tag">AI Agent + ATS Check</span>
          </div>

          <div className="step-connector" aria-hidden="true">
            <svg width="48" height="24" viewBox="0 0 48 24">
              <path d="M0 12h38" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M34 6l8 6-8 6" stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="step-card">
            <div className="step-badge">Step 3</div>
            <div className="step-icon-circle" style={{ background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>Export Perfect PDF</h3>
            <p>Fine-tune in the LaTeX editor, check your ATS score, and download a beautifully typeset PDF ready to submit.</p>
            <span className="step-tag">LaTeX → PDF</span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join job seekers who have leveled up their resumes with AI.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{ backgroundColor: testimonial.color }}>
                  {testimonial.avatar}
                </div>
                <div className="author-info">
                  <p className="author-name">{testimonial.name}</p>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Build Your Resume?</h2>
          <p>
            Start generating AI-powered, ATS-optimized resumes today.<br />
            No credit card needed. Free to get started.
          </p>
          <button className="btn-cta" onClick={() => navigate('/generate')}>
            Get Started — It's Free
          </button>
          <span className="cta-note">Powered by Advanced AI</span>
        </div>
      </section>


    </div>
  );
};

export default LandingPage;

