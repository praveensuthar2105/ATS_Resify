import React, { useState } from 'react';
import { resumeAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import './GenerateResume.css';

const GenerateResume = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Custom brutalist snackbar instead of MUI
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });

  // Import states
  const [inputMode, setInputMode] = useState('text');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [usageCount, setUsageCount] = useState(() => parseInt(localStorage.getItem('freeUsageCount') || '0', 10));
  const [selectedTemplate, setSelectedTemplate] = useState('ats');

  const availableTemplates = {
    'ats': 'ATS-Engine v2.0 - Stripped of graphical noise to ensure 100% OCR compatibility with enterprise systems.',
    'minimal': 'Minimal Typographic - Elegant serif-driven design for senior roles and high-impact clarity.'
  };

  const writingTips = [
    { num: 1, text: 'Quantify your impact with numbers and percentages.' },
    { num: 2, text: 'Use strong action verbs like "Spearheaded" or "Optimized".' },
    { num: 3, text: 'Keep descriptions concise and focused on key achievements.' }
  ];

  const quickExamples = [
    {
      title: 'SOFTWARE ENGINEER',
      text: '"Experienced in React, Node.js. Led team of 5 to launch v2.0..."'
    },
    {
      title: 'PRODUCT MANAGER',
      text: '"Launched B2B SaaS platform resulting in 40% MRR growth..."'
    }
  ];

  const showToast = (text, type = 'success') => {
    setSnack({ open: true, text, type });
    setTimeout(() => {
      setSnack(s => ({ ...s, open: false }));
    }, 4000);
  };

  const handleGenerateResume = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const usageCount = parseInt(localStorage.getItem('freeUsageCount') || '0', 10);
      if (usageCount >= 2) {
        showToast('FREE LIMIT REACHED. PLEASE SIGN IN TO CONTINUE.', 'info');
        setTimeout(() => navigate('/login', { state: { from: location } }), 1500);
        return;
      }
    }

    // PDF Mode Logic
    if (inputMode === 'pdf' || inputMode === 'linkedin') {
      if (!selectedFile) {
        showToast('PLEASE SELECT A PDF FILE FIRST.', 'error');
        return;
      }
      setLoading(true);
      setParsingPdf(true);
      try {
        const source = inputMode === 'linkedin' ? 'linkedin' : 'general';
        const result = await resumeAPI.importFromPdf(selectedFile, source);

        if (result.success && result.data) {
          const resumeWithTemplate = {
            data: result.data,
            selectedTemplate: selectedTemplate
          };
          localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
          if (!isAuthenticated) {
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            localStorage.setItem('freeUsageCount', newCount.toString());
          }
          showToast('RESUME EXTRACTED SUCCESSFULLY!', 'success');

          setTimeout(() => navigate('/edit-resume'), 1000);
        } else {
          showToast(result.error || 'FAILED TO PARSE RESUME PDF.', 'error');
        }
      } catch (error) {
        showToast(error.response?.data?.error || error.message || 'ERROR OCCURRED DURING EXTRACTION.', 'error');
      } finally {
        setLoading(false);
        setParsingPdf(false);
      }
      return;
    }

    if (!description || description.length < 50) {
      showToast('PROVIDE AT LEAST 50 CHARS FOR BETTER RESULTS.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.generateResume(description, selectedTemplate);
      const resumeWithTemplate = {
        ...response,
        selectedTemplate: selectedTemplate
      };
      localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
      if (!isAuthenticated) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('freeUsageCount', newCount.toString());
      }
      showToast('RESUME GENERATED SUCCESSFULLY!', 'success');

      setTimeout(() => navigate('/edit-resume'), 1000);
    } catch (error) {
      console.error('Error generating resume:', error);
      showToast(error.response?.data?.message || 'FAILED TO GENERATE RESUME.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const PROGRESS_THRESHOLDS = { minimal: 100, basic: 300, good: 600 };

  const getProgressPercentage = () => {
    let pct = 0;
    if (charCount < PROGRESS_THRESHOLDS.minimal) pct = 20;
    else if (charCount < PROGRESS_THRESHOLDS.basic) pct = 40;
    else if (charCount < PROGRESS_THRESHOLDS.good) pct = 60;
    else if (charCount < 1000) pct = 80;
    else pct = 100;
    return pct;
  };

  const getProgressLabel = () => {
    if (charCount < PROGRESS_THRESHOLDS.basic) return 'NEEDS MORE';
    if (charCount < PROGRESS_THRESHOLDS.good) return 'GETTING THERE';
    return 'READY';
  };

  const getReadTime = () => {
    const words = description.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} MIN READ`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') setSelectedFile(file);
      else showToast('ONLY PDF FILES SUPPORTED.', 'error');
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      if (e.target.files[0].type === 'application/pdf') {
        setSelectedFile(e.target.files[0]);
      } else {
        showToast('ONLY STD PDF FILES SUPPORTED.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brutal-black text-brutal-white font-mono uppercase grid-bg relative selection:bg-neon-green selection:text-black">
      <SEO
        title="AI Resume Generator"
        description="Share your professional journey or upload your LinkedIn profile, and our AI will craft an ATS-optimized resume tailored to your target role in seconds."
      />
      <div className="scanline"></div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="text-center pt-24 pb-12 px-6 border-b-2 border-brutal-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green text-black mb-8 w-fit text-xs font-black">
            [ SYSTEM STATUS: READY ] AI-POWERED ENGINE
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-none mb-6 tracking-tight">
            INITIALIZE <span className="text-neon-green underline">YOUR RESUME.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-700 max-w-2xl mx-auto lowercase leading-relaxed">
            &gt; IMPORT DATA VIA LINKEDIN PDF OR RAW TEXT.
            OUR ENGINE WILL COMPILE AN ATS-OPTIMIZED DOCUMENT MEASURED FOR SUCCESS.
          </p>
        </div>
      </section>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <main className="py-16 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* LEFT SIDEBAR - TIPS & EXAMPLES */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Writing Tips */}
            <div className="brutal-border bg-brutal-black p-6 relative">
              <div className="absolute -top-3 -left-3 bg-neon-green border-2 border-brutal-white px-2 text-xs font-black text-black">
                /TIPS
              </div>
              <ul className="flex flex-col gap-6 mt-4">
                {writingTips.map((tip) => (
                  <li key={tip.num} className="flex gap-4 items-start group">
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center brutal-border bg-transparent group-hover:bg-neon-green group-hover:text-black transition-colors text-sm font-black">
                      {tip.num}
                    </span>
                    <span className="text-xs lowercase text-slate-700 leading-relaxed mt-1">{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Examples */}
            <div className="brutal-border bg-brutal-black p-6 relative">
              <div className="absolute -top-3 -left-3 bg-neon-green border-2 border-brutal-white px-2 text-xs font-black text-black">
                /EXAMPLES
              </div>
              <div className="flex flex-col mt-4">
                {quickExamples.map((example, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    className="p-4 border-b-2 border-dashed border-brutal-white last:border-0 hover:bg-neon-green hover:text-black transition-colors cursor-pointer group"
                    onClick={() => {
                      setDescription(example.text.replace(/"/g, ''));
                      setCharCount(example.text.replace(/"/g, '').length);
                      setInputMode('text');
                    }}
                  >
                    <div className="text-xs font-black mb-2 flex items-center justify-between">
                      {example.title}
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">arrow_forward</span>
                    </div>
                    <div className="text-[11px] lowercase opacity-80 leading-relaxed">{example.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE - FORM */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Template Selection */}
            <div className="brutal-border bg-brutal-black p-6 relative">
              <div className="absolute -top-3 -left-3 bg-neon-green border-2 border-brutal-white px-2 text-[10px] font-black text-black tracking-tighter">
                /SELECT_ENGINE
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {Object.entries(availableTemplates).map(([key, description]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 border-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[100px] relative overflow-hidden ${selectedTemplate === key
                      ? 'bg-neon-green border-brutal-white text-black brutal-shadow-white translate-x-1 translate-y-1 shadow-none'
                      : 'border-slate-800 bg-transparent text-slate-400 hover:border-slate-600 hover:bg-white/5'
                      }`}
                  >
                    {selectedTemplate === key && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-brutal-white flex items-center justify-center rotate-12 translate-x-4 -translate-y-4">
                        <span className="material-symbols-outlined text-black text-xs font-black">check</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTemplate === key ? 'text-black' : 'text-neon-green'}`}>
                          {key === 'ats' ? 'ATS_OPTIMIZED' : 'MINIMAL_SERIF'}
                        </span>
                        {selectedTemplate === key && (
                          <span className="px-1.5 py-0.5 border border-black text-[8px] font-black animate-pulse">ACTIVE</span>
                        )}
                      </div>
                      <p className={`text-[10px] lowercase leading-relaxed ${selectedTemplate === key ? 'text-black/80 font-medium' : 'text-slate-500'}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="brutal-border bg-brutal-black p-6 relative">
              <div className="absolute -top-3 -left-3 bg-neon-green border-2 border-brutal-white px-2 text-xs font-black text-black">
                /INPUT_DATA
              </div>

              {/* Progress Indicator (only for text mode) */}
              {inputMode === 'text' && (
                <div className="flex items-center gap-4 mb-6 mt-2 justify-end">
                  <span className="text-[10px] font-bold">VOL:</span>
                  <div className="flex-1 max-w-[150px] h-3 border-2 border-brutal-white bg-transparent p-[1px]">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressPercentage() >= 80 ? 'bg-neon-green' : 'bg-brutal-white'}`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 border-2 border-brutal-white ${getProgressPercentage() >= 80 ? 'bg-neon-green text-black' : ''}`}>
                    {getProgressLabel()}
                  </span>
                </div>
              )}

              {/* Input Mode Tabs */}
              <div className="flex flex-wrap gap-4 mb-8 mt-4">
                {[
                  { id: 'text', icon: 'keyboard', label: 'RAW TEXT' },
                  { id: 'pdf', icon: 'upload_file', label: 'STD PDF' },
                  { id: 'linkedin', icon: 'link', label: 'LINKEDIN PDF' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setInputMode(tab.id)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 border-2 border-brutal-white font-bold text-xs transition-colors cursor-pointer ${inputMode === tab.id ? 'bg-neon-green text-black' : 'bg-transparent text-brutal-white hover:bg-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Text Area */}
              {inputMode === 'text' && (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full bg-transparent border-2 border-brutal-white p-4 font-mono text-sm brutal-scrollbar text-brutal-white focus:outline-none focus:border-neon-green transition-colors resize-y min-h-[250px]"
                    placeholder="> ENTER YOUR EXPERIENCES, SKILLS, AND ACHIEVEMENTS HERE..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setCharCount(e.target.value.length);
                    }}
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-1">
                    <span>CHARS: {charCount.toLocaleString()}</span>
                    <span>{getReadTime()}</span>
                  </div>
                </div>
              )}

              {/* File Dropzone */}
              {inputMode !== 'text' && (
                <div className="flex flex-col gap-4">
                  {inputMode === 'linkedin' && (
                    <div className="text-xs text-neon-green font-bold bg-neon-green/10 border border-neon-green p-3">
                      [INFO]: DOWNLOAD PROFILE AS PDF FROM LINKEDIN "MORE..." MENU.
                    </div>
                  )}
                  <div
                    className={`border-2 border-dashed p-12 text-center transition-colors cursor-pointer group ${dragActive ? 'border-neon-green bg-neon-green/5' : 'border-slate-600 hover:border-brutal-white hover:bg-white/5'
                      } ${selectedFile ? 'border-neon-green bg-neon-green/5' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 border-2 flex items-center justify-center text-2xl group-hover:bg-brutal-white group-hover:text-black transition-colors ${selectedFile ? 'bg-neon-green border-brutal-white text-black' : 'border-brutal-white'
                      }`}>
                      <span className="material-symbols-outlined text-3xl">
                        {selectedFile ? 'check' : (inputMode === 'linkedin' ? 'link' : 'upload_file')}
                      </span>
                    </div>
                    <p className="text-sm font-bold mb-2">
                      {selectedFile ? selectedFile.name : `DROP ${inputMode.toUpperCase()} FILE HERE`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedFile ? '[CLICK TO REPLACE]' : '[OR CLICK TO BROWSE]'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Usage Counter for Guest Users */}
              {!isAuthenticated && (
                <div className="flex items-center justify-between px-2 mb-2 mt-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-neon-green animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400">GUEST_RECON_ACTIVE</span>
                  </div>
                  <div className={`text-[10px] font-bold px-3 py-1 border-2 ${usageCount >= 2 ? 'border-red-500 text-red-500' : 'border-neon-green text-neon-green bg-neon-green/5'}`}>
                    FREE USES REMAINING: {Math.max(0, 2 - usageCount)} / 2
                  </div>
                </div>
              )}

              {/* Generate Button Context Area */}
              <div className="mt-8 pt-8 border-t-2 border-dashed border-brutal-white font-mono uppercase text-brutal-white bg-brutal-black">
                <button
                  onClick={handleGenerateResume}
                  disabled={loading || (inputMode === 'text' && charCount < 50) || (inputMode !== 'text' && !selectedFile)}
                  className="w-full bg-neon-green text-black font-black px-8 py-5 text-xl brutal-shadow-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all border-2 border-brutal-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined spin-slow">progress_activity</span>
                      {parsingPdf ? 'EXTRACTING...' : 'COMPILING...'}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">terminal</span>
                      <span className="relative z-10">ENGAGE PROTOCOL</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Brutalist Custom Toast/Snackbar */}
      {snack.open && (
        <div className="fixed bottom-6 right-6 z-[9999] toast-slide-in">
          <div className={`p-4 border-2 brutal-shadow-white flex items-center gap-3 bg-brutal-black ${snack.type === 'error' ? 'border-red-500 text-red-500' : 'border-neon-green text-neon-green'
            }`}>
            <span className="material-symbols-outlined flex-shrink-0">
              {snack.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="text-xs font-black truncate max-w-[280px]">
              {snack.text}
            </span>
            <button
              onClick={() => setSnack(s => ({ ...s, open: false }))}
              className="ml-4 bg-transparent border-none text-current cursor-pointer hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GenerateResume;
