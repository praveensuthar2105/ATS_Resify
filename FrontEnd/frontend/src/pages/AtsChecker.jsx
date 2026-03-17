import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AgentChat from '../components/AgentChat';
import SEO from '../components/SEO';
import './AtsChecker.css';

const AtsChecker = () => {
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [rawResponse, setRawResponse] = useState(null);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [usageCount, setUsageCount] = useState(() => parseInt(localStorage.getItem('freeUsageCount') || '0', 10));

  const showToast = (text, type = 'success') => {
    setSnack({ open: true, text, type });
    setTimeout(() => {
      setSnack(s => ({ ...s, open: false }));
    }, 4000);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setAtsResult(null);

    try {
      const response = await resumeAPI.calculateAtsScore(file, jobDescription);
      setRawResponse(response);
      const normalized = normalizeAtsResponse(response);
      if (!normalized.hasContent) {
        setAtsResult(null);
        showToast(normalized.error || 'NO ATS DATA RETURNED. PLEASE TRY AGAIN.', 'error');
        return;
      }
      setAtsResult(normalized);
      if (!isAuthenticated) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('freeUsageCount', newCount.toString());
      }
      showToast('ATS ANALYSIS COMPLETE!', 'success');
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      showToast(error.response?.data?.message || 'FAILED TO ANALYZE RESUME. PLEASE TRY AGAIN.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const validateAndSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('PLEASE UPLOAD A PDF FILE.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('FILE MUST BE SMALLER THAN 5MB.', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      const usageCount = parseInt(localStorage.getItem('freeUsageCount') || '0', 10);
      if (usageCount >= 2) {
        showToast('FREE LIMIT REACHED. PLEASE SIGN IN TO CONTINUE.', 'info');
        setTimeout(() => navigate('/login', { state: { from: location } }), 1500);
        return;
      }
    }

    if (!selectedFile) {
      showToast('PLEASE SELECT A RESUME FILE FIRST.', 'error');
      return;
    }
    handleUpload(selectedFile);
    setSelectedFile(null);
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    validateAndSelect(file);
    event.target.value = '';
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
    const file = e.dataTransfer?.files?.[0];
    validateAndSelect(file);
  };

  const parseScore = (val) => {
    if (!val) return null;
    let scoreStr = val;
    let details = {};
    if (typeof val === 'object' && val !== null) {
      scoreStr = val.score || val.value;
      details = {
        explanation: val.explanation || '',
        suggestion: val.suggestion || ''
      };
    }
    if (typeof scoreStr === 'number') return { num: scoreStr, den: 10, ...details };
    const match = String(scoreStr).match(/(\d+)\s*\/\s*(\d+)/);
    if (match) return { num: parseInt(match[1], 10), den: parseInt(match[2], 10) || 10, ...details };
    const numOnly = parseInt(String(scoreStr).replace(/[^\d]/g, ''), 10);
    return isNaN(numOnly) ? null : { num: numOnly, den: 10, ...details };
  };

  const normalizeAtsResponse = (res) => {
    const core = res?.data ?? res ?? {};
    const rawScore = core?.atsScore ?? core?.overallScore ?? core?.score;
    const percent = typeof rawScore === 'string'
      ? parseInt(String(rawScore).replace(/[^\d]/g, ''), 10)
      : (typeof rawScore === 'number' ? rawScore : null);

    const breakdown = core?.scoreBreakdown ?? core?.breakdown ?? {};
    const strengths = Array.isArray(core?.strengths) ? core.strengths : [];
    const weaknesses = Array.isArray(core?.weaknesses) ? core.weaknesses : [];
    const suggestions = Array.isArray(core?.detailedSuggestions)
      ? core.detailedSuggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
      : (Array.isArray(core?.suggestions)
        ? core.suggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
        : []);

    const hasContent = Object.keys(core || {}).length > 0;

    const penaltyLog = Array.isArray(core?.penaltyLog)
      ? core.penaltyLog.filter(p => {
        if (!p.deduction) return false;
        // Extract only digits from the deduction string (e.g. "-5%" -> "5")
        const numericalValue = String(p.deduction).replace(/[^\d]/g, '');
        // Only keep penalties that have a number greater than 0
        return numericalValue !== '' && parseInt(numericalValue, 10) > 0;
      })
      : [];
    const keywordAnalysis = core?.keywordAnalysis ?? {};
    const rewriteExamples = Array.isArray(core?.rewriteExamples) ? core.rewriteExamples : [];
    const topMissingKeywords = Array.isArray(core?.topMissingKeywords) ? core.topMissingKeywords : [];

    return {
      score: Number.isFinite(percent) ? percent : null,
      breakdown: {
        keywordMatch: parseScore(breakdown.keywordMatch ?? breakdown.keywords),
        formatting: parseScore(breakdown.formatting ?? breakdown.format),
        sectionCompleteness: parseScore(breakdown.sectionCompleteness ?? breakdown.sections),
        impactScore: parseScore(breakdown.impactScore ?? breakdown.impact),
        brevity: parseScore(breakdown.brevity ?? breakdown.readability),
        experienceFit: parseScore(breakdown.experienceFit),
      },
      strengths,
      weaknesses,
      suggestions,
      penaltyLog,
      keywordAnalysis,
      rewriteExamples,
      topMissingKeywords,
      keywords: keywordAnalysis.matchedKeywords || core?.keywords || [],
      missingKeywords: keywordAnalysis.missingKeywords || core?.missingKeywords || [],
      feedback: core?.feedback,
      error: core?.error || res?.error,
      hasContent,
      resumeText: core?.resumeText || '',
    };
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 40) return 'NEEDS WORK';
    return 'POOR';
  };

  const getScoreTier = (score) => {
    if (score >= 85) return 'TOP 10%';
    if (score >= 70) return 'TOP 25%';
    if (score >= 50) return 'TOP 50%';
    return 'BELOW AVG';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { hex: '#39ff14', text: 'text-neon-green', bg: 'bg-neon-green', border: 'border-neon-green' };
    if (score >= 60) return { hex: '#facc15', text: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-400' };
    if (score >= 40) return { hex: '#fb923c', text: 'text-orange-400', bg: 'bg-orange-400', border: 'border-orange-400' };
    return { hex: '#ef4444', text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' };
  };

  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;

  const sectionMeta = {
    Summary: { icon: 'description', color: 'text-blue-400', border: 'border-blue-400' },
    Experience: { icon: 'rocket_launch', color: 'text-indigo-400', border: 'border-indigo-400' },
    Education: { icon: 'school', color: 'text-neon-green', border: 'border-neon-green' },
    Projects: { icon: 'terminal', color: 'text-cyan-400', border: 'border-cyan-400' },
    Skills: { icon: 'psychology', color: 'text-orange-400', border: 'border-orange-400' },
    Certifications: { icon: 'workspace_premium', color: 'text-neon-green', border: 'border-neon-green' },
    Achievements: { icon: 'emoji_events', color: 'text-purple-400', border: 'border-purple-400' },
    Languages: { icon: 'translate', color: 'text-blue-400', border: 'border-blue-400' },
    Contact: { icon: 'contact_page', color: 'text-teal-400', border: 'border-teal-400' },
    Formatting: { icon: 'view_column', color: 'text-blue-400', border: 'border-blue-400' },
    Keywords: { icon: 'key', color: 'text-yellow-400', border: 'border-yellow-400' },
    General: { icon: 'task_alt', color: 'text-neon-green', border: 'border-neon-green' },
  };

  const breakdownConfig = [
    { key: 'keywordMatch', label: 'KEYWORD MATCH', icon: 'key' },
    { key: 'formatting', label: 'FORMATTING', icon: 'view_column' },
    { key: 'sectionCompleteness', label: 'SECTION COMPLETENESS', icon: 'contact_page' },
    { key: 'impactScore', label: 'IMPACT & METRICS', icon: 'trending_up' },
    { key: 'brevity', label: 'BREVITY & READABILITY', icon: 'short_text' },
    { key: 'experienceFit', label: 'EXPERIENCE FIT', icon: 'work_history' },
  ];

  return (
    <div className="min-h-screen bg-brutal-black text-brutal-white font-mono uppercase grid-bg relative selection:bg-neon-green selection:text-black">
      <SEO
        title="Check ATS Score Online"
        description="Upload your resume and get an instant AI-powered ATS score with keyword analysis, formatting checks, and actionable AI recommendations."
      />
      <div className="scanline"></div>

      <main className="py-12 px-4 relative z-10 flex flex-col min-h-[calc(100vh-64px)] items-center">

        {/* PRE-SCAN UPLOAD VIEW */}
        {!atsResult && !uploading && (
          <div className="max-w-[1000px] w-full bg-brutal-black border-2 border-brutal-white relative p-8 md:p-12 mb-12">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-neon-green border-2 border-brutal-white"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-neon-green border-2 border-brutal-white"></div>

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black mb-4 text-brutal-white">
                <span className="bg-neon-green px-2 text-black">ATS</span> OPTIMIZATION ENGINE
              </h1>
              <p className="text-sm md:text-base text-slate-400 lowercase">
                &gt; INITIALIZE SCAN SEQUENCE. UPLOAD RESUME DATA FOR ALGORITHMIC PARSING AND COMPLIANCE VERIFICATION.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {/* Dropzone */}
              <div
                className={`border-2 border-dashed p-12 flex flex-col items-center justify-center text-center group transition-colors cursor-pointer min-h-[300px] relative ${dragActive ? 'bg-neon-green/10 border-neon-green' : 'border-brutal-white hover:bg-white/5'
                  } ${selectedFile ? 'border-neon-green' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold">INPUT_STREAM_01</div>

                <span className={`material-symbols-outlined text-6xl mb-4 transition-transform group-hover:-translate-y-2 ${selectedFile ? 'text-neon-green' : 'text-brutal-white'}`}>
                  {selectedFile ? 'task' : 'upload_file'}
                </span>

                <h2 className={`text-2xl font-black mb-2 ${selectedFile ? 'text-neon-green' : 'text-brutal-white'}`}>
                  {selectedFile ? selectedFile.name : 'DRAG & DROP YOUR RESUME'}
                </h2>

                <p className="text-xs text-slate-400 lowercase mb-6">
                  {selectedFile ? '[ DATA STREAM LOADED - CLICK TO REPLACE ]' : 'SUPPORTED FORMATS: .PDF (MAX 5MB)'}
                </p>

                <button
                  className="px-6 py-3 border-2 border-brutal-white text-brutal-white bg-brutal-black font-bold hover:bg-neon-green hover:text-black hover:border-brutal-white transition-all brutal-shadow-white group-hover:-translate-y-1"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  BROWSE FILES
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={onPickFile} className="hidden" />
              </div>

              {/* Job Description Textarea */}
              <div className="border-2 border-brutal-white p-6 relative bg-brutal-black">
                <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-bold">PARAM_TARGET_JOB</div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brutal-white">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                  TARGET JOB DESCRIPTION <span className="text-xs text-slate-500">(OPTIONAL)</span>
                </h3>
                <textarea
                  className="w-full h-32 bg-transparent border-2 border-brutal-white text-brutal-white p-4 text-xs font-mono brutal-scrollbar focus:outline-none focus:border-neon-green resize-none"
                  placeholder="> PASTE JOB DESCRIPTION TEXT HERE FOR CONTEXTUAL ANALYSIS. THIS SIGNIFICANTLY IMPROVES KEYWORD MATCHING SCORING."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Usage Counter for Guest Users */}
              {!isAuthenticated && (
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-neon-green animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400">GUEST_SESSION_ACTIVE</span>
                  </div>
                  <div className={`text-[10px] font-bold px-3 py-1 border-2 ${usageCount >= 2 ? 'border-red-500 text-red-500' : 'border-neon-green text-neon-green bg-neon-green/5'}`}>
                    FREE USES REMAINING: {Math.max(0, 2 - usageCount)} / 2
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                className={`w-full font-black px-6 py-5 text-xl border-2 flex items-center justify-center gap-3 transition-all brutal-shadow-white group ${selectedFile
                  ? 'bg-neon-green text-black border-brutal-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
                  : 'bg-transparent text-slate-500 border-slate-600 cursor-not-allowed hidden-shadow'
                  }`}
                onClick={handleSubmit}
                disabled={!selectedFile}
              >
                <span className="material-symbols-outlined spin-slow opacity-0 group-hover:opacity-100 transition-opacity absolute left-[15%] hidden sm:block">settings</span>
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                EXECUTE SCAN
                <span className="material-symbols-outlined spin-slow opacity-0 group-hover:opacity-100 transition-opacity absolute right-[15%] hidden sm:block">settings</span>
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {uploading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] flex-grow">
            <span className="material-symbols-outlined text-7xl text-neon-green spin-slow mb-6">progress_activity</span>
            <h2 className="text-2xl font-black mb-2 animate-pulse">ANALYZING DATA STREAM <span className="blink-cursor">_</span></h2>
            <p className="text-xs text-slate-500 lowercase">Running algorithmic parsing and compliance verification (10-20s)...</p>
          </div>
        )}

        {/* RESULTS VIEW */}
        {atsResult && !uploading && (
          <div className="w-full max-w-[1400px] flex flex-col gap-8 pb-12">

            {/* Header Reset */}
            <div className="flex justify-between items-end border-b-2 border-brutal-white pb-4 mb-4">
              <div>
                <h2 className="text-3xl font-black">SCAN_RESULTS</h2>
                <div className="text-xs text-slate-400">FILE: {selectedFile?.name || 'UNKNOWN_INPUT.PDF'}</div>
              </div>
              <button
                className="px-4 py-2 border-2 border-brutal-white text-xs font-bold hover:bg-neon-green hover:text-black transition-colors"
                onClick={() => { setAtsResult(null); setJobDescription(''); setSelectedFile(null); }}
              >
                RESET SCAN
              </button>
            </div>

            {/* Top Grid: Score & Verdict */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Score breakdown (Left) */}
              <div className="lg:col-span-8 border-2 border-brutal-white bg-brutal-black p-6 md:p-10 relative">
                <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold">SYS_METRICS_DUMP</div>

                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mt-4">

                  {/* Circular Score */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r={circleRadius} stroke="#333" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="50" cy="50" r={circleRadius}
                          stroke={getScoreColor(atsResult.score ?? 0).hex}
                          strokeWidth="8" fill="transparent"
                          strokeLinecap="square"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (circumference * (atsResult.score ?? 0)) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-black tracking-tighter ${getScoreColor(atsResult.score ?? 0).text}`}>
                          {atsResult.score ?? 0}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                      </div>
                    </div>
                    <div className={`px-4 py-1 border-2 font-black text-xs ${getScoreColor(atsResult.score ?? 0).bg} text-black border-brutal-white`}>
                      {getScoreLabel(atsResult.score ?? 0)}
                    </div>
                  </div>

                  {/* Bar Breakdown */}
                  <div className="flex-1 w-full flex flex-col gap-4">
                    <div className="flex justify-between border-b border-dashed border-slate-600 pb-2">
                      <span className="font-bold text-sm">SECTOR ANALYSIS</span>
                      <span className="font-bold text-sm text-neon-green">[{getScoreTier(atsResult.score ?? 0)}]</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {breakdownConfig.map(({ key, label, icon }) => {
                        const s = atsResult.breakdown?.[key];
                        const pct = s ? Math.round((s.num / s.den) * 100) : 0;
                        const isExpanded = expandedMetric === key;
                        const hasDetails = s?.explanation || s?.suggestion;
                        const barColor = getScoreColor(pct).bg;

                        return (
                          <div key={key} className="flex flex-col">
                            <div
                              className={`flex justify-between items-center mb-1 text-xs font-bold ${hasDetails ? 'cursor-pointer hover:text-neon-green transition-colors' : ''}`}
                              onClick={() => hasDetails && setExpandedMetric(isExpanded ? null : key)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                                {label}
                                {hasDetails && <span className="text-[10px] text-slate-500">[{isExpanded ? '-' : '+'}]</span>}
                              </div>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 border border-slate-700 p-[1px]">
                              <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && hasDetails && (
                              <div className="mt-2 p-3 border border-slate-700 bg-white/5 text-[11px] lowercase leading-relaxed flex flex-col gap-2">
                                {s.explanation && (
                                  <div><strong className="text-brutal-white uppercase text-[10px]">ANALYSIS:</strong> {s.explanation}</div>
                                )}
                                {s.suggestion && (
                                  <div><strong className="text-neon-green uppercase text-[10px]">SUGGESTION:</strong> {s.suggestion}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verdict Sidebar (Right) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="border-2 border-brutal-white p-6 bg-brutal-black flex-1 flex flex-col">
                  <div className="flex items-center gap-2 border-b-2 border-brutal-white pb-3 mb-4">
                    <span className="material-symbols-outlined text-neon-green">terminal</span>
                    <h3 className="font-black">ENGINE VERDICT</h3>
                  </div>

                  <p className="text-xs lowercase text-slate-300 leading-relaxed mb-6 flex-1">
                    YOUR RESUME DEMONSTRATES <strong className={`uppercase ${getScoreColor(atsResult.score ?? 0).text}`}>{getScoreLabel(atsResult.score ?? 0).toLowerCase()}</strong> COMPATIBILITY WITH ALGORITHMIC FILTERS.
                    {atsResult.score >= 75
                      ? ' MINOR CALIBRATIONS IN KEYWORD DENSITY COULD ACHIEVE ELITE STATUS.'
                      : atsResult.score >= 50
                        ? ' SIGNIFICANT STRUCTURAL WEAKNESSES DETECTED. RECTIFICATION REQUIRED.'
                        : ' CRITICAL PARSING FAILURE LIKELY. REDEVELOP USING STANDARD TEMPLATES.'}
                  </p>

                  <div className="flex flex-col gap-3 font-mono text-[10px] border-t border-dashed border-slate-600 pt-4 mt-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">PARSER_STATUS:</span>
                      <span className="text-neon-green font-bold">OPERATIONAL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MATCH_RATE:</span>
                      <span className="text-brutal-white font-bold">{atsResult.keywordAnalysis?.matchRate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CATEGORIES_SCANNED:</span>
                      <span>6</span>
                    </div>
                  </div>
                </div>

                {/* Penalty Log Section */}
                {atsResult.penaltyLog.length > 0 && (
                  <div className="border-2 border-red-500/50 p-6 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-red-500">heart_broken</span>
                      <h3 className="font-black text-xs text-red-500">PENALTY_LOG_FILE</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      {atsResult.penaltyLog.map((p, i) => (
                        <div key={i} className="flex justify-between text-[10px] lowercase border-b border-red-500/10 pb-1">
                          <span className="text-slate-400">{p.reason}</span>
                          <span className="text-red-500 font-bold">{p.deduction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="w-full bg-neon-green text-black font-black py-4 border-2 border-brutal-white brutal-shadow-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
                  onClick={() => navigate('/generate')}
                >
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  AUTO-REPAIR RESUME
                </button>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="border-2 border-brutal-white p-6 bg-brutal-black">
                <h3 className="flex items-center gap-2 font-black text-neon-green mb-6 border-b border-dashed border-slate-600 pb-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  STRENGTHS [{atsResult.strengths.length}]
                </h3>
                {atsResult.strengths.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {atsResult.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3 text-xs lowercase text-slate-300 items-start">
                        <span className="text-neon-green font-black mt-[2px]">+</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 lowercase">no notable strengths identified in current scan.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="border-2 border-brutal-white p-6 bg-brutal-black">
                <h3 className="flex items-center gap-2 font-black text-red-500 mb-6 border-b border-dashed border-slate-600 pb-3">
                  <span className="material-symbols-outlined">warning</span>
                  WEAKNESSES [{atsResult.weaknesses.length}]
                </h3>
                {atsResult.weaknesses.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {atsResult.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-3 text-xs lowercase text-slate-300 items-start">
                        <span className="text-red-500 font-black mt-[2px]">-</span>
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 lowercase">no architectural weaknesses found. optimal structure.</p>
                )}
              </div>
            </div>

            {/* Keyword Analysis Section */}
            {(atsResult.missingKeywords.length > 0 || atsResult.keywords.length > 0) && (
              <div className="border-2 border-brutal-white p-6 md:p-10 bg-brutal-black">
                <div className="flex justify-between items-center mb-8 border-b-2 border-brutal-white pb-4">
                  <div>
                    <h3 className="text-2xl font-black">KEYWORD_DATABANK</h3>
                    <p className="text-xs text-slate-400 lowercase">frequency mapping and alignment with target parameters.</p>
                  </div>
                  {atsResult.keywordAnalysis?.matchRate && (
                    <div className="px-4 py-2 bg-neon-green text-black font-black text-sm">
                      MATCH: {atsResult.keywordAnalysis.matchRate}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-black mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-neon-green"></span> MATCHED_TAGS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-bold uppercase">
                          {kw}
                        </span>
                      ))}
                      {atsResult.keywords.length === 0 && <span className="text-xs text-slate-500">ERROR: NO MATCHES_DETECTED</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500"></span> MISSING_PROTOTYPES
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase">
                          {kw}
                        </span>
                      ))}
                      {atsResult.missingKeywords.length === 0 && <span className="text-xs text-neon-green">ALL_TARGETS_ACQUIRED</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rewrite Examples Section */}
            {atsResult.rewriteExamples.length > 0 && (
              <div className="border-2 border-neon-green p-6 md:p-10 bg-neon-green/5">
                <div className="mb-8 border-b-2 border-neon-green pb-4">
                  <h3 className="text-2xl font-black text-neon-green">BULLET_RECONSTRUCT_V1</h3>
                  <p className="text-xs text-neon-green/60 lowercase">transforming weak descriptions into quantified high-impact data points.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {atsResult.rewriteExamples.map((ex, i) => (
                    <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-1 overflow-hidden border border-neon-green/20">
                      <div className="bg-red-500/5 p-4 border-r border-neon-green/20 relative">
                        <div className="absolute top-0 right-0 text-[8px] bg-red-500 text-white px-2 py-[2px] font-bold">ORIGINAL</div>
                        <p className="text-xs italic text-slate-400 line-through">"{ex.original}"</p>
                      </div>
                      <div className="bg-neon-green/10 p-4 relative">
                        <div className="absolute top-0 right-0 text-[8px] bg-neon-green text-black px-2 py-[2px] font-bold">IMPROVED</div>
                        <p className="text-xs text-neon-green font-bold">"{ex.improved}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions (Grid) */}
            {atsResult.suggestions.length > 0 && (
              <div className="border-2 border-brutal-white bg-brutal-black p-6 md:p-10">
                <div className="flex justify-between items-end border-b-2 border-brutal-white pb-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black">CRITICAL OPTIMIZATIONS</h2>
                    <p className="text-xs text-slate-400 lowercase">algorithmic insight patches recommended for deployment.</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1 text-[10px] font-bold">
                    FOUND: {atsResult.suggestions.length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {atsResult.suggestions.map((s, idx) => {
                    const section = s.section || 'General';
                    const meta = sectionMeta[section] || { icon: 'code', color: 'text-brutal-white', border: 'border-brutal-white' };
                    return (
                      <div key={idx} className={`p-5 border text-brutal-white bg-white/5 hover:bg-white/10 transition-colors ${meta.border}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`material-symbols-outlined text-lg ${meta.color}`}>{meta.icon}</span>
                          <h4 className={`text-xs font-black ${meta.color}`}>{section}</h4>
                        </div>
                        <p className="text-[11px] lowercase text-slate-300 leading-relaxed">{s.suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Embedded Agent Chat */}
            <div className="border-2 border-brutal-white">
              <AgentChat
                resumeContext={`File: ${selectedFile?.name || 'Unknown'}\nJob Description: ${jobDescription || 'None'}\n\nResume Text:\n${atsResult.resumeText}\n\nOverall ATS Score: ${atsResult.score}%`}
                userId={isAuthenticated ? 'user' : 'anonymous'}
              />
            </div>

          </div>
        )}
      </main>

      {/* Brutalist Custom Toast/Snackbar */}
      {snack.open && (
        <div className="fixed bottom-6 right-6 z-[9999] toast-slide-in">
          <div className={`p-4 border-2 brutal-shadow-white flex items-center gap-3 bg-brutal-black ${snack.type === 'error' ? 'border-red-500 text-red-500' :
            snack.type === 'info' ? 'border-blue-400 text-blue-400' :
              'border-neon-green text-neon-green'
            }`}>
            <span className="material-symbols-outlined flex-shrink-0">
              {snack.type === 'error' ? 'error' : snack.type === 'info' ? 'info' : 'check_circle'}
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

export default AtsChecker;
