import React, { useState, useEffect } from 'react';
import './ResumeDashboard.css';

const ResumeDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumeData();
    }, []);

    const fetchResumeData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resume-sync/data');
            const data = await response.json();
            setResumeData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching resume data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="resume-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Resume Builder</h1>
                    <p>Create beautiful, professional resumes in minutes with AI assistance.</p>
                </div>
                <div className="header-actions">
                    <button className="ghost-btn" onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className="primary-btn" onClick={() => setActiveTab('editor')}>Start Editing</button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="nav-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <span className="tab-icon">📄</span> Overview
                </button>
                <button
                    className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('editor')}
                >
                    <span className="tab-icon">✏️</span> Editor
                </button>
                <button
                    className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    <span className="tab-icon">👁️</span> Preview
                </button>
                <button
                    className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('templates')}
                >
                    <span className="tab-icon">🎨</span> Templates
                </button>
            </nav>

            {/* Main Content */}
            <main className="dashboard-content">
                {activeTab === 'overview' && <OverviewTab data={resumeData} />}
                {activeTab === 'editor' && <EditorTab data={resumeData} onUpdate={fetchResumeData} />}
                {activeTab === 'preview' && <PreviewTab data={resumeData} />}
                {activeTab === 'templates' && <TemplatesTab />}
            </main>
        </div>
    );
};

