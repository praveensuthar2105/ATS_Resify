import React, { useState, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './ImportResumeModal.css';

/**
 * Modal component for importing resumes from PDF, LinkedIn PDF, or plain text.
 * After parsing, shows a review screen with confidence scores.
 */
const ImportResumeModal = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState('pdf');
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const [loading, setLoading] = useState(false);
    const [parsedResult, setParsedResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!open) return null;

    const tabs = [
        { id: 'pdf', icon: '📄', label: 'Upload PDF' },
        { id: 'linkedin', icon: '🔗', label: 'LinkedIn PDF' },
        { id: 'text', icon: '📝', label: 'Paste Text' },
    ];

    // ── File handling ──
    const validateAndSelect = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File must be smaller than 5MB.');
            return;
        }
        setError('');
        setSelectedFile(file);
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
        validateAndSelect(e.dataTransfer?.files?.[0]);
    };

    const handleFileInput = (e) => {
        validateAndSelect(e.target.files?.[0]);
        e.target.value = '';
    };

    // ── Import actions ──
    const handleImport = async () => {
        if (!isAuthenticated) {
            onClose();
            navigate('/login', { state: { from: location } });
            return;
        }

        setLoading(true);
        setError('');
        try {
            let result;

            if (activeTab === 'text') {
                if (!pasteText || pasteText.trim().length < 50) {
                    setError('Please provide at least 50 characters of resume content.');
                    setLoading(false);
                    return;
                }
                result = await resumeAPI.importFromText(pasteText);
            } else {
                if (!selectedFile) {
                    setError('Please select a PDF file first.');
                    setLoading(false);
                    return;
                }
                const source = activeTab === 'linkedin' ? 'linkedin' : 'general';
                result = await resumeAPI.importFromPdf(selectedFile, source);
            }

            if (result.success) {
                setParsedResult(result);
            } else {
                setError(result.error || 'Failed to parse resume. Please try again.');
            }
        } catch (err) {
            console.error('Import error:', err);
            setError(err.response?.data?.error || err.message || 'Import failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Continue to editor ──
    const handleContinueToEditor = () => {
        if (!parsedResult?.data) return;

        // Store parsed data the same way GenerateResume does
        const resumeData = {
            data: parsedResult.data,
            selectedTemplate: 'ats',
        };
        localStorage.setItem('generatedResume', JSON.stringify(resumeData));
        onClose();
        navigate('/edit-resume');
    };

    // ── Go back from review ──
    const handleBackFromReview = () => {
        setParsedResult(null);
        setError('');
    };

    // ── Close and reset ──
    const handleClose = () => {
        setSelectedFile(null);
        setPasteText('');
        setParsedResult(null);
        setError('');
        setActiveTab('pdf');
        onClose();
    };

    // ── Render Review Screen ──
    if (parsedResult) {
        const data = parsedResult.data;
        const confidence = parsedResult.confidence;
        const warnings = parsedResult.warnings || [];
        const expList = data.experienceList || [];
        const eduList = data.educationList || [];
        const skills = data.skills || [];
        const projects = data.projects || [];

        return (
            <div className="import-modal-overlay" onClick={handleClose}>
                <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="import-modal-header">
                        <h2>✅ Resume Parsed</h2>
                        <button className="import-close-btn" onClick={handleClose}>×</button>
                    </div>

                    <div className="import-tab-content">
                        <div className="review-header">
                            <h3>Resume extracted successfully!</h3>
                            <p className="review-confidence">
                                Confidence: <strong>{Math.round((confidence?.overall || 0) * 100)}%</strong>
                                {' · '}Processed in {parsedResult.processingTimeMs}ms
                            </p>
                        </div>

                        {/* Personal Info */}
                        <div className="review-section">
                            <p className="review-section-title">👤 Personal Info</p>
                            {data.name && <div className="review-field"><span className="review-field-label">Name</span><span className="review-field-value">{data.name}</span></div>}
                            {data.email && <div className="review-field"><span className="review-field-label">Email</span><span className="review-field-value">{data.email}</span></div>}
                            {data.phone && <div className="review-field"><span className="review-field-label">Phone</span><span className="review-field-value">{data.phone}</span></div>}
                            {data.address && <div className="review-field"><span className="review-field-label">Address</span><span className="review-field-value">{data.address}</span></div>}
                        </div>

                        {/* Experience */}
                        {expList.length > 0 && (
                            <div className="review-section">
                                <p className="review-section-title">💼 Experience ({expList.length} entries)</p>
                                {expList.map((exp, i) => (
                                    <div key={i} className="review-list-item">
                                        <div className="review-list-title">{exp.title} @ {exp.company}</div>
                                        <div className="review-list-subtitle">{exp.duration}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {eduList.length > 0 && (
                            <div className="review-section">
                                <p className="review-section-title">🎓 Education ({eduList.length} entries)</p>
                                {eduList.map((edu, i) => (
                                    <div key={i} className="review-list-item">
                                        <div className="review-list-title">{edu.degree}</div>
                                        <div className="review-list-subtitle">{edu.institution} · {edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div className="review-section">
                                <p className="review-section-title">🛠️ Skills ({skills.length})</p>
                                <div className="review-skills-grid">
                                    {skills.map((skill, i) => (
                                        <span key={i} className="review-skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <div className="review-section">
                                <p className="review-section-title">📁 Projects ({projects.length})</p>
                                {projects.map((proj, i) => (
                                    <div key={i} className="review-list-item">
                                        <div className="review-list-title">{proj.name}</div>
                                        <div className="review-list-subtitle">{proj.description?.substring(0, 80)}...</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Warnings */}
                        {warnings.length > 0 && (
                            <div className="review-warnings">
                                <p>⚠️ {warnings.length} warning{warnings.length > 1 ? 's' : ''}</p>
                                <ul>
                                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="review-actions">
                            <button className="review-back-btn" onClick={handleBackFromReview}>
                                ← Back
                            </button>
                            <button className="review-continue-btn" onClick={handleContinueToEditor}>
                                Continue to Editor →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render Main Import Modal ──
    return (
        <div className="import-modal-overlay" onClick={handleClose}>
            <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="import-modal-header">
                    <h2>📥 Import Resume</h2>
                    <button className="import-close-btn" onClick={handleClose}>×</button>
                </div>

                {/* Tabs */}
                <div className="import-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`import-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab.id); setError(''); setSelectedFile(null); }}
                        >
                            <span className="import-tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="import-tab-content">
                    {loading ? (
                        <div className="import-loading">
                            <CircularProgress size={40} sx={{ color: '#6366f1' }} />
                            <p>Parsing your resume with AI...</p>
                            <span>This may take 10–20 seconds</span>
                        </div>
                    ) : (
                        <>
                            {/* ── PDF Upload Tab ── */}
                            {activeTab === 'pdf' && (
                                <>
                                    <div
                                        className={`import-drop-zone ${dragActive ? 'drag-active' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="import-drop-icon">📄</div>
                                        <p className="import-drop-text">Drop your resume PDF here</p>
                                        <p className="import-drop-hint">or click to browse · PDF only · Max 5MB</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileInput}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {selectedFile && (
                                        <div className="import-selected-file">
                                            <span className="import-selected-name">📄 {selectedFile.name}</span>
                                            <button className="import-remove-btn" onClick={() => setSelectedFile(null)}>✕</button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── LinkedIn PDF Tab ── */}
                            {activeTab === 'linkedin' && (
                                <>
                                    <div className="import-instructions">
                                        <h4>How to export your LinkedIn profile as PDF:</h4>
                                        <ol>
                                            <li>Go to your LinkedIn profile page</li>
                                            <li>Click the <strong>"More"</strong> button (•••)</li>
                                            <li>Select <strong>"Save to PDF"</strong></li>
                                            <li>Upload the downloaded PDF below</li>
                                        </ol>
                                    </div>

                                    <div
                                        className={`import-drop-zone ${dragActive ? 'drag-active' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="import-drop-icon">🔗</div>
                                        <p className="import-drop-text">Drop your LinkedIn PDF here</p>
                                        <p className="import-drop-hint">or click to browse · LinkedIn PDF export</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileInput}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {selectedFile && (
                                        <div className="import-selected-file">
                                            <span className="import-selected-name">🔗 {selectedFile.name}</span>
                                            <button className="import-remove-btn" onClick={() => setSelectedFile(null)}>✕</button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── Text Paste Tab ── */}
                            {activeTab === 'text' && (
                                <>
                                    <textarea
                                        className="import-textarea"
                                        placeholder="Paste your resume text here...

Example:
John Doe
john@email.com | +1-234-567-8900

EXPERIENCE
Software Engineer | Google | 2020 - Present
- Built microservices handling 1M+ requests/day
- Led team of 5 engineers..."
                                        value={pasteText}
                                        onChange={(e) => setPasteText(e.target.value)}
                                    />
                                    <div className="import-textarea-footer">
                                        <span>📝 {pasteText.length.toLocaleString()} characters</span>
                                        <span>{pasteText.length < 50 ? 'Need at least 50 characters' : '✅ Ready to parse'}</span>
                                    </div>
                                </>
                            )}

                            {/* Error message */}
                            {error && (
                                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px' }}>{error}</p>
                            )}

                            {/* Action button */}
                            <button
                                className="import-action-btn"
                                onClick={handleImport}
                                disabled={
                                    activeTab === 'text'
                                        ? pasteText.trim().length < 50
                                        : !selectedFile
                                }
                            >
                                ✨ Parse Resume with AI
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportResumeModal;
