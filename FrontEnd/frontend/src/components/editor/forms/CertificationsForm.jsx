import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const CertificationsForm = () => {
  const { formData, updateField, addCertification, removeCertification } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon yellow">🏆</div>
        <div className="section-info">
          <h3>Certifications</h3>
          <p>Professional certifications and courses</p>
        </div>
      </div>
      {formData.certifications.map((cert, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeCertification(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Certification Name</label>
              <input
                type="text"
                value={cert.title}
                onChange={(e) => {
                  const newCerts = [...formData.certifications];
                  newCerts[index] = { ...newCerts[index], title: e.target.value };
                  updateField('certifications', newCerts);
                }}
                placeholder="AWS Certified Developer"
              />
            </div>
            <div className="form-group">
              <label>Issuing Organization</label>
              <input
                type="text"
                value={cert.issuingOrganization}
                onChange={(e) => {
                  const newCerts = [...formData.certifications];
                  newCerts[index] = { ...newCerts[index], issuingOrganization: e.target.value };
                  updateField('certifications', newCerts);
                }}
                placeholder="Amazon Web Services"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="text"
                value={cert.year}
                onChange={(e) => {
                  const newCerts = [...formData.certifications];
                  newCerts[index] = { ...newCerts[index], year: e.target.value };
                  updateField('certifications', newCerts);
                }}
                placeholder="2024"
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addCertification}>
        + Add Certification
      </button>
    </div>
  );
};

export default CertificationsForm;
