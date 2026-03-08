import React from 'react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const Features = () => {
  return (
    <div className="bg-[#FFFFFF] text-[#000000] flex flex-col min-h-screen" style={{ fontFamily: "'Space Mono', monospace" }}>
      <SEO
        title="ATS Resify - Features"
        description="Explore the tools behind ATS Resify including AI-powered generation, real-time LaTeX editing, ATS score checking, and interactive resume chat."
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

      <main className="flex-grow">
        <section className="py-20 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-block border-2 border-[#39FF14] text-[#000000] bg-[#39FF14] px-4 py-1 text-sm font-bold uppercase mb-8 tracking-widest">
            Platform Features
          </div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase mb-6 leading-tight text-[#000000]">
            Built for <br /> Job-Winning Resumes
          </h1>
          <p className="text-[#333333] text-lg md:text-xl max-w-3xl mx-auto mb-10">
            AI-powered content generation, professional LaTeX typesetting, ATS optimization, and real-time collaboration — everything in one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <span className="border-2 border-[#000000] text-[#000000] font-bold px-4 py-2 text-sm uppercase">Advanced AI Engine</span>
            <span className="border-2 border-[#000000] text-[#000000] font-bold px-4 py-2 text-sm uppercase">Live LaTeX → PDF</span>
            <span className="border-2 border-[#000000] text-[#000000] font-bold px-4 py-2 text-sm uppercase">WebSocket Sync</span>
            <span className="border-2 border-[#000000] text-[#000000] font-bold px-4 py-2 text-sm uppercase">ATS Keyword Analysis</span>
            <span className="border-2 border-[#000000] text-[#000000] font-bold px-4 py-2 text-sm uppercase">Job Description Matching</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">auto_awesome</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">AI-Powered Generation</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                Advanced AI generates professional summaries, experience bullets, project descriptions, and skill recommendations tailored to your target role.
              </p>
            </div>
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">code</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">Live LaTeX Editor</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                Full-featured Monaco-based LaTeX editor with syntax highlighting, auto-completion, and instant server-side PDF compilation using pdflatex.
              </p>
            </div>
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">verified</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">ATS Score Checker</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                Upload your resume to get an AI-powered ATS score with keyword analysis, formatting checks, strengths, weaknesses, and actionable recommendations.
              </p>
            </div>
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">smart_toy</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">AI Resume Agent</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                Interactive chat agent that improves bullet points, analyzes job matches, identifies keyword gaps, and tailors content to specific job descriptions.
              </p>
            </div>
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">sync</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">Real-time Sync</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                WebSocket-powered live synchronization between form editor, JSON editor, and LaTeX code. Edit in any mode — all views stay perfectly in sync.
              </p>
            </div>
            <div className="border-2 border-[#39FF14] bg-[#F8F8F8] p-8 group hover:bg-white transition-colors">
              <div className="w-16 h-16 bg-white border-2 border-[#39FF14] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#39FF14] text-3xl">lock</span>
              </div>
              <h3 className="text-xl font-bold uppercase mb-4 text-[#000000]">Secure Authentication</h3>
              <p className="text-[#333333] text-sm leading-relaxed">
                OAuth 2.0 login with JWT-based authentication and secure one-time authorization code exchange. Your data stays protected.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 border-t-2 border-[#39FF14] bg-[#F8F8F8]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold uppercase mb-16 border-b-4 border-[#39FF14] inline-block pb-2 text-[#000000]">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
              <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-1 bg-[#39FF14] opacity-20 z-0"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-8xl font-bold number-outline mb-6 bg-[#F8F8F8] px-4">1</div>
                <h3 className="text-xl font-bold uppercase text-[#000000] mb-4">Enter Your Details</h3>
                <p className="text-[#333333] text-sm leading-relaxed max-w-xs">
                  Fill in your experience, education, skills, and projects using our guided form editor — or let the AI generate content from scratch.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-8xl font-bold number-outline mb-6 bg-[#F8F8F8] px-4">2</div>
                <h3 className="text-xl font-bold uppercase text-[#000000] mb-4">AI Generates &amp; Optimizes</h3>
                <p className="text-[#333333] text-sm leading-relaxed max-w-xs">
                  Our AI creates impactful bullet points, professional summaries, and optimizes your content for ATS keyword matching.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-8xl font-bold number-outline mb-6 bg-[#F8F8F8] px-4">3</div>
                <h3 className="text-xl font-bold uppercase text-[#000000] mb-4">Edit &amp; Export PDF</h3>
                <p className="text-[#333333] text-sm leading-relaxed max-w-xs">
                  Fine-tune in the LaTeX editor, check your ATS score, and download a beautifully typeset PDF — ready to submit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
