import React from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Sparkles, CheckCircle2, Code2, 
  Target, Layers, Rocket, FileText, Download 
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const keyFeatures = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Utilizing Gemini AI to generate professional resumes quickly and efficiently from raw input.',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      icon: Sparkles,
      title: 'Simple & Easy',
      description: 'Clean, intuitive interface designed for maximum ease of use, even for complete beginners.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: CheckCircle2,
      title: 'ATS Friendly',
      description: 'Generates resumes optimized for modern Applicant Tracking Systems to get you noticed instantly.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Code2,
      title: 'Cloud Platform',
      description: 'Fully hosted SaaS solution — no installs, no setup. Access your resume tools from anywhere, anytime.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    }
  ];

  const timeline = [
    {
      date: 'EARLY 2025',
      title: 'Project Inception',
      description: 'Began development of ATS Resify as a comprehensive platform to master full-stack AI integration.',
      status: 'completed'
    },
    {
      date: 'SPRING 2025',
      title: 'Backend Architecture',
      description: 'Built Spring Boot backend with Gemini AI integration, LaTeX compilation, and secure MySQL data storage.',
      status: 'completed'
    },
    {
      date: 'SUMMER 2025',
      title: 'Frontend Experience',
      description: 'Created modern React frontend with optimized components and a seamless user experience for data input.',
      status: 'completed'
    },
    {
      date: 'PRESENT',
      title: 'Continuous Evolution',
      description: 'Continuously improving features, adding new templates, and refining the AI generation logic.',
      status: 'current'
    }
  ];

  const steps = [
    {
      num: '1',
      icon: FileText,
      title: 'Input Details',
      description: 'Provide your work experience, skills, and education through our simple, guided interface.',
    },
    {
      num: '2',
      icon: Brain,
      title: 'AI Processing',
      description: 'Gemini AI analyzes your information and generates a professional, high-impact resume structure.',
    },
    {
      num: '3',
      icon: Download,
      title: 'Export & Apply',
      description: 'Review and download your professional resume as a polished PDF file ready for submission.',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 pb-20 pt-28 px-6 relative overflow-hidden">
      <SEO
        title="About Us | ATS Resify"
        description="Learn about the development journey of ATS Resify, a modern full-stack application built to simplify ATS-friendly resume generation."
      />

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[150px]" />
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

        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto mb-24">
          <span className="text-[11px] font-bold tracking-widest text-[#0D9488] uppercase bg-[#14B8A6]/10 px-3 py-1.5 rounded-full mb-6 inline-block">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">ATS Resify</span>
          </h1>

          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-10 text-left space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            <p className="flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5"><Target className="w-3.5 h-3.5" /></span>
              <span>
                <strong>Developed ATS Resify</strong> using Spring Boot 3.3.5 and React 18, integrating Google
                Gemini 2.0 Flash API to transform user descriptions into professional LaTeX
                code, automatically compiling to PDF with MiKTeX across multiple ATS-optimized templates.
              </span>
            </p>
            <p className="flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Layers className="w-3.5 h-3.5" /></span>
              <span>
                <strong>Engineered robust backend services</strong> including a custom prompt template engine for AI content
                generation, JSON response parsing, PDF text extraction using Apache PDFBox for ATS score
                analysis, and an automated LaTeX compilation pipeline with graceful error handling.
              </span>
            </p>
            <p className="flex items-start gap-4">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Rocket className="w-3.5 h-3.5" /></span>
              <span>
                <strong>Implemented secure authentication</strong> with Spring Security and Google OAuth2 login, JWT token-based sessions,
                user role management, and MySQL 8.0 persistence using Spring Data JPA and Hibernate ORM.
              </span>
            </p>
          </div>
        </section>

        {/* INFO CARDS (Project Goal / Tech Stack) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <div className="bg-gradient-to-br from-teal-500 to-teal-400 p-10 rounded-[2rem] text-white shadow-xl shadow-teal-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Project Goal</h3>
            </div>
            <p className="text-teal-50 text-sm leading-relaxed relative z-10 font-medium">
              To create a functional platform that demonstrates the practical application of modern web technologies including React,
              Spring Boot, and AI APIs. This project serves as a hands-on learning experience in full-stack development and generative AI.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[2rem] text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-100 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Technology Stack</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Frontend built with React, Vite, and Tailwind CSS. Backend powered by Spring Boot with integration to Google's Gemini AI
              for intelligent resume generation, structured JSON mapping, and advanced ATS scoring capabilities.
            </p>
          </div>
        </section>

        {/* KEY FEATURES */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Key Features
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">The core capabilities powering our intelligent resume builder.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-3 text-slate-800">{feature.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-24 bg-white/60 backdrop-blur-lg border border-slate-200/50 p-10 md:p-16 rounded-[3rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-slate-500">Create your perfect resume in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-100 to-transparent" />
                  )}
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-50 relative z-10 group hover:scale-105 transition-transform">
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {step.num}
                    </span>
                    <Icon className="w-10 h-10 text-teal-600 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-slate-800">{step.title}</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Development Timeline
            </h2>
          </div>
          
          <div className="relative border-l-2 border-slate-100 ml-4 md:ml-8 pl-8 py-4 space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="relative group">
                {/* Timeline Node */}
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-colors ${item.status === 'current' ? 'bg-teal-500 animate-pulse' : 'bg-slate-300 group-hover:bg-teal-400'}`}></div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${item.status === 'current' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.date}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
