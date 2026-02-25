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
                  <span className="step-title">Tell Us About Yourself</span>
                </div>
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
              </div>

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

              <button 
                className="generate-btn"
                onClick={handleGenerateResume}
                disabled={loading || charCount < 50}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="btn-sparkle">✨</span>
                    Generate My Resume
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
