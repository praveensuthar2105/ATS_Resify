import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { resumeAPI } from '../../services/api';
import SEO from '../../components/SEO';
import gsap from 'gsap';

const CreatePrompt = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Prompt generation states
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate Handler
  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 20) return;

    setLoading(true);
    setError(null);

    try {
      const response = await resumeAPI.generateResume(prompt, 'ats');
      
      // Pull data from response
      const d = response.data || response;
      
      if (d && d.error) {
        throw new Error(d.message || d.error);
      }
      
      const pi = d.personalInformation || d.personalInfo || {};
      
      const rawExp = Array.isArray(d.experience) ? d.experience : [];
      const experienceData = rawExp.map(exp => ({
        company: exp.company || '',
        jobTitle: exp.jobTitle || exp.title || '',
        location: exp.location || '',
        duration: exp.duration || '',
        responsibility: exp.responsibility || exp.description || ''
      }));

      const rawEdu = Array.isArray(d.education) ? d.education : [];
      const educationData = rawEdu.map(edu => ({
        university: edu.university || edu.institution || '',
        degree: edu.degree || '',
        location: edu.location || '',
        graduationYear: edu.graduationYear || edu.year || ''
      }));

      const rawSkills = Array.isArray(d.skills) ? d.skills : [];
      const skillsArray = rawSkills.map(s => {
        if (typeof s === 'string') {
          return { title: 'Skills', level: 'Intermediate', items: [s] };
        }
        return {
          title: s.title || s.category || 'Skills',
          level: s.level || 'Intermediate',
          items: Array.isArray(s.items) ? s.items : []
        };
      });

      const formattedResume = {
        data: {
          personalInformation: {
            fullName: pi.fullName || pi.name || '',
            email: pi.email || '',
            phoneNumber: pi.phoneNumber || pi.phone || '',
            location: pi.location || '',
            linkedIn: pi.linkedIn || pi.linkedin || '',
            gitHub: pi.gitHub || pi.github || ''
          },
          summary: d.summary || '',
          skills: skillsArray,
          experience: experienceData,
          education: educationData
        },
        selectedTemplate: 'ats'
      };

      // Store in local storage and redirect directly to edit-resume
      localStorage.setItem('generatedResume', JSON.stringify(formattedResume));
      navigate('/edit-resume', { state: { triggerFeedback: true } });
    } catch (e) {
      console.error('AI Resume Generation failed:', e);
      setError(e.message || 'AI Resume Generation failed. Please ensure the API is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Back button slide-in
      tl.fromTo('.back-btn',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.45 }
      );

      // 2. Prompt panel card pop-in
      tl.fromTo('.prompt-panel',
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75 },
        '-=0.25'
      );

      // 3. Stagger details inner animation (title, textarea, CTA)
      tl.fromTo('.prompt-animate',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.4'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#f7fdfb] via-[#eefbf7] to-[#d5f5ec] pt-16 pb-12 px-6 relative overflow-hidden flex flex-col items-center">
      <SEO 
        title="Generate Resume with AI Prompt | ATS Resify" 
        description="Describe your professional background and let AI generate an ATS-optimized LaTeX resume draft for you instantly."
      />
      <Helmet>
        <title>Generate with AI Prompt | ATS Resify</title>
      </Helmet>

      {/* Decorative Blob */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-[1240px] w-full relative z-10">
        
        {/* Header link */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium border-none bg-transparent cursor-pointer mb-4 align-self-start back-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="max-w-[640px] mx-auto glass-panel-tier-1 rounded-3xl p-8 text-center prompt-panel">
          <h2 className="text-3xl font-bold text-slate-800 font-sans tracking-tight prompt-animate">Describe your background</h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed prompt-animate">
            Tell us about your experience — AI drafts a first version and opens it directly in the editor.
          </p>

          <div className="mt-6 text-left prompt-animate">
            <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide">Enter your background prompt</label>
            <textarea
              placeholder="Example: I'm a Senior Frontend Engineer with 6 years of experience in React, TypeScript, and TailwindCSS. I worked at Netflix where I built high-performance streaming user interfaces and led a team of 4. Previously, I studied Computer Science at Stanford..."
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-2xl border border-[rgba(20,40,35,0.15)] bg-white/40 backdrop-blur-md focus:outline-none focus:border-[#14B8A6] focus:bg-white/70 focus:ring-3 focus:ring-[#14B8A6]/15 transition-all text-sm text-slate-800 resize-none font-sans leading-relaxed shadow-inner"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-mono">
              <span>{prompt.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>Minimum 20 words recommended</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs text-left flex items-start gap-2.5 font-sans leading-relaxed">
              <span className="material-symbols-outlined text-[16px] text-rose-500 mt-0.5 flex-shrink-0">error</span>
              <div>
                <span className="font-bold block mb-0.5">Generation Failed</span>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="mt-8 p-5 rounded-2xl border border-[#14B8A6]/20 bg-teal-50/10 flex items-center justify-center gap-3 prompt-animate">
              <Loader2 className="w-5 h-5 text-[#0D9488] animate-spin" />
              <span className="text-sm font-bold text-[#0D9488] uppercase tracking-wider font-mono">AI Writer active... Drafting resume...</span>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={prompt.trim().length < 20}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors border-none rounded-xl cursor-pointer disabled:opacity-40 prompt-animate"
            >
              Generate draft <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
