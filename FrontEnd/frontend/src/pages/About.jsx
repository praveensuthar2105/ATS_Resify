import React from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const keyFeatures = [
    {
      icon: 'psychology',
      title: 'AI-Powered',
      description: 'Utilizing AI technology to generate professional resumes quickly and efficiently.',
    },
    {
      icon: 'design_services',
      title: 'Simple & Easy',
      description: 'Clean, intuitive interface designed for ease of use even for beginners.',
    },
    {
      icon: 'fact_check',
      title: 'ATS Friendly',
      description: 'Generates resumes optimized for Applicant Tracking Systems to get you noticed.',
    },
    {
      icon: 'code',
      title: 'Open Source',
      description: 'Built as a learning project to explore modern AI integration in web applications.',
    }
  ];

  const timeline = [
    {
      date: 'EARLY 2025',
      title: 'Project Started',
      description: 'Began development of ATS Resify as a comprehensive learning project to master full-stack integration.',
    },
    {
      date: 'SPRING 2025',
      title: 'Backend Development',
      description: 'Built Spring Boot backend with Gemini AI integration, LaTeX compilation, and secure MySQL data storage.',
    },
    {
      date: 'SUMMER 2025',
      title: 'Frontend Development',
      description: 'Created React frontend with optimized components and a seamless user experience for data input.',
    },
    {
      date: 'CONTINUOUS',
      title: 'In Development',
      description: 'Continuously improving features, adding new templates, and refining the AI generation logic.',
    }
  ];

  const steps = [
    {
      num: '1',
      icon: 'list_alt',
      title: 'Input Your Details',
      description: 'Provide your work experience, skills, and education through our simple, guided form.',
    },
    {
      num: '2',
      icon: 'auto_awesome',
      title: 'AI Processing',
      description: 'Gemini AI analyzes your information and generates a professional, high-impact resume.',
    },
    {
      num: '3',
      icon: 'download',
      title: 'Download & Apply',
      description: 'Review and download your professional resume as a polished PDF file ready for submission.',
    }
  ];

  return (
    <div className="bg-[#ffffff] text-[#000000] min-h-screen flex flex-col font-mono selection:bg-[#39ff14] selection:text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
      <SEO
        title="About Us - ATS Resify"
        description="Learn about the development journey of ATS Resify, a modern full-stack application built to simplify ATS-friendly resume generation."
      />
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{`
          .number-outline {
            -webkit-text-stroke: 2px #39FF14;
            color: transparent;
          }
        `}</style>
      </Helmet>

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto mb-20 relative">
          <div className="inline-block border-2 border-black bg-[#39ff14] text-black px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            SYSTEM_ORIGIN
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter uppercase">
            About <span className="text-[#39ff14]" style={{ textShadow: "1px 1px 0px #000" }}>ATS Resify</span>
          </h1>

          <div className="border border-black bg-[#f8f8f8] p-8 text-left shadow-[2px_2px_0px_0px_#000000] space-y-4 font-bold text-sm md:text-base leading-relaxed">
            <p>
              <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>&gt;</span>
              <strong>Developed ATS Resify</strong> using Spring Boot 3.3.5 and React 18, integrating Google
              Gemini 2.0 Flash API via Spring RestClient to transform user descriptions into professional LaTeX
              code, automatically compiling to PDF with MiKTeX across 4 ATS-optimized templates.
            </p>
            <p>
              <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>&gt;</span>
              <strong>Engineered robust backend services</strong> including custom prompt template engine for AI content
              generation, JSON response parsing, PDF text extraction using Apache PDFBox for ATS score
              analysis, and automated LaTeX compilation pipeline with error handling.
            </p>
            <p>
              <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>&gt;</span>
              <strong>Implemented secure authentication</strong> with Spring Security and Google OAuth2 login, JWT token-based sessions,
              user role management, and MySQL 8.0 persistence using Spring Data JPA and Hibernate ORM with HikariCP connection pooling.
            </p>
          </div>
        </section>

        {/* INFO CARDS (Project Goal / Tech Stack) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="border border-black bg-[#39ff14] p-8 text-black shadow-[2px_2px_0px_0px_#000000] group hover:bg-black hover:text-[#39ff14] transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-4xl">flag</span>
              <h3 className="text-2xl font-bold uppercase">Project Goal</h3>
            </div>
            <p className="font-bold text-sm leading-relaxed">
              To create a functional platform that demonstrates the practical application of modern web technologies including React,
              Spring Boot, and AI APIs. This project serves as a hands-on learning experience in full-stack development.
            </p>
          </div>

          <div className="border border-black bg-[#f8f8f8] p-8 text-black shadow-[2px_2px_0px_0px_#000000] group hover:bg-black hover:text-white transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-4xl group-hover:text-[#39ff14]">architecture</span>
              <h3 className="text-2xl font-bold uppercase">Technology Stack</h3>
            </div>
            <p className="font-bold text-sm leading-relaxed text-gray-700 group-hover:text-gray-300">
              Frontend built with React and Tailwind CSS. Backend powered by Spring Boot with integration to Google's Gemini AI
              for intelligent resume generation and ATS scoring capabilities.
            </p>
          </div>
        </section>

        {/* KEY FEATURES */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold uppercase mb-8 border-b-2 border-black inline-block pb-2">
            <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>/</span>Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="border border-black bg-[#f8f8f8] p-6 shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[-2px] transition-transform">
                <div className="w-12 h-12 border border-black flex items-center justify-center mb-4 text-[#39ff14] bg-black">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>

                <h4 className="font-bold uppercase text-lg mb-2">{feature.title}</h4>
                <p className="text-sm font-bold text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold uppercase mb-8 border-b-2 border-black inline-block pb-2">
            <span className="text-[#39ff14] mr-2" style={{ textShadow: "1px 1px 0px #000" }}>/</span>Development Timeline
          </h2>
          <div className="border-l-2 border-black ml-4 md:ml-8 pl-8 py-4 space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline Node */}
                <div className="absolute -left-[45px] top-0 w-6 h-6 bg-[#39ff14] border-2 border-black shadow-[2px_2px_0px_0px_#000000]"></div>

                <div className="border border-black bg-white p-6 shadow-[2px_2px_0px_0px_#000000] inline-block w-full max-w-2xl">
                  <div className="inline-block bg-black text-[#39ff14] px-2 py-1 text-xs font-bold mb-3 uppercase tracking-wider border border-[#39ff14]">
                    {item.date}
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-2">{item.title}</h3>
                  <p className="text-sm font-bold text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-t border-black pt-16 bg-[#f8f8f8] p-8 md:p-12 border shadow-[4px_4px_0px_0px_#39ff14]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase mb-4 inline-block bg-black text-white px-4 py-2">
              How It Works
            </h2>
            <p className="font-bold text-gray-700 uppercase">Create your perfect resume in three simple operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-7xl font-bold number-outline mb-4">
                  0{step.num}
                </div>
                <div className="w-16 h-16 bg-white border border-black flex items-center justify-center mb-4 text-black shadow-[2px_2px_0px_0px_#39ff14]">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h4 className="font-bold uppercase text-lg mb-2">{step.title}</h4>
                <p className="text-sm font-bold text-gray-700 max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
