import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import AgentChat from '../AgentChat';
import { decodeToken, getAuthToken } from '../../utils/auth';
import { useResume } from '../../context/ResumeContext';
import PersonalInfoForm from './forms/PersonalInfoForm';
import SummaryForm from './forms/SummaryForm';
import SkillsForm from './forms/SkillsForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import ProjectsForm from './forms/ProjectsForm';
import CertificationsForm from './forms/CertificationsForm';
import AchievementsForm from './forms/AchievementsForm';
import LatexCodeEditor from './LatexCodeEditor';
import ResumePreview from './ResumePreview';
import '../../pages/EditResume.css';

const EditResumeContent = () => {
  const navigate = useNavigate();
  const {
    loading,
    editMode,
    setEditMode,
    saving,
    lastSavedAt,
    latexCode,
    parseLatexToData,
    setResumeData,
    setFormData,
    handleSave,
    downloadPDF,
    compiling,
    snack,
    setSnack,
    formData
  } = useResume();

  if (loading) {
    return (
      <div className="edit-resume-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-resume-page">
      <div className="edit-resume-container">
        {/* Left Panel - Form or LaTeX Editor */}
        <div className="form-panel">
          {/* Back Link */}
          <span className="back-link" onClick={() => navigate('/generate')}>
            ← Back to Generator
          </span>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <div className="page-title">
                <h1>{editMode === 'latex' ? 'Edit LaTeX Code' : 'Edit Your Resume'}</h1>
                <span className="edit-icon">{editMode === 'latex' ? '📄' : '✏️'}</span>
              </div>
              <div className="auto-save-badge">
                <span className="dot"></span>
                {saving ? 'Saving...' : lastSavedAt ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : 'No saves yet'}
              </div>
            </div>
            <div className="header-actions">
              {/* Edit Mode Toggle */}
              <div className="edit-mode-toggle">
                <button
                  className={`mode-btn ${editMode === 'form' ? 'active' : ''}`}
                  onClick={() => {
                    // ── Bidirectional sync: parse LaTeX back into form when switching to Form mode ──
                    if (editMode === 'latex' && latexCode) {
                      const parsed = parseLatexToData(latexCode);
                      if (parsed) {
                        setResumeData(parsed);
                        const pi = parsed.personalInformation || {};
                        setFormData({
                          fullName: pi.fullName || '',
                          email: pi.email || '',
                          phoneNumber: pi.phoneNumber || '',
                          location: pi.location || '',
                          linkedIn: pi.linkedIn || '',
                          gitHub: pi.gitHub || '',
                          portfolio: pi.portfolio || '',
                          summary: parsed.summary || '',
                          skills: (parsed.skills || []).map(s => ({
                            title: s.title || '', level: s.level || 'Intermediate', items: s.items || [],
                          })),
                          experience: parsed.experience || [],
                          education: parsed.education || [],
                          projects: parsed.projects || [],
                          certifications: parsed.certifications || [],
                          achievements: parsed.achievements || [],
                          languages: parsed.languages || [],
                          interests: parsed.interests || [],
                        });
                        localStorage.setItem('generatedResume', JSON.stringify(parsed));
                      }
                    }
                    setEditMode('form');
                  }}
                >
                  📝 Form
                </button>
                <button
                  className={`mode-btn ${editMode === 'latex' ? 'active' : ''}`}
                  onClick={() => setEditMode('latex')}
                >
                  &lt;/&gt; LaTeX
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Form or LaTeX Editor */}
          {editMode === 'latex' ? (
            <LatexCodeEditor />
          ) : (
            <>
              <PersonalInfoForm />
              <SummaryForm />
              <SkillsForm />
              <ExperienceForm />
              <EducationForm />
              <ProjectsForm />
              <CertificationsForm />
              <AchievementsForm />
            </>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        <ResumePreview />
      </div>

      {/* Floating Save Bar */}
      <div className="save-bar">
        <div className="save-status">
          <span className="dot"></span>
          {saving ? 'Saving...' : 'All progress saved'}
        </div>
        <button className="btn-save" onClick={handleSave}>
          Save Changes
        </button>
        <button className="btn-download" onClick={downloadPDF} disabled={compiling}>
          {compiling ? '⏳ Compiling...' : '⬇ Download PDF'}
        </button>
      </div>

      {/* AI Agent Chat */}
      <AgentChat
        formData={formData}
        resumeContext={latexCode}
        userId={(() => {
          const token = getAuthToken();
          if (token) {
            const decoded = decodeToken(token);
            return decoded?.sub || decoded?.email || 'anonymous';
          }
          return 'anonymous';
        })()}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.type}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          {snack.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditResumeContent;