const OverviewTab = ({ data }) => {
    const summaryText = data?.summary ? `${data.summary.slice(0, 160)}${data.summary.length > 160 ? '…' : ''}` : 'Add a short professional summary to highlight your strengths.';
    const skills = data?.skills || [];

    return (
        <div className="overview-tab">
            <div className="overview-grid">
                <div className="overview-card">
                    <h3><span className="card-icon">👤</span>Personal Info</h3>
                    <div className="info-item">
                        <span className="label">Name:</span>
                        <span className="value">{data?.name || 'Not set'}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Email:</span>
                        <span className="value">{data?.email || 'Not set'}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Phone:</span>
                        <span className="value">{data?.phone || 'Not set'}</span>
                    </div>
                </div>

                <div className="overview-card stats-card">
                    <h3><span className="card-icon">📊</span>Snapshot</h3>
                    <div className="stat-row">
                        <div className="stat">
                            <span className="stat-number">{data?.experienceList?.length || 0}</span>
                            <span className="stat-label">Experience</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{data?.educationList?.length || 0}</span>
                            <span className="stat-label">Education</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">{skills.length}</span>
                            <span className="stat-label">Skills</span>
                        </div>
                    </div>
                    <div className="stat-hint">Keep your experience, education, and skills balanced for ATS.</div>
                </div>

                <div className="overview-card">
                    <h3><span className="card-icon">📝</span>Summary</h3>
                    <p className="summary-text">{summaryText}</p>
                    <button className="link-btn" onClick={() => document.querySelector('.nav-tabs .tab:nth-child(2)')?.click()}>
                        Edit summary →
                    </button>
                </div>

                <div className="overview-card">
                    <h3><span className="card-icon">✨</span>Skills</h3>
                    {skills.length > 0 ? (
                        <div className="chip-row">
                            {skills.slice(0, 8).map((skill, idx) => (
                                <span key={idx} className="chip">{skill}</span>
                            ))}
                            {skills.length > 8 && <span className="chip muted">+{skills.length - 8} more</span>}
                        </div>
                    ) : (
                        <p className="summary-text">Add your top skills to boost your ATS score.</p>
                    )}
                </div>

                <div className="overview-card actions-card">
                    <h3><span className="card-icon">⚡</span>Quick Actions</h3>
                    <div className="actions-grid">
                        <button className="action-btn">📥 Download PDF</button>
                        <button className="action-btn">🔗 Share Link</button>
                        <button className="action-btn">📋 Duplicate</button>
                        <button className="action-btn ghost">🖊️ Edit Details</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorTab = ({ data, onUpdate }) => {
    const [formData, setFormData] = useState(data || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            await fetch('http://localhost:8080/api/resume-sync/update-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            onUpdate();
            alert('Resume updated successfully!');
        } catch (error) {
            console.error('Error saving resume:', error);
        }
    };

    return (
        <div className="editor-tab">
            <div className="form-section">
                <h2>Personal Information</h2>
                <div className="form-grid">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="form-input"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="form-input"
                    />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="form-input"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <textarea
                    name="summary"
                    placeholder="Professional Summary"
                    value={formData.summary || ''}
                    onChange={handleChange}
                    className="form-textarea"
                    rows={4}
                />
            </div>

            <div className="editor-actions">
                <p className="hint-text">Tip: Keep your summary concise (2-3 sentences) and focus on impact.</p>
                <button className="save-btn" onClick={handleSave}>💾 Save Changes</button>
            </div>
        </div>
    );
};

const PreviewTab = ({ data }) => {
    const goToEditor = () => document.querySelector('.nav-tabs .tab:nth-child(2)')?.click();
    const goToTemplates = () => document.querySelector('.nav-tabs .tab:nth-child(4)')?.click();

    if (!data) {
        return (
            <div className="preview-tab">
                <div className="preview-placeholder">
                    <p>Preview not available yet.</p>
                    <span className="hint-text">Save your edits in the Editor tab, then refresh the preview.</span>
                    <div className="preview-actions">
                        <button className="ghost-btn" onClick={goToEditor}>Go to Editor</button>
                        <button className="primary-btn" onClick={goToTemplates}>Choose Template</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-tab">
            <div className="resume-preview">
                <div className="resume-header">
                    <h1>{data?.name}</h1>
                    <p className="contact-info">
                        {data?.email} • {data?.phone} • {data?.address}
                    </p>
                </div>

                {data?.summary && (
                    <section className="resume-section">
                        <h2>Professional Summary</h2>
                        <p>{data.summary}</p>
                    </section>
                )}

                {data?.experienceList && data.experienceList.length > 0 && (
                    <section className="resume-section">
                        <h2>Experience</h2>
                        {data.experienceList.map((exp, idx) => (
                            <div key={idx} className="resume-item">
                                <div className="item-header">
                                    <h3>{exp.title}</h3>
                                    <span className="date">{exp.duration}</span>
                                </div>
                                <p className="company">{exp.company}</p>
                                <p className="description">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                )}

                {data?.educationList && data.educationList.length > 0 && (
                    <section className="resume-section">
                        <h2>Education</h2>
                        {data.educationList.map((edu, idx) => (
                            <div key={idx} className="resume-item">
                                <div className="item-header">
                                    <h3>{edu.degree}</h3>
                                    <span className="date">{edu.year}</span>
                                </div>
                                <p className="company">{edu.institution}</p>
                                <p className="description">{edu.details}</p>
                            </div>
                        ))}
                    </section>
                )}

                {data?.skills && data.skills.length > 0 && (
                    <section className="resume-section">
                        <h2>Skills</h2>
                        <div className="skills-grid">
                            {data.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                <div className="preview-actions">
                    <button className="ghost-btn">📄 Download PDF</button>
                    <button className="primary-btn" onClick={goToTemplates}>🎨 Choose Template</button>
                </div>
            </div>
        </div>
    );
};

const TemplatesTab = () => {
    const templates = [
        { id: 1, name: 'Modern', description: 'Clean and contemporary design', color: '#2563eb' },
        { id: 2, name: 'Professional', description: 'Classic professional layout', color: '#059669' },
        { id: 3, name: 'Creative', description: 'Bold and creative styling', color: '#f59e0b' },
        { id: 4, name: 'Minimalist', description: 'Simple and elegant design', color: '#6b7280' },
    ];

    return (
        <div className="templates-tab">
            <div className="templates-grid">
                {templates.map(template => (
                    <div key={template.id} className="template-card" style={{ borderTopColor: template.color }}>
                        <div className="template-preview" style={{ backgroundColor: template.color }}>
                            <span>{template.name.slice(0, 1)}</span>
                        </div>
                        <h3>{template.name}</h3>
                        <p>{template.description}</p>
                        <button className="template-btn">Use {template.name}</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeDashboard;
