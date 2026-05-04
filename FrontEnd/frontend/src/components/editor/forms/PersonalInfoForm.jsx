import React from 'react';
import { useResume } from '../../../context/ResumeContext';

/** Normalize a LinkedIn input into a full https URL */
const normalizeLinkedIn = (value) => {
  if (!value) return '';
  const v = value.trim();
  if (!v) return '';
  // Already a full https LinkedIn URL
  if (/^https?:\/\/(www\.)?linkedin\.com/i.test(v)) return v;
  // Has linkedin.com but no protocol
  if (/^(www\.)?linkedin\.com/i.test(v)) return `https://${v}`;
  // Looks like "in/username"
  if (/^in\//i.test(v)) return `https://www.linkedin.com/${v}`;
  // Plain username
  return `https://www.linkedin.com/in/${v}`;
};

/** Normalize a GitHub input into a full https URL */
const normalizeGitHub = (value) => {
  if (!value) return '';
  const v = value.trim();
  if (!v) return '';
  // Already a full https GitHub URL
  if (/^https?:\/\/(www\.)?github\.com/i.test(v)) return v;
  // Has github.com but no protocol
  if (/^(www\.)?github\.com/i.test(v)) return `https://${v}`;
  // Plain username
  return `https://github.com/${v}`;
};

const PersonalInfoForm = () => {
  const { formData, updateField } = useResume();

  const handleLinkedIn = (e) => {
    updateField('linkedIn', e.target.value);
  };

  const handleLinkedInBlur = (e) => {
    updateField('linkedIn', normalizeLinkedIn(e.target.value));
  };

  const handleGitHub = (e) => {
    updateField('gitHub', e.target.value);
  };

  const handleGitHubBlur = (e) => {
    updateField('gitHub', normalizeGitHub(e.target.value));
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon blue">👤</div>
        <div className="section-info">
          <h3>Personal Information</h3>
          <p>Contact details and profile links</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => updateField('phoneNumber', e.target.value)}
            placeholder="123-456-7890"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>

        {/* LinkedIn */}
        <div className="form-group">
          <label>
            LinkedIn
            <span className="field-badge">🔗 clickable in resume</span>
          </label>
          <input
            type="text"
            value={formData.linkedIn || ''}
            onChange={handleLinkedIn}
            onBlur={handleLinkedInBlur}
            placeholder="linkedin.com/in/yourname or just yourname"
          />
          {formData.linkedIn && (
            <a
              className="field-preview-link"
              href={formData.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ Preview link
            </a>
          )}
        </div>

        {/* GitHub */}
        <div className="form-group">
          <label>
            GitHub
            <span className="field-badge">🔗 clickable in resume</span>
          </label>
          <input
            type="text"
            value={formData.gitHub || ''}
            onChange={handleGitHub}
            onBlur={handleGitHubBlur}
            placeholder="github.com/yourname or just yourname"
          />
          {formData.gitHub && (
            <a
              className="field-preview-link"
              href={formData.gitHub}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ Preview link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
