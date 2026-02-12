import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Icons as SVG components
const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
  </svg>
);

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
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

const DevicesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
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
      description: 'Leveraging advanced GPT-4 models to generate professional bullet points that showcase your impact instantly.',
      color: '#a855f7'
    },
    {
      icon: <GridIcon />,
      title: 'ATS-Optimized Template',
      description: "Clean, professional template designed to pass Applicant Tracking Systems with a 95%+ success rate.",
      color: '#6366f1'
    },
    {
      icon: <CheckCircleIcon />,
      title: 'Keyword Optimized',
      description: 'Built-in keyword suggestions ensure your resume passes through automated screening systems with ease.',
      color: '#22c55e'
    },
    {
      icon: <SyncIcon />,
      title: 'Real-time Sync',
      description: 'Instant synchronization between your form data and the preview. See changes as you type them.',
      color: '#a855f7'
    },
    {
      icon: <DevicesIcon />,
      title: 'Fully Responsive',
      description: 'Edit your resume on any device. Your workspace is optimized for mobile, tablet, and desktop.',
      color: '#f97316'
    },
    {
      icon: <ExportIcon />,
      title: 'One-Click Export',
      description: 'Export your masterpiece to PDF, Word, or plain text formats in seconds. Ready to upload.',
      color: '#ec4899'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      text: 'This tool helped me land my dream job at a Fortune 500 company! The AI suggestions were spot on.',
      avatar: 'SJ',
      color: '#6366f1'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      text: "The real-time preview and ATS optimization are amazing. I've never built a resume this fast.",
      avatar: 'MC',
      color: '#f97316'
    },
    {
      name: 'Emma Davis',
      role: 'Marketing Manager',
      text: 'Highly recommended! The ATS optimization feature gave me the confidence I needed to apply.',
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
          <span>THE FUTURE OF JOB HUNTING IS HERE</span>
        </div>
        
        <h1 className="hero-title">
          Create Your Perfect<br />
          Resume <span className="gradient-text">with AI</span>
        </h1>
        
        <p className="hero-subtitle">
          Build professional, ATS-optimized resumes in minutes using cutting-<br />
          edge AI technology. Tailored to your industry, focused on your success.
        </p>
        
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate('/generate')}>
            <span className="btn-icon">✨</span>
            Start Building Now
          </button>
          <button className="btn-secondary" onClick={() => navigate('/features')}>
            Learn More
          </button>
        </div>
        
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Resumes Created</span>
          </div>
          <div className="stat">
            <span className="stat-number">95%</span>
            <span className="stat-label">Success Rate</span>
          </div>
          <div className="stat">
            <span className="stat-number">4.9/5</span>
            <span className="stat-label">User Rating</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose Our Builder?</h2>
          <p>Packed with powerful features to make your resume stand out and beat the applicant tracking systems.</p>
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
          <p>Three simple steps to land your dream job.</p>
        </div>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Input Your Details</h3>
            <p>Simply enter your work experience and education. Our intuitive editor makes it a breeze.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Optimization</h3>
            <p>Our AI analyzes your industry and transforms your input into high-impact professional summaries.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Download & Apply</h3>
            <p>Choose a template and download your ATS-ready resume. You're ready to apply and succeed!</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of job seekers who have already landed their dream jobs.</p>
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
            Join thousands of job seekers who have already upgraded their career<br />
            with Resume.AI. Your perfect job is just a click away.
          </p>
          <button className="btn-cta" onClick={() => navigate('/generate')}>
            Get Started Now – It's Free
          </button>
          <span className="cta-note">No credit card required. Cancel anytime.</span>
        </div>
      </section>


    </div>
  );
};

export default LandingPage;
