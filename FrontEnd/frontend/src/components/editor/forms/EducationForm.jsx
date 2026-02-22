import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const EducationForm = () => {
  const { formData, updateField, addEducation, removeEducation } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon orange">🎓</div>
        <div className="section-info">
          <h3>Education</h3>
          <p>Your academic qualifications</p>
        </div>
      </div>
      {formData.education.map((edu, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeEducation(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => {
                  const newEdu = [...formData.education];
                  newEdu[index] = { ...newEdu[index], degree: e.target.value };
                  updateField('education', newEdu);
                }}
                placeholder="Bachelor of Technology"
              />
            </div>
            <div className="form-group">
              <label>University/Institution</label>
              <input
                type="text"
                value={edu.university}
                onChange={(e) => {
                  const newEdu = [...formData.education];
                  newEdu[index] = { ...newEdu[index], university: e.target.value };
                  updateField('education', newEdu);
                }}
                placeholder="University Name"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={edu.location}
                onChange={(e) => {
                  const newEdu = [...formData.education];
                  newEdu[index] = { ...newEdu[index], location: e.target.value };
                  updateField('education', newEdu);
                }}
                placeholder="City, Country"
              />
            </div>
            <div className="form-group">
              <label>Graduation Year</label>
              <input
                type="text"
                value={edu.graduationYear}
                onChange={(e) => {
                  const newEdu = [...formData.education];
                  newEdu[index] = { ...newEdu[index], graduationYear: e.target.value };
                  updateField('education', newEdu);
                }}
                placeholder="2024"
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addEducation}>
        + Add Education
      </button>
    </div>
  );
};

export default EducationForm;
