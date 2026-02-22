import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const SummaryForm = () => {
  const { formData, updateField } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon purple">📝</div>
        <div className="section-info">
          <h3>Professional Summary</h3>
          <p>A concise overview of your impact</p>
        </div>
      </div>
      <div className="form-group full-width">
        <textarea
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
          rows={5}
        />
      </div>
    </div>
  );
};

export default SummaryForm;
