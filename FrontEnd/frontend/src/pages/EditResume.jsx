  import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Select, MenuItem, FormControl, InputLabel, CircularProgress, Snackbar, Alert, Stack, Paper, Container
} from '@mui/material';
import { 
  EditOutlined, EyeOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined, 
  SaveOutlined, ArrowLeftOutlined, MinusCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import ModernTemplate from '../components/templates/ModernTemplate';
import SectionHeader from '../components/SectionHeader';
import LatexEditor from '../components/LatexEditor';

const EditResume = () => {
  const [formData, setFormData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [latexOpen, setLatexOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const saveTimer = useRef(null);
  const templateRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load resume data from localStorage
    const storedResume = localStorage.getItem('generatedResume');
    console.log('Stored Resume from localStorage:', storedResume);
    
    if (storedResume) {
      try {
        let data = storedResume;
        // Handle double-stringified JSON in localStorage
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch {}
        }
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch {}
        }

        // Unwrap common wrappers if present (e.g., { data: {...} } or { result: {...} })
        const likelyKeys = ['personalInformation', 'summary', 'skills', 'experience'];
        if (data && typeof data === 'object' && !likelyKeys.some(k => k in data)) {
          const keys = Object.keys(data || {});
          if (keys.length === 1 && typeof data[keys[0]] === 'object') {
            data = data[keys[0]];
          } else {
            // Find first nested object that looks like the schema
            for (const val of Object.values(data)) {
              if (val && typeof val === 'object' && likelyKeys.some(k => k in val)) {
                data = val;
                break;
              }
            }
          }
        }

        console.log('Parsed/Unwrapped Resume Data:', data);
        setResumeData(data);
        
        // Transform projects technologiesUsed from array to string for form input
        const formProjects = (data.projects || []).map(project => ({
          title: project.title || '',
          description: project.description || '',
          technologiesUsed: Array.isArray(project.technologiesUsed) 
            ? project.technologiesUsed.join(', ') 
            : (project.technologiesUsed || ''),
          githubLink: project.githubLink || ''
        }));
        
        // Prepare form values
        const pi = data.personalInformation || data.personalInfo || {};
        const skillsRaw = Array.isArray(data.skills) ? data.skills : [];
        const expRaw = Array.isArray(data.experience) ? data.experience : [];
        const eduRaw = Array.isArray(data.education) ? data.education : [];
        const certRaw = Array.isArray(data.certifications) ? data.certifications : [];
        const achRaw = Array.isArray(data.achievements) ? data.achievements : [];
  const langRaw = Array.isArray(data.languages) ? data.languages : [];
  const interestsRaw = Array.isArray(data.interests) ? data.interests : [];

        const formValues = {
          fullName: pi.fullName || pi.name || '',
          email: pi.email || '',
          phoneNumber: pi.phoneNumber || pi.phone || '',
          location: pi.location || '',
          linkedIn: pi.linkedIn || pi.linkedin || '',
          gitHub: pi.gitHub || pi.github || '',
          portfolio: pi.portfolio || '',
          summary: data.summary || '',
          skills: skillsRaw.map(skill => (
            typeof skill === 'string'
              ? { title: skill, level: 'Intermediate' }
              : { title: skill.title || '', level: skill.level || 'Intermediate' }
          )),
          experience: expRaw.map(exp => ({
            jobTitle: exp.jobTitle || exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            duration: exp.duration || '',
            responsibility: exp.responsibility || exp.description || ''
          })),
          education: eduRaw.map(edu => ({
            degree: edu.degree || '',
            university: edu.university || edu.institution || '',
            location: edu.location || '',
            graduationYear: edu.graduationYear || edu.year || ''
          })),
          certifications: certRaw.map(cert => ({
            title: cert.title || '',
            issuingOrganization: cert.issuingOrganization || cert.organization || '',
            year: cert.year || ''
          })),
          projects: formProjects,
          achievements: achRaw.map(ach => ({
            title: ach.title || '',
            year: ach.year || ''
          })),
          languages: langRaw.map(lang => ({
            name: typeof lang === 'string' ? lang : (lang.name || '')
          })),
          interests: interestsRaw.map(int => (
            typeof int === 'string'
              ? { name: int }
              : { name: int.name || int.title || '' }
          )),
          extraInformation: data.extraInformation || '',
        };
        
        console.log('Setting Form Values:', formValues);
        setFormData(formValues);
        setLoading(false);
        
      } catch (error) {
        console.error('Error parsing resume data:', error);
  setSnack({ open: true, type: 'error', text: 'Error loading resume data. Please generate a new resume.' });
  setLoading(false);
  navigate('/generate');
      }
    } else {
  setSnack({ open: true, type: 'error', text: 'No resume data found. Please generate a resume first.' });
  setLoading(false);
  navigate('/generate');
    }
  }, [navigate]);

  const handleSave = () => {
    if (!formData) return;
    setSaving(true);
    // Transform projects technologiesUsed from string to array
    const savedProjects = formData.projects?.map(project => ({
      ...project,
      technologiesUsed: typeof project.technologiesUsed === 'string' 
        ? project.technologiesUsed.split(',').map(tech => tech.trim()).filter(Boolean)
        : project.technologiesUsed
    })) || [];
    
    const updatedResume = {
      personalInformation: {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        linkedIn: formData.linkedIn || null,
        gitHub: formData.gitHub || null,
        portfolio: formData.portfolio || null,
      },
      summary: formData.summary,
      skills: formData.skills || [],
      experience: formData.experience || [],
      education: formData.education || [],
      certifications: formData.certifications || [],
      projects: savedProjects,
      achievements: formData.achievements || [],
      languages: formData.languages?.map((lang, index) => ({
        id: index + 1,
        name: lang.name
      })) || [],
      interests: formData.interests?.map((it, index) => ({
        id: index + 1,
        name: it.name
      })) || [],
      extraInformation: formData.extraInformation || '',
    };
    
    setResumeData(updatedResume);
    localStorage.setItem('generatedResume', JSON.stringify(updatedResume));
    setLastSavedAt(new Date());
    setSaving(false);
    setSnack({ open: true, type: 'success', text: 'Resume updated successfully!' });
  };

  // Autosave on change (debounced)
  const handleFieldChange = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      handleSave();
    }, 800);
  };

  const downloadPDF = async () => {
    if (!resumeData) {
      setSnack({ open: true, type: 'error', text: 'No resume data available. Please save your changes first.' });
      console.error('No resumeData available for PDF generation');
      return;
    }

    try {
      setSnack({ open: true, type: 'info', text: 'Generating PDF... Please wait.' });
      
      // Create a temporary div to render the template
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Render the template into the temp div
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempDiv);
      
      await new Promise((resolve) => {
        root.render(<ModernTemplate data={resumeData} />);
        setTimeout(resolve, 500); // Wait for render
      });
      
      const element = tempDiv.querySelector('#resume-template');
      
      if (!element) {
        throw new Error('Resume template element not found');
      }

      const opt = {
        margin: [0.5, 0.6, 0.5, 0.6], // top, right, bottom, left in inches
        filename: `${resumeData.personalInformation?.fullName || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      // Cleanup
      root.unmount();
      document.body.removeChild(tempDiv);
      
      setSnack({ open: true, type: 'success', text: 'PDF downloaded successfully!' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnack({ open: true, type: 'error', text: 'Failed to generate PDF. Please try again.' });
    }
  };

  const renderPreview = () => {
    if (!resumeData) {
      console.log('No resumeData available for preview');
      return <div style={{ padding: '48px', textAlign: 'center' }}>
        <span style={{ color: '#6B7280' }}>No resume data available. Please save your changes first.</span>
      </div>;
    }

    console.log('Rendering preview with resumeData:', resumeData);

    return (
      <div style={{ background: 'white', padding: '48px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ marginBottom: '8px', color: '#1F2937', fontSize: '32px', fontWeight: 'bold' }}>
            {resumeData.personalInformation?.fullName}
          </h1>
          
          {/* Contact Info */}
          <div style={{ color: '#4B5563', fontSize: '14px', marginBottom: '4px' }}>
            {[
              resumeData.personalInformation?.email,
              resumeData.personalInformation?.phoneNumber,
              resumeData.personalInformation?.location
            ].filter(Boolean).join('  |  ')}
          </div>
          
          {/* Links */}
          <div style={{ color: '#4B5563', fontSize: '14px' }}>
            {[
              resumeData.personalInformation?.linkedIn,
              resumeData.personalInformation?.gitHub,
              resumeData.personalInformation?.portfolio
            ].filter(Boolean).join('  |  ')}
          </div>
        </div>

        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />

        {/* Professional Summary */}
        {resumeData.summary && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              PROFESSIONAL SUMMARY
            </h4>
            <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              SKILLS
            </h4>
            {(() => {
              const skillsByLevel = {};
              resumeData.skills.forEach(skill => {
                const level = skill.level || 'Other';
                if (!skillsByLevel[level]) skillsByLevel[level] = [];
                skillsByLevel[level].push(skill.title);
              });
              
              return Object.entries(skillsByLevel).map(([level, skills], idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  <strong>{level}:</strong> <span style={{ color: '#374151' }}>{skills.join(', ')}</span>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              PROFESSIONAL EXPERIENCE
            </h4>
            {resumeData.experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h5 style={{ color: '#4F46E5', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                  {exp.jobTitle}
                </h5>
                <div style={{ color: '#4B5563', fontSize: '13px', fontStyle: 'italic', marginBottom: '8px' }}>
                  {exp.company} | {exp.location} | {exp.duration}
                </div>
                <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: 0 }}>
                  {exp.responsibility}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              EDUCATION
            </h4>
            {resumeData.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <h5 style={{ color: '#4F46E5', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                  {edu.degree}
                </h5>
                <div style={{ color: '#4B5563', fontSize: '13px' }}>
                  {edu.university} | {edu.location} | {edu.graduationYear}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              PROJECTS
            </h4>
            {resumeData.projects.map((project, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h5 style={{ color: '#4F46E5', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                  {project.title}
                </h5>
                <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '4px', margin: 0 }}>
                  {project.description}
                </p>
                {project.technologiesUsed && project.technologiesUsed.length > 0 && (
                  <div style={{ color: '#4B5563', fontSize: '13px', fontStyle: 'italic' }}>
                    Technologies: {project.technologiesUsed.join(', ')}
                  </div>
                )}
                {project.githubLink && (
                  <div style={{ color: '#2563EB', fontSize: '13px', marginTop: '4px' }}>
                    GitHub: <a href={project.githubLink} target="_blank" rel="noreferrer">{project.githubLink}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              CERTIFICATIONS
            </h4>
            {resumeData.certifications.map((cert, index) => (
              <div key={index} style={{ color: '#374151', marginBottom: '6px' }}>
                {cert.title} - {cert.issuingOrganization} ({cert.year})
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {resumeData.languages && resumeData.languages.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              LANGUAGES
            </h4>
            <div style={{ color: '#374151' }}>
              {resumeData.languages.map(lang => lang.name).join(', ')}
            </div>
          </div>
        )}

        {/* Interests */}
        {resumeData.interests && resumeData.interests.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              INTERESTS
            </h4>
            <div style={{ color: '#374151' }}>
              {resumeData.interests.map(i => i.name || i.title).filter(Boolean).join(', ')}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 6, px: 3 }}>
      <Container maxWidth="xl">
        {/* Loading State */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 3, color: '#6B7280' }}>
              Loading your resume data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ 
              position: 'sticky', 
              top: 72, 
              zIndex: 5, 
              bgcolor: '#F9FAFB', 
              pb: 1.5, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid #E5E7EB' 
            }}>
              <Box>
                <Button 
                  startIcon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/generate')}
                  sx={{ mb: 2 }}
                >
                  Back to Generator
                </Button>
                <Typography variant="h4" sx={{ m: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditOutlined /> Edit Your Resume
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.75 }}>
                  {saving ? 'Saving…' : lastSavedAt ? `Saved • ${lastSavedAt.toLocaleTimeString()}` : 'Changes auto-save'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  startIcon={<EyeOutlined />} 
                  size="large"
                  onClick={() => setPreviewVisible(true)}
                  disabled={!resumeData}
                >
                  Preview
                </Button>
                <Button 
                  startIcon={<SaveOutlined />} 
                  size="large"
                  onClick={() => setLatexOpen(true)}
                  disabled={!resumeData}
                >
                  Edit LaTeX
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<DownloadOutlined />} 
                  size="large"
                  onClick={downloadPDF}
                  disabled={!resumeData}
                >
                  Download PDF
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ p: 3.5 }}>
                  <Box component="form" noValidate>
                {/* Personal Information */}
                <SectionHeader title="Personal Information" subtitle="Add your contact details and profile links." />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData?.fullName || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        handleFieldChange();
                      }}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        handleFieldChange();
                      }}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData?.phoneNumber || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, phoneNumber: e.target.value });
                        handleFieldChange();
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData?.location || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        handleFieldChange();
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={formData?.linkedIn || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, linkedIn: e.target.value });
                        handleFieldChange();
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={formData?.gitHub || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, gitHub: e.target.value });
                        handleFieldChange();
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Portfolio"
                      value={formData?.portfolio || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, portfolio: e.target.value });
                        handleFieldChange();
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Professional Summary */}
                <SectionHeader title="Professional Summary" subtitle="A concise overview of your experience and strengths." />
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={formData?.summary || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, summary: e.target.value });
                    handleFieldChange();
                  }}
                  placeholder="3-4 sentence professional summary highlighting your experience and strengths"
                  size="small"
                />

                <Divider sx={{ my: 3 }} />

                {/* Skills */}
                <SectionHeader title="Skills" subtitle="List your technical and professional skills." />
                {(formData?.skills || []).map((skill, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={10}>
                      <TextField
                        fullWidth
                        placeholder="Skill (e.g., JavaScript, React, Node.js)"
                        value={skill.title || ''}
                        onChange={(e) => {
                          const newSkills = [...(formData?.skills || [])];
                          newSkills[index] = { ...newSkills[index], title: e.target.value };
                          setFormData({ ...formData, skills: newSkills });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newSkills = (formData?.skills || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, skills: newSkills });
                          handleFieldChange();
                        }}
                      >
                        <MinusCircleOutlined style={{ fontSize: 20 }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newSkills = [...(formData?.skills || []), { title: '' }];
                    setFormData({ ...formData, skills: newSkills });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Skill
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Experience */}
                <SectionHeader title="Professional Experience" subtitle="Add your roles, responsibilities, and accomplishments." />
                {(formData?.experience || []).map((exp, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: '#F9FAFB', p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          value={exp.jobTitle || ''}
                          onChange={(e) => {
                            const newExp = [...(formData?.experience || [])];
                            newExp[index] = { ...newExp[index], jobTitle: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const newExp = [...(formData?.experience || [])];
                            newExp[index] = { ...newExp[index], company: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const newExp = [...(formData?.experience || [])];
                            newExp[index] = { ...newExp[index], location: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Duration"
                          placeholder="Jan 2020 - Present"
                          value={exp.duration || ''}
                          onChange={(e) => {
                            const newExp = [...(formData?.experience || [])];
                            newExp[index] = { ...newExp[index], duration: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Responsibilities"
                          placeholder="Describe your responsibilities and achievements..."
                          value={exp.responsibility || ''}
                          onChange={(e) => {
                            const newExp = [...(formData?.experience || [])];
                            newExp[index] = { ...newExp[index], responsibility: e.target.value };
                            setFormData({ ...formData, experience: newExp });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlined />}
                      onClick={() => {
                        const newExp = (formData?.experience || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, experience: newExp });
                        handleFieldChange();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove Experience
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newExp = [...(formData?.experience || []), { jobTitle: '', company: '', location: '', duration: '', responsibility: '' }];
                    setFormData({ ...formData, experience: newExp });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Experience
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Education */}
                <SectionHeader title="Education" subtitle="Your academic qualifications." />
                {(formData?.education || []).map((edu, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: '#F9FAFB', p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Degree"
                          placeholder="Bachelor of Science in Computer Science"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const newEdu = [...(formData?.education || [])];
                            newEdu[index] = { ...newEdu[index], degree: e.target.value };
                            setFormData({ ...formData, education: newEdu });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="University"
                          placeholder="University Name"
                          value={edu.university || ''}
                          onChange={(e) => {
                            const newEdu = [...(formData?.education || [])];
                            newEdu[index] = { ...newEdu[index], university: e.target.value };
                            setFormData({ ...formData, education: newEdu });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          placeholder="City, Country"
                          value={edu.location || ''}
                          onChange={(e) => {
                            const newEdu = [...(formData?.education || [])];
                            newEdu[index] = { ...newEdu[index], location: e.target.value };
                            setFormData({ ...formData, education: newEdu });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Graduation Year"
                          placeholder="2020"
                          value={edu.graduationYear || ''}
                          onChange={(e) => {
                            const newEdu = [...(formData?.education || [])];
                            newEdu[index] = { ...newEdu[index], graduationYear: e.target.value };
                            setFormData({ ...formData, education: newEdu });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlined />}
                      onClick={() => {
                        const newEdu = (formData?.education || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, education: newEdu });
                        handleFieldChange();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove Education
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newEdu = [...(formData?.education || []), { degree: '', university: '', location: '', graduationYear: '' }];
                    setFormData({ ...formData, education: newEdu });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Education
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Projects */}
                <SectionHeader title="Projects" subtitle="Highlight key projects and technologies used." />
                {(formData?.projects || []).map((project, index) => (
                  <Card key={index} sx={{ mb: 2, bgcolor: '#F9FAFB', p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project Title"
                          placeholder="E-commerce Platform"
                          value={project.title || ''}
                          onChange={(e) => {
                            const newProjects = [...(formData?.projects || [])];
                            newProjects[index] = { ...newProjects[index], title: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Description"
                          placeholder="Describe the project..."
                          value={project.description || ''}
                          onChange={(e) => {
                            const newProjects = [...(formData?.projects || [])];
                            newProjects[index] = { ...newProjects[index], description: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Technologies (comma-separated)"
                          placeholder="React, Node.js, MongoDB"
                          value={project.technologiesUsed || ''}
                          onChange={(e) => {
                            const newProjects = [...(formData?.projects || [])];
                            newProjects[index] = { ...newProjects[index], technologiesUsed: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="GitHub Link"
                          placeholder="https://github.com/..."
                          value={project.githubLink || ''}
                          onChange={(e) => {
                            const newProjects = [...(formData?.projects || [])];
                            newProjects[index] = { ...newProjects[index], githubLink: e.target.value };
                            setFormData({ ...formData, projects: newProjects });
                            handleFieldChange();
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlined />}
                      onClick={() => {
                        const newProjects = (formData?.projects || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, projects: newProjects });
                        handleFieldChange();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove Project
                    </Button>
                  </Card>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newProjects = [...(formData?.projects || []), { title: '', description: '', technologiesUsed: '', githubLink: '' }];
                    setFormData({ ...formData, projects: newProjects });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Project
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Certifications */}
                <SectionHeader title="Certifications" subtitle="Add relevant certifications." />
                {(formData?.certifications || []).map((cert, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        placeholder="Certification Title"
                        value={cert.title || ''}
                        onChange={(e) => {
                          const newCerts = [...(formData?.certifications || [])];
                          newCerts[index] = { ...newCerts[index], title: e.target.value };
                          setFormData({ ...formData, certifications: newCerts });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        placeholder="Issuing Organization"
                        value={cert.issuingOrganization || ''}
                        onChange={(e) => {
                          const newCerts = [...(formData?.certifications || [])];
                          newCerts[index] = { ...newCerts[index], issuingOrganization: e.target.value };
                          setFormData({ ...formData, certifications: newCerts });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={10} sm={2}>
                      <TextField
                        fullWidth
                        placeholder="Year"
                        value={cert.year || ''}
                        onChange={(e) => {
                          const newCerts = [...(formData?.certifications || [])];
                          newCerts[index] = { ...newCerts[index], year: e.target.value };
                          setFormData({ ...formData, certifications: newCerts });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newCerts = (formData?.certifications || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, certifications: newCerts });
                          handleFieldChange();
                        }}
                      >
                        <MinusCircleOutlined style={{ fontSize: 20 }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newCerts = [...(formData?.certifications || []), { title: '', issuingOrganization: '', year: '' }];
                    setFormData({ ...formData, certifications: newCerts });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Certification
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Achievements */}
                <SectionHeader title="Achievements" subtitle="Awards and recognitions." />
                {(formData?.achievements || []).map((achievement, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={9}>
                      <TextField
                        fullWidth
                        placeholder="Achievement Title"
                        value={achievement.title || ''}
                        onChange={(e) => {
                          const newAchv = [...(formData?.achievements || [])];
                          newAchv[index] = { ...newAchv[index], title: e.target.value };
                          setFormData({ ...formData, achievements: newAchv });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={10} sm={2}>
                      <TextField
                        fullWidth
                        placeholder="Year"
                        value={achievement.year || ''}
                        onChange={(e) => {
                          const newAchv = [...(formData?.achievements || [])];
                          newAchv[index] = { ...newAchv[index], year: e.target.value };
                          setFormData({ ...formData, achievements: newAchv });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newAchv = (formData?.achievements || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, achievements: newAchv });
                          handleFieldChange();
                        }}
                      >
                        <MinusCircleOutlined style={{ fontSize: 20 }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newAchv = [...(formData?.achievements || []), { title: '', year: '' }];
                    setFormData({ ...formData, achievements: newAchv });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Achievement
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Languages */}
                <SectionHeader title="Languages" subtitle="Languages you speak." />
                {(formData?.languages || []).map((language, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={10} sm={11}>
                      <TextField
                        fullWidth
                        placeholder="Language Name (e.g., English)"
                        value={language.name || ''}
                        onChange={(e) => {
                          const newLang = [...(formData?.languages || [])];
                          newLang[index] = { ...newLang[index], name: e.target.value };
                          setFormData({ ...formData, languages: newLang });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newLang = (formData?.languages || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, languages: newLang });
                          handleFieldChange();
                        }}
                      >
                        <MinusCircleOutlined style={{ fontSize: 20 }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newLang = [...(formData?.languages || []), { name: '' }];
                    setFormData({ ...formData, languages: newLang });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Language
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Interests */}
                <SectionHeader title="Interests" subtitle="Your professional interests." />
                {(formData?.interests || []).map((interest, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={10} sm={11}>
                      <TextField
                        fullWidth
                        placeholder="Interest (e.g., Open Source, UI/UX)"
                        value={interest.name || ''}
                        onChange={(e) => {
                          const newInt = [...(formData?.interests || [])];
                          newInt[index] = { ...newInt[index], name: e.target.value };
                          setFormData({ ...formData, interests: newInt });
                          handleFieldChange();
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newInt = (formData?.interests || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, interests: newInt });
                          handleFieldChange();
                        }}
                      >
                        <MinusCircleOutlined style={{ fontSize: 20 }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => {
                    const newInt = [...(formData?.interests || []), { name: '' }];
                    setFormData({ ...formData, interests: newInt });
                  }}
                  sx={{ mb: 3 }}
                >
                  Add Interest
                </Button>

                <Divider sx={{ my: 3 }} />

                {/* Extra Information */}
                <SectionHeader title="Additional Information" subtitle="Anything else you'd like to include." />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Any additional information you'd like to include..."
                  value={formData?.extraInformation || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, extraInformation: e.target.value });
                    handleFieldChange();
                  }}
                  size="small"
                />

                <Divider sx={{ my: 3 }} />

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" startIcon={<SaveOutlined />} size="large" onClick={handleSave}>
                    Save All Changes
                  </Button>
                  <Button size="large" onClick={() => setPreviewVisible(true)}>
                    Preview Resume
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Live Preview</Typography>
              {renderPreview()}
            </Card>
          </Grid>
        </Grid>
          </>
        )}
      </Container>

  <LatexEditor open={latexOpen} onClose={() => setLatexOpen(false)} resumeData={resumeData} templateType={localStorage.getItem('selectedTemplate') || 'professional'} />

      {/* Preview Dialog */}
      <Dialog
        open={previewVisible}
        onClose={() => setPreviewVisible(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resume Preview</DialogTitle>
        <DialogContent>
          {renderPreview()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<DownloadOutlined />} onClick={downloadPDF}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.type} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditResume;
