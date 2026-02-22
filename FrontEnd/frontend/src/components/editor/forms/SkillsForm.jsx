import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const SkillsForm = () => {
  const { formData, updateField, addSkill, removeSkill } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon cyan">⚡</div>
        <div className="section-info">
          <h3>Skills</h3>
          <p>Your technical and soft skills (by category)</p>
        </div>
      </div>
      {formData.skills.map((skill, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeSkill(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={skill.title}
                onChange={(e) => {
                  const newSkills = [...formData.skills];
                  newSkills[index] = { ...newSkills[index], title: e.target.value };
                  updateField('skills', newSkills);
                }}
                placeholder="e.g., Languages, Frameworks, Tools"
              />
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                value={
                  skill.items
                    ? (Array.isArray(skill.items) ? skill.items.join(', ') : skill.items)
                    : (skill.level || '')
                }
                onChange={(e) => {
                  const newSkills = [...formData.skills];
                  newSkills[index] = {
                    ...newSkills[index],
                    items: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                    level: e.target.value
                  };
                  updateField('skills', newSkills);
                }}
                placeholder="e.g., Java, Python, JavaScript"
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addSkill}>
        + Add Skill Category
      </button>
    </div>
  );
};

export default SkillsForm;
