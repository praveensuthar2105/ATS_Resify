import React, { useState, useRef } from 'react';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AtsChecker.css';

const AtsChecker = () => {
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [rawResponse, setRawResponse] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleUpload = async (file) => {
    setUploading(true);
    setAtsResult(null);

    try {
      const response = await resumeAPI.calculateAtsScore(file, jobDescription);
      setRawResponse(response);
      const normalized = normalizeAtsResponse(response);
      setAtsResult(normalized);
      setSnack({ open: true, type: 'success', text: 'ATS analysis complete!' });
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      setSnack({ open: true, type: 'error', text: error.response?.data?.message || 'Failed to analyze resume. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const validateAndSelect = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setSnack({ open: true, type: 'error', text: 'Please upload a PDF file!' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSnack({ open: true, type: 'error', text: 'File must be smaller than 5MB!' });
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      // Prompt login if not authenticated
      setSnack({ open: true, type: 'info', text: 'Please sign in to analyze your resume.' });
      setTimeout(() => {
        navigate('/login', { state: { from: location } });
      }, 1500);
      return;
    }

    if (!selectedFile) {
      setSnack({ open: true, type: 'error', text: 'Please select a resume file first!' });
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
    if (typeof val === 'number') return { num: val, den: 10 };
    const match = String(val).match(/(\d+)\s*\/\s*(\d+)/);
    if (match) return { num: parseInt(match[1], 10), den: parseInt(match[2], 10) || 10 };
    const numOnly = parseInt(String(val).replace(/[^\d]/g, ''), 10);
    return isNaN(numOnly) ? null : { num: numOnly, den: 10 };
  };

  const normalizeAtsResponse = (res) => {
    const payload = res?.data ?? res ?? {};
    const rawScore = payload?.atsScore ?? payload?.overallScore ?? payload?.score;
    const percent = typeof rawScore === 'string'
      ? parseInt(String(rawScore).replace(/[^\d]/g, ''), 10)
      : (typeof rawScore === 'number' ? rawScore : null);

    const breakdown = payload?.scoreBreakdown ?? payload?.breakdown ?? {};
    const strengths = Array.isArray(payload?.strengths) ? payload.strengths : [];
    const weaknesses = Array.isArray(payload?.weaknesses) ? payload.weaknesses : [];
    const suggestions = Array.isArray(payload?.detailedSuggestions)
      ? payload.detailedSuggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
      : (Array.isArray(payload?.suggestions)
        ? payload.suggestions.map(s => typeof s === 'string' ? { section: 'General', suggestion: s } : s)
        : []);

    return {
      score: Number.isFinite(percent) ? percent : null,
      breakdown: {
        keywordMatch: parseScore(breakdown.keywordMatch ?? breakdown.keywords),
        formatting: parseScore(breakdown.formatting ?? breakdown.format),
        sectionCompleteness: parseScore(breakdown.sectionCompleteness ?? breakdown.sections),
      },
      strengths,
      weaknesses,
      suggestions,
    };
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const getScoreTier = (score) => {
    if (score >= 85) return 'Top 10%';
    if (score >= 70) return 'Top 25%';
    if (score >= 50) return 'Top 50%';
    return 'Below Average';
  };

  // SVG circular progress
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;

  const sectionMeta = {
    Summary: { icon: 'description', color: 'blue' },
    Experience: { icon: 'rocket_launch', color: 'indigo' },
    Education: { icon: 'school', color: 'green' },
    Projects: { icon: 'terminal', color: 'cyan' },
    Skills: { icon: 'psychology', color: 'orange' },
    Certifications: { icon: 'workspace_premium', color: 'green' },
    Achievements: { icon: 'emoji_events', color: 'purple' },
    Languages: { icon: 'translate', color: 'blue' },
    Contact: { icon: 'contact_page', color: 'teal' },
    Formatting: { icon: 'view_column', color: 'blue' },
    Keywords: { icon: 'key', color: 'amber' },
    General: { icon: 'task_alt', color: 'emerald' },
  };

  const breakdownConfig = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: 'key', bgClass: 'bd-amber' },
    { key: 'formatting', label: 'Formatting', icon: 'view_column', bgClass: 'bd-blue' },
    { key: 'sectionCompleteness', label: 'Section Completeness', icon: 'contact_page', bgClass: 'bd-teal' },
  ];

  return (
    <div className="ats-page">
      {/* ══════════ HERO ══════════ */}
      <section className="ats-hero">
        <div className="ats-hero-badge">
          <span className="ping-dot">
            <span className="ping-ring"></span>
            <span className="ping-core"></span>
          </span>
          {atsResult ? 'LIVE ANALYSIS COMPLETE' : 'ATS READINESS CHECK'}
        </div>
        <h1>{atsResult ? 'ATS Analysis Results' : <>Score your resume for <span className="hero-accent">ATS</span> in minutes</>}</h1>
        <p className="hero-subtitle">
          {atsResult
            ? "We've analyzed your resume to ensure it bypasses modern enterprise ATS filters."
            : 'Upload your PDF resume to get instant scoring, keyword coverage, and section-level guidance tailored for Applicant Tracking Systems.'}
        </p>
        {!atsResult && (
          <div className="hero-tags">
            <span className="hero-tag">📄 PDF Files</span>
            <span className="hero-tag">📦 &lt; 5 MB</span>
            <span className="hero-tag">🔑 Keyword Insights</span>
          </div>
        )}
      </section>

      <main className="ats-main">
        {/* ══════════ UPLOAD + CHECKLIST (pre-results) ══════════ */}
        {!atsResult && !uploading && (
          <>
            <div className="upload-checklist-row">
              <div className="upload-panel">
                <h2 className="panel-title">Upload &amp; analyze</h2>
                <p className="panel-subtitle">Drop in your resume to get ATS scoring, keyword coverage, and prioritized fixes.</p>

                <div
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-icon">📁</div>
                  <p className="drop-text">Click to select a file or drag and drop</p>
                  <p className="drop-hint">Accepted: PDF • Max 5MB</p>
                  <button className="select-file-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    📁 SELECT FILE
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={onPickFile} style={{ display: 'none' }} />
                </div>

                {selectedFile && (
                  <div className="selected-file-row">
                    <span className="selected-file-name">📄 {selectedFile.name}</span>
                    <button className="remove-file-btn" onClick={() => setSelectedFile(null)}>✕</button>
                  </div>
                )}

                <button
                  className={`submit-btn ${selectedFile ? 'active' : 'disabled'}`}
                  onClick={handleSubmit}
                  disabled={!selectedFile}
                >
                  🚀 Analyze Resume
                </button>

                <div className="jd-section">
                  <label className="jd-label">
                    🎯 Paste Job Description <span className="jd-optional">(optional — improves keyword matching)</span>
                  </label>
                  <textarea
                    className="jd-textarea"
                    placeholder="Paste the job description here to get a targeted analysis with keyword matching..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="checklist-panel">
                <h2 className="panel-title">ATS-friendly checklist</h2>
                <p className="panel-subtitle">Quick wins to boost your score before you upload.</p>
                <ul className="checklist">
                  <li className="checklist-item"><span className="check-icon">✅</span>Use standard headings: Summary, Experience, Education, Skills</li>
                  <li className="checklist-item"><span className="check-icon">✅</span>Keep fonts simple (Inter, Arial, Calibri) and avoid images</li>
                  <li className="checklist-item"><span className="check-icon">✅</span>Mirror keywords from the job description naturally</li>
                  <li className="checklist-item"><span className="check-icon">✅</span>Prefer bullet points, avoid dense paragraphs</li>
                  <li className="checklist-item"><span className="check-icon">✅</span>Export to PDF for consistency unless a DOCX is required</li>
                </ul>
                <div className="pro-tip">
                  <span className="pro-tip-badge">PRO TIP</span>
                  <p>Our AI suggests specific action verbs like "spearheaded" or "optimized" to grab recruiter attention.</p>
                </div>
              </div>
            </div>

            <section className="info-section">
              <h2 className="info-title">What is an ATS Score?</h2>
              <p className="info-text">
                An Applicant Tracking System (ATS) is software used by employers to manage job applications. Your ATS score indicates how
                well your resume is formatted and optimized for these systems. A higher score means your resume is more likely to be seen
                by human recruiters.
              </p>
            </section>

            <div className="practices-row">
              <div className="practices-card good">
                <h3><span className="practices-icon good-icon">✅</span> Good ATS Practices</h3>
                <ul>
                  <li><span className="practice-bullet good-bullet">+</span> Use standard fonts and formatting</li>
                  <li><span className="practice-bullet good-bullet">+</span> Include relevant keywords</li>
                  <li><span className="practice-bullet good-bullet">+</span> Use clear section headings</li>
                  <li><span className="practice-bullet good-bullet">+</span> Avoid images and graphics</li>
                </ul>
              </div>
              <div className="practices-card poor">
                <h3><span className="practices-icon poor-icon">❌</span> Poor ATS Practices</h3>
                <ul>
                  <li><span className="practice-bullet poor-bullet">−</span> Complex tables and columns</li>
                  <li><span className="practice-bullet poor-bullet">−</span> Headers and footers</li>
                  <li><span className="practice-bullet poor-bullet">−</span> Special characters</li>
                  <li><span className="practice-bullet poor-bullet">−</span> Unconventional section names</li>
                </ul>
              </div>
            </div>

            <section className="cta-band">
              <h2>Ready to Build Your Resume?</h2>
              <p>Join thousands of job seekers who have already landed their dream jobs.</p>
              <button className="cta-band-btn" onClick={() => navigate('/generate')}>Get Started Now</button>
            </section>
          </>
        )}

        {/* ══════════ LOADING ══════════ */}
        {uploading && (
          <div className="loading-container">
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
            <p>Analyzing your resume with AI...</p>
            <span className="loading-hint">This may take 10–20 seconds</span>
          </div>
        )}

        {/* ══════════ RESULTS (Glassmorphic Design) ══════════ */}
        {atsResult && (
          <>
            {/* Score + Breakdown Row */}
            <div className="results-grid">
              {/* Left: Score Card with Circular Progress */}
              <div className="glass-card score-main-card">
                <div className="score-flex">
                  {/* Circular SVG Progress */}
                  <div className="score-circle-wrap">
                    <svg className="score-svg" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <circle className="score-bg-ring" cx="50" cy="50" r={circleRadius} strokeWidth="10" />
                      <circle
                        className="score-fg-ring"
                        cx="50" cy="50" r={circleRadius}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * (atsResult.score ?? 0)) / 100}
                      />
                    </svg>
                    <div className="score-center-text">
                      <span className="score-big-num">{atsResult.score ?? 0}</span>
                      <span className="score-percent">%</span>
                      <span className="score-label-text">Overall Score</span>
                    </div>
                  </div>

                  {/* Breakdown Bars */}
                  <div className="score-breakdown-section">
                    <div className="breakdown-header">
                      <h3 className="breakdown-heading">
                        <span className="heading-bar"></span>
                        Score Breakdown
                      </h3>
                      <span className="tier-badge">{getScoreTier(atsResult.score ?? 0)}</span>
                    </div>

                    <div className="breakdown-bars">
                      {breakdownConfig.map(({ key, label, icon, bgClass }) => {
                        const s = atsResult.breakdown?.[key];
                        const pct = s ? Math.round((s.num / s.den) * 100) : 0;
                        return (
                          <div key={key} className="bd-item">
                            <div className="bd-item-top">
                              <div className="bd-icon-label">
                                <div className={`bd-icon-box ${bgClass}`}>
                                  <span className="material-symbols-outlined">{icon}</span>
                                </div>
                                <span className="bd-label">{label}</span>
                              </div>
                              <span className={`bd-pct ${bgClass}`}>{pct}%</span>
                            </div>
                            <div className="bd-bar-track">
                              <div className={`bd-bar-fill ${bgClass}`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI Summary Sidebar */}
              <div className="glass-card summary-sidebar">
                <div className="summary-content">
                  <div className="summary-icon-box">
                    <span className="material-symbols-outlined">query_stats</span>
                  </div>
                  <div>
                    <h4 className="summary-title">AI Summary</h4>
                    <p className="summary-text">
                      Your resume shows <strong>{getScoreLabel(atsResult.score ?? 0).toLowerCase()} compatibility</strong> with ATS systems.
                      {atsResult.score >= 75
                        ? ' Fine-tuning keywords and formatting could push you into the elite bracket.'
                        : ' Focus on the improvements below to significantly boost your score.'}
                    </p>
                  </div>
                  <div className="parser-status">
                    <div className="parser-icon">
                      <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                      <p className="parser-label">Parser Status</p>
                      <p className="parser-value">100% Compatible</p>
                    </div>
                  </div>
                </div>
                <button className="download-report-btn" onClick={() => navigate('/generate')}>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  Generate Optimized Resume
                </button>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="sw-grid">
              <div className="glass-card sw-card">
                <h3 className="sw-heading">
                  <div className="sw-icon-box emerald">
                    <span className="material-symbols-outlined">task_alt</span>
                  </div>
                  Strengths
                  <span className="sw-count emerald">{atsResult.strengths.length}</span>
                </h3>
                {atsResult.strengths.length > 0 ? (
                  <ul className="sw-list">
                    {atsResult.strengths.map((s, i) => (
                      <li key={i} className="sw-item strength-item">
                        <span className="sw-bullet strength-bullet">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No strengths identified.</p>
                )}
              </div>

              <div className="glass-card sw-card">
                <h3 className="sw-heading">
                  <div className="sw-icon-box rose">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  Weaknesses
                  <span className="sw-count rose">{atsResult.weaknesses.length}</span>
                </h3>
                {atsResult.weaknesses.length > 0 ? (
                  <ul className="sw-list">
                    {atsResult.weaknesses.map((w, i) => (
                      <li key={i} className="sw-item weakness-item">
                        <span className="sw-bullet weakness-bullet">!</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No weaknesses found — great job!</p>
                )}
              </div>
            </div>

            {/* Critical Improvements / Suggestions */}
            {atsResult.suggestions.length > 0 && (
              <div className="improvements-section">
                <div className="improvements-header">
                  <div>
                    <h2 className="improvements-title">Critical Improvements</h2>
                    <p className="improvements-sub">Strategic adjustments recommended by our AI model.</p>
                  </div>
                  <div className="insights-count-box">
                    <span>{atsResult.suggestions.length} Insights Found</span>
                  </div>
                </div>

                <div className="improvements-grid">
                  {atsResult.suggestions.map((s, idx) => {
                    const section = s.section || 'General';
                    const meta = sectionMeta[section] || { icon: 'task_alt', color: 'blue' };
                    const isWarning = ['Keywords', 'Formatting', 'General'].includes(section);
                    return (
                      <div key={idx} className={`glass-card improvement-card ${isWarning ? `border-left-${meta.color}` : ''}`}>
                        <div className={`improve-icon-box ${meta.color}`}>
                          <span className="material-symbols-outlined">{meta.icon}</span>
                        </div>
                        <h4 className="improve-title">{section}</h4>
                        <p className="improve-text">{s.suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raw Backend Response Toggle */}
            {rawResponse && (
              <div className="glass-card raw-response-card">
                <button className="raw-toggle-btn" onClick={() => setShowRaw(!showRaw)}>
                  <span className="material-symbols-outlined">{showRaw ? 'visibility_off' : 'data_object'}</span>
                  {showRaw ? 'Hide Backend Response' : 'Show Backend Response'}
                </button>
                {showRaw && (
                  <pre className="raw-json-block">{JSON.stringify(rawResponse, null, 2)}</pre>
                )}
              </div>
            )}

            {/* CTA - Mesh gradient */}
            <section className="results-cta-mesh">
              <div className="mesh-blur mesh-blur-1"></div>
              <div className="mesh-blur mesh-blur-2"></div>
              <div className="mesh-cta-content">
                <h2>Ready to reach 100%?</h2>
                <p>Let our AI engine rewrite your sections instantly to match the highest industry standards.</p>
                <div className="mesh-cta-buttons">
                  <button className="mesh-btn-primary" onClick={() => navigate('/generate')}>
                    <span className="material-symbols-outlined">auto_fix_high</span>
                    Apply AI Suggestions
                  </button>
                  <button className="mesh-btn-secondary" onClick={() => { setAtsResult(null); setJobDescription(''); }}>
                    Analyze Another Resume
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.text}</Alert>
      </Snackbar>
    </div>
  );
};

export default AtsChecker;
