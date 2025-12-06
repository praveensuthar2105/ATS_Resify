import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: '⚡',
      title: 'AI-Powered',
      description: 'Leveraging advanced AI to create professional resumes instantly'
    },
    {
      icon: '✨',
      title: 'Beautiful Templates',
      description: 'Modern, elegant templates designed by professionals'
    },
    {
      icon: '🔄',
      title: 'Real-time Sync',
      description: 'Instant synchronization between form, JSON, and LaTeX'
    },
    {
      icon: '📱',
      title: 'Fully Responsive',
      description: 'Works perfectly on all devices and screen sizes'
    },
    {
      icon: '🚀',
      title: 'ATS Optimized',
      description: 'Optimized for Applicant Tracking Systems'
    },
    {
      icon: '📊',
      title: 'Export Ready',
      description: 'Export to PDF, Word, or JSON formats'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      text: 'This tool helped me land my dream job at a Fortune 500 company!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      text: 'The AI suggestions are incredibly helpful and time-saving.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Marketing Manager',
      text: 'Professional templates and easy to use interface. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Create Your Perfect Resume
              <span className="gradient-text"> with AI</span>
            </h1>
            <p className="hero-subtitle">
              Build professional, ATS-optimized resumes in minutes using advanced AI technology
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/generate')}
              >
                Start Building
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Resumes Created</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-header">Resume Preview</div>
              <div className="card-content">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line short"></div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-header">✓ ATS Checked</div>
              <div className="card-content">
                <div className="check">✓</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-header">AI Suggestions</div>
              <div className="card-content">
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
            <div className="gradient-orb"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose Our Resume Builder?</h2>
          <p>Packed with powerful features to make your resume stand out</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to your perfect resume</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Enter Your Information</h3>
            <p>Fill in your details using our intuitive form editor</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose a Template</h3>
            <p>Select from our professionally designed templates</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Export & Apply</h3>
            <p>Download your resume and start applying</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied users worldwide</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {'★'.repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.name[0]}</div>
                <div>
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
          <p>Join thousands of job seekers who have already landed their dream jobs</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/generate')}
          >
            Get Started Now
          </button>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
