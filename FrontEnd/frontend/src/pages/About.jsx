import React from 'react';
import './About.css';

const About = () => {
  const keyFeatures = [
    {
      icon: '🧠',
      title: 'AI-Powered',
      description: 'Utilizing AI technology to generate professional resumes quickly and efficiently.',
      colorClass: 'blue'
    },
    {
      icon: '📝',
      title: 'Simple & Easy',
      description: 'Clean, intuitive interface designed for ease of use even for beginners.',
      colorClass: 'purple'
    },
    {
      icon: '✓',
      title: 'ATS Friendly',
      description: 'Generates resumes optimized for Applicant Tracking Systems to get you noticed.',
      colorClass: 'green'
    },
    {
      icon: '</>',
      title: 'Open Source',
      description: 'Built as a learning project to explore modern AI integration in web applications.',
      colorClass: 'pink'
    }
  ];

  const timeline = [
    {
      date: 'EARLY 2025',
      title: 'Project Started',
      description: 'Began development of ATS Resify as a comprehensive learning project to master full-stack integration.',
      colorClass: 'purple'
    },
    {
      date: 'SPRING 2025',
      title: 'Backend Development',
      description: 'Built Spring Boot backend with Gemini AI integration, LaTeX compilation, and secure MySQL data storage.',
      colorClass: 'pink'
    },
    {
      date: 'SUMMER 2025',
      title: 'Frontend Development',
      description: 'Created React frontend with optimized components and a seamless user experience for data input.',
      colorClass: 'cyan'
    },
    {
      date: 'CONTINUOUS',
      title: 'In Development',
      description: 'Continuously improving features, adding new templates, and refining the AI generation logic.',
      colorClass: 'green'
    }
  ];

  const steps = [
    {
      num: '01',
      icon: '📋',
      title: 'Input Your Details',
      description: 'Provide your work experience, skills, and education through our simple, guided form.',
      colorClass: 'blue'
    },
    {
      num: '02',
      icon: '✨',
      title: 'AI Processing',
      description: 'Gemini AI analyzes your information and generates a professional, high-impact resume.',
      colorClass: 'purple'
    },
    {
      num: '03',
      icon: '⬇️',
      title: 'Download & Apply',
      description: 'Review and download your professional resume as a polished PDF file ready for submission.',
      colorClass: 'green'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1 className="about-title">About ATS Resify</h1>

        <p className="about-description">
          <strong>Developed ATS Resify</strong> using Spring Boot 3.3.5 and React 18, integrating Google
          Gemini 2.0 Flash API via Spring RestClient to transform user descriptions into professional LaTeX
          code, automatically compiling to PDF with MiKTeX across 4 ATS-optimized templates.
        </p>

        <p className="about-description">
          <strong>Engineered robust backend services</strong> including custom prompt template engine for AI content
          generation, JSON response parsing, PDF text extraction using Apache PDFBox for ATS score
          analysis, and automated LaTeX compilation pipeline with error handling.
        </p>

        <p className="about-description">
          <strong>Implemented secure authentication</strong> with Spring Security and Google OAuth2 login, JWT token-
          based sessions, user role management, and MySQL 8.0 persistence using Spring Data JPA and
          Hibernate ORM with HikariCP connection pooling.
        </p>
      </section>

      {/* Info Cards */}
      <section className="info-cards">
        <div className="info-card purple">
          <div className="info-card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false" role="presentation">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="info-card-content">
            <h3>Project Goal</h3>
            <p>
              To create a functional ATS Resify platform that demonstrates
              the practical application of modern web technologies including React,
              Spring Boot, and AI APIs. This project serves as a hands-on learning
              experience in full-stack development.
            </p>
          </div>
        </div>

        <div className="info-card pink">
          <div className="info-card-icon pink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false" role="presentation">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="info-card-content">
            <h3>Technology Stack</h3>
            <p>
              Frontend built with React and Tailwind UI. Backend powered by
              Spring Boot with integration to Google's Gemini AI for intelligent
              resume generation and ATS scoring capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className={`feature-icon ${feature.colorClass}`}>
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Development Timeline */}
      <section className="timeline-section">
        <h2 className="section-title">Development Timeline</h2>
        <div className="timeline-container">
          <div className="timeline-line"></div>
          {timeline.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className={`timeline-dot ${item.colorClass}`}>●</div>
              <div className={`timeline-card ${item.colorClass}`}>
                <div className={`timeline-date ${item.colorClass}`}>{item.date}</div>
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-it-works-container">
          <h2 className="section-title">How It Works</h2>
          <p className="how-it-works-subtitle">Create your perfect resume in three simple steps</p>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-icon-wrapper">
                  <div className={`step-icon ${step.colorClass}`}>
                    {step.icon}
                  </div>
                  <span className="step-number">{step.num}</span>
                </div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
