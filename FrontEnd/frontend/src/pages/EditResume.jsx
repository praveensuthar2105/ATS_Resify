import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentChat from '../components/AgentChat';
import { decodeToken, getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../services/api';
import { parseLatexToResumeData } from '../utils/latexParser';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import SectionHeader from '../components/SectionHeader';

const FormItem = ({ label, value, onChange, placeholder, type = "text", colspan = 1 }) => (
  <div className={`flex flex-col gap-1 ${colspan > 1 ? `col-span-${colspan} sm:col-span-${colspan}` : ''}`}>
    <label className="text-xs font-bold uppercase tracking-widest">{label}</label>
    {type === "textarea" ? (
      <textarea
        value={value} onChange={onChange} placeholder={placeholder} rows={5}
        className="border-2 border-black bg-white focus:outline-none focus:border-[#39ff14] focus:shadow-[4px_4px_0px_0px_#39ff14] p-3 text-sm font-mono transition-all"
      />
    ) : (
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="border-2 border-black bg-white focus:outline-none focus:border-[#39ff14] focus:shadow-[4px_4px_0px_0px_#39ff14] p-3 text-sm font-mono transition-all h-12"
      />
    )}
  </div>
);

const SectionCard = ({ icon, title, subtitle, children, buttonText, onAdd }) => (
  <div className="border-4 border-black bg-[#f8f8f8] mb-8 shadow-[8px_8px_0px_0px_#000000]">
    <div className="border-b-4 border-black p-4 flex items-center gap-4 bg-white">
      <div className="w-12 h-12 border-2 border-black bg-black text-[#39ff14] flex items-center justify-center shadow-[4px_4px_0px_0px_#39ff14]">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
    <div className="p-6">
      {children}
      {buttonText && (
        <button onClick={onAdd} className="mt-6 w-full py-4 border-2 border-black border-dashed font-bold uppercase hover:bg-[#39ff14] hover:border-solid transition-colors text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span> {buttonText}
        </button>
      )}
    </div>
  </div>
);

const EditResume = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [editMode, setEditMode] = useState('form');
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [zoom, setZoom] = useState(100);
  const saveTimer = useRef(null);
  const syncTimer = useRef(null);

  // LaTeX & PDF state
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [autoCompile, setAutoCompile] = useState(true);
  const [useOnlineCompiler, setUseOnlineCompiler] = useState(false);
  const autoCompileTimer = useRef(null);

  // Resizer state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef(null);

  const startResizing = useCallback(() => {
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(true);
    setIsResizing(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', location: '', linkedIn: '', gitHub: '', portfolio: '', summary: '',
    skills: [], experience: [], education: [], projects: [], certifications: [], achievements: [], languages: [], interests: [],
  });

  const [resumeData, setResumeData] = useState(null);

  const normalizeSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'object') {
      const result = [];
      Object.entries(skills).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          result.push({ title: categoryName, level: 'Intermediate', items: items });
        }
      });
      return result;
    }
    return [];
  };

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

    let summarySection = '';
    if (data?.summary && data.summary.trim()) {
      summarySection = `\\section*{Summary}\n${escapeLatex(data.summary)}`;
    }

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
          const respList = exp.responsibility.split(/\n+/).map(r => r.replace(/^[•\-\*]\s*/, '').trim()).filter(r => r.length > 5);
          if (respList.length > 0) {
            bullets = `\\begin{itemize}\n${respList.map(r => `\\item ${escapeLatex(r)}`).join('\n')}\n\\end{itemize}`;
          }
        }
        return `\\textbf{${company || 'Company'}}${expLocation ? `, ${expLocation}` : ''} \\hfill ${duration}\n\n\\textit{${title || 'Position'}}\n${bullets}`;
      }).filter(Boolean).join('\n\n');
      if (expItems) experienceSection = `\\section*{Experience}\n${expItems}`;
    }

    let projectsSection = '';
    if (data?.projects && data.projects.length > 0) {
      const projItems = data.projects.map(proj => {
        const title = escapeLatex(proj.title || '');
        if (!title) return null;
        const tech = proj.technologiesUsed ? escapeLatex(Array.isArray(proj.technologiesUsed) ? proj.technologiesUsed.join(', ') : proj.technologiesUsed) : '';
        let headerLine = `\\textbf{${title}}`;
        if (tech) headerLine += ` $|$ \\textit{${tech}}`;

        let bullets = '';
        if (proj.description) {
          const descList = proj.description.split(/\n+/).map(d => d.replace(/^[•\-\*]\s*/, '').trim()).filter(d => d.length > 5);
          const limitedDescList = descList.slice(0, 3);
          if (limitedDescList.length > 0) {
            bullets = `\\begin{itemize}\n${limitedDescList.map(d => `\\item ${escapeLatex(d)}`).join('\n')}\n\\end{itemize}`;
          }
        }
        return `${headerLine}\n${bullets}`;
      }).filter(Boolean).join('\n\n');
      if (projItems) projectsSection = `\\section*{Projects}\n${projItems}`;
    }

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
        if (!items) return null;
        return `\\textbf{${category}:} ${items}`;
      }).filter(Boolean);
      if (skillLines.length > 0) {
        skillsSection = `\\section*{Technical Skills}\n${skillLines.join(' \\\\\n')}`;
      }
    }

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

    const sections = [summarySection, educationSection, experienceSection, projectsSection, skillsSection, certificationsSection, achievementsSection].filter(Boolean).join('\n\n');

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

  const compileLocal = useCallback(async (latex) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const resp = await fetch(`${API_BASE_URL}/latex/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
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

  const compileToPdf = useCallback(async (latex) => {
    if (!latex) return;
    setCompiling(true);
    setCompileError(null);

    try {
      const blob = await compileLocal(latex);
      setPdfBlob(blob);
      setPdfUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setUseOnlineCompiler(false);
    } catch (localError) {
      console.warn('Local compile failed, trying online:', localError.message);
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
          technologiesUsed: Array.isArray(project.technologiesUsed) ? project.technologiesUsed.join(', ') : (project.technologiesUsed || ''),
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
              : { title: skill.title || skill.category || '', level: skill.level || 'Intermediate', items: skill.items || null }
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
          languages: langRaw.map(lang => ({ name: typeof lang === 'string' ? lang : (lang.name || '') })),
          interests: interestsRaw.map(int => (typeof int === 'string' ? { name: int } : { name: int.name || int.title || '' })),
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

  useEffect(() => {
    if (!resumeData) return;
    if (editMode === 'latex') return;

    const latex = generateLatexFromData(resumeData);
    setLatexCode(latex);

    if (autoCompile && latex) {
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      autoCompileTimer.current = setTimeout(() => compileToPdf(latex), 1000);
    }
  }, [resumeData, editMode, autoCompile, compileToPdf, generateLatexFromData]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (snack.open) {
      const timer = setTimeout(() => {
        setSnack(s => ({ ...s, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snack.open]);

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
        fullName: formData.fullName, email: formData.email, phoneNumber: formData.phoneNumber,
        location: formData.location, linkedIn: formData.linkedIn || null, gitHub: formData.gitHub || null, portfolio: formData.portfolio || null,
      },
      summary: formData.summary,
      skills: formData.skills?.map(s => ({ title: s.title || '', level: s.level || 'Intermediate', items: s.items || null })) || [],
      experience: formData.experience || [],
      education: formData.education || [],
      certifications: formData.certifications || [],
      projects: savedProjects,
      achievements: formData.achievements || [],
      languages: formData.languages?.map((lang, index) => ({ id: index + 1, name: lang.name })) || [],
      interests: formData.interests?.map((it, index) => ({ id: index + 1, name: it.name })) || [],
    };

    setResumeData(updatedResume);
    localStorage.setItem('generatedResume', JSON.stringify(updatedResume));
    setLastSavedAt(new Date());
    setSaving(false);
    setSnack({ open: true, type: 'success', text: 'SYSTEM: DATA PERSISTED' });
  };

  const handleFieldChange = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(), 1000);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleFieldChange();
  };

  const downloadPDF = async () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.fullName || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSnack({ open: true, type: 'success', text: 'PDF COMPILATION DOWNLOADED' });
    } else if (latexCode) {
      setSnack({ open: true, type: 'info', text: 'INITIATING COMPILATION SEQUENCE...' });
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
        setSnack({ open: true, type: 'success', text: 'PDF COMPILATION DOWNLOADED' });
      } catch (error) {
        setSnack({ open: true, type: 'error', text: 'PDF CREATION HALTED: ' + error.message });
      }
    } else {
      setSnack({ open: true, type: 'error', text: 'NO TARGET DATA. SAVE FIRST.' });
    }
  };

  const downloadTex = () => {
    if (!latexCode) {
      setSnack({ open: true, type: 'error', text: 'NO LaTeX SOURCE ACQUIRED.' });
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
    setSnack({ open: true, type: 'success', text: 'SOURCE TEX ACQUIRED' });
  };

  const handleManualCompile = () => {
    if (latexCode) compileToPdf(latexCode);
  };

  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, { degree: '', university: '', location: '', graduationYear: '' }] }));
    handleFieldChange();
  };
  const removeEducation = (index) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    handleFieldChange();
  };

  const addProject = () => {
    setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: '', description: '', technologiesUsed: '', githubLink: '' }] }));
    handleFieldChange();
  };
  const removeProject = (index) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
    handleFieldChange();
  };

  const addExperience = () => {
    setFormData(prev => ({ ...prev, experience: [...prev.experience, { jobTitle: '', company: '', location: '', duration: '', responsibility: '' }] }));
    handleFieldChange();
  };
  const removeExperience = (index) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    handleFieldChange();
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { title: '', level: 'Intermediate', items: [] }] }));
    handleFieldChange();
  };
  const removeSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    handleFieldChange();
  };

  const addCertification = () => {
    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { title: '', issuingOrganization: '', year: '' }] }));
    handleFieldChange();
  };
  const removeCertification = (index) => {
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
    handleFieldChange();
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center font-mono selection:bg-[#39ff14] selection:text-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#39ff14] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold uppercase tracking-widest animate-pulse">INITIATING DATA_CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#ffffff] text-black font-mono selection:bg-[#39ff14] selection:text-black flex flex-col lg:flex-row mt-[64px] absolute w-full top-0 left-0 bottom-0 overflow-hidden" style={{ fontFamily: "'Space Mono', monospace" }}>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <style>{`
          /* Hide scrollbar for cleaner look */
          ::-webkit-scrollbar { width: 10px; height: 10px; }
          ::-webkit-scrollbar-track { background: #f0f0f0; border-left: 2px solid #000; }
          ::-webkit-scrollbar-thumb { background: #000; border: 2px solid #f0f0f0; }
          ::-webkit-scrollbar-thumb:hover { background: #39ff14; }
          /* Toast Animation */
          @keyframes slideInUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .toast-enter { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
      </Helmet>

      {/* LEFT PANEL: Form Editor */}
      <div
        className="h-full overflow-y-auto border-r-4 border-black bg-white relative pb-24 lg:pb-0"
        style={{ width: `calc(${leftWidth}%)` }}
      >
        <div className="sticky top-0 z-10 bg-white border-b-4 border-black p-4 flex items-center justify-between shadow-[0px_4px_0px_0px_#000000]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined font-black cursor-pointer hover:text-[#39ff14]" onClick={() => navigate('/generate')}>arrow_back</span>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                EDIT <span className="text-[#39ff14]" style={{ textShadow: "2px 2px 0px #000" }}>RESUME</span>
              </h1>
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-[#39ff14]'} inline-block`}></span>
              {saving ? 'SYNCING DATA...' : lastSavedAt ? `LATEST COMMIT: ${new Date(lastSavedAt).toLocaleTimeString()}` : 'AWAITING EDITS'}
            </div>
          </div>
          <button className="px-4 py-2 bg-black text-white font-bold uppercase text-xs border-2 border-black hover:bg-[#39ff14] hover:text-black transition-colors lg:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">visibility</span> PREVIEW
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
          <SectionCard icon="person" title="BASE IDENTITY" subtitle="CONTACT COMMUNIQUE">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormItem label="FULL NAME" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="JOHN DOE" />
              <FormItem label="EMAIL" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="USER@DOMAIN.COM" />
              <FormItem label="PHONE NUMBER" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} placeholder="000-000-0000" />
              <FormItem label="LOCATION" value={formData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="CITY, NATION" />
            </div>
          </SectionCard>

          <SectionCard icon="history_edu" title="MISSION BRIEF" subtitle="EXECUTIVE SUMMARY">
            <FormItem label="PROFESSIONAL SUMMARY" value={formData.summary} onChange={(e) => updateField('summary', e.target.value)} type="textarea" placeholder="DESCRIBE YOUR OBJECTIVES AND STRENGTHS..." />
          </SectionCard>

          <SectionCard icon="code" title="SKILL MATRIX" subtitle="CORE COMPETENCIES" buttonText="ADD SKILLSET" onAdd={addSkill}>
            {formData.skills.map((skill, index) => (
              <div key={index} className="relative border-l-4 border-black pl-4 py-2 mb-6 group">
                <button onClick={() => removeSkill(index)} className="absolute -left-[14px] top-4 w-6 h-6 bg-red-600 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[14px]">close</span></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormItem label="CLASS" value={skill.title} onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[index] = { ...newSkills[index], title: e.target.value };
                    updateField('skills', newSkills);
                  }} placeholder="LANGUAGES / TOOLS" />
                  <FormItem label="VARIABLES (COMMA SEPARATED)" value={skill.items ? (Array.isArray(skill.items) ? skill.items.join(', ') : skill.items) : (skill.level || '')} onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[index] = { ...newSkills[index], items: e.target.value.split(',').map(s => s.trim()).filter(Boolean), level: e.target.value };
                    updateField('skills', newSkills);
                  }} placeholder="JAVA, RUST, GOLANG" />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard icon="work" title="CAREER LOG" subtitle="PAST DIRECTIVES" buttonText="ADD DEPLOYMENT" onAdd={addExperience}>
            {formData.experience.map((exp, index) => (
              <div key={index} className="relative border-l-4 border-black pl-4 py-4 mb-8 group bg-white shadow-[4px_4px_0px_0px_#f0f0f0] border-t-2 border-r-2 border-b-2">
                <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 p-1 text-red-600 hover:bg-black transition-colors"><span className="material-symbols-outlined">delete</span></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormItem label="RANK / DESIGNATION" value={exp.jobTitle} onChange={(e) => {
                    const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], jobTitle: e.target.value }; updateField('experience', newExp);
                  }} placeholder="SOFTWARE ARCHITECT" />
                  <FormItem label="CORPORATION" value={exp.company} onChange={(e) => {
                    const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], company: e.target.value }; updateField('experience', newExp);
                  }} placeholder="CYBERDYNE" />
                  <FormItem label="SECTOR" value={exp.location} onChange={(e) => {
                    const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], location: e.target.value }; updateField('experience', newExp);
                  }} placeholder="SILICON VALLEY" />
                  <FormItem label="TIMEFRAME" value={exp.duration} onChange={(e) => {
                    const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], duration: e.target.value }; updateField('experience', newExp);
                  }} placeholder="2020 - 2024" />
                </div>
                <FormItem label="OPERATIONAL MANIFEST" type="textarea" value={exp.responsibility} onChange={(e) => {
                  const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], responsibility: e.target.value }; updateField('experience', newExp);
                }} placeholder="DETAILED LOG OF ACTIONS AND IMPACT..." colspan={2} />
              </div>
            ))}
          </SectionCard>

          <SectionCard icon="school" title="ACADEMIC RECORDS" subtitle="KNOWLEDGE ACQUISITION" buttonText="ADD INSTITUTE" onAdd={addEducation}>
            {formData.education.map((edu, index) => (
              <div key={index} className="relative border-l-4 border-black pl-4 py-2 mb-6 group">
                <button onClick={() => removeEducation(index)} className="absolute -left-[14px] top-4 w-6 h-6 bg-red-600 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[14px]">close</span></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormItem label="DEGREE" value={edu.degree} onChange={(e) => {
                    const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], degree: e.target.value }; updateField('education', newEdu);
                  }} placeholder="B.S. COMPUTER SCIENCE" />
                  <FormItem label="INSTITUTE" value={edu.university} onChange={(e) => {
                    const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], university: e.target.value }; updateField('education', newEdu);
                  }} placeholder="MIT" />
                  <FormItem label="REGION" value={edu.location} onChange={(e) => {
                    const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], location: e.target.value }; updateField('education', newEdu);
                  }} placeholder="BOSTON, MA" />
                  <FormItem label="GRADUATION CYCLE" value={edu.graduationYear} onChange={(e) => {
                    const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], graduationYear: e.target.value }; updateField('education', newEdu);
                  }} placeholder="2024" />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard icon="folder_open" title="PROJECT ARCHIVE" subtitle="BUILT ASSETS" buttonText="NEW PROJECT MODULE" onAdd={addProject}>
            {formData.projects.map((project, index) => (
              <div key={index} className="relative border-l-4 border-black pl-4 py-4 mb-8 group bg-white shadow-[4px_4px_0px_0px_#f0f0f0] border-t-2 border-r-2 border-b-2">
                <button onClick={() => removeProject(index)} className="absolute top-2 right-2 p-1 text-red-600 hover:bg-black transition-colors"><span className="material-symbols-outlined">delete</span></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormItem label="PROJECT DESIGNATION" value={project.title} onChange={(e) => {
                    const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], title: e.target.value }; updateField('projects', newProjects);
                  }} placeholder="NEXUS CORE" />
                  <FormItem label="STACK" value={project.technologiesUsed} onChange={(e) => {
                    const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], technologiesUsed: e.target.value }; updateField('projects', newProjects);
                  }} placeholder="REACT, NODE, MYSQL" />
                </div>
                <FormItem label="ARCHITECTURE OVERVIEW" type="textarea" value={project.description} onChange={(e) => {
                  const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], description: e.target.value }; updateField('projects', newProjects);
                }} placeholder="DOCUMENT THE BUILD SPECIFICATIONS..." colspan={2} />
              </div>
            ))}
          </SectionCard>

          <SectionCard icon="verified" title="CERTIFICATIONS" subtitle="VALIDATED PROOFS" buttonText="ADD CREDENTIAL" onAdd={addCertification}>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="relative border-l-4 border-black pl-4 py-2 mb-6 group">
                <button onClick={() => removeCertification(index)} className="absolute -left-[14px] top-4 w-6 h-6 bg-red-600 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[14px]">close</span></button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <span className="col-span-1 sm:col-span-3">
                    <FormItem label="CREDENTIAL ID" value={cert.title} onChange={(e) => {
                      const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], title: e.target.value }; updateField('certifications', newCerts);
                    }} placeholder="AWS CLOUD PRACTITIONER" />
                  </span>
                  <FormItem label="ISSUING ORG" value={cert.issuingOrganization} onChange={(e) => {
                    const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], issuingOrganization: e.target.value }; updateField('certifications', newCerts);
                  }} placeholder="AMAZON" />
                  <FormItem label="CYCLE" value={cert.year} onChange={(e) => {
                    const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], year: e.target.value }; updateField('certifications', newCerts);
                  }} placeholder="2023" />
                </div>
              </div>
            ))}
          </SectionCard>
        </div>

        {/* Floating Action Bar (Mobile only, hidden on large screens where right panel is visible) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t-4 border-[#39ff14] lg:hidden z-20 flex gap-4">
          <button onClick={handleSave} className="flex-1 bg-[#39ff14] text-black font-bold uppercase py-3 border-2 border-black flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">save</span> COMMIT
          </button>
          <button onClick={downloadPDF} disabled={compiling} className="flex-1 bg-white text-black font-bold uppercase py-3 border-2 border-black flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">download</span> {compiling ? 'BUSY' : 'EXPORT'}
          </button>
        </div>
      </div>

      {/* DRAGGABLE RESIZER */}
      <div
        onMouseDown={startResizing}
        className={`hidden lg:flex w-1 hover:w-2 bg-black/10 hover:bg-[#39ff14] transition-all cursor-col-resize z-50 h-full items-center justify-center group ${isResizing ? 'bg-[#39ff14] w-2' : ''}`}
      >
        <div className="w-[1px] h-12 bg-black/20 group-hover:bg-black/50"></div>
      </div>

      {/* RIGHT PANEL: PDF Preview */}
      <div
        className="hidden lg:flex flex-col h-full bg-[#f0f0f0] border-black pb-0 relative"
        style={{ width: `calc(${100 - leftWidth}%)` }}
      >
        <div className="bg-black text-[#39ff14] p-3 flex items-center justify-between border-b-4 border-black shadow-[0px_4px_0px_0px_#39ff14] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 ${compiling ? 'bg-yellow-500 animate-pulse' : pdfUrl ? 'bg-[#39ff14]' : 'bg-red-500'} inline-block`}></span>
            <span className="font-bold uppercase tracking-widest text-sm text-white">
              {compiling ? 'RENDERING PDF...' : 'OUTPUT BUFFER (PDF)'}
            </span>
            {useOnlineCompiler && <span className="bg-blue-600 text-white text-[10px] px-2 border border-blue-400">EXT_SERVICE</span>}
          </div>
          <div className="flex items-center gap-3 bg-white text-black p-1 border-2 border-black">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="w-6 h-6 flex items-center justify-center hover:bg-black hover:text-[#39ff14]"><span className="material-symbols-outlined text-[16px]">remove</span></button>
            <span className="font-bold text-xs w-12 text-center font-mono">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-6 h-6 flex items-center justify-center hover:bg-black hover:text-[#39ff14]"><span className="material-symbols-outlined text-[16px]">add</span></button>
            <div className="w-px h-6 bg-black mx-1"></div>
            <button onClick={handleManualCompile} disabled={compiling} className="w-6 h-6 flex items-center justify-center hover:bg-[#39ff14]">
              <span className={`material-symbols-outlined text-[16px] ${compiling ? 'animate-spin opacity-50' : ''}`}>sync</span>
            </button>
          </div>
        </div>

        <div className="flex-grow bg-[#d1d5db] relative overflow-hidden flex items-center justify-center p-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZDFkNWRiIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjY2JjY2QwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]">
          {compiling ? (
            <div className="bg-black text-[#39ff14] border-4 border-[#39ff14] p-8 max-w-sm w-full font-mono text-center shadow-[12px_12px_0px_0px_#000]">
              <div className="w-12 h-12 border-4 border-transparent border-t-[#39ff14] border-l-[#39ff14] rounded-full animate-spin mx-auto mb-4"></div>
              <div className="uppercase font-bold tracking-widest text-sm">COMPILING LATEX.TEX</div>
              <div className="text-xs mt-2 text-gray-500 animate-pulse">Running pdflatex...</div>
            </div>
          ) : compileError ? (
            <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_#ff0000]">
              <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-4">
                <span className="material-symbols-outlined text-red-600 text-4xl">gavel</span>
                <h3 className="text-xl font-black uppercase text-red-600">FATAL ERROR</h3>
              </div>
              <div className="bg-red-950/10 border-2 border-red-500 p-3 font-mono text-xs text-red-700 h-32 overflow-y-auto mb-6 whitespace-pre-wrap">
                {compileError}
              </div>
              <div className="flex gap-4">
                <button onClick={handleManualCompile} className="flex-1 bg-black text-white px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-[#39ff14] hover:text-black transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span> RETRY
                </button>
                <button onClick={downloadTex} className="flex-1 bg-white text-black px-4 py-2 font-bold uppercase text-xs border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">code</span> EXTRACT .TEX
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="w-full h-full bg-white border-2 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,0.3)] flex overflow-hidden">
              <iframe
                src={`${pdfUrl}#view=FitH`}
                className="w-full h-full border-none custom-scrollbar"
                title="PDF Preview"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  width: `${(100 / (zoom / 100))}%`,
                  height: `${(100 / (zoom / 100))}%`
                }}
              />
            </div>
          ) : (
            <div className="bg-white border-4 border-black p-8 max-w-sm w-full text-center shadow-[12px_12px_0px_0px_#000]">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">description</span>
              <h3 className="text-lg font-black uppercase mb-2">NO PDF AVAILABLE</h3>
              <p className="text-xs font-bold text-gray-500 mb-6 uppercase">AWAITING COMPILATION TRIGGER</p>
              <button onClick={handleManualCompile} className="bg-[#39ff14] text-black px-6 py-3 font-bold uppercase border-2 border-black w-full hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_#000]">
                INITIALIZE RENDER
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border-t-4 border-black p-4 flex gap-4 shrink-0 shadow-[0px_-4px_0px_0px_#000000] z-10 sticky bottom-0">
          <button onClick={handleSave} className="flex-1 bg-black text-[#39ff14] font-bold uppercase tracking-widest py-3 border-2 border-transparent hover:bg-[#39ff14] hover:text-black hover:border-black transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">save</span> UPDATE DATABASE
          </button>
          <button onClick={downloadPDF} disabled={compiling} className="flex-1 bg-white text-black font-bold uppercase tracking-widest py-3 border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined">download</span> {compiling ? 'BUSY' : 'DOWNLOAD'}
          </button>
        </div>
      </div>

      {/* AI Agent Chat overlay is rendered normally */}
      <div className="hidden lg:block">
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
      </div>

      {/* Global Snackbar replacement */}
      {snack.open && (
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[100] toast-enter w-[90%] sm:w-auto max-w-md pointer-events-none">
          <div className={`border-4 border-black p-4 font-bold uppercase text-sm shadow-[8px_8px_0px_0px_#000] flex items-center gap-3 ${snack.type === 'error' ? 'bg-red-600 text-white' : snack.type === 'info' ? 'bg-cyan-400 text-black' : 'bg-[#39ff14] text-black'}`}>
            <span className="material-symbols-outlined text-[20px]">
              {snack.type === 'error' ? 'gavel' : snack.type === 'info' ? 'info' : 'task_alt'}
            </span>
            <div className="flex-grow">{snack.text}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditResume;
