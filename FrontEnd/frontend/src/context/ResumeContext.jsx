import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeToken, getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
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
          if (descList.length > 0) {
            bullets = `\\begin{itemize}\n${descList.map(d => `\\item ${escapeLatex(d)}`).join('\n')}\n\\end{itemize}`;
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

  // Parse LaTeX back into resumeData (LaTeX → Form sync)
  const parseLatexToData = useCallback((latex) => {
    if (!latex) return null;
    const data = {
      personalInformation: { fullName: '', email: '', phoneNumber: '', location: '', linkedIn: '', gitHub: '', portfolio: '' },
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      interests: [],
    };

    // Helper: un-escape common LaTeX chars
    const unescape = (s) => s
      .replace(/\\textbackslash\{\}/g, '\\')
      .replace(/\\textasciitilde\{\}/g, '~')
      .replace(/\\textasciicircum\{\}/g, '^')
      .replace(/\\&/g, '&').replace(/\\%/g, '%').replace(/\\\$/g, '$')
      .replace(/\\#/g, '#').replace(/\\_/g, '_')
      .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
      .trim();

    // Helper: extract href URL
    const hrefUrl = (s) => { const m = s.match(/\\href\{([^}]*)\}/); return m ? m[1] : ''; };

    // ── Name: \textbf{\uppercase{NAME}} ──
    const nameMatch = latex.match(/\\textbf\{\\uppercase\{([^}]*)\}\}/);
    if (nameMatch) data.personalInformation.fullName = unescape(nameMatch[1]);

    // ── Contact line: phone $|$ email $|$ ... ──
    const contactMatch = latex.match(/\\vspace\{2pt\}\s*\n([^\\]*(?:\\href\{[^}]*\}\{[^}]*\}[^\\]*)*)\s*\n\\end\{center\}/);
    if (contactMatch) {
      const parts = contactMatch[1].split('$|$').map(p => p.trim());
      parts.forEach(part => {
        if (part.includes('@') || part.includes('email')) {
          data.personalInformation.email = unescape(part);
        } else if (/^[+\d\s()-]+$/.test(part.replace(/\\/g, ''))) {
          data.personalInformation.phoneNumber = unescape(part);
        } else if (part.includes('\\href')) {
          const url = hrefUrl(part);
          const label = part.match(/\{([^}]*)\}\s*$/)?.[1] || '';
          if (label.toLowerCase().includes('linkedin')) data.personalInformation.linkedIn = url;
          else if (label.toLowerCase().includes('github')) data.personalInformation.gitHub = url;
          else if (label.toLowerCase().includes('portfolio')) data.personalInformation.portfolio = url;
        } else if (part && !data.personalInformation.location) {
          data.personalInformation.location = unescape(part);
        }
      });
    }

    // ── Split by \section*{...} ──
    const sectionRegex = /\\section\*\{([^}]*)\}/g;
    const sectionPositions = [];
    let m;
    while ((m = sectionRegex.exec(latex)) !== null) {
      sectionPositions.push({ name: m[1], start: m.index + m[0].length });
    }
    const getSectionContent = (idx) => {
      const start = sectionPositions[idx].start;
      const end = idx + 1 < sectionPositions.length ? sectionPositions[idx + 1].start - sectionPositions[idx + 1].name.length - 12 : latex.indexOf('\\end{document}');
      return latex.substring(start, end > start ? end : latex.length);
    };

    sectionPositions.forEach((sec, idx) => {
      const content = getSectionContent(idx);
      const sectionName = sec.name.toLowerCase();

      if (sectionName === 'summary') {
        data.summary = unescape(content.trim());
      }

      else if (sectionName === 'education') {
        const eduBlocks = content.split(/\\textbf\{/).filter(Boolean);
        eduBlocks.forEach(block => {
          const uniMatch = block.match(/^([^}]*)\}/);
          const locMatch = block.match(/\},\s*([^\\]*)\s*\\hfill/);
          const yearMatch = block.match(/\\hfill\s*(.*)/);
          const degreeMatch = block.match(/\\textit\{([^}]*)\}/);
          if (uniMatch) {
            data.education.push({
              university: unescape(uniMatch[1]),
              location: locMatch ? unescape(locMatch[1]) : '',
              graduationYear: yearMatch ? unescape(yearMatch[1].replace(/\\textit.*/, '').trim()) : '',
              degree: degreeMatch ? unescape(degreeMatch[1]) : '',
            });
          }
        });
      }

      else if (sectionName === 'experience') {
        const expBlocks = content.split(/\\textbf\{/).filter(Boolean);
        expBlocks.forEach(block => {
          const companyMatch = block.match(/^([^}]*)\}/);
          const locMatch = block.match(/\},\s*([^\\]*)\s*\\hfill/);
          const durationMatch = block.match(/\\hfill\s*(.*)/);
          const titleMatch = block.match(/\\textit\{([^}]*)\}/);
          // Bullet items
          const items = [];
          const itemRegex = /\\item\s+(.*)/g;
          let im;
          while ((im = itemRegex.exec(block)) !== null) items.push(unescape(im[1]));
          if (companyMatch) {
            data.experience.push({
              company: unescape(companyMatch[1]),
              location: locMatch ? unescape(locMatch[1]) : '',
              duration: durationMatch ? unescape(durationMatch[1].replace(/\\textit.*/, '').replace(/\n.*/s, '').trim()) : '',
              jobTitle: titleMatch ? unescape(titleMatch[1]) : '',
              responsibility: items.join('\n'),
            });
          }
        });
      }

      else if (sectionName === 'projects') {
        const projBlocks = content.split(/\\textbf\{/).filter(Boolean);
        projBlocks.forEach(block => {
          const titleMatch = block.match(/^([^}]*)\}/);
          const techMatch = block.match(/\\textit\{([^}]*)\}/);
          const items = [];
          const itemRegex = /\\item\s+(.*)/g;
          let im;
          while ((im = itemRegex.exec(block)) !== null) items.push(unescape(im[1]));
          if (titleMatch) {
            data.projects.push({
              title: unescape(titleMatch[1]),
              technologiesUsed: techMatch ? unescape(techMatch[1]) : '',
              description: items.join('\n'),
              githubLink: '',
            });
          }
        });
      }

      else if (sectionName === 'technical skills') {
        const skillLines = content.split(/\\\\/).filter(Boolean);
        skillLines.forEach(line => {
          const catMatch = line.match(/\\textbf\{([^:}]*):?\}\s*(.*)/);
          if (catMatch) {
            const category = unescape(catMatch[1].replace(/:$/, ''));
            const items = catMatch[2].split(',').map(s => unescape(s)).filter(Boolean);
            if (items.length > 0) {
              data.skills.push({ title: category, level: 'Intermediate', items });
            }
          }
        });
      }

      else if (sectionName === 'certifications') {
        const itemRegex = /\\item\s+(.*)/g;
        let im;
        while ((im = itemRegex.exec(content)) !== null) {
          const line = im[1];
          const parts = line.split('--').map(p => p.trim());
          const yearMatch = line.match(/\(([^)]*)\)/);
          data.certifications.push({
            title: unescape(parts[0].replace(/\([^)]*\)/, '').trim()),
            issuingOrganization: parts.length > 1 ? unescape(parts[1].replace(/\([^)]*\)/, '').trim()) : '',
            year: yearMatch ? unescape(yearMatch[1]) : '',
          });
        }
      }

      else if (sectionName === 'achievements') {
        const itemRegex = /\\item\s+(.*)/g;
        let im;
        while ((im = itemRegex.exec(content)) !== null) {
          const line = im[1];
          const yearMatch = line.match(/\(([^)]*)\)/);
          data.achievements.push({
            title: unescape(line.replace(/\([^)]*\)/, '').trim()),
            year: yearMatch ? unescape(yearMatch[1]) : '',
          });
        }
      }
    });

    return data;
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

    if (!isAuthenticated) {
      setCompileError('Please sign in to preview and download your resume.');
      return;
    }

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
  }, [compileLocal, compileOnline, isAuthenticated]);

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
    const latex = generateLatexFromData(resumeData);
    setLatexCode(latex);

    // Auto-compile if enabled
    if (autoCompile && latex) {
      if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
      autoCompileTimer.current = setTimeout(() => {
        compileToPdf(latex);
      }, 1000);
    }
  }, [resumeData, generateLatexFromData, autoCompile, compileToPdf]);

  // Handle LaTeX code changes (when in latex edit mode)
  const handleLatexChange = useCallback((value) => {
    setLatexCode(value || '');

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
    if (!isAuthenticated) {
      setSnack({ open: true, type: 'info', text: 'Please sign in to save your changes.' });
      setTimeout(() => {
        navigate('/login', { state: { from: location } });
      }, 1500);
      return;
    }

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

  const handleManualCompile = () => {
    if (latexCode) {
      compileToPdf(latexCode);
    }
  };

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

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', year: '' }]
    }));
    handleFieldChange();
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
    handleFieldChange();
  };

  return (
    <ResumeContext.Provider value={{
      loading,
      saving,
      lastSavedAt,
      editMode,
      setEditMode,
      snack,
      setSnack,
      zoom,
      setZoom,
      latexCode,
      setLatexCode,
      pdfUrl,
      pdfBlob,
      compiling,
      compileError,
      autoCompile,
      setAutoCompile,
      useOnlineCompiler,
      setUseOnlineCompiler,
      monacoAvailable,
      MonacoEditor,
      editorRef,
      formData,
      setFormData,
      resumeData,
      setResumeData,
      handleLatexChange,
      handleSave,
      updateField,
      downloadPDF,
      downloadTex,
      handleManualCompile,
      compileToPdf,
      addEducation,
      removeEducation,
      addProject,
      removeProject,
      addExperience,
      removeExperience,
      addSkill,
      removeSkill,
      addCertification,
      removeCertification,
      addAchievement,
      removeAchievement,
      parseLatexToData,
      handleFieldChange,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};
