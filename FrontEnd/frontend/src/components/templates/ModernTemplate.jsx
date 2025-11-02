import React from 'react';
import './ModernTemplate.css';

const ModernTemplate = ({ data }) => {
  const pi = data?.personalInformation || {};
  
  return (
    <div className="modern-template" id="resume-template">
      {/* Header */}
      <div className="resume-header">
        <h1 className="name">{pi.fullName || 'Your Name'}</h1>
        <div className="contact-info">
          {pi.email && <span>{pi.email}</span>}
          {pi.phoneNumber && <span>{pi.phoneNumber}</span>}
          {pi.location && <span>{pi.location}</span>}
        </div>
        <div className="links">
          {pi.linkedIn && <a href={pi.linkedIn}>{pi.linkedIn.replace('https://', '')}</a>}
          {pi.gitHub && <a href={pi.gitHub}>{pi.gitHub.replace('https://', '')}</a>}
          {pi.portfolio && <a href={pi.portfolio}>{pi.portfolio.replace('https://', '')}</a>}
        </div>
      </div>

      {/* Professional Summary */}
      {data?.summary && (
        <div className="resume-section">
          <h2 className="section-title">Professional Summary</h2>
          <div className="section-content">
            <p>{data.summary}</p>
          </div>
        </div>
      )}

      {/* Skills */}
      {data?.skills && data.skills.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Skills</h2>
          <div className="section-content">
            <div className="skills-grid">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="skill-item">
                  <strong>{skill.title}</strong>
                  {skill.level && <span className="skill-level"> - {skill.level}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {data?.experience && data.experience.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Professional Experience</h2>
          <div className="section-content">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <div className="exp-header">
                  <h3 className="job-title">{exp.jobTitle}</h3>
                  <span className="duration">{exp.duration}</span>
                </div>
                <div className="exp-company">
                  <span className="company">{exp.company}</span>
                  {exp.location && <span className="location"> • {exp.location}</span>}
                </div>
                {exp.responsibility && (
                  <div className="exp-description">
                    <p>{exp.responsibility}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data?.projects && data.projects.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Projects</h2>
          <div className="section-content">
            {data.projects.map((project, idx) => (
              <div key={idx} className="project-item">
                <h3 className="project-title">{project.title}</h3>
                {project.description && <p className="project-desc">{project.description}</p>}
                {project.technologiesUsed && (
                  <p className="project-tech">
                    <strong>Technologies:</strong> {
                      Array.isArray(project.technologiesUsed) 
                        ? project.technologiesUsed.join(', ') 
                        : project.technologiesUsed
                    }
                  </p>
                )}
                {project.githubLink && (
                  <p className="project-link">
                    <strong>GitHub:</strong> <a href={project.githubLink}>{project.githubLink}</a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data?.education && data.education.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Education</h2>
          <div className="section-content">
            {data.education.map((edu, idx) => (
              <div key={idx} className="education-item">
                <div className="edu-header">
                  <h3 className="degree">{edu.degree}</h3>
                  <span className="year">{edu.graduationYear}</span>
                </div>
                <div className="university">{edu.university}</div>
                {edu.location && <div className="edu-location">{edu.location}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data?.certifications && data.certifications.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Certifications</h2>
          <div className="section-content">
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="cert-item">
                <strong>{cert.title}</strong>
                {cert.issuingOrganization && <span> - {cert.issuingOrganization}</span>}
                {cert.year && <span> ({cert.year})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {data?.achievements && data.achievements.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Achievements</h2>
          <div className="section-content">
            {data.achievements.map((ach, idx) => (
              <div key={idx} className="achievement-item">
                <strong>{ach.title}</strong>
                {ach.year && <span> ({ach.year})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data?.languages && data.languages.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Languages</h2>
          <div className="section-content">
            <div className="languages-list">
              {data.languages.map((lang, idx) => (
                <span key={idx} className="language-item">
                  {typeof lang === 'string' ? lang : lang.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;
