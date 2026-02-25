import React, { useState } from 'react';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import './AtsChecker.css';

// Donut Chart Component
const DonutChart = ({ value = 0, size = 180, thickness = 14 }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;
  
  const getColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={thickness} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={getColor(clamped)} strokeWidth={thickness} strokeLinecap="round" fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="donut-content">
        <span className="donut-value">{clamped}</span>
        <span className="donut-percent">%</span>
      </div>
    </div>
  );
};

// Mini Score Ring for breakdown items
const MiniRing = ({ value = 0, max = 10, size = 44, thickness = 4 }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // Guard against division by zero
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const dash = (pct / 100) * circumference;

  const getColor = (p) => {
    if (p >= 80) return '#22c55e';
    if (p >= 60) return '#3b82f6';
    if (p >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="mini-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={thickness} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke={getColor(pct)} strokeWidth={thickness} strokeLinecap="round" fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span className="mini-ring-value">{value}</span>
    </div>
  );
};

const AtsChecker = () => {
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setUploading(true);
    setAtsResult(null);
    setRawResponse(null);
    
    try {
      const response = await resumeAPI.calculateAtsScore(file, jobDescription);
      console.log('Backend ATS response:', response);
      setRawResponse(response);
      const normalized = normalizeAtsResponse(response);
      console.log('Normalized ATS result:', normalized);
      setAtsResult(normalized);
      setSnack({ open: true, type: 'success', text: 'ATS analysis complete!' });
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      setSnack({ open: true, type: 'error', text: error.response?.data?.message || 'Failed to analyze resume. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setSnack({ open: true, type: 'error', text: 'Please upload a PDF file!' });
      event.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setSnack({ open: true, type: 'error', text: 'File must be smaller than 5MB!' });
      event.target.value = '';
      return;
    }
    
    handleUpload(file);
    event.target.value = '';
  };

  // Parse "7/10" → { num: 7, den: 10 }
  const parseScore = (val) => {
    if (!val) return null;
    if (typeof val === 'number') return { num: val, den: 10 };
    const match = String(val).match(/(\d+)\s*\/\s*(\d+)/);
    if (match) return { num: parseInt(match[1], 10), den: parseInt(match[2], 10) || 10 };
    const numOnly = parseInt(String(val).replace(/[^\d]/g, ''), 10);
    return isNaN(numOnly) ? null : { num: numOnly, den: 10 };
  };

  const normalizeAtsResponse = (res) => {
    // Backend returns { data: { atsScore, scoreBreakdown, ... }, think: ... }
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

  const sectionMeta = {
    Summary: { icon: '📝', color: 'blue' },
    Experience: { icon: '💼', color: 'purple' },
    Education: { icon: '🎓', color: 'green' },
    Projects: { icon: '🚀', color: 'cyan' },
    Skills: { icon: '⚡', color: 'orange' },
    Certifications: { icon: '🏆', color: 'green' },
    Achievements: { icon: '🏅', color: 'purple' },
    Languages: { icon: '🌐', color: 'blue' },
    Contact: { icon: '📧', color: 'cyan' },
    Formatting: { icon: '📐', color: 'red' },
    Keywords: { icon: '🔑', color: 'orange' },
    General: { icon: '📋', color: 'blue' },
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return { text: 'Excellent', cls: 'excellent' };
    if (score >= 75) return { text: 'Good', cls: 'good' };
    if (score >= 60) return { text: 'Fair', cls: 'fair' };
    if (score >= 40) return { text: 'Needs Work', cls: 'needs-work' };
    return { text: 'Poor', cls: 'poor' };
  };

  const getBarColorClass = (pct) => {
    if (pct >= 80) return 'bar-green';
    if (pct >= 60) return 'bar-blue';
    if (pct >= 40) return 'bar-orange';
    return 'bar-red';
  };

  const breakdownItems = [
    { key: 'keywordMatch', label: 'Keyword Match', icon: '🔑' },
    { key: 'formatting', label: 'Formatting', icon: '📐' },
    { key: 'sectionCompleteness', label: 'Section Completeness', icon: '📋' },
  ];

  return (
    <div className="ats-page">
      {/* Hero */}
      <section className="ats-hero">
        {atsResult ? (
          <>
            <div className="analysis-badge">
              <span className="dot"></span>
              ANALYSIS COMPLETE
            </div>
            <h1>Your ATS Score Report</h1>
            <p>Here's how your resume performs against Applicant Tracking Systems.</p>
          </>
        ) : (
          <>
            <h1>ATS Resume Checker</h1>
            <p>Upload your resume to get instant ATS scoring, keyword analysis, and optimization suggestions powered by AI.</p>
          </>
        )}
      </section>

      <main className="ats-main">
        {/* Upload */}
        {!atsResult && !uploading && (
          <div className="upload-section">
            <div className="upload-area">
              <div className="upload-icon">📄</div>
              <p className="upload-text">Click to select a file</p>
              <p className="upload-hint">Accepted: PDF • Max 5MB</p>
              <label className="upload-btn">
                📁 SELECT FILE
                <input type="file" accept=".pdf" onChange={onPickFile} />
              </label>
            </div>
            <div className="jd-section">
              <label className="jd-label">
                🎯 Paste Job Description <span className="jd-optional">(optional — improves keyword matching)</span>
              </label>
              <textarea
                className="jd-textarea"
                placeholder="Paste the job description here to get a targeted analysis with keyword matching..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {uploading && (
          <div className="loading-container">
            <CircularProgress size={48} sx={{ color: '#6366f1' }} />
            <p>Analyzing your resume with AI...</p>
            <span className="loading-hint">This may take 10–20 seconds</span>
          </div>
        )}

        {/* ─── Results ─── */}
        {atsResult && (
          <>
            {/* Row 1: Overall Score + Breakdown */}
            <div className="results-top">
              <div className="card overall-score-card">
                <DonutChart value={atsResult.score ?? 0} size={170} thickness={14} />
                <div className="score-meta">
                  <span className={`score-label-badge ${getScoreLabel(atsResult.score ?? 0).cls}`}>
                    {getScoreLabel(atsResult.score ?? 0).text}
                  </span>
                  <span className="score-subtitle">Overall ATS Score</span>
                </div>
              </div>

              <div className="card breakdown-card">
                <h3 className="card-title">Score Breakdown</h3>
                <div className="breakdown-list">
                  {breakdownItems.map(({ key, label, icon }) => {
                    const s = atsResult.breakdown?.[key];
                    const pct = s ? Math.round((s.num / s.den) * 100) : 0;
                    return (
                      <div key={key} className="breakdown-row">
                        <div className="breakdown-left">
                          <MiniRing value={s?.num ?? 0} max={s?.den ?? 10} />
                          <div className="breakdown-info">
                            <span className="breakdown-label">{icon} {label}</span>
                            <span className="breakdown-score-text">{s ? `${s.num} / ${s.den}` : '—'}</span>
                          </div>
                        </div>
                        <div className="breakdown-bar-wrap">
                          <div className={`breakdown-bar-fill ${getBarColorClass(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: Strengths & Weaknesses */}
            <div className="results-middle">
              <div className="card sw-card">
                <h3 className="card-title">
                  <span className="title-icon green-bg">✅</span>
                  Strengths
                  <span className="count-badge green-badge">{atsResult.strengths.length}</span>
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

              <div className="card sw-card">
                <h3 className="card-title">
                  <span className="title-icon red-bg">⚠️</span>
                  Weaknesses
                  <span className="count-badge red-badge">{atsResult.weaknesses.length}</span>
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

            {/* Row 3: Detailed Suggestions */}
            {atsResult.suggestions.length > 0 && (
              <div className="card suggestions-card">
                <div className="suggestions-header">
                  <div>
                    <h3 className="card-title" style={{ marginBottom: 4 }}>💡 AI Recommendations</h3>
                    <p className="suggestions-subtitle">Actionable improvements to boost your ATS score</p>
                  </div>
                  <span className="count-badge purple-badge">{atsResult.suggestions.length} suggestions</span>
                </div>
                <div className="suggestions-list">
                  {atsResult.suggestions.map((s, idx) => {
                    const section = s.section || 'General';
                    const meta = sectionMeta[section] || { icon: '📋', color: 'blue' };
                    return (
                      <div key={idx} className="suggestion-item">
                        <div className={`suggestion-icon-wrap ${meta.color}`}>{meta.icon}</div>
                        <div className="suggestion-content">
                          <span className={`suggestion-section-tag ${meta.color}`}>{section}</span>
                          <p className="suggestion-text">{s.suggestion}</p>
                        </div>
                        <span className="suggestion-num">#{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raw Response */}
            <div className="raw-toggle-section">
              <button className="raw-toggle-btn" onClick={() => setShowRaw(!showRaw)}>
                {showRaw ? '🔼 Hide' : '🔽 Show'} Raw AI Response
              </button>
              {showRaw && rawResponse && (
                <pre className="raw-response-block">{JSON.stringify(rawResponse, null, 2)}</pre>
              )}
            </div>

            {/* CTA */}
            <div className="cta-section">
              <h2>Ready to improve your score?</h2>
              <p>Use our AI resume generator to apply the suggestions above automatically.</p>
              <div className="cta-buttons">
                <button className="cta-btn-primary" onClick={() => navigate('/generate')}>
                  ✨ Generate Optimized Resume
                </button>
                <button className="cta-btn-secondary" onClick={() => { setAtsResult(null); setRawResponse(null); setJobDescription(''); }}>
                  🔄 Analyze Another Resume
                </button>
              </div>
            </div>
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
