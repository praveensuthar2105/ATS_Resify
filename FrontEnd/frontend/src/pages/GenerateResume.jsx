import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import { resumeAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './GenerateResume.css';

const GenerateResume = () => {
  const [description, setDescription] = useState('');
  const [selectedTemplate] = useState('ats'); // ATS-optimized template only
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });

  // Import states
  const [inputMode, setInputMode] = useState('text');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);

  const navigate = useNavigate();

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

  const handleGenerateResume = async (e) => {
    e.preventDefault();

    // PDF Mode Logic
    if (inputMode === 'pdf' || inputMode === 'linkedin') {
      if (!selectedFile) {
        setSnack({ open: true, type: 'error', text: 'Please select a PDF file first.' });
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
          setSnack({ open: true, type: 'success', text: `Resume extracted successfully!` });

          setTimeout(() => {
            navigate('/edit-resume');
          }, 1000);
        } else {
          setSnack({ open: true, type: 'error', text: result.error || 'Failed to parse resume PDF' });
        }
      } catch (error) {
        setSnack({ open: true, type: 'error', text: error.response?.data?.error || error.message || 'Error occurred during extraction.' });
      } finally {
        setLoading(false);
        setParsingPdf(false);
      }
      return;
    }

    if (!description || description.length < 50) {
      setSnack({ open: true, type: 'error', text: 'Please provide at least 50 characters for better results' });
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.generateResume(description, selectedTemplate);
      console.log('Backend response:', response);

      const resumeWithTemplate = {
        ...response,
        selectedTemplate: selectedTemplate
      };
      localStorage.setItem('generatedResume', JSON.stringify(resumeWithTemplate));
      setSnack({ open: true, type: 'success', text: 'Resume generated successfully!' });

      setTimeout(() => {
        navigate('/edit-resume');
      }, 1000);
    } catch (error) {
      console.error('Error generating resume:', error);
      setSnack({
        open: true,
        type: 'error',
        text: error.response?.data?.message || 'Failed to generate resume. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Shared thresholds for progress value and label
  const PROGRESS_THRESHOLDS = { minimal: 100, basic: 300, good: 600 };

  const getProgressValue = () => {
    if (charCount < PROGRESS_THRESHOLDS.minimal) return 20;
    if (charCount < PROGRESS_THRESHOLDS.basic) return 40;
    if (charCount < PROGRESS_THRESHOLDS.good) return 60;
    if (charCount < 1000) return 80;
    return 100;
  };

  const getProgressLabel = () => {
    if (charCount < PROGRESS_THRESHOLDS.basic) return 'Needs More';
    if (charCount < PROGRESS_THRESHOLDS.good) return 'Getting There';
    return 'Good';
  };

  const getReadTime = () => {
    const words = description.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} mins read`;
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
      else setSnack({ open: true, type: 'error', text: 'Only PDF files are supported' });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      if (e.target.files[0].type === 'application/pdf') {
        setSelectedFile(e.target.files[0]);
      } else {
        setSnack({ open: true, type: 'error', text: 'Only standard PDF files are supported' });
      }
    }
  };

  return (
    <div className="generate-page">
      {/* Hero Section */}
      <section className="gen-hero">
        <div className="gen-hero-badge">
          <span>✨ AI-POWERED GENERATOR</span>
        </div>
        <h1 className="gen-hero-title">Create Your Perfect Resume</h1>
        <p className="gen-hero-subtitle">
          Share your professional journey and our AI will craft an ATS-optimized resume<br />
          tailored to your target role in seconds.
        </p>
      </section>

      {/* Main Content */}
      <main className="gen-main">
        <div className="gen-container">
          {/* Left Sidebar - Tips */}
          <aside className="gen-sidebar-left">
            <div className="tips-card">
              <div className="tips-header">
                <span className="tips-icon">💡</span>
                <span className="tips-title">Writing Tips</span>
              </div>
              <ul className="tips-list">
                {writingTips.map((tip) => (
                  <li key={tip.num} className="tip-item">
                    <span className="tip-num">{tip.num}</span>
                    <span className="tip-text">{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="examples-card">
              <div className="examples-header">
                <span className="examples-icon">⚡</span>
                <span className="examples-title">Quick Examples</span>
              </div>
              {quickExamples.map((example, idx) => (
                <div
                  key={idx}
                  className="example-item"
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    setDescription(example.text.replace(/"/g, ''));
                    setCharCount(example.text.replace(/"/g, '').length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDescription(example.text.replace(/"/g, ''));
                      setCharCount(example.text.replace(/"/g, '').length);
                    }
                  }}
                >
                  <div className="example-title">{example.title}</div>
                  <div className="example-text">{example.text}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* Center - Main Form */}
          <div className="gen-form-section">
            {/* ATS Template Badge */}
            <div className="form-step">
              <div className="step-header">
                <span className="step-icon">✅</span>
                <span className="step-title">ATS-Optimized Template Selected</span>
              </div>

              <div className="ats-template-badge">
                <div className="ats-badge-icon">📋</div>
                <div className="ats-badge-content">
                  <div className="ats-badge-title">ATS-Optimized Resume</div>
                  <div className="ats-badge-subtitle">Designed to pass Applicant Tracking Systems with 95%+ success rate</div>
                </div>
                <div className="ats-badge-check">✓</div>
              </div>
            </div>

            {/* Tell Us About Yourself */}
            <div className="form-step">
              <div className="step-header-row">
                <div className="step-header">
                  <span className="step-icon">📝</span>
                  <span className="step-title">Provide Your Details</span>
                </div>
                {inputMode === 'text' && (
                  <div className="progress-indicator">
                    <span className="progress-label">Progress:</span>
                    <div className="progress-bar-container">
                      <LinearProgress
                        variant="determinate"
                        value={getProgressValue()}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          width: 80,
                          bgcolor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressValue() >= 80 ? '#22c55e' : '#6366f1',
                            borderRadius: 4
                          }
                        }}
                      />
                    </div>
                    <span className={`progress-status ${getProgressValue() >= 80 ? 'good' : ''}`}>
                      {getProgressLabel()}
                    </span>
                  </div>
                )}
              </div>

              <div className="input-mode-tabs-container">
                <div className="input-mode-tabs">
                  <button
                    className={`mode-tab ${inputMode === 'text' ? 'active' : ''}`}
                    onClick={() => { setInputMode('text'); }}
                  >
                    <span className="mode-icon">⌨️</span>
                    <span>Paste Text</span>
                  </button>
                  <button
                    className={`mode-tab ${inputMode === 'pdf' ? 'active' : ''}`}
                    onClick={() => { setInputMode('pdf'); }}
                  >
                    <span className="mode-icon">📄</span>
                    <span>Upload PDF</span>
                  </button>
                  <button
                    className={`mode-tab ${inputMode === 'linkedin' ? 'active' : ''}`}
                    onClick={() => { setInputMode('linkedin'); }}
                  >
                    <span className="mode-icon">🔗</span>
                    <span>LinkedIn PDF</span>
                  </button>
                </div>
              </div>
              {inputMode === 'text' && (
                <>
                  <div className="textarea-container">
                    <textarea
                      className="gen-textarea"
                      placeholder="Example: I am a senior software engineer with 8 years of experience in full-stack development. I led a team of 4 to migrate legacy infrastructure to AWS, reducing costs by 30%. I'm proficient in React, Go, and PostgreSQL..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setCharCount(e.target.value.length);
                      }}
                      rows={10}
                    />
                    <div className="textarea-actions">
                    </div>
                  </div>

                  <div className="textarea-footer">
                    <span className="char-count">📝 {charCount.toLocaleString()} Characters</span>
                    <span className="read-time">⏱️ {getReadTime()}</span>
                  </div>
                </>
              )}

              {inputMode !== 'text' && (
                <div className="upload-wrapper">
                  {inputMode === 'linkedin' && (
                    <div className="mode-hint">
                      Tip: Download your profile PDF from your LinkedIn 'More...' menu.
                    </div>
                  )}
                  <div
                    className={`drop-zone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="drop-icon-circle">
                      {selectedFile ? '✔️' : (inputMode === 'linkedin' ? '🔗' : '📤')}
                    </div>
                    <p className="drop-main-text">
                      {selectedFile ? selectedFile.name : `Drop your ${inputMode === 'linkedin' ? 'LinkedIn' : ''} PDF here`}
                    </p>
                    <p className="drop-sub-text">
                      {selectedFile ? 'Click to replace' : 'or click to browse files'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}

              <button
                className="generate-btn"
                onClick={handleGenerateResume}
                disabled={loading || (inputMode === 'text' && charCount < 50) || (inputMode !== 'text' && !selectedFile)}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    {parsingPdf ? 'Parsing PDF...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <span className="btn-sparkle">✨</span>
                    {inputMode === 'text' ? 'Generate My Resume' : 'Continue to Editor'}
                  </>
                )}
              </button>
            </div>

            {/* Bottom Cards */}
            <div className="bottom-cards">
              <div className="ats-card">
                <div className="ats-icon">🛡️</div>
                <div className="ats-content">
                  <div className="ats-title">ATS-Optimized Output</div>
                  <div className="ats-text">Your resume will be formatted to pass Applicant Tracking Systems with high compatibility.</div>
                </div>
                <div className="ats-chart">📊</div>
              </div>
            </div>
          </div>
        </div>
      </main>



      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.type}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {snack.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GenerateResume;
