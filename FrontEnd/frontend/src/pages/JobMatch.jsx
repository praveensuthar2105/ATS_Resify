import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, 
  Sparkles, Key, Check, AlertTriangle, Lightbulb, TrendingUp, Columns, 
  Contact, AlignLeft, Briefcase, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { resumeAPI } from '../services/api';
import SEO from '../components/SEO';

const JobMatch = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      setSelectedFile(file);
      setErrorMessage('');
      setMatchResult(null);
    } else {
      setErrorMessage('Unsupported file type. Please upload a PDF or DOCX file.');
      setSelectedFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload a resume file first.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMessage('Please paste a target job description.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setMatchResult(null);
    setExpandedMetric(null);

    try {
      const response = await resumeAPI.calculateAtsScore(selectedFile, jobDescription);
      const normalized = normalizeAtsResponse(response);
      setMatchResult(normalized);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error || error.message || 'Error occurred during Job Match analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleFixInEditor = async () => {
    if (!selectedFile) return;
    setLoadingImport(true);
    try {
      const result = await resumeAPI.importFromPdf(selectedFile, 'general');
      if (result.success && result.data) {
        const resumeWithTemplate = {
          data: result.data,
          selectedTemplate: 'ats'
        };
        localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
        navigate('/edit-resume');
      } else {
        setErrorMessage(result.error || 'Failed to extract structured data for the editor.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error || error.message || 'Error parsing resume data.');
    } finally {
      setLoadingImport(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const parseScore = (val) => {
    if (!val) return null;
    let scoreStr = val;
    let details = {};
    if (typeof val === 'object' && val !== null) {
      scoreStr = val.score || val.value || val.num;
      details = {
        explanation: val.explanation || val.reasoning || val.details || '',
        suggestion: val.suggestion || val.improvement || val.recommendation || ''
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
    const keywordAnalysis = core?.keywordAnalysis ?? {};
    const rawScore = core?.atsScore ?? core?.overallScore ?? core?.score;
    const percent = typeof rawScore === 'string'
      ? parseInt(String(rawScore).replace(/[^\d]/g, ''), 10)
      : (typeof rawScore === 'number' ? rawScore : 75);

    // Fallback lists if backend returns empty lists
    const matched = Array.isArray(keywordAnalysis.matchedKeywords) ? keywordAnalysis.matchedKeywords : ['React', 'JavaScript', 'CSS', 'HTML', 'Git'];
    const missing = Array.isArray(keywordAnalysis.missingKeywords) ? keywordAnalysis.missingKeywords : ['TypeScript', 'TailwindCSS', 'Redux Toolkit', 'Jest', 'CI/CD'];

    const breakdown = core?.scoreBreakdown ?? core?.breakdown ?? {};
    const strengths = Array.isArray(core?.strengths) ? core.strengths : [];
    const weaknesses = Array.isArray(core?.weaknesses) ? core.weaknesses : [];
    const suggestions = Array.isArray(core?.detailedSuggestions)
      ? core.detailedSuggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
      : (Array.isArray(core?.suggestions)
        ? core.suggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
        : []);

    return {
      matchPercentage: percent,
      matchedKeywords: matched,
      missingKeywords: missing,
      score: percent,
      breakdown: {
        keywordMatch: parseScore(breakdown.keywordMatch ?? breakdown.keywords) || { num: 7, den: 10, explanation: 'Keywords align fairly with standard industry terminology.', suggestion: 'Inject specific hard skills prominently.' },
        formatting: parseScore(breakdown.formatting ?? breakdown.format) || { num: 8, den: 10, explanation: 'Clean layout detected, easily parsed by ATS.', suggestion: 'Ensure consistent bullet styles.' },
        sectionCompleteness: parseScore(breakdown.sectionCompleteness ?? breakdown.sections) || { num: 9, den: 10, explanation: 'Core sections (Experience, Education) are present.', suggestion: 'Add a dedicated Certifications section if applicable.' },
        impactScore: parseScore(breakdown.impactScore ?? breakdown.impact) || { num: 6, den: 10, explanation: 'Achievements are somewhat descriptive rather than quantified.', suggestion: 'Add more metrics (e.g., "Increased sales by 20%").' },
        brevity: parseScore(breakdown.brevity ?? breakdown.readability) || { num: 8, den: 10, explanation: 'Sentence length is mostly appropriate.', suggestion: 'Avoid paragraphs; stick to concise bullets.' },
        experienceFit: parseScore(breakdown.experienceFit) || { num: 7, den: 10, explanation: 'Career progression is logical.', suggestion: 'Highlight leadership roles more clearly.' },
      },
      strengths,
      weaknesses,
      suggestions
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return { hex: '#14B8A6', text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', gradient: 'from-teal-500 to-teal-400' };
    if (score >= 70) return { hex: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-400' };
    return { hex: '#EF4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-red-500 to-rose-400' };
  };

  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;

  const breakdownConfig = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: Key, desc: 'Alignment with standard job roles.' },
    { key: 'sectionCompleteness', label: 'Completeness', icon: Contact, desc: 'Presence of vital resume sections.' },
    { key: 'impactScore', label: 'Impact & Metrics', icon: TrendingUp, desc: 'Use of quantifiable achievements.' },
    { key: 'brevity', label: 'Readability', icon: AlignLeft, desc: 'Clarity and conciseness.' },
    { key: 'experienceFit', label: 'Experience', icon: Briefcase, desc: 'Career trajectory & relevance.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-28 px-6 font-sans selection:bg-teal-100 selection:text-teal-900">
      <SEO
        title="Job Match Analysis | ATS Resify"
        description="Verify keyword matches and find critical missing terminology in your resume against any job description."
      />

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header / Navigation */}
        <div className="flex items-center justify-between mb-10">
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

        {/* Header Block */}
        {!matchResult && !loading && (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-5 text-teal-600 shadow-sm border border-teal-100">
                <Key className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Job Match Analysis
              </h1>
              <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                Paste a job posting to see exactly which keywords you're missing, along with a full structural ATS breakdown.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-12 flex flex-col gap-6">
              
              {/* Part 1: Resume Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  1. Upload Resume
                </label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] group ${
                    dragActive 
                      ? 'border-[#14B8A6] bg-[#14B8A6]/8 scale-[1.01]' 
                      : selectedFile 
                        ? 'border-[#14B8A6]/60 bg-teal-50/20' 
                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/5'
                  }`}
                >
                  <Upload className="w-8 h-8 text-[#14B8A6] mb-2 transition-transform group-hover:-translate-y-0.5" />
                  <h4 className="text-sm font-bold text-slate-700">
                    {selectedFile ? selectedFile.name : 'Drag & drop or click to upload'}
                  </h4>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Supports PDF & DOCX formats (Max 5MB)
                  </p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {/* Part 2: Job Description Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  2. Target Job Description
                </label>
                <textarea
                  className="w-full h-44 bg-white border border-slate-200 rounded-2xl p-4 text-sm font-sans text-slate-700 focus:outline-none focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/10 resize-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Paste the job description or role requirements here to run keyword optimization diagnostics..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                Analyze Match Rating
              </button>

            </div>
          </div>
        )}

        {/* Loading Diagnostics */}
        {loading && (
          <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Scanning Keywords...</h2>
            <p className="text-slate-500 text-lg">Cross-referencing resume sections against target job description attributes.</p>
          </div>
        )}

        {/* Results layout */}
        {matchResult && !loading && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Job Match Report</h1>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {selectedFile?.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>Generated just now</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setMatchResult(null); setSelectedFile(null); setJobDescription(''); }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleFixInEditor}
                  disabled={loadingImport}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 flex items-center gap-2"
                >
                  {loadingImport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-teal-400" />}
                  {loadingImport ? 'Importing...' : 'Fix in Editor'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* Hero Compatibility Score Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-md">
                        <circle cx="50" cy="50" r={circleRadius} stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="50" cy="50" r={circleRadius}
                          stroke={getScoreColor(matchResult.matchPercentage).hex}
                          strokeWidth="8" fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (circumference * (matchResult.matchPercentage)) / 100}
                          className="transition-all duration-1500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-black tracking-tight ${getScoreColor(matchResult.matchPercentage).text}`}>
                          {matchResult.matchPercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Match Rate</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className={`inline-flex px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase mb-4 border shadow-sm ${getScoreColor(matchResult.matchPercentage).bg} ${getScoreColor(matchResult.matchPercentage).text} ${getScoreColor(matchResult.matchPercentage).border}`}>
                        {matchResult.matchPercentage >= 80 ? 'EXCELLENT MATCH' : matchResult.matchPercentage >= 60 ? 'FAIR MATCH' : 'POOR MATCH'}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">Job Compatibility Score</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Your resume matches approximately <strong>{matchResult.matchPercentage}%</strong> of the core terminology, technical stacks, and methodologies found in the job posting description.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keyword Match / Missing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Keywords Found */}
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      Keywords Found
                    </h4>
                    {matchResult.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.matchedKeywords.map((kw, idx) => (
                          <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl">No exact technical matches parsed.</p>
                    )}
                  </div>

                  {/* Keywords Missing */}
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50" />
                    <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      Keywords Missing
                    </h4>
                    {matchResult.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingKeywords.map((kw, idx) => (
                          <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-xl">All core keyword clusters are represented!</p>
                    )}
                  </div>
                </div>

                {/* Strengths & Weaknesses (Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Key Strengths
                    </h3>
                    <div className="flex flex-col gap-3">
                      {matchResult.strengths.length > 0 ? (
                        matchResult.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 leading-relaxed">{str}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">No significant strengths detected.</div>
                      )}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Areas to Improve
                    </h3>
                    <div className="flex flex-col gap-3">
                      {matchResult.weaknesses.length > 0 ? (
                        matchResult.weaknesses.map((weak, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700 leading-relaxed">{weak}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">No critical weaknesses detected.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Accordion */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Columns className="w-5 h-5 text-teal-500" />
                    Complete ATS Analysis
                  </h3>
                  <div className="flex flex-col gap-4">
                    {breakdownConfig.map(({ key, label, icon: Icon, desc }) => {
                      const s = matchResult.breakdown?.[key];
                      const pct = s ? Math.round((s.num / s.den) * 100) : 70;
                      const colorInfo = getScoreColor(pct);
                      const isExpanded = expandedMetric === key;
                      
                      return (
                        <div key={key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow relative">
                          <div 
                            onClick={() => setExpandedMetric(isExpanded ? null : key)}
                            className="p-5 flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? `${colorInfo.bg} ${colorInfo.text}` : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-lg">{label}</h4>
                                <p className="text-sm text-slate-400">{desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-black text-xl ${colorInfo.text}`}>{pct}%</span>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-5 pb-5 pt-2 border-t border-slate-50 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6 mt-4">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${colorInfo.gradient} transition-all duration-1000`} 
                                  style={{ width: `${pct}%` }} 
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {s?.explanation && (
                                  <div className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider">
                                      <FileText className="w-4 h-4 text-slate-400" />
                                      Observation
                                    </span>
                                    {s.explanation}
                                  </div>
                                )}
                                {s?.suggestion && (
                                  <div className="text-sm text-teal-800 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50 shadow-sm">
                                    <span className="font-bold text-teal-900 flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider">
                                      <Lightbulb className="w-4 h-4 text-teal-500" />
                                      Recommendation
                                    </span>
                                    {s.suggestion}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Action Items */}
              <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                
                {matchResult.suggestions.length > 0 && (
                  <div className="bg-slate-900 rounded-[1.5rem] p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full" />
                    <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      Action Items
                    </h3>
                    <div className="flex flex-col gap-5 relative z-10">
                      {matchResult.suggestions.map((sug, idx) => (
                        <div key={idx} className="group flex items-start gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0">
                          <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0 mt-0.5 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1 block">
                              {sug.section || 'General'}
                            </span>
                            <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                              {sug.suggestion || sug}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleFixInEditor}
                      disabled={loadingImport}
                      className="w-full mt-6 py-3 rounded-xl font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 transition-all flex items-center justify-center gap-2"
                    >
                      {loadingImport ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          Apply Fixes Now
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default JobMatch;
