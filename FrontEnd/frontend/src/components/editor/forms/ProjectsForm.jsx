import React from 'react';
import { useResume } from '../../../context/ResumeContext';

const ProjectsForm = () => {
  const { formData, updateField, addProject, removeProject } = useResume();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-icon green">📁</div>
        <div className="section-info">
          <h3>Projects</h3>
          <p>Showcase your technical work</p>
        </div>
      </div>
      {formData.projects.map((project, index) => (
        <div key={index} className="repeater-item">
          <button className="delete-btn" onClick={() => removeProject(index)}>✕</button>
          <div className="form-grid">
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => {
                  const newProjects = [...formData.projects];
                  newProjects[index] = { ...newProjects[index], title: e.target.value };
                  updateField('projects', newProjects);
                }}
                placeholder="Project Name"
              />
            </div>
            <div className="form-group">
              <label>Technologies</label>
              <input
                type="text"
                value={project.technologiesUsed}
                onChange={(e) => {
                  const newProjects = [...formData.projects];
                  newProjects[index] = { ...newProjects[index], technologiesUsed: e.target.value };
                  updateField('projects', newProjects);
                }}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...formData.projects];
                  newProjects[index] = { ...newProjects[index], description: e.target.value };
                  updateField('projects', newProjects);
                }}
                placeholder="Describe what you built and the impact it made..."
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={addProject}>
        + Add Project
      </button>
    </div>
  );
};

export default ProjectsForm;
