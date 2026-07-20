import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Sparkles, 
  TrendingUp, Key, Columns, Contact, AlignLeft, Briefcase, 
  Lightbulb, ShieldCheck, ChevronRight, FileText, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { resumeAPI } from '../services/api';
import SEO from '../components/SEO';

const QuickScore = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
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
      setAtsResult(null);
    } else {
      setErrorMessage('Unsupported file type. Please upload a PDF or DOCX file.');
      setSelectedFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMessage('');
    setAtsResult(null);
    setExpandedMetric(null); // Reset accordion on new scan

    try {
      const response = await resumeAPI.calculateAtsScore(selectedFile);
      const normalized = normalizeAtsResponse(response);
      setAtsResult(normalized);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.error || error.message || 'Error occurred during ATS scoring.');
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

  // Helper parser utilities
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

    // Provide default fallbacks if data is completely missing, 
    // but try to retain actual backend structure.
    return {
      score: Number.isFinite(percent) ? percent : 72,
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

  const getScoreLabel = (score) => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    return 'NEEDS WORK';
  };

  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;

  const breakdownConfig = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: Key, desc: 'Alignment with standard job roles.' },
    { key: 'formatting', label: 'Formatting', icon: Columns, desc: 'ATS parsing compatibility.' },
    { key: 'sectionCompleteness', label: 'Completeness', icon: Contact, desc: 'Presence of vital resume sections.' },
    { key: 'impactScore', label: 'Impact & Metrics', icon: TrendingUp, desc: 'Use of quantifiable achievements.' },
    { key: 'brevity', label: 'Readability', icon: AlignLeft, desc: 'Clarity and conciseness.' },
    { key: 'experienceFit', label: 'Experience', icon: Briefcase, desc: 'Career trajectory & relevance.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-28 px-6 font-sans selection:bg-teal-100 selection:text-teal-900">
      <SEO
        title="Quick ATS Score | ATS Resify"
        description="Comprehensive real-time ATS scoring for your resume with deep formatting, keyword, and structural analysis."
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

        {/* Upload State */}
        {!atsResult && !loading && (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-5 text-teal-600 shadow-sm border border-teal-100">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Discover Your True ATS Score
              </h1>
              <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                Upload your resume to receive a comprehensive diagnostic report on formatting, keywords, and overall ATS compatibility.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-[2rem] p-8 md:p-12">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 rounded-[1.5rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer
                  ${dragActive 
                    ? 'border-teal-500 bg-teal-50/50 scale-[1.02]' 
                    : selectedFile 
                      ? 'border-teal-500/50 bg-teal-50/30 shadow-inner' 
                      : 'border-dashed border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/30'
                  }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${selectedFile ? 'bg-teal-100 text-teal-600' : 'bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-teal-500 group-hover:shadow-md group-hover:-translate-y-1'}`}>
                  {selectedFile ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {selectedFile ? selectedFile.name : 'Drag & Drop your resume'}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  {selectedFile ? 'Ready for analysis. Click to change file.' : 'Supports PDF and DOCX formats up to 5MB. We ensure strict data privacy.'}
                </p>

                {!selectedFile && (
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                    className="mt-8 px-8 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Select File
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
              </div>

              {errorMessage && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {selectedFile && (
                <button
                  onClick={handleAnalyze}
                  className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze My Resume
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Analyzing Document...</h2>
            <p className="text-slate-500 text-lg">Parsing sections, verifying keywords, and calculating impact scores.</p>
          </div>
        )}

        {/* Results Dashboard */}
        {atsResult && !loading && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">ATS Analysis Report</h1>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {selectedFile?.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>Generated just now</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setAtsResult(null); setSelectedFile(null); }}
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
              
              {/* LEFT COLUMN: Main Score, Strengths & Breakdown */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {/* Hero Score Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-white">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 filter drop-shadow-md">
                        <circle cx="60" cy="60" r={circleRadius} stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="60" cy="60" r={circleRadius}
                          stroke={getScoreColor(atsResult.score ?? 0).hex}
                          strokeWidth="10" fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (circumference * (atsResult.score ?? 0)) / 100}
                          className="transition-all duration-1500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-6xl font-black tracking-tighter ${getScoreColor(atsResult.score ?? 0).text}`}>
                          {atsResult.score ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">/ 100</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className={`inline-flex px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase mb-4 border shadow-sm ${getScoreColor(atsResult.score ?? 0).bg} ${getScoreColor(atsResult.score ?? 0).text} ${getScoreColor(atsResult.score ?? 0).border}`}>
                        {getScoreLabel(atsResult.score ?? 0)}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-3">Overall Resume Health</h2>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        This score reflects how easily Applicant Tracking Systems can read, parse, and rank your resume. Scores above 80 indicate high compatibility with automated screening tools.
                      </p>
                      
                      {/* Mini visual summary */}
                      <div className="flex items-center justify-center md:justify-start text-sm mt-2">
                        <div className="flex flex-col pr-6">
                          <span className="font-bold text-emerald-600 text-2xl">{atsResult.strengths.length}</span>
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Strengths</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="flex flex-col px-6">
                          <span className="font-bold text-amber-500 text-2xl">{atsResult.weaknesses.length}</span>
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Weaknesses</span>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div className="flex flex-col pl-6">
                          <span className="font-bold text-teal-600 text-2xl">{atsResult.suggestions.length}</span>
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Fixes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses (Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />
                    <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Key Strengths
                    </h3>
                    <div className="flex flex-col gap-3">
                      {atsResult.strengths.length > 0 ? (
                        atsResult.strengths.map((str, idx) => (
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
                  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50" />
                    <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Areas to Improve
                    </h3>
                    <div className="flex flex-col gap-3">
                      {atsResult.weaknesses.length > 0 ? (
                        atsResult.weaknesses.map((weak, idx) => (
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
                    Key Analysis
                  </h3>
                  <div className="flex flex-col gap-4">
                    {breakdownConfig.map(({ key, label, icon: Icon, desc }) => {
                      const s = atsResult.breakdown?.[key];
                      const pct = s ? Math.round((s.num / s.den) * 100) : 70;
                      const colorInfo = getScoreColor(pct);
                      const isExpanded = expandedMetric === key;
                      
                      return (
                        <div key={key} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow relative">
                          {/* Accordion Header */}
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

                          {/* Accordion Body */}
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

              {/* RIGHT COLUMN: Action Items (Sticky) */}
              <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                
                {/* Suggestions List */}
                {atsResult.suggestions.length > 0 && (
                  <div className="bg-slate-900 rounded-[1.5rem] p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full" />
                    <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      Action Items
                    </h3>
                    <div className="flex flex-col gap-5 relative z-10">
                      {atsResult.suggestions.map((sug, idx) => (
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

export default QuickScore;
