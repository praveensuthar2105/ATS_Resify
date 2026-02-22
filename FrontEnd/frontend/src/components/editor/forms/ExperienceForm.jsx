import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const ExperienceForm = () => {
  const { formData, updateField, addExperience, removeExperience } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon green">💼</div>
        <div className="section-info">
          <h3>Work Experience</h3>
          <p>Your professional journey</p>
        </div>
      </div>
      {formData.experience.map((exp, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeExperience(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => {
                  const newExp = [...formData.experience];
                  newExp[index] = { ...newExp[index], jobTitle: e.target.value };
                  updateField('experience', newExp);
                }}
                placeholder="Software Engineer"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => {
                  const newExp = [...formData.experience];
                  newExp[index] = { ...newExp[index], company: e.target.value };
                  updateField('experience', newExp);
                }}
                placeholder="Company Name"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => {
                  const newExp = [...formData.experience];
                  newExp[index] = { ...newExp[index], location: e.target.value };
                  updateField('experience', newExp);
                }}
                placeholder="City, Country"
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => {
                  const newExp = [...formData.experience];
                  newExp[index] = { ...newExp[index], duration: e.target.value };
                  updateField('experience', newExp);
                }}
                placeholder="Jan 2020 - Present"
              />
            </div>
            <div className="form-group full-width">
              <label>Responsibilities</label>
              <textarea
                value={exp.responsibility}
                onChange={(e) => {
                  const newExp = [...formData.experience];
                  newExp[index] = { ...newExp[index], responsibility: e.target.value };
                  updateField('experience', newExp);
                }}
                placeholder="Describe your key responsibilities and achievements..."
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addExperience}>
        + Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;
