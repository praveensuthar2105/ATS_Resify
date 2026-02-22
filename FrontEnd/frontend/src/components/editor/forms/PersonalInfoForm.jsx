import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const PersonalInfoForm = () => {
  const { formData, updateField } = useResume();

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
      </div>
    </div>
  );
};

export default PersonalInfoForm;
