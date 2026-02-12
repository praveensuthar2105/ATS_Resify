import React from 'react';
import './ModernTemplate.css';

const ModernTemplate = ({ data }) => {
  const pi = data?.personalInformation || {};
  
  // Normalize skills from any format into a consistent array
  const normalizeSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    // Categorized object: { languages: [...], frameworks: [...], ... }
    if (typeof skills === 'object') {
      const result = [];
      Object.entries(skills).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          result.push({ title: categoryName, items: items });
        }
      });
      return result;
    }
    return [];
  };
  
  const normalizedSkills = normalizeSkills(data?.skills);
  
  // Helper to parse bullet points from responsibility text
  const parseBulletPoints = (text) => {
    if (!text) return [];
    // Split by newlines, then strip leading bullet markers (•, -, –, —) from each line
    const points = text
      .split(/\n/)
      .map(line => line.replace(/^\s*[•\-–—]\s*/, '').trim())
      .filter(p => p.length > 0);
    return points;
  };

  return (
    <div className="modern-template" id="resume-template">
      {/* Header - Centered Name with Contact Info */}
      <div className="resume-header">
        <h1 className="name">{pi.fullName || 'Your Name'}</h1>
        <div className="contact-line">
          {pi.phoneNumber && <span>{pi.phoneNumber}</span>}
          {pi.email && <span>{pi.email}</span>}
          {pi.linkedIn && (
            <span>
              <a href={pi.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </span>
          )}
          {pi.gitHub && (
            <span>
              <a href={pi.gitHub} target="_blank" rel="noopener noreferrer">GitHub</a>
            </span>
          )}
          {pi.portfolio && (
            <span>
              <a href={pi.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>
            </span>
          )}
          {pi.location && <span>{pi.location}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {data?.summary && (
        <div className="resume-section">
          <h2 className="section-title">Summary</h2>
          <div className="section-content">
            <p>{data.summary}</p>
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
                <div className="edu-row">
                  <div className="edu-left">
                    <span className="university">{edu.university}</span>
                    {edu.location && <span className="edu-location">, {edu.location}</span>}
                  </div>
                  <div className="edu-right">
                    <span className="year">{edu.graduationYear}</span>
                  </div>
                </div>
                <div className="edu-row">
                  <div className="edu-left">
                    <span className="degree">{edu.degree}</span>
                    {edu.gpa && <span className="gpa"> | GPA: {edu.gpa}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data?.experience && data.experience.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Experience</h2>
          <div className="section-content">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <div className="exp-row">
                  <div className="exp-left">
                    <span className="company">{exp.company}</span>
                    {exp.location && <span className="exp-location">, {exp.location}</span>}
                  </div>
                  <div className="exp-right">
                    <span className="duration">{exp.duration}</span>
                  </div>
                </div>
                <div className="exp-row">
                  <div className="exp-left">
                    <span className="job-title">{exp.jobTitle}</span>
                  </div>
                </div>
                {(() => {
                  const points = parseBulletPoints(exp.responsibility);
                  return points.length > 0 && (
                    <ul className="bullet-list">
                      {points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  );
                })()}
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
                <div className="project-row">
                  <div className="project-left">
                    <span className="project-title">{project.title}</span>
                    {project.technologiesUsed && (
                      <span className="project-tech">
                        {' | '}
                        {Array.isArray(project.technologiesUsed) 
                          ? project.technologiesUsed.join(', ') 
                          : project.technologiesUsed}
                      </span>
                    )}
                  </div>
                  {(project.githubLink || project.liveLink) && (
                    <div className="project-right">
                      {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer">GitHub</a>}
                      {project.githubLink && project.liveLink && ' | '}
                      {project.liveLink && <a href={project.liveLink} target="_blank" rel="noopener noreferrer">Live</a>}
                    </div>
                  )}
                </div>
                {(() => {
                  const points = parseBulletPoints(project.description);
                  return points.length > 0 && (
                    <ul className="bullet-list">
                      {points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Skills */}
      {normalizedSkills.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Technical Skills</h2>
          <div className="section-content">
            <div className="skills-list">
              {normalizedSkills.map((skill, idx) => (
                <div key={idx} className="skill-row">
                  <span className="skill-category">{skill.title || skill.category || 'Skills'}:</span>
                  <span className="skill-items">
                    {skill.items ? (
                      Array.isArray(skill.items) ? skill.items.join(', ') : skill.items
                    ) : (
                      skill.level || ''
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Certifications */}
      {data?.certifications && data.certifications.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Certifications</h2>
          <div className="section-content">
            <ul className="bullet-list">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>
                  <strong>{cert.title}</strong>
                  {cert.issuingOrganization && <span> - {cert.issuingOrganization}</span>}
                  {cert.year && <span> ({cert.year})</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Achievements */}
      {data?.achievements && data.achievements.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Achievements</h2>
          <div className="section-content">
            <ul className="bullet-list">
              {data.achievements.map((ach, idx) => (
                <li key={idx}>
                  {typeof ach === 'string' ? ach : (
                    <>
                      <strong>{ach.title}</strong>
                      {ach.description && <span>: {ach.description}</span>}
                      {ach.year && <span> ({ach.year})</span>}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Languages */}
      {data?.languages && data.languages.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Languages</h2>
          <div className="section-content">
            <p className="languages-inline">
              {data.languages.map((lang, idx) => (
                <span key={idx}>
                  {typeof lang === 'string' ? lang : lang.name}
                  {idx < data.languages.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;
