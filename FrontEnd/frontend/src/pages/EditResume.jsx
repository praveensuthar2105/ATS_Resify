import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AgentChat from '../components/AgentChat';
import { decodeToken, getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../services/api';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import FeedbackPopup from '../components/FeedbackPopup';
import { ArrowLeft, Loader2, Save, Download, RefreshCw, Trash2, CheckCircle2, ChevronDown, Award, Briefcase, GraduationCap, FolderGit, User, Award as CertificationIcon, Lightbulb } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import TemplateSelector from '../components/TemplateSelector';

const FormItem = ({ label, value, onChange, placeholder, type = 'text', colspan = 1 }) => {
  const idId = React.useId ? React.useId() : label.replace(/\s+/g, '-');
  return (
    <div className={`flex flex-col mt-2 ${colspan > 1 ? `sm:col-span-${colspan}` : ''}`}>
      <label htmlFor={idId} className="text-[13px] font-semibold font-sans block mb-[6px]" style={{ color: '#3D5751' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={idId}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || ''}
          className="flex min-h-[100px] w-full bg-white text-[14px] text-slate-900 transition-all placeholder:text-[rgba(20,40,35,0.35)] focus-visible:outline-none focus-visible:border-[rgb(20,180,140)] focus-visible:ring-[3px] focus-visible:ring-[rgba(20,180,140,0.12)] disabled:cursor-not-allowed disabled:opacity-50 font-sans"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(20,40,35,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
          }}
        />
      ) : (
        <input
          type={type}
          id={idId}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || ''}
          className="flex h-10 w-full bg-white text-[14px] text-slate-900 transition-all placeholder:text-[rgba(20,40,35,0.35)] focus-visible:outline-none focus-visible:border-[rgb(20,180,140)] focus-visible:ring-[3px] focus-visible:ring-[rgba(20,180,140,0.12)] disabled:cursor-not-allowed disabled:opacity-50 font-sans"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(20,40,35,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
          }}
        />
      )}
    </div>
  );
};

const SectionCard = ({ 
  icon, 
  title, 
  subtitle, 
  children, 
  buttonText, 
  onAdd, 
  value, 
  isExpanded,
  dragHandleProps,
  onTitleDoubleClick,
  isEditingTitle,
  editingTitleValue,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  headerAction
}) => {
  const triggerRef = React.useRef(null);
  return (
    <AccordionItem 
      value={value} 
      className="border-b-0 overflow-hidden transition-all duration-300 bg-white rounded-2xl"
      style={{
        border: isExpanded ? '1px solid rgba(20, 180, 140, 0.24)' : '1px solid rgba(20, 40, 35, 0.10)',
        boxShadow: isExpanded ? '0 18px 36px rgba(20, 100, 80, 0.10)' : '0 10px 24px rgba(20, 40, 35, 0.055)'
      }}
    >
      <div className="flex items-center w-full hover:bg-slate-50/60 transition-colors pr-4">
        {/* Six dot handle for drag-and-drop indicator */}
        {dragHandleProps && (
          <div 
            {...dragHandleProps} 
            className="flex flex-col gap-0.5 px-3 py-4 text-slate-300 hover:text-teal-600 transition-colors cursor-grab active:cursor-grabbing shrink-0 select-none"
            title="Drag to reorder section"
          >
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
            </div>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
            </div>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <AccordionTrigger 
            ref={triggerRef}
            className="group py-4 px-4 hover:no-underline font-sans transition-colors"
          >
            <div className="flex items-center gap-3 text-left min-w-0" onClick={(e) => {
              // Prevent expand trigger when clicking the input field to rename
              if (isEditingTitle) {
                e.stopPropagation();
              }
            }}>
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden transition-all duration-300 bg-white"
                style={{
                  border: '1px solid rgba(20, 180, 140, 0.18)',
                  boxShadow: '0 6px 16px rgba(20, 100, 80, 0.08)',
                  color: '#0D9488'
                }}
              >
                {typeof icon === 'string' ? <span className="material-symbols-outlined text-[19px] font-semibold">{icon}</span> : icon}
              </div>
              <div className="min-w-0 flex-1">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editingTitleValue}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    onKeyDown={onTitleKeyDown}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-bold font-sans tracking-tight text-teal-600 bg-slate-100 border border-teal-300 rounded px-2 py-0.5 w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                ) : (
                  <h3 
                    onDoubleClick={(e) => {
                      if (onTitleDoubleClick) {
                        e.stopPropagation();
                        onTitleDoubleClick();
                      }
                    }}
                    className="text-sm font-bold font-sans tracking-tight transition-colors truncate hover:text-teal-600 cursor-text select-none flex items-center gap-1.5" 
                    style={{ color: '#1A2E28' }}
                    title="Double-click to rename section"
                  >
                    {title}
                    <span className="opacity-0 group-hover:opacity-40 transition-opacity text-[10px] font-medium text-slate-400">(double-click to rename)</span>
                  </h3>
                )}
                {subtitle && <p className="text-[11px] font-medium font-sans transition-colors truncate" style={{ color: 'rgba(20, 70, 60, 0.56)' }}>{subtitle}</p>}
              </div>
            </div>
          </AccordionTrigger>
        </div>

        {headerAction && (
          <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        )}
      </div>
      <AccordionContent className="pb-5 px-4 font-sans">
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'rgba(20, 100, 80, 0.08)' }}>
          {children}
          {buttonText && (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onAdd(); }} 
              className="mt-4 w-full py-2.5 bg-white hover:bg-teal-50/40 border border-dashed border-slate-300 hover:border-teal-300 rounded-xl font-semibold text-slate-700 hover:text-teal-700 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> {buttonText}
            </button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
let hasAutoScrolledGlobal = false;

