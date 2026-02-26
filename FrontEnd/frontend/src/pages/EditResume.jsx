import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import AgentChat from '../components/AgentChat';
import { decodeToken, getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../services/api';
import './EditResume.css';

const EditResume = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  // Edit mode: 'form' or 'latex'
  const [editMode, setEditMode] = useState('form');
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [zoom, setZoom] = useState(100);
  const saveTimer = useRef(null);

  // LaTeX & PDF state
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [autoCompile, setAutoCompile] = useState(true);
  const [useOnlineCompiler, setUseOnlineCompiler] = useState(false);
  const autoCompileTimer = useRef(null);

  // Monaco editor state
  const [monacoAvailable, setMonacoAvailable] = useState(false);
  const [MonacoEditor, setMonacoEditor] = useState(null);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    linkedIn: '',
    gitHub: '',
    portfolio: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
  });

  const [resumeData, setResumeData] = useState(null);

  // Normalize skills from any format into a consistent array
  // Backend may send: { languages: [...], frameworks: [...], ... } (categorized object)
  // Or: [{ title, level }] (array) or ['skill1', 'skill2'] (string array)
  const normalizeSkills = (skills) => {
    if (!skills) return [];

    // Already an array - return as-is
    if (Array.isArray(skills)) return skills;

    // Categorized object format: { languages: [...], frameworks: [...], tools: [...], ... }
    if (typeof skills === 'object') {
      const result = [];
      Object.entries(skills).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          // Create one entry per category with items joined
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          result.push({
            title: categoryName,
            level: 'Intermediate',
            items: items,
          });
        }
      });
      return result;
    }

    return [];
  };

  // Escape special LaTeX characters
  const escapeLatex = (str) => {
    if (!str) return '';
    const BACKSLASH_PLACEHOLDER = '\x00BACKSLASH\x00';
    return String(str)
      .replace(/\\/g, BACKSLASH_PLACEHOLDER)
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(new RegExp(BACKSLASH_PLACEHOLDER, 'g'), '\\textbackslash{}');
  };

  // Generate LaTeX from resume data
  const generateLatexFromData = useCallback((data) => {
    const pi = data?.personalInformation || {};
    const name = escapeLatex(pi.fullName || 'Your Name');
    const email = escapeLatex(pi.email || 'email@example.com');
    const phone = escapeLatex(pi.phoneNumber || '+1 234 567 8900');
    const location = escapeLatex(pi.location || '');
    const linkedin = pi.linkedIn ? escapeLatex(pi.linkedIn) : '';
    const github = pi.gitHub ? escapeLatex(pi.gitHub) : '';
    const portfolio = pi.portfolio ? escapeLatex(pi.portfolio) : '';

    let contactParts = [];
    if (phone) contactParts.push(phone);
    if (email) contactParts.push(email);
    if (linkedin) contactParts.push(`\\href{${linkedin}}{LinkedIn}`);
    if (github) contactParts.push(`\\href{${github}}{GitHub}`);
    if (portfolio) contactParts.push(`\\href{${portfolio}}{Portfolio}`);
    if (location) contactParts.push(location);
    const contactLine = contactParts.length > 0 ? contactParts.join(' $|$ ') : '';

    // Summary section
    let summarySection = '';
    if (data?.summary && data.summary.trim()) {
      summarySection = `\\section*{Summary}\n${escapeLatex(data.summary)}`;
    }

    // Education section
    let educationSection = '';
    if (data?.education && data.education.length > 0) {
      const eduItems = data.education.map(edu => {
        const university = escapeLatex(edu.university || edu.institution || '');
        const eduLocation = escapeLatex(edu.location || '');
        const degree = escapeLatex(edu.degree || '');
        const year = escapeLatex(edu.graduationYear || edu.endDate || '');
        if (!university && !degree) return null;
        return `\\textbf{${university || 'University'}}${eduLocation ? `, ${eduLocation}` : ''} \\hfill ${year}\n\n\\textit{${degree || 'Degree'}}`;
      }).filter(Boolean).join('\n\n');
      if (eduItems) educationSection = `\\section*{Education}\n${eduItems}`;
    }

    // Experience section
    let experienceSection = '';
    if (data?.experience && data.experience.length > 0) {
      const expItems = data.experience.map(exp => {
        const company = escapeLatex(exp.company || '');
        const expLocation = escapeLatex(exp.location || '');
        const title = escapeLatex(exp.jobTitle || exp.title || '');
        const duration = escapeLatex(exp.duration || '');
        if (!company && !title) return null;

        let bullets = '';
        if (exp.responsibility) {
          // Split on newlines, or bullet points (• or - at start of line)
          const respList = exp.responsibility
            .split(/\n+/)
            .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
            .filter(r => r.length > 5);
          if (respList.length > 0) {
            bullets = `\\begin{itemize}\n${respList.map(r => `\\item ${escapeLatex(r)}`).join('\n')}\n\\end{itemize}`;
          }
        }
        return `\\textbf{${company || 'Company'}}${expLocation ? `, ${expLocation}` : ''} \\hfill ${duration}\n\n\\textit{${title || 'Position'}}\n${bullets}`;
      }).filter(Boolean).join('\n\n');
      if (expItems) experienceSection = `\\section*{Experience}\n${expItems}`;
    }

    // Projects section - limit to 3 bullet points per project
    let projectsSection = '';
    if (data?.projects && data.projects.length > 0) {
      const projItems = data.projects.map(proj => {
        const title = escapeLatex(proj.title || '');
        if (!title) return null;
        const tech = proj.technologiesUsed
          ? escapeLatex(Array.isArray(proj.technologiesUsed) ? proj.technologiesUsed.join(', ') : proj.technologiesUsed)
          : '';
        let headerLine = `\\textbf{${title}}`;
        if (tech) headerLine += ` $|$ \\textit{${tech}}`;

        let bullets = '';
        if (proj.description) {
          // Split on newlines, then remove leading bullet markers (• or - or *)
          const descList = proj.description
            .split(/\n+/)
            .map(d => d.replace(/^[•\-\*]\s*/, '').trim())
            .filter(d => d.length > 5);
          // Limit to maximum 3 bullet points
          const limitedDescList = descList.slice(0, 3);
          if (limitedDescList.length > 0) {
            bullets = `\\begin{itemize}\n${limitedDescList.map(d => `\\item ${escapeLatex(d)}`).join('\n')}\n\\end{itemize}`;
          }
        }
        return `${headerLine}\n${bullets}`;
      }).filter(Boolean).join('\n\n');
      if (projItems) projectsSection = `\\section*{Projects}\n${projItems}`;
    }

    // Skills section
    let skillsSection = '';
    const normalizedSkills = normalizeSkills(data?.skills);
    if (normalizedSkills.length > 0) {
      const skillLines = normalizedSkills.map(s => {
        if (typeof s === 'string') {
          const escaped = escapeLatex(s);
          return escaped ? `\\textbf{Skills:} ${escaped}` : null;
        }
        const category = escapeLatex(s.title || s.category || 'Skills');
        let items = '';
        if (s.items && Array.isArray(s.items) && s.items.length > 0) {
          items = escapeLatex(s.items.join(', '));
        } else if (s.items && typeof s.items === 'string') {
          items = escapeLatex(s.items);
        }
        // Skip if no actual skill items
        if (!items) return null;
        return `\\textbf{${category}:} ${items}`;
      }).filter(Boolean);
      if (skillLines.length > 0) {
        skillsSection = `\\section*{Technical Skills}\n${skillLines.join(' \\\\\n')}`;
      }
    }

    // Certifications section
    let certificationsSection = '';
    if (data?.certifications && data.certifications.length > 0) {
      const certItems = data.certifications.map(cert => {
        const title = escapeLatex(cert.title || '');
        if (!title) return null;
        const org = cert.issuingOrganization ? escapeLatex(cert.issuingOrganization) : '';
        const year = cert.year ? ` (${escapeLatex(cert.year)})` : '';
        return `\\item ${title}${org ? ` -- ${org}` : ''}${year}`;
      }).filter(Boolean).join('\n');
      if (certItems) certificationsSection = `\\section*{Certifications}\n\\begin{itemize}\n${certItems}\n\\end{itemize}`;
    }

    // Achievements section
    let achievementsSection = '';
    if (data?.achievements && data.achievements.length > 0) {
      const achItems = data.achievements.map(ach => {
        const title = escapeLatex(ach.title || '');
        if (!title) return null;
        const year = ach.year ? ` (${escapeLatex(ach.year)})` : '';
        return `\\item ${title}${year}`;
      }).filter(Boolean).join('\n');
      if (achItems) achievementsSection = `\\section*{Achievements}\n\\begin{itemize}\n${achItems}\n\\end{itemize}`;
    }

    // Build document sections in order
    const sections = [
      summarySection,
      educationSection,
      experienceSection,
      projectsSection,
      skillsSection,
      certificationsSection,
      achievementsSection
    ].filter(Boolean).join('\n\n');

    return `\\documentclass[10pt,letterpaper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[top=0.4in,bottom=0.4in,left=0.5in,right=0.5in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\titleformat{\\section}{\\normalsize\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

\\setlist[itemize]{leftmargin=0.15in, topsep=2pt, itemsep=1pt, parsep=0pt}

\\begin{document}

\\begin{center}
{\\Large \\textbf{\\uppercase{${name}}}}

\\vspace{2pt}
${contactLine}
\\end{center}

${sections}

\\end{document}`;
  }, []);

  // Compile LaTeX to PDF (local backend)
  const compileLocal = useCallback(async (latex) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const resp = await fetch(`${API_BASE_URL}/latex/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ latexCode: latex })
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const contentType = resp.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          return await resp.blob();
        } else {
          const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.message || errorData.error || 'Compilation failed');
        }
      } else {
        const errorData = await resp.json().catch(() => ({ error: 'Compilation failed' }));
        throw new Error(errorData.message || errorData.error || 'Compilation failed');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new Error('Compilation timeout (60s)');
      }
      throw e;
    }
  }, []);

  // Compile LaTeX to PDF (online fallback)
  const compileOnline = useCallback(async (latex) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const resp = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ main: true, content: latex }]
        })
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const blob = await resp.blob();
        if (blob.type === 'application/pdf') {
          return blob;
        } else {
          const text = await blob.text();
          throw new Error('Online compilation failed: ' + text.substring(0, 200));
        }
      } else {
        throw new Error('Online compilation service unavailable');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new Error('Online compilation timeout (60s)');
      }
      throw e;
    }
  }, []);

  // Main compile function - tries local first, auto-fallback to online on failure
  const compileToPdf = useCallback(async (latex) => {
    if (!latex) return;
    setCompiling(true);
    setCompileError(null);

    try {
      // Try local compiler first
      const blob = await compileLocal(latex);
      setPdfBlob(blob);
      setPdfUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setUseOnlineCompiler(false);
    } catch (localError) {
      console.warn('Local compile failed, trying online:', localError.message);

      // Auto-fallback to online compiler
      try {
        const blob = await compileOnline(latex);
        setPdfBlob(blob);
        setPdfUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setUseOnlineCompiler(true);
        setSnack({ open: true, type: 'info', text: 'Using online compiler (local unavailable)' });
      } catch (onlineError) {
        console.error('Online compile also failed:', onlineError);
        setCompileError(`Local: ${localError.message}\nOnline: ${onlineError.message}`);
      }
    } finally {
      setCompiling(false);
    }
  }, [compileLocal, compileOnline]);

  // Load Monaco editor dynamically
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@monaco-editor/react');
        if (!cancelled) {
          setMonacoEditor(() => mod.default || mod.Editor);
          setMonacoAvailable(true);
        }
      } catch (err) {
        console.warn('Monaco not available:', err);
        setMonacoAvailable(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load resume data from localStorage
  useEffect(() => {
    const storedResume = localStorage.getItem('generatedResume');

    if (storedResume) {
      try {
        let data = storedResume;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch { }
        }
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch { }
        }

        const likelyKeys = ['personalInformation', 'summary', 'skills', 'experience'];
        if (data && typeof data === 'object' && !likelyKeys.some(k => k in data)) {
          const keys = Object.keys(data || {});
          if (keys.length === 1 && typeof data[keys[0]] === 'object') {
            data = data[keys[0]];
          } else {
            for (const val of Object.values(data)) {
              if (val && typeof val === 'object' && likelyKeys.some(k => k in val)) {
                data = val;
                break;
              }
            }
          }
        }

        setResumeData(data);

        const formProjects = (data.projects || []).map(project => ({
          title: project.title || '',
          description: project.description || '',
          technologiesUsed: Array.isArray(project.technologiesUsed)
            ? project.technologiesUsed.join(', ')
            : (project.technologiesUsed || ''),
          githubLink: project.githubLink || ''
        }));

        const pi = data.personalInformation || data.personalInfo || {};
        const skillsRaw = normalizeSkills(data.skills);
        const expRaw = Array.isArray(data.experience) ? data.experience : [];
        const eduRaw = Array.isArray(data.education) ? data.education : [];
        const certRaw = Array.isArray(data.certifications) ? data.certifications : [];
        const achRaw = Array.isArray(data.achievements) ? data.achievements : [];
        const langRaw = Array.isArray(data.languages) ? data.languages : [];
        const interestsRaw = Array.isArray(data.interests) ? data.interests : [];

        setFormData({
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
              ? { title: 'Skills', level: 'Intermediate', items: [skill] }
              : {
                title: skill.title || skill.category || '',
                level: skill.level || 'Intermediate',
                items: skill.items || null,
              }
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
        });

        setLoading(false);
      } catch (error) {
        console.error('Error parsing resume data:', error);
        setSnack({ open: true, type: 'error', text: 'Error loading resume data.' });
        setLoading(false);
        navigate('/generate');
      }
    } else {
      setSnack({ open: true, type: 'error', text: 'No resume data found. Please generate a resume first.' });
      setLoading(false);
      navigate('/generate');
    }
  }, [navigate]);

  // Generate LaTeX when resumeData changes and compile to PDF
  useEffect(() => {
    if (!resumeData) return;
    if (editMode === 'latex') return; // Prevent overwriting manual LaTeX edits

    const latex = generateLatexFromData(resumeData);
    setLatexCode(latex);

    // Auto-compile if enabled
    if (autoCompile && latex) {
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      autoCompileTimer.current = setTimeout(() => {
        compileToPdf(latex);
      }, 1000);
    }
  }, [resumeData, generateLatexFromData, autoCompile, compileToPdf, editMode]);

  // Handle LaTeX code changes (when in latex edit mode)
  const handleLatexChange = useCallback((value) => {
    setLatexCode(value || '');

    // Auto-sync back to form data
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      import('../utils/latexParser').then(({ parseLatexToResumeData }) => {
        const parsed = parseLatexToResumeData(value || '');
        if (parsed) {
          setResumeData(parsed);

          const pi = parsed.personalInformation || {};
          const skillsRaw = Array.isArray(parsed.skills) ? parsed.skills : [];
          const expRaw = Array.isArray(parsed.experience) ? parsed.experience : [];
          const eduRaw = Array.isArray(parsed.education) ? parsed.education : [];
          const certRaw = Array.isArray(parsed.certifications) ? parsed.certifications : [];
          const achRaw = Array.isArray(parsed.achievements) ? parsed.achievements : [];
          const langRaw = Array.isArray(parsed.languages) ? parsed.languages : [];
          const interestsRaw = Array.isArray(parsed.interests) ? parsed.interests : [];

          setFormData(prev => ({
            ...prev,
            fullName: pi.fullName || prev.fullName,
            email: pi.email || prev.email,
            phoneNumber: pi.phoneNumber || prev.phoneNumber,
            location: pi.location || prev.location,
            linkedIn: pi.linkedIn || prev.linkedIn,
            gitHub: pi.gitHub || prev.gitHub,
            portfolio: pi.portfolio || prev.portfolio,
            summary: parsed.summary || prev.summary,
            skills: skillsRaw.length > 0 ? skillsRaw.map(skill => (
              typeof skill === 'string'
                ? { title: 'Skills', level: 'Intermediate', items: [skill] }
                : {
                  title: skill.title || skill.category || '',
                  level: skill.level || 'Intermediate',
                  items: skill.items || null,
                }
            )) : prev.skills,
            experience: expRaw.length > 0 ? expRaw.map(exp => ({
              jobTitle: exp.jobTitle || exp.title || '',
              company: exp.company || '',
              location: exp.location || '',
              duration: exp.duration || '',
              responsibility: exp.responsibility || exp.description || ''
            })) : prev.experience,
            education: eduRaw.length > 0 ? eduRaw.map(edu => ({
              degree: edu.degree || '',
              university: edu.university || edu.institution || '',
              location: edu.location || '',
              graduationYear: edu.graduationYear || edu.year || ''
            })) : prev.education,
            certifications: certRaw.length > 0 ? certRaw.map(cert => ({
              title: cert.title || '',
              issuingOrganization: cert.issuingOrganization || cert.organization || '',
              year: cert.year || ''
            })) : prev.certifications,
            projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects.map(project => ({
              title: project.title || '',
              description: project.description || '',
              technologiesUsed: Array.isArray(project.technologiesUsed)
                ? project.technologiesUsed.join(', ')
                : (project.technologiesUsed || ''),
              githubLink: project.githubLink || ''
            })) : prev.projects,
            achievements: achRaw.length > 0 ? achRaw.map(ach => ({
              title: ach.title || '',
              year: ach.year || ''
            })) : prev.achievements,
          }));
        }
      }).catch(err => console.error('Failed to load latex parser:', err));
    }, 1500);

    // Auto-compile with debounce
    if (autoCompile) {
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      autoCompileTimer.current = setTimeout(() => {
        compileToPdf(value || '');
      }, 2000);
    }
  }, [autoCompile, compileToPdf]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleSave = () => {
    setSaving(true);

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
      skills: formData.skills?.map(s => ({
        title: s.title || '',
        level: s.level || 'Intermediate',
        items: s.items || null,
      })) || [],
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
    };

    setResumeData(updatedResume);
    localStorage.setItem('generatedResume', JSON.stringify(updatedResume));
    setLastSavedAt(new Date());
    setSaving(false);
    setSnack({ open: true, type: 'success', text: 'Resume saved!' });
  };

  const handleFieldChange = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      handleSave();
    }, 1000);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleFieldChange();
  };

  const downloadPDF = async () => {
    if (pdfBlob) {
      // Use the already compiled PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.fullName || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSnack({ open: true, type: 'success', text: 'PDF downloaded!' });
    } else if (latexCode) {
      // Compile first then download
      setSnack({ open: true, type: 'info', text: 'Compiling PDF...' });
      try {
        const blob = useOnlineCompiler ? await compileOnline(latexCode) : await compileLocal(latexCode);
        setPdfBlob(blob);
        setPdfUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${formData.fullName || 'Resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
        setSnack({ open: true, type: 'success', text: 'PDF downloaded!' });
      } catch (error) {
        console.error('PDF error:', error);
        setSnack({ open: true, type: 'error', text: 'Failed to compile PDF: ' + error.message });
      }
    } else {
      setSnack({ open: true, type: 'error', text: 'No resume data. Please save your changes first.' });
    }
  };

  // Download LaTeX source file
  const downloadTex = () => {
    if (!latexCode) {
      setSnack({ open: true, type: 'error', text: 'No LaTeX code to download.' });
      return;
    }
    const blob = new Blob([latexCode], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.fullName || 'Resume'}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSnack({ open: true, type: 'success', text: 'LaTeX file downloaded!' });
  };

  // Manual compile trigger
  const handleManualCompile = () => {
    if (latexCode) {
      compileToPdf(latexCode);
    }
  };

  // Add/Remove handlers for repeater sections
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', university: '', location: '', graduationYear: '' }]
    }));
    handleFieldChange();
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', technologiesUsed: '', githubLink: '' }]
    }));
    handleFieldChange();
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { jobTitle: '', company: '', location: '', duration: '', responsibility: '' }]
    }));
    handleFieldChange();
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { title: '', level: 'Intermediate', items: [] }]
    }));
    handleFieldChange();
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { title: '', issuingOrganization: '', year: '' }]
    }));
    handleFieldChange();
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  if (loading) {
    return (
      <div className="edit-resume-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-resume-page">
      <div className="edit-resume-container">
        {/* Left Panel - Form or LaTeX Editor */}
        <div className="form-panel">
          {/* Back Link */}
          <span className="back-link" onClick={() => navigate('/generate')}>
            ← Back to Generator
          </span>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <div className="page-title">
                <h1>{editMode === 'latex' ? 'Edit LaTeX Code' : 'Edit Your Resume'}</h1>
                <span className="edit-icon">{editMode === 'latex' ? '📄' : '✏️'}</span>
              </div>
              <div className="auto-save-badge">
                <span className="dot"></span>
                {saving ? 'Saving...' : lastSavedAt ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : 'No saves yet'}
              </div>
            </div>
            <div className="header-actions">
              {/* Edit Mode Toggle */}
              <div className="edit-mode-toggle">
                <button
                  className={`mode-btn ${editMode === 'form' ? 'active' : ''}`}
                  onClick={() => setEditMode('form')}
                >
                  📝 Form
                </button>
                <button
                  className={`mode-btn ${editMode === 'latex' ? 'active' : ''}`}
                  onClick={() => setEditMode('latex')}
                >
                  &lt;/&gt; LaTeX
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Form or LaTeX Editor */}
          {editMode === 'latex' ? (
            /* LaTeX Editor Mode */
            <div className="latex-editor-panel">
              <div className="latex-toolbar">
                <label className="auto-compile-toggle">
                  <input
                    type="checkbox"
                    checked={autoCompile}
                    onChange={(e) => setAutoCompile(e.target.checked)}
                  />
                  Auto-Compile
                </label>
                {useOnlineCompiler && <span className="online-indicator">🌐 Online</span>}
                <button className="toolbar-btn" onClick={handleManualCompile} disabled={compiling}>
                  {compiling ? '⏳' : '▶'} Compile
                </button>
                <button className="toolbar-btn" onClick={downloadTex}>
                  📤 Export .TEX
                </button>
              </div>
              <div className="latex-editor-container">
                {monacoAvailable && MonacoEditor ? (
                  <MonacoEditor
                    height="600px"
                    defaultLanguage="latex"
                    value={latexCode}
                    onChange={handleLatexChange}
                    theme="vs-dark"
                    onMount={(editor) => { editorRef.current = editor; }}
                    options={{
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      fontSize: 14,
                      lineHeight: 1.6,
                      scrollBeyondLastLine: false,
                      fontFamily: "'Fira Code', 'Consolas', monospace",
                      padding: { top: 16 },
                      lineNumbers: 'on',
                      renderLineHighlight: 'line',
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <textarea
                    className="latex-textarea"
                    value={latexCode}
                    onChange={(e) => handleLatexChange(e.target.value)}
                    spellCheck={false}
                    rows={30}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Form Editor Mode */
            <>
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

              {/* Professional Summary Section */}
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

              {/* Skills Section */}
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

              {/* Experience Section */}
              <div className="section-card">
                <div className="section-header">
                  <div className="section-icon green">💼</div>
                  <div className="section-info">
                    <h3>Work Experience</h3>
                    <p>Your professional journey</p>
                  </div>
                </div>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="repeater-item">
                    <button className="delete-btn" onClick={() => removeExperience(index)}>✕</button>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...newExp[index], jobTitle: e.target.value };
                            updateField('experience', newExp);
                          }}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...newExp[index], company: e.target.value };
                            updateField('experience', newExp);
                          }}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...newExp[index], location: e.target.value };
                            updateField('experience', newExp);
                          }}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...newExp[index], duration: e.target.value };
                            updateField('experience', newExp);
                          }}
                          placeholder="Jan 2020 - Present"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Responsibilities</label>
                        <textarea
                          value={exp.responsibility}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index] = { ...newExp[index], responsibility: e.target.value };
                            updateField('experience', newExp);
                          }}
                          placeholder="Describe your key responsibilities and achievements..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={addExperience}>
                  + Add Experience
                </button>
              </div>

              {/* Education Section */}
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

              {/* Projects Section */}
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

              {/* Certifications Section */}
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
            </>
          )}
        </div>

        {/* Right Panel - PDF Preview */}
        <div className="preview-panel">
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-title">
                <span className={`live-dot ${compiling ? 'compiling' : pdfUrl ? 'ready' : ''}`}></span>
                {compiling ? 'Compiling...' : 'PDF Preview'}
              </div>
              <div className="preview-actions">
                {useOnlineCompiler && <span className="online-indicator" title="Using online compiler">🌐</span>}
                <button
                  className="compile-btn"
                  onClick={handleManualCompile}
                  disabled={compiling}
                  title="Compile LaTeX to PDF"
                >
                  {compiling ? '⏳' : '▶'}
                </button>
                <div className="zoom-controls">
                  <button onClick={() => setZoom(Math.max(50, zoom - 10))}>−</button>
                  <span>{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button>
                </div>
              </div>
            </div>
            <div className="preview-content pdf-preview-content">
              {compiling ? (
                <div className="pdf-loading">
                  <div className="loading-spinner"></div>
                  <p>Compiling LaTeX to PDF...</p>
                </div>
              ) : compileError ? (
                <div className="pdf-error">
                  <div className="error-icon">⚠️</div>
                  <h3>Compilation Error</h3>
                  <p className="error-message">{compileError}</p>
                  <div className="error-actions">
                    <button onClick={handleManualCompile}>🔄 Retry</button>
                    <button onClick={downloadTex}>📤 Download .TEX</button>
                  </div>
                  <p className="error-hint">
                    💡 Download .TEX and use <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer">Overleaf</a> to compile
                  </p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="pdf-iframe"
                  title="PDF Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                />
              ) : (
                <div className="pdf-placeholder">
                  <div className="placeholder-icon">📄</div>
                  <h3>No PDF Preview</h3>
                  <p>Make changes to generate PDF preview</p>
                  <button className="compile-now-btn" onClick={handleManualCompile}>
                    ▶ Compile Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="save-bar">
        <div className="save-status">
          <span className="dot"></span>
          {saving ? 'Saving...' : 'All progress saved'}
        </div>
        <button className="btn-save" onClick={handleSave}>
          Save Changes
        </button>
        <button className="btn-download" onClick={downloadPDF} disabled={compiling}>
          {compiling ? '⏳ Compiling...' : '⬇ Download PDF'}
        </button>
      </div>

      {/* Snackbar */}
      {/* AI Agent Chat */}
      <AgentChat
        formData={formData}
        resumeContext={latexCode}
        userId={(() => {
          const token = getAuthToken();
          if (token) {
            const decoded = decodeToken(token);
            return decoded?.sub || decoded?.email || 'anonymous';
          }
          return 'anonymous';
        })()}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.type}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          {snack.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditResume;
