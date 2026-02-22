import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const AchievementsForm = () => {
  const { formData, updateField, addAchievement, removeAchievement } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon purple">🏆</div>
        <div className="section-info">
          <h3>Achievements</h3>
          <p>Key accomplishments and awards</p>
        </div>
      </div>
      {formData.achievements.map((ach, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeAchievement(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Achievement Title</label>
              <input
                type="text"
                value={ach.title}
                onChange={(e) => {
                  const newAch = [...formData.achievements];
                  newAch[index] = { ...newAch[index], title: e.target.value };
                  updateField('achievements', newAch);
                }}
                placeholder="Hackathon Winner"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="text"
                value={ach.year}
                onChange={(e) => {
                  const newAch = [...formData.achievements];
                  newAch[index] = { ...newAch[index], year: e.target.value };
                  updateField('achievements', newAch);
                }}
                placeholder="2023"
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addAchievement}>
        + Add Achievement
      </button>
    </div>
  );
};

export default AchievementsForm;