const EditResume = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [ReactPdf, setReactPdf] = useState(null);

  useEffect(() => {
    let active = true;
    const loadReactPdf = async () => {
      try {
        const [module] = await Promise.all([
          import('react-pdf'),
          import('react-pdf/dist/Page/AnnotationLayer.css'),
          import('react-pdf/dist/Page/TextLayer.css')
        ]);
        if (active) {
          module.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${module.pdfjs.version}/build/pdf.worker.min.mjs`;
          setReactPdf(() => module);
        }
      } catch (err) {
        console.error('Failed to dynamically load react-pdf:', err);
      }
    };
    loadReactPdf();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (location.state?.triggerFeedback) {
      setShowFeedback(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!hasAutoScrolledGlobal) {
      hasAutoScrolledGlobal = true;
      const timer = setTimeout(() => {
        const el = document.getElementById('summary-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setExpandedSections(prev => ({ ...prev, summary: true }));
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [editMode] = useState('form');
  const [snack, setSnack] = useState({ open: false, type: 'success', text: '' });
  const [zoom, setZoom] = useState(100);
  const saveTimer = useRef(null);

  // LaTeX & PDF state
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFilename, setPdfFilename] = useState('resume_draft');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [autoCompile] = useState(true);
  const [useOnlineCompiler, setUseOnlineCompiler] = useState(false);
  const autoCompileTimer = useRef(null);
  
  // Section Customization Configuration state definitions
  const [sectionConfig, setSectionConfig] = useState(() => {
    // Attempt to load from custom key or fallback to default
    const defaults = {
      order: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
      titles: {
        summary: 'Professional Summary',
        skills: 'Skills',
        experience: 'Work Experience',
        education: 'Education',
        projects: 'Projects',
        certifications: 'Certifications'
      },
      hidden: []
    };
    return defaults;
  });

  // State for double click inline renaming
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // Handle reorder swap via drag indicator arrows or hover buttons
  const moveSection = (index, direction) => {
    const newOrder = [...sectionConfig.order];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setSectionConfig(prev => ({
      ...prev,
      order: newOrder
    }));
    handleFieldChange();
  };

  // Handle title rename submit
  const submitRename = (key) => {
    if (editingTitleValue.trim()) {
      setSectionConfig(prev => ({
        ...prev,
        titles: {
          ...prev.titles,
          [key]: editingTitleValue.trim()
        }
      }));
      handleFieldChange();
    }
    setEditingSectionKey(null);
  };

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    summary: false,
    skills: false,
    experience: false,
    education: false,
    projects: false,
    certifications: false
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Resizer state
  // react-pdf state
  const [numPages, setNumPages] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', location: '', linkedIn: '', gitHub: '', summary: '',
    skills: [], experience: [], education: [], projects: [], certifications: [], achievements: [], languages: [], interests: [],
  });
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (formData.fullName) {
      const safeName = formData.fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      if (safeName) {
        setPdfFilename(safeName);
      }
    }
  }, [formData.fullName]);

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

  const generateLatexFromData = useCallback((data, templateType = 'ats') => {
    const pi = data?.personalInformation || {};
    const name = escapeLatex(pi.fullName || 'Your Name');
    const email = escapeLatex(pi.email || 'email@example.com');
    const phone = escapeLatex(pi.phoneNumber || '+1 234 567 8900');
    const location = escapeLatex(pi.location || '');

    const ensureHttps = (url) => {
      if (!url) return '';
      const u = url.trim();
      if (!u) return '';
      return /^https?:\/\//i.test(u) ? u : `https://${u}`;
    };

    const linkedin = pi.linkedIn ? escapeLatex(ensureHttps(pi.linkedIn)) : '';
    const github = pi.gitHub ? escapeLatex(ensureHttps(pi.gitHub)) : '';
    let contactParts = [];
    if (phone) contactParts.push(phone);
    if (email) contactParts.push(email);
    if (linkedin) contactParts.push(`\\href{${linkedin}}{LinkedIn}`);
    if (github) contactParts.push(`\\href{${github}}{GitHub}`);
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
          const respList = exp.responsibility.split(/\n+/).map(r => r.replace(/^[•\-*]\s*/, '').trim()).filter(r => r.length > 5);
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
          const descList = proj.description.split(/\n+/).map(d => d.replace(/^[•\-*]\s*/, '').trim()).filter(d => d.length > 5);
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

    // Reassemble sections dynamically based on the customized sectionConfig order
    const sectionMap = {
      summary: summarySection,
      education: educationSection,
      experience: experienceSection,
      projects: projectsSection,
      skills: skillsSection,
      certifications: certificationsSection,
      achievements: achievementsSection
    };

    const orderedSections = [];
    sectionConfig.order.forEach(key => {
      // Omit if hidden
      if (sectionConfig.hidden.includes(key)) return;
      
      const content = sectionMap[key];
      if (content) {
        // Handle renamed headers dynamically during code generation
        let customContent = content;
        const customTitle = sectionConfig.titles[key];
        if (customTitle && customTitle.trim()) {
          const escapedTitle = escapeLatex(customTitle);
          // Substring section header replacements
          customContent = customContent.replace(/\\section\*\{[^\}]+\}/, `\\section*{${escapedTitle}}`);
        }
        orderedSections.push(customContent);
      }
    });

    // Append any extra missing sections just in case
    Object.keys(sectionMap).forEach(key => {
      if (!sectionConfig.order.includes(key) && !sectionConfig.hidden.includes(key) && sectionMap[key]) {
        orderedSections.push(sectionMap[key]);
      }
    });

    const sections = orderedSections.filter(Boolean).join('\n\n');

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
        body: JSON.stringify({ 
          latexCode: latex,
          sectionConfig: sectionConfig
        })
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
        setCompileError(`Local Compiler: ${localError.message}\nOnline Compiler: ${onlineError.message}`);
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
          try { data = JSON.parse(data); } catch (e) { void e; }
        }
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { void e; }
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

        const sanitizeInputString = (str) => {
          if (typeof str !== 'string') return str;
          return str.replace(/(^|[\s,;])(aa|bb)+/g, '$1')
                    .replace(/(aa|bb)+([\s,;]|$)/g, '$2')
                    .trim();
        };

        const sanitizeObject = (obj) => {
          if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
          } else if (obj !== null && typeof obj === 'object') {
            const newObj = {};
            for (const key in obj) {
              // Sanitize both key and value, just in case the category key is corrupted (e.g., "Frameworksaa")
              const cleanKey = sanitizeInputString(key);
              newObj[cleanKey] = sanitizeObject(obj[key]);
            }
            return newObj;
          } else if (typeof obj === 'string') {
            return sanitizeInputString(obj);
          }
          return obj;
        };

        data = sanitizeObject(data);

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

        const initialFormData = {
          fullName: pi.fullName || pi.name || '',
          email: pi.email || '',
          phoneNumber: pi.phoneNumber || pi.phone || '',
          location: pi.location || '',
          linkedIn: pi.linkedIn || pi.linkedin || '',
          gitHub: pi.gitHub || pi.github || '',
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
        };

        setFormData(initialFormData);

        const savedProjects = initialFormData.projects?.map(project => ({
          ...project,
          technologiesUsed: typeof project.technologiesUsed === 'string'
            ? project.technologiesUsed.split(',').map(tech => tech.trim()).filter(Boolean)
            : project.technologiesUsed
        })) || [];

        const normalizedResumeData = {
          personalInformation: {
            fullName: initialFormData.fullName, email: initialFormData.email, phoneNumber: initialFormData.phoneNumber,
            location: initialFormData.location, linkedIn: initialFormData.linkedIn || null, gitHub: initialFormData.gitHub || null,
          },
          summary: initialFormData.summary,
          skills: initialFormData.skills?.map(s => ({ title: s.title || '', level: s.level || 'Intermediate', items: s.items || null })) || [],
          experience: initialFormData.experience || [],
          education: initialFormData.education || [],
          certifications: initialFormData.certifications || [],
          projects: savedProjects,
          achievements: initialFormData.achievements || [],
          languages: initialFormData.languages?.map((lang, index) => ({ id: index + 1, name: lang.name })) || [],
          interests: initialFormData.interests?.map((it, index) => ({ id: index + 1, name: it.name })) || [],
        };

        setResumeData(normalizedResumeData);

        setLoading(false);
      } catch (error) {
        console.error('Error parsing resume data:', error);
        setSnack({ open: true, type: 'error', text: 'Error loading resume data.' });
        setLoading(false);
        navigate('/create-resume/prompt');
      }
    } else {
      setSnack({ open: true, type: 'error', text: 'No resume data found. Please generate a resume first.' });
      setLoading(false);
      navigate('/create-resume/prompt');
    }
  }, [navigate]);

  const [templateType, setTemplateType] = useState(() => {
    try {
      const stored = localStorage.getItem('generatedResume');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedId = parsed?.selectedTemplate || parsed?.templateType || parsed?.templateId;
        if (storedId) {
          const key = storedId.trim().toLowerCase();
          const aliases = {
            modern: 'ats',
            professional: 'ats',
            creative: 'minimal',
            minimalist: 'minimal',
            minimalistic: 'minimal'
          };
          return aliases[key] || (key === 'minimal' ? 'minimal' : 'ats');
        }
      }
    } catch (e) {
      void e;
    }
    return 'ats';
  });

  useEffect(() => {
    if (!resumeData) return;
    if (editMode === 'latex') return;

    const run = async () => {
      let latex = '';
      try {
        const resumePayload = { ...resumeData };
        delete resumePayload.selectedTemplate;
        delete resumePayload.templateType;
        delete resumePayload.templateId;

        const response = await fetch(`${API_BASE_URL}/latex/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            resumeData: resumePayload,
            templateType: templateType,
            sectionConfig: sectionConfig
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (result?.latexCode) {
            latex = result.latexCode;
          }
        }
      } catch (err) {
        console.warn('Backend latex generate failed in EditResume, falling back to local:', err);
      }

      if (!latex) {
        latex = generateLatexFromData(resumeData, templateType);
      }

      setLatexCode(latex);

      if (autoCompile && latex) {
        if (autoCompileTimer.current) clearTimeout(autoCompileTimer.current);
        autoCompileTimer.current = setTimeout(() => compileToPdf(latex), 500);
      }
    };

    run();
  }, [resumeData, editMode, autoCompile, compileToPdf, generateLatexFromData, sectionConfig, templateType]);

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

  // ATS Score Calculator State
  const [atsScore, setAtsScore] = useState(85);

  useEffect(() => {
    let score = 40;
    
    // Personal Info components (+5 each, max 30)
    if (formData.fullName) score += 5;
    if (formData.email) score += 5;
    if (formData.phoneNumber) score += 5;
    if (formData.location) score += 5;
    if (formData.linkedIn) score += 5;
    if (formData.gitHub) score += 5;

    // Professional Summary (+10)
    if (formData.summary && formData.summary.trim().length > 30) score += 10;

    // Work Experience (+5 per entry up to 15, +10 for detailed logs)
    if (formData.experience && formData.experience.length > 0) {
      score += Math.min(15, formData.experience.length * 5);
      const hasLongBullets = formData.experience.some(exp => exp.responsibility && exp.responsibility.trim().length > 120);
      if (hasLongBullets) score += 10;
    }

    // Education (+5 per entry up to 10)
    if (formData.education && formData.education.length > 0) {
      score += Math.min(10, formData.education.length * 5);
    }

    // Projects (+5 per entry up to 10)
    if (formData.projects && formData.projects.length > 0) {
      score += Math.min(10, formData.projects.length * 5);
    }

    // Skills category items (+5 per skill list up to 15)
    if (formData.skills && formData.skills.length > 0) {
      score += Math.min(15, formData.skills.length * 5);
    }

    // Certs & Achievements (+5)
    if ((formData.certifications && formData.certifications.length > 0) || (formData.achievements && formData.achievements.length > 0)) {
      score += 5;
    }

    setAtsScore(Math.min(99, score));
  }, [formData]);

  const activeAccordionSections = Object.entries(expandedSections)
    .filter(([_, isExpanded]) => isExpanded)
    .map(([key]) => key);

  const handleAccordionChange = (val) => {
    const newExpanded = { ...expandedSections };
    Object.keys(newExpanded).forEach(key => {
      newExpanded[key] = val.includes(key);
    });
    setExpandedSections(newExpanded);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    const currentFormData = formDataRef.current;
    const savedProjects = currentFormData.projects?.map(project => ({
      ...project,
      technologiesUsed: typeof project.technologiesUsed === 'string'
        ? project.technologiesUsed.split(',').map(tech => tech.trim()).filter(Boolean)
        : project.technologiesUsed
    })) || [];

    const updatedResume = {
      personalInformation: {
        fullName: currentFormData.fullName, email: currentFormData.email, phoneNumber: currentFormData.phoneNumber,
        location: currentFormData.location, linkedIn: currentFormData.linkedIn || null, gitHub: currentFormData.gitHub || null,
      },
      summary: currentFormData.summary,
      skills: currentFormData.skills?.map(s => ({ title: s.title || '', level: s.level || 'Intermediate', items: s.items || null })) || [],
      experience: currentFormData.experience || [],
      education: currentFormData.education || [],
      certifications: currentFormData.certifications || [],
      projects: savedProjects,
      achievements: currentFormData.achievements || [],
      languages: currentFormData.languages?.map((lang, index) => ({ id: index + 1, name: lang.name })) || [],
      interests: currentFormData.interests?.map((it, index) => ({ id: index + 1, name: it.name })) || [],
    };

    setResumeData(updatedResume);
    localStorage.setItem('generatedResume', JSON.stringify(updatedResume));
    setLastSavedAt(new Date());
    setSaving(false);
    setShowSavedIndicator(true);
    setTimeout(() => setShowSavedIndicator(false), 2000);
    setSnack({ open: true, type: 'success', text: 'Resume draft saved successfully' });
  }, []);

  const handleFieldChange = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(), 1500);
  }, [handleSave]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    handleFieldChange();
  };

  const downloadPDF = async () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFilename || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSnack({ open: true, type: 'success', text: 'PDF compilation downloaded' });
      
      // Trigger feedback popup after successful download
      setTimeout(() => {
        if (!localStorage.getItem('hasSubmittedFeedback')) {
          setShowFeedback(true);
        }
      }, 1000);
    } else if (latexCode) {
      setSnack({ open: true, type: 'info', text: 'Initiating LaTeX PDF compilation...' });
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
        a.download = `${pdfFilename || 'Resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
        setSnack({ open: true, type: 'success', text: 'PDF compilation downloaded' });
        
        // Trigger feedback popup after successful download
        setTimeout(() => {
          if (!localStorage.getItem('hasSubmittedFeedback')) {
            setShowFeedback(true);
          }
        }, 1000);
      } catch (error) {
        setSnack({ open: true, type: 'error', text: 'PDF generation failed: ' + error.message });
      }
    } else {
      setSnack({ open: true, type: 'error', text: 'No target data. Save first.' });
    }
  };

  const downloadTex = () => {
    if (!latexCode) {
      setSnack({ open: true, type: 'error', text: 'No LaTeX source acquired.' });
      return;
    }
    const blob = new Blob([latexCode], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formDataRef.current.fullName || 'Resume'}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSnack({ open: true, type: 'success', text: 'Source .tex file downloaded' });
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-sm">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="font-bold text-slate-800 uppercase tracking-widest text-xs animate-pulse font-sans">Initializing Data Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full text-slate-900 font-sans relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(180deg, #FBFEFC 0%, #F0F9F6 100%)' }}>
      <Helmet>
        <style>{`
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(20, 184, 166, 0.2); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 166, 0.4); }
          @keyframes slideInUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .toast-enter { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .section-card-expanded {
            background-color: #FFFFFF !important;
            border-top: 1px solid rgba(20, 100, 80, 0.12) !important;
            border-right: 1px solid rgba(20, 100, 80, 0.12) !important;
            border-bottom: 1px solid rgba(20, 100, 80, 0.12) !important;
            border-left: 3px solid rgb(20, 180, 140) !important;
            box-shadow: 0 4px 16px -2px rgba(20, 100, 80, 0.06) !important;
            border-radius: 12px;
          }
          .section-card-collapsed {
            background-color: #FFFFFF !important;
            border: 1px solid rgba(20, 100, 80, 0.10) !important;
            border-radius: 12px;
          }
          .section-card-collapsed:hover {
            background-color: rgba(20, 180, 140, 0.02) !important;
            border-color: rgba(20, 180, 140, 0.35) !important;
          }
        `}</style>
      </Helmet>

      <PanelGroup orientation="horizontal" direction="horizontal" className="w-full h-full flex">
        {/* LEFT PANEL: Form Editor */}
        <Panel defaultSize={48} minSize={32} className="h-full overflow-y-auto border-r border-slate-200 relative pb-24 lg:pb-0" style={{ background: 'linear-gradient(180deg, #FBFEFC 0%, #F0F9F6 100%)' }}>
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/create-resume/prompt')}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-all border border-slate-200 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
                  Edit Resume <span className="text-teal-600">Builder</span>
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <div className="bg-slate-100 border border-slate-200/80 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'} inline-block`}></span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider font-sans">
                      {saving ? 'Saving...' : showSavedIndicator ? 'Saved ✓' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Accordion type="multiple" value={activeAccordionSections} onValueChange={handleAccordionChange} className="p-6 sm:p-8 max-w-3xl mx-auto space-y-3 w-full">
            {/* 1. Personal Information remains fixed at the top */}
            <SectionCard 
              icon={<User className="w-5 h-5" />}
              title="Personal Information" 
              subtitle="Contact Details"
              value="personal"
              isExpanded={activeAccordionSections.includes('personal')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormItem label="Full Name" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="e.g. John Doe" />
                <FormItem label="Email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="e.g. john.doe@example.com" />
                <FormItem label="Phone Number" value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} placeholder="e.g. (555) 123-4567" />
                <FormItem label="Location" value={formData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="e.g. San Francisco, CA" />
                
                {/* LinkedIn */}
                <div className="flex flex-col mt-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-[6px]">
                    <label htmlFor="linkedin-input" className="text-[13px] font-semibold font-sans flex items-center gap-1.5" style={{ color: '#3D5751' }}>
                      LinkedIn Profile URL
                      <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-200/60 rounded-full px-2 py-0.5">Clickable</span>
                    </label>
                    {formData.linkedIn && (
                      <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1 select-none">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> Preview
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    id="linkedin-input"
                    value={formData.linkedIn || ''}
                    onChange={(e) => updateField('linkedIn', e.target.value)}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (!v) return;
                      if (/^https?:\/\/(www\.)?linkedin\.com/i.test(v)) return;
                      if (/^(www\.)?linkedin\.com/i.test(v)) { updateField('linkedIn', `https://${v}`); return; }
                      if (/^in\//i.test(v)) { updateField('linkedIn', `https://www.linkedin.com/${v}`); return; }
                      updateField('linkedIn', `https://www.linkedin.com/in/${v}`);
                    }}
                    placeholder="linkedin.com/in/johndoe"
                    className="flex h-10 w-full bg-white text-[14px] text-slate-900 transition-all placeholder:text-[rgba(20,40,35,0.35)] focus-visible:outline-none focus-visible:border-[rgb(20,180,140)] focus-visible:ring-[3px] focus-visible:ring-[rgba(20,180,140,0.12)] font-sans"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(20,40,35,0.15)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* GitHub */}
                <div className="flex flex-col mt-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-[6px]">
                    <label htmlFor="github-input" className="text-[13px] font-semibold font-sans flex items-center gap-1.5" style={{ color: '#3D5751' }}>
                      GitHub Profile URL
                      <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-200/60 rounded-full px-2 py-0.5">Clickable</span>
                    </label>
                    {formData.gitHub && (
                      <a href={formData.gitHub} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1 select-none">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span> Preview
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    id="github-input"
                    value={formData.gitHub || ''}
                    onChange={(e) => updateField('gitHub', e.target.value)}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (!v) return;
                      if (/^https?:\/\/(www\.)?github\.com/i.test(v)) return;
                      if (/^(www\.)?github\.com/i.test(v)) { updateField('gitHub', `https://${v}`); return; }
                      updateField('gitHub', `https://github.com/${v}`);
                    }}
                    placeholder="github.com/johndoe"
                    className="flex h-10 w-full bg-white text-[14px] text-slate-900 transition-all placeholder:text-[rgba(20,40,35,0.35)] focus-visible:outline-none focus-visible:border-[rgb(20,180,140)] focus-visible:ring-[3px] focus-visible:ring-[rgba(20,180,140,0.12)] font-sans"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(20,40,35,0.15)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            {/* 2. Dynamically rendered customizable sections */}
            {sectionConfig.order.map((sectionKey, index) => {
              if (sectionConfig.hidden.includes(sectionKey)) return null;

              const isEditing = editingSectionKey === sectionKey;
              const displayTitle = sectionConfig.titles[sectionKey] || sectionKey.toUpperCase();

              // Helper buttons to swap orders via click
              const reorderAction = (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-teal-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Section Up"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                    disabled={index === sectionConfig.order.length - 1}
                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-teal-600 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Section Down"
                  >
                    ▼
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSectionConfig(prev => ({
                        ...prev,
                        hidden: [...prev.hidden, sectionKey]
                      }));
                      handleFieldChange();
                      setSnack({ open: true, type: 'info', text: `Section "${displayTitle}" removed. Add it back from the bottom options if needed.` });
                    }}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded ml-1"
                    title="Remove Section"
                  >
                    ✕
                  </button>
                </div>
              );

              // Render corresponding cards depending on target sectionKey
              if (sectionKey === 'summary') {
                return (
                  <SectionCard 
                    key="summary"
                    icon="history_edu" 
                    title={displayTitle} 
                    subtitle="Executive Abstract"
                    value="summary"
                    isExpanded={activeAccordionSections.includes('summary')}
                    dragHandleProps={{}} // Six dot visual placeholder
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('summary');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('summary')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('summary')}
                    headerAction={reorderAction}
                  >
                    <FormItem label="Executive Summary" value={formData.summary} onChange={(e) => updateField('summary', e.target.value)} type="textarea" placeholder="Detail your career objectives, core strengths, and what sets you apart..." />
                  </SectionCard>
                );
              }

              if (sectionKey === 'skills') {
                return (
                  <SectionCard 
                    key="skills"
                    icon="code" 
                    title={displayTitle} 
                    subtitle="Core Competencies" 
                    buttonText="Add Skill Category" 
                    onAdd={addSkill}
                    value="skills"
                    isExpanded={activeAccordionSections.includes('skills')}
                    dragHandleProps={{}}
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('skills');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('skills')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('skills')}
                    headerAction={reorderAction}
                  >
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="relative border-l-2 border-teal-500/20 pl-5 py-2 mb-6 group transition-all hover:border-teal-500">
                        <button 
                          onClick={() => removeSkill(index)} 
                          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormItem label="Category Name" value={skill.title} onChange={(e) => {
                            const newSkills = [...formData.skills];
                            newSkills[index] = { ...newSkills[index], title: e.target.value };
                            updateField('skills', newSkills);
                          }} placeholder="e.g. Languages / Tools" />
                          <FormItem label="Skills (Comma Separated)" value={skill.items ? (Array.isArray(skill.items) ? skill.items.join(', ') : skill.items) : (skill.level || '')} onChange={(e) => {
                            const newSkills = [...formData.skills];
                            newSkills[index] = { ...newSkills[index], items: e.target.value.split(',').map(s => s.trim()).filter(Boolean), level: e.target.value };
                            updateField('skills', newSkills);
                          }} placeholder="e.g. Java, Rust, Golang" />
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                );
              }

              if (sectionKey === 'experience') {
                return (
                  <SectionCard 
                    key="experience"
                    icon="work" 
                    title={displayTitle} 
                    subtitle="Professional History" 
                    buttonText="Add Work Experience" 
                    onAdd={addExperience}
                    value="experience"
                    isExpanded={activeAccordionSections.includes('experience')}
                    dragHandleProps={{}}
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('experience');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('experience')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('experience')}
                    headerAction={reorderAction}
                  >
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="relative border border-slate-200/60 rounded-2xl pl-5 pr-5 py-5 mb-6 group bg-white transition-all hover:border-teal-500/40 shadow-sm">
                        <button 
                          onClick={() => removeExperience(index)} 
                          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <FormItem label="Job Title" value={exp.jobTitle} onChange={(e) => {
                            const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], jobTitle: e.target.value }; updateField('experience', newExp);
                          }} placeholder="e.g. Senior Software Engineer" />
                          <FormItem label="Company" value={exp.company} onChange={(e) => {
                            const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], company: e.target.value }; updateField('experience', newExp);
                          }} placeholder="e.g. Acme Corp" />
                          <FormItem label="Location" value={exp.location} onChange={(e) => {
                            const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], location: e.target.value }; updateField('experience', newExp);
                          }} placeholder="e.g. San Francisco, CA" />
                          <FormItem label="Duration" value={exp.duration} onChange={(e) => {
                            const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], duration: e.target.value }; updateField('experience', newExp);
                          }} placeholder="e.g. 2022 - Present" />
                        </div>
                        <FormItem label="Description" type="textarea" value={exp.responsibility} onChange={(e) => {
                          const newExp = [...formData.experience]; newExp[index] = { ...newExp[index], responsibility: e.target.value }; updateField('experience', newExp);
                        }} placeholder="Describe your achievements and impact..." colspan={2} />
                      </div>
                    ))}
                  </SectionCard>
                );
              }

              if (sectionKey === 'education') {
                return (
                  <SectionCard 
                    key="education"
                    icon="school" 
                    title={displayTitle} 
                    subtitle="Academic Background" 
                    buttonText="Add Education" 
                    onAdd={addEducation}
                    value="education"
                    isExpanded={activeAccordionSections.includes('education')}
                    dragHandleProps={{}}
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('education');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('education')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('education')}
                    headerAction={reorderAction}
                  >
                    {formData.education.map((edu, index) => (
                      <div key={index} className="relative border-l-2 border-teal-500/20 pl-5 py-2 mb-6 group transition-all hover:border-teal-500">
                        <button 
                          onClick={() => removeEducation(index)} 
                          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormItem label="Degree" value={edu.degree} onChange={(e) => {
                            const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], degree: e.target.value }; updateField('education', newEdu);
                          }} placeholder="e.g. B.S. in Computer Science" />
                          <FormItem label="School / University" value={edu.university} onChange={(e) => {
                            const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], university: e.target.value }; updateField('education', newEdu);
                          }} placeholder="e.g. Stanford University" />
                          <FormItem label="Location" value={edu.location} onChange={(e) => {
                            const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], location: e.target.value }; updateField('education', newEdu);
                          }} placeholder="e.g. Stanford, CA" />
                          <FormItem label="Graduation Year" value={edu.graduationYear} onChange={(e) => {
                            const newEdu = [...formData.education]; newEdu[index] = { ...newEdu[index], graduationYear: e.target.value }; updateField('education', newEdu);
                          }} placeholder="e.g. 2021" />
                        </div>
                      </div>
                    ))}
                  </SectionCard>
                );
              }

              if (sectionKey === 'projects') {
                return (
                  <SectionCard 
                    key="projects"
                    icon="terminal" 
                    title={displayTitle} 
                    subtitle="Technical Portfolio" 
                    buttonText="Add Project" 
                    onAdd={addProject}
                    value="projects"
                    isExpanded={activeAccordionSections.includes('projects')}
                    dragHandleProps={{}}
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('projects');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('projects')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('projects')}
                    headerAction={reorderAction}
                  >
                    {formData.projects.map((project, index) => (
                      <div key={index} className="relative border border-slate-200/60 rounded-2xl pl-5 pr-5 py-5 mb-6 group bg-white transition-all hover:border-teal-500/40 shadow-sm">
                        <button 
                          onClick={() => removeProject(index)} 
                          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <FormItem label="Project Title" value={project.title} onChange={(e) => {
                            const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], title: e.target.value }; updateField('projects', newProjects);
                          }} placeholder="e.g. Cloud Resume Platform" />
                          <FormItem label="Technologies Used" value={project.technologiesUsed} onChange={(e) => {
                            const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], technologiesUsed: e.target.value }; updateField('projects', newProjects);
                          }} placeholder="e.g. React, Node.js, Spring Boot" />
                        </div>
                        <FormItem label="Description" type="textarea" value={project.description} onChange={(e) => {
                          const newProjects = [...formData.projects]; newProjects[index] = { ...newProjects[index], description: e.target.value }; updateField('projects', newProjects);
                        }} placeholder="Detail build specs and outcomes..." colspan={2} />
                      </div>
                    ))}
                  </SectionCard>
                );
              }

              if (sectionKey === 'certifications') {
                return (
                  <SectionCard 
                    key="certifications"
                    icon="workspace_premium" 
                    title={displayTitle} 
                    subtitle="Professional Credentials" 
                    buttonText="Add Certification" 
                    onAdd={addCertification}
                    value="certifications"
                    isExpanded={activeAccordionSections.includes('certifications')}
                    dragHandleProps={{}}
                    onTitleDoubleClick={() => {
                      setEditingSectionKey('certifications');
                      setEditingTitleValue(displayTitle);
                    }}
                    isEditingTitle={isEditing}
                    editingTitleValue={editingTitleValue}
                    onTitleChange={(e) => setEditingTitleValue(e.target.value)}
                    onTitleBlur={() => submitRename('certifications')}
                    onTitleKeyDown={(e) => e.key === 'Enter' && submitRename('certifications')}
                    headerAction={reorderAction}
                  >
                    {/* Certifications Sub-Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4 pb-1.5 border-b border-slate-200/50">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#3D5751' }}>Certifications</h4>
                        <button 
                          onClick={addCertification}
                          className="px-2.5 py-1 text-[10px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/50 border border-teal-200/40 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">add</span> Add Cert
                        </button>
                      </div>
                      
                      {formData.certifications.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No certifications added yet.</p>
                      ) : (
                        formData.certifications.map((cert, index) => (
                          <div key={index} className="relative border-l-2 border-teal-500/20 pl-5 py-2 mb-4 group transition-all hover:border-teal-500">
                            <button 
                              onClick={() => removeCertification(index)} 
                              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <span className="col-span-1 sm:col-span-3">
                                <FormItem label="Certification Title" value={cert.title} onChange={(e) => {
                                  const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], title: e.target.value }; updateField('certifications', newCerts);
                                }} placeholder="e.g. AWS Certified Cloud Practitioner" />
                              </span>
                              <span className="col-span-2">
                                <FormItem label="Issuing Organization" value={cert.issuingOrganization} onChange={(e) => {
                                  const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], issuingOrganization: e.target.value }; updateField('certifications', newCerts);
                                }} placeholder="e.g. Amazon Web Services" />
                              </span>
                              <FormItem label="Year" value={cert.year} onChange={(e) => {
                                  const newCerts = [...formData.certifications]; newCerts[index] = { ...newCerts[index], year: e.target.value }; updateField('certifications', newCerts);
                                }} placeholder="e.g. 2023" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Achievements Sub-Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-1.5 border-b border-slate-200/50">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Achievements</h4>
                        <button 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, achievements: [...prev.achievements, { title: '', year: '' }] }));
                            handleFieldChange();
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/50 border border-teal-200/40 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">add</span> Add Achievement
                        </button>
                      </div>
                      
                      {formData.achievements.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No achievements added yet.</p>
                      ) : (
                        formData.achievements.map((ach, index) => (
                          <div key={index} className="relative border-l-2 border-teal-500/20 pl-5 py-2 mb-4 group transition-all hover:border-teal-500">
                            <button 
                              onClick={() => {
                                setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));
                                handleFieldChange();
                              }} 
                              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <span className="col-span-2">
                                <FormItem label="Achievement Title" value={ach.title} onChange={(e) => {
                                  const newAchs = [...formData.achievements]; newAchs[index] = { ...newAchs[index], title: e.target.value }; updateField('achievements', newAchs);
                                }} placeholder="e.g. Won 1st place in National Hackathon" />
                              </span>
                              <FormItem label="Year" value={ach.year} onChange={(e) => {
                                const newAchs = [...formData.achievements]; newAchs[index] = { ...newAchs[index], year: e.target.value }; updateField('achievements', newAchs);
                              }} placeholder="e.g. 2024" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                );
              }

              return null;
            })}

            {/* 3. Add Removed Section menu triggers at the end of the scroll */}
            {sectionConfig.hidden.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-200/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Add Removed Sections Back:</p>
                <div className="flex flex-wrap gap-2">
                  {sectionConfig.hidden.map(hiddenKey => {
                    const displayTitle = sectionConfig.titles[hiddenKey] || hiddenKey.toUpperCase();
                    return (
                      <button
                        key={hiddenKey}
                        type="button"
                        onClick={() => {
                          setSectionConfig(prev => ({
                            ...prev,
                            hidden: prev.hidden.filter(k => k !== hiddenKey)
                          }));
                          handleFieldChange();
                          setSnack({ open: true, type: 'success', text: `Restored "${displayTitle}" section.` });
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                        {displayTitle}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Accordion>

          {/* Floating Action Bar (Mobile only, hidden on large screens) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 lg:hidden z-20 flex gap-4 font-sans">
            <button onClick={handleSave} className="flex-1 bg-[#1A2E28] hover:bg-[#14241f] text-white font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs transition-colors">
              <Save className="w-4 h-4" /> Save
            </button>
            <button 
              onClick={downloadPDF} 
              disabled={compiling} 
              className="flex-1 font-bold uppercase py-3 flex items-center justify-center gap-2 cursor-pointer text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(20,180,140,0.08)',
                color: 'rgb(20,180,140)',
                border: '1px solid rgba(20,180,140,0.3)'
              }}
            >
              <Download className="w-4 h-4" /> {compiling ? 'Compiling...' : 'Export'}
            </button>
          </div>
        </Panel>

        {/* DRAGGABLE RESIZER HANDLE */}
        <PanelResizeHandle className="hidden lg:flex w-2 hover:w-2 bg-slate-100 hover:bg-slate-200 active:bg-teal-500/20 transition-colors cursor-col-resize z-30 items-center justify-center relative group">
          <div className="w-1 h-8 rounded-full bg-slate-300 group-hover:bg-slate-400 group-active:bg-teal-600 transition-colors" />
        </PanelResizeHandle>

        {/* RIGHT PANEL: PDF Preview */}
        <Panel defaultSize={52} minSize={35} className="hidden lg:flex flex-col h-full pb-0 relative font-sans" style={{ background: 'linear-gradient(180deg, #FBFEFC 0%, #F0F9F6 100%)' }}>
          {/* Top bar with resume status and controls */}
          <div className="relative z-50 bg-white border-b border-slate-200 p-4 flex items-center justify-between gap-4 shrink-0 font-sans">
            <div className="min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center text-xs font-sans font-bold text-slate-800 uppercase tracking-wider">
                  <input
                    type="text"
                    value={pdfFilename}
                    onChange={(e) => setPdfFilename(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="bg-transparent border-b border-transparent hover:border-[#14B8A6]/40 focus:border-[#14B8A6] focus:outline-none text-slate-800 text-xs font-bold uppercase tracking-wider px-1 py-0.5 w-32 focus:w-48 transition-all font-sans"
                    placeholder="FILENAME"
                  />
                  <span className="opacity-50 text-[10px] text-slate-400">.pdf</span>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5 min-w-0">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-sans whitespace-nowrap">
                  <span className={`w-1.5 h-1.5 rounded-full ${compiling ? 'bg-yellow-500 animate-pulse' : pdfUrl ? 'bg-teal-500' : 'bg-red-500'} inline-block`}></span>
                  {compiling ? 'Rendering PDF...' : pdfUrl ? 'Preview Compiled' : 'Ready'}
                </p>
              </div>
            </div>

            {/* Template Selector, Zoom, and manual sync */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              <TemplateSelector 
                templateId={templateType} 
                onSelect={(id) => {
                  setTemplateType(id);
                  // Update generatedResume in localStorage to store selected template config
                  try {
                    const stored = localStorage.getItem('generatedResume');
                    if (stored) {
                      const parsed = JSON.parse(stored);
                      parsed.selectedTemplate = id;
                      parsed.templateType = id;
                      localStorage.setItem('generatedResume', JSON.stringify(parsed));
                    }
                  } catch (e) {
                    void e;
                  }
                }} 
              />
              <div className="w-px h-5 bg-slate-200/80 mx-1"></div>
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-200/60 hover:shadow-sm cursor-pointer"><span className="material-symbols-outlined text-[16px]">remove</span></button>
              <span className="font-bold text-xs text-slate-700 w-11 text-center font-sans">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-200/60 hover:shadow-sm cursor-pointer"><span className="material-symbols-outlined text-[16px]">add</span></button>
              <div className="w-px h-5 bg-slate-200/80 mx-1"></div>
              <button onClick={handleManualCompile} disabled={compiling} className="w-8 h-8 flex items-center justify-center hover:bg-teal-50 text-teal-600 rounded-lg transition-all border border-transparent hover:border-teal-200/50 hover:shadow-sm cursor-pointer">
                <span className={`material-symbols-outlined text-[16px] ${compiling ? 'animate-spin opacity-50' : ''}`}>sync</span>
              </button>
            </div>
          </div>

          {/* Live Preview compilation and view wrapper */}
          <div className="flex-grow relative overflow-auto flex flex-col items-center p-4 sm:p-8" style={{ background: 'linear-gradient(180deg, #FBFEFC 0%, #F0F9F6 100%)' }}>
            {pdfUrl && !compileError ? (
              <div className="w-full h-full flex flex-col items-center justify-start relative min-h-[500px]">
                <div 
                  className="transition-all duration-200 flex flex-col items-center justify-center w-full"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  {ReactPdf ? (
                    <ReactPdf.Document
                      file={pdfUrl}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={
                        <div className="flex items-center justify-center p-16">
                          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        </div>
                      }
                      error={
                        <iframe
                          key={pdfUrl}
                          src={`${pdfUrl}#view=FitH`}
                          className="w-full min-h-[800px] border-none rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white"
                          title="PDF Preview Fallback"
                        />
                      }
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-slate-200/80 bg-white">
                        <ReactPdf.Page 
                          pageNumber={1} 
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                          className="max-w-full"
                        />
                      </div>
                    </ReactPdf.Document>
                  ) : (
                    <div className="flex items-center justify-center p-16">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                    </div>
                  )}
                </div>
                {compiling && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[2px] rounded-xl z-20">
                    <div className="bg-white border border-teal-100 p-6 max-w-xs w-full text-center shadow-2xl rounded-2xl">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                      <div className="uppercase font-bold tracking-widest text-xs text-slate-800 font-sans">Compiling...</div>
                    </div>
                  </div>
                )}
              </div>
            ) : compileError ? (
              <div className="bg-white p-8 max-w-md w-full text-center shadow-lg border border-rose-200 rounded-2xl my-auto">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-sans">Couldn't render preview</h3>
                <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
                  We encountered an issue during compilation. Check your inputs (e.g. special characters like &, %, $, #, _) and try compiling again.
                </p>
                <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl font-mono text-[10px] text-rose-700 text-left max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {compileError}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={handleManualCompile} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">refresh</span> RETRY
                  </button>
                  <button onClick={downloadTex} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2.5 font-bold uppercase text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">code</span> EXTRACT .TEX
                  </button>
                </div>
              </div>
            ) : compiling ? (
              <div className="bg-white p-8 max-w-sm w-full text-center shadow-lg border border-teal-100 rounded-2xl my-auto">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
                <div className="uppercase font-bold tracking-widest text-xs text-slate-800 font-sans">Compiling Latex Source</div>
              </div>
            ) : (
              <div className="bg-white p-8 max-w-sm w-full text-center shadow-lg border border-slate-200 rounded-2xl my-auto">
                <span className="material-symbols-outlined text-5xl mb-3 text-slate-400">description</span>
                <h3 className="text-md font-bold text-slate-800 font-sans">No PDF Available</h3>
                <p className="text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider font-sans">Awaiting Compilation Trigger</p>
                <button onClick={handleManualCompile} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 font-bold uppercase text-xs border border-transparent rounded-xl w-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans">
                  <RefreshCw className="w-4 h-4" /> Initialize Render
                </button>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="bg-white border-t border-slate-200 p-4 flex gap-3 shrink-0 z-10 font-sans">
            <button onClick={handleSave} className="flex-1 bg-[#1A2E28] hover:bg-[#14241f] text-white font-bold uppercase tracking-wider py-2.5 text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              <Save className="w-4.5 h-4.5" /> Save
            </button>
            <button 
              onClick={downloadPDF} 
              disabled={compiling} 
              className="flex-1 font-bold uppercase tracking-wider py-2.5 text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              style={{
                backgroundColor: 'rgba(20,180,140,0.08)',
                color: 'rgb(20,180,140)',
                border: '1px solid rgba(20,180,140,0.3)'
              }}
            >
              <Download className="w-4.5 h-4.5" /> {compiling ? 'Compiling...' : 'Download'}
            </button>
          </div>
        </Panel>
      </PanelGroup>

      {/* AI Agent Chat overlay */}
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
          <div className={`p-4 rounded-2xl border font-bold text-xs shadow-lg flex items-center gap-3 ${
            snack.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-600' 
              : snack.type === 'info' 
                ? 'bg-sky-50 border-sky-200 text-sky-600' 
                : 'bg-teal-50 border-teal-200 text-teal-700'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {snack.type === 'error' ? 'error' : snack.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <div className="flex-grow leading-relaxed font-sans">{snack.text}</div>
          </div>
        </div>
      )}

      {showFeedback && <FeedbackPopup onClose={() => setShowFeedback(false)} />}
    </div>
  );
};

export default EditResume;
