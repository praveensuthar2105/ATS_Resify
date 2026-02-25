import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LatexEditor.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export default function LatexEditor({ open, onClose, resumeData, templateType = 'professional', onSyncBack }) {
  const [loading, setLoading] = useState(false);
  const [latexCode, setLatexCode] = useState('');
  const [monacoAvailable, setMonacoAvailable] = useState(false);
  const [Editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const [autoCompile, setAutoCompile] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [previewSynced, setPreviewSynced] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [fileName, setFileName] = useState('Software_Engineer_2024.tex');
  const autoTimer = useRef(null);
  const syncTimer = useRef(null);
  const isInitialLoad = useRef(true);

  // State for compile errors
  const [compileError, setCompileError] = useState(null);
  const [useOnlineCompiler, setUseOnlineCompiler] = useState(false);

  // Resizable panel state
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  // Handle resize drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp between 20% and 80%
    const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
    setEditorWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Load Monaco editor dynamically
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@monaco-editor/react');
        if (!cancelled) {
          // Monaco exports Editor as default
          setEditor(() => mod.default || mod.Editor);
          setMonacoAvailable(true);
        }
      } catch (err) {
        console.warn('Monaco not available, using textarea fallback:', err);
        setMonacoAvailable(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Escape special LaTeX characters
  const escapeLatex = (str) => {
    if (!str) return '';
    // Use placeholder to avoid double-escaping braces from \textbackslash{}
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

  // Parse LaTeX code back into resume data JSON
  const parseLatexToResumeData = useCallback((latex) => {
    try {
      const result = {
        personalInformation: {},
        summary: '',
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
        achievements: [],
        languages: [],
        interests: [],
      };

      // Helper: unescape LaTeX special chars
      const unescapeLatex = (str) => {
        if (!str) return '';
        return str
          .replace(/\\textbackslash\{\}/g, '\\')
          .replace(/\\&/g, '&')
          .replace(/\\%/g, '%')
          .replace(/\\\$/g, '$')
          .replace(/\\#/g, '#')
          .replace(/\\_/g, '_')
          .replace(/\\\{/g, '{')
          .replace(/\\\}/g, '}')
          .replace(/\\textasciitilde\{\}/g, '~')
          .replace(/\\textasciicircum\{\}/g, '^')
          .trim();
      };

      // Extract name from header
      const nameMatch = latex.match(/\\textbf\{\\uppercase\{([^}]*)\}\}/);
      if (nameMatch) {
        result.personalInformation.fullName = unescapeLatex(nameMatch[1]);
      }

      // Extract contact line (after the name, before first section)
      const contactLineMatch = latex.match(/\\vspace\{2pt\}\s*\n([^\n]+)\n\\end\{center\}/);
      if (contactLineMatch) {
        const contactLine = contactLineMatch[1];
        const parts = contactLine.split(/\s*\$\|\$\s*/).map(p => p.trim());
        parts.forEach(part => {
          // Check for href (LinkedIn, GitHub, Portfolio)
          const hrefMatch = part.match(/\\href\{([^}]*)\}\{([^}]*)\}/);
          if (hrefMatch) {
            const url = hrefMatch[1];
            const label = hrefMatch[2].toLowerCase();
            if (label.includes('linkedin')) result.personalInformation.linkedIn = unescapeLatex(url);
            else if (label.includes('github')) result.personalInformation.gitHub = unescapeLatex(url);
            else if (label.includes('portfolio')) result.personalInformation.portfolio = unescapeLatex(url);
          } else if (part.includes('@')) {
            result.personalInformation.email = unescapeLatex(part);
          } else if (part.match(/^[+\d\s\-().]+$/)) {
            result.personalInformation.phoneNumber = unescapeLatex(part);
          } else if (part && !part.startsWith('\\')) {
            result.personalInformation.location = unescapeLatex(part);
          }
        });
      }

      // Split by sections
      const sectionRegex = /\\section\*\{([^}]*)\}/g;
      const sections = [];
      let match;
      while ((match = sectionRegex.exec(latex)) !== null) {
        sections.push({ name: match[1].toLowerCase().trim(), index: match.index + match[0].length });
      }

      const getSectionContent = (idx) => {
        const start = sections[idx].index;
        const end = idx + 1 < sections.length ? sections[idx + 1].index - sections[idx + 1].name.length - 12 : latex.indexOf('\\end{document}');
        return latex.substring(start, end > start ? end : latex.length).trim();
      };

      sections.forEach((sec, idx) => {
        const content = getSectionContent(idx);
        const sectionName = sec.name;

        if (sectionName.includes('education')) {
          // Parse education entries: \textbf{University}, Location \hfill Year
          // \textit{Degree} | GPA: X
          const eduBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim());
          eduBlocks.forEach(block => {
            const uniMatch = block.match(/\\textbf\{([^}]*)\}(?:,\s*([^\\]*))?\s*\\hfill\s*(.*)/);
            const degreeMatch = block.match(/\\textit\{([^}]*)\}/);
            const gpaMatch = block.match(/GPA:\s*([\d.]+)/);
            if (uniMatch || degreeMatch) {
              result.education.push({
                university: unescapeLatex(uniMatch ? uniMatch[1] : ''),
                location: unescapeLatex(uniMatch && uniMatch[2] ? uniMatch[2].trim() : ''),
                graduationYear: unescapeLatex(uniMatch ? uniMatch[3]?.trim() : ''),
                degree: unescapeLatex(degreeMatch ? degreeMatch[1] : ''),
                gpa: gpaMatch ? gpaMatch[1] : '',
              });
            }
          });
        }

        else if (sectionName.includes('experience')) {
          const expBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim());
          expBlocks.forEach(block => {
            const companyMatch = block.match(/\\textbf\{([^}]*)\}(?:,\s*([^\\]*))?\s*\\hfill\s*(.*)/);
            const titleMatch = block.match(/\\textit\{([^}]*)\}/);
            // Extract bullet items
            const items = [];
            const itemRegex = /\\item\s+([^\\]+?)(?=\\item|\\end\{itemize\}|$)/gs;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(block)) !== null) {
              items.push(unescapeLatex(itemMatch[1].trim()));
            }
            if (companyMatch || titleMatch) {
              result.experience.push({
                company: unescapeLatex(companyMatch ? companyMatch[1] : ''),
                location: unescapeLatex(companyMatch && companyMatch[2] ? companyMatch[2].trim() : ''),
                duration: unescapeLatex(companyMatch ? companyMatch[3]?.trim() : ''),
                jobTitle: unescapeLatex(titleMatch ? titleMatch[1] : ''),
                responsibility: items.length > 0 ? items.join('\n') : '',
              });
            }
          });
        }

        else if (sectionName.includes('project')) {
          const projBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim());
          projBlocks.forEach(block => {
            const titleMatch = block.match(/\\textbf\{([^}]*)\}/);
            const techMatch = block.match(/\\textit\{([^}]*)\}/);
            const githubMatch = block.match(/\\href\{([^}]*)\}\{GitHub\}/);
            // Extract bullet items
            const items = [];
            const itemRegex = /\\item\s+([^\\]+?)(?=\\item|\\end\{itemize\}|$)/gs;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(block)) !== null) {
              items.push(unescapeLatex(itemMatch[1].trim()));
            }
            if (titleMatch) {
              result.projects.push({
                title: unescapeLatex(titleMatch[1]),
                technologiesUsed: unescapeLatex(techMatch ? techMatch[1] : ''),
                description: items.length > 0 ? items.join('\n') : '',
                githubLink: githubMatch ? unescapeLatex(githubMatch[1]) : '',
              });
            }
          });
        }

        else if (sectionName.includes('skill')) {
          // Format: \textbf{Category:} item1, item2 \\
          // Split by \\ (line breaks in LaTeX) or newlines, clean up
          const skillLines = content.split(/\s*\\\\\s*|\n/).map(l => l.trim()).filter(l => l.length > 0);
          skillLines.forEach(line => {
            // Match \textbf{Category:} rest  OR  \textbf{Category} rest
            const skillMatch = line.match(/\\textbf\{([^}]*)\}\s*:?\s*(.*)/);
            if (skillMatch) {
              let category = unescapeLatex(skillMatch[1].replace(/:$/, '').trim());
              let itemsStr = unescapeLatex(skillMatch[2].replace(/:$/, '').trim());

              // If items contain comma-separated values, expand into individual skills
              if (itemsStr && itemsStr.includes(',')) {
                const individualSkills = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
                individualSkills.forEach(skillName => {
                  result.skills.push({
                    title: skillName,
                    level: 'Intermediate',
                    category: category,
                  });
                });
              } else if (itemsStr) {
                // Single skill item or level value
                result.skills.push({
                  title: category,
                  level: itemsStr || 'Intermediate',
                });
              } else {
                result.skills.push({
                  title: category,
                  level: 'Intermediate',
                });
              }
            }
          });
        }

        else if (sectionName.includes('certification')) {
          const itemRegex = /\\item\s+([^\\]+?)(?=\\item|\\end\{itemize\}|$)/gs;
          let itemMatch;
          while ((itemMatch = itemRegex.exec(content)) !== null) {
            const raw = unescapeLatex(itemMatch[1].trim());
            const certParts = raw.match(/^(.+?)(?:\s*--\s*(.+?))?(?:\s*\(([^)]+)\))?$/);
            result.certifications.push({
              title: certParts ? certParts[1].trim() : raw,
              issuingOrganization: certParts && certParts[2] ? certParts[2].trim() : '',
              year: certParts && certParts[3] ? certParts[3].trim() : '',
            });
          }
        }

        else if (sectionName.includes('achievement')) {
          const itemRegex = /\\item\s+([^\\]+?)(?=\\item|\\end\{itemize\}|$)/gs;
          let itemMatch;
          while ((itemMatch = itemRegex.exec(content)) !== null) {
            const raw = unescapeLatex(itemMatch[1].trim());
            const achParts = raw.match(/^(.+?)(?::\s*(.+?))?(?:\s*\(([^)]+)\))?$/);
            result.achievements.push({
              title: achParts ? achParts[1].trim() : raw,
              description: achParts && achParts[2] ? achParts[2].trim() : '',
              year: achParts && achParts[3] ? achParts[3].trim() : '',
            });
          }
        }
      });

      return result;
    } catch (err) {
      console.error('Error parsing LaTeX:', err);
      return null;
    }
  }, []);

  // Auto-sync LaTeX changes back to form with debounce
  const handleLatexChange = useCallback((value) => {
    setLatexCode(value || '');

    // Don't sync during initial load
    if (isInitialLoad.current) return;

    // Debounce sync - wait 1.5s after user stops typing
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (!onSyncBack) return;
      try {
        const parsed = parseLatexToResumeData(value || '');
        if (parsed) {
          onSyncBack(parsed);
        }
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    }, 1500);
  }, [onSyncBack, parseLatexToResumeData]);

  // Cleanup sync timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, []);

  // Generate LaTeX from resume data (use frontend generation for reliable compilation)
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    isInitialLoad.current = true;

    // Use frontend-generated LaTeX for reliable compilation
    // Backend templates have custom commands that may fail with incomplete data
    setTimeout(() => {
      setLatexCode(generateSampleLatex(resumeData));
      setLoading(false);
      // Allow a tick for the editor to settle before enabling auto-sync
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    }, 100);
  }, [open, resumeData, templateType]);

  // Generate ATS-optimized LaTeX from resume data (matching demo resume format)
  const generateSampleLatex = (data) => {
    const pi = data?.personalInformation || {};
    const name = escapeLatex(pi.fullName || 'Your Name');
    const email = escapeLatex(pi.email || 'email@example.com');
    const phone = escapeLatex(pi.phoneNumber || '+1 234 567 8900');
    const location = escapeLatex(pi.location || '');
    const linkedin = pi.linkedIn ? escapeLatex(pi.linkedIn) : '';
    const github = pi.gitHub ? escapeLatex(pi.gitHub) : '';
    const portfolio = pi.portfolio ? escapeLatex(pi.portfolio) : '';

    // Build contact line
    let contactParts = [phone, email];
    if (linkedin) contactParts.push(`\\href{${linkedin}}{LinkedIn}`);
    if (github) contactParts.push(`\\href{${github}}{GitHub}`);
    if (portfolio) contactParts.push(`\\href{${portfolio}}{Portfolio}`);
    if (location) contactParts.push(location);
    const contactLine = contactParts.join(' $|$ ');

    // Build education section
    let educationSection = '';
    if (data?.education && data.education.length > 0) {
      const eduItems = data.education.map(edu => {
        const university = escapeLatex(edu.university || edu.institution || edu.school || 'University');
        const eduLocation = escapeLatex(edu.location || '');
        const degree = escapeLatex(edu.degree || 'Degree');
        const year = escapeLatex(edu.graduationYear || edu.endDate || '');
        const gpa = edu.gpa ? ` $|$ GPA: ${escapeLatex(edu.gpa)}` : '';

        return `\\textbf{${university}}${eduLocation ? `, ${eduLocation}` : ''} \\hfill ${year}

\\textit{${degree}}${gpa}`;
      }).join('\n\n');

      educationSection = `\\section*{Education}\n${eduItems}`;
    }

    // Build experience section with bullet points
    let experienceSection = '';
    if (data?.experience && data.experience.length > 0) {
      const expItems = data.experience.map(exp => {
        const company = escapeLatex(exp.company || 'Company');
        const expLocation = escapeLatex(exp.location || '');
        const title = escapeLatex(exp.jobTitle || exp.title || 'Position');
        const duration = escapeLatex(exp.duration || `${exp.startDate || ''} -- ${exp.endDate || 'Present'}`);

        // Parse responsibilities into bullet points
        let bullets = '';
        if (exp.responsibility || exp.responsibilities) {
          const respText = exp.responsibility || exp.responsibilities;
          let respList;
          if (Array.isArray(respText)) {
            respList = respText;
          } else {
            // Split by newlines, bullets, or sentence boundaries (Safari-compatible, no lookbehind)
            respList = respText.split(/[\n•\-]/).map(r => r.trim()).filter(r => r.length > 10);
          }
          if (respList.length > 0) {
            bullets = `\\begin{itemize}\n${respList.map(r => `\\item ${escapeLatex(r)}`).join('\n')}\n\\end{itemize}`;
          }
        }

        return `\\textbf{${company}}${expLocation ? `, ${expLocation}` : ''} \\hfill ${duration}

\\textit{${title}}
${bullets}`;
      }).join('\n\n');

      experienceSection = `\\section*{Experience}\n${expItems}`;
    }

    // Build projects section with bullet points
    let projectsSection = '';
    if (data?.projects && data.projects.length > 0) {
      const projItems = data.projects.map(proj => {
        const title = escapeLatex(proj.title || proj.name || 'Project');
        const tech = proj.technologiesUsed
          ? escapeLatex(Array.isArray(proj.technologiesUsed) ? proj.technologiesUsed.join(', ') : proj.technologiesUsed)
          : '';
        const githubLink = proj.githubLink ? escapeLatex(proj.githubLink) : '';
        const liveLink = proj.liveLink ? escapeLatex(proj.liveLink) : '';

        // Project header line
        let headerLine = `\\textbf{${title}}`;
        if (tech) headerLine += ` $|$ \\textit{${tech}}`;
        if (githubLink) headerLine += ` \\hfill \\href{${githubLink}}{GitHub}`;
        if (liveLink) headerLine += `${githubLink ? ' $|$' : ' \\hfill'} \\href{${liveLink}}{Live}`;

        // Parse description into bullet points
        let bullets = '';
        if (proj.description) {
          let descList;
          if (Array.isArray(proj.description)) {
            descList = proj.description;
          } else {
            // Split on newlines, bullets, or sentence boundaries (Safari-safe, no lookbehind)
            descList = proj.description
              .split(/[\n•\-]/)
              .flatMap(seg => seg.split(/\.\s+(?=[A-Z])/))
              .map(d => d.trim())
              .filter(d => d.length > 10);
          }
          if (descList.length > 0) {
            bullets = `\\begin{itemize}\n${descList.map(d => `\\item ${escapeLatex(d)}`).join('\n')}\n\\end{itemize}`;
          }
        }

        return `${headerLine}
${bullets}`;
      }).join('\n\n');

      projectsSection = `\\section*{Projects}\n${projItems}`;
    }

    // Normalize skills from any format
    const normalizeSkillsForLatex = (skills) => {
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

    // Build skills section (categorized format)
    let skillsSection = '';
    const normalizedSkills = normalizeSkillsForLatex(data?.skills);
    if (normalizedSkills.length > 0) {
      const skillLines = normalizedSkills.map(s => {
        if (typeof s === 'string') {
          return `\\textbf{Skills:} ${escapeLatex(s)}`;
        }
        const category = escapeLatex(s.title || s.category || 'Skills');
        const items = s.items
          ? escapeLatex(Array.isArray(s.items) ? s.items.join(', ') : s.items)
          : escapeLatex(s.level || '');
        return `\\textbf{${category}:} ${items}`;
      }).filter(Boolean);

      if (skillLines.length > 0) {
        skillsSection = `\\section*{Technical Skills}\n${skillLines.join(' \\\\\n')}`;
      }
    }

    // Build certifications section
    let certificationsSection = '';
    if (data?.certifications && data.certifications.length > 0) {
      const certItems = data.certifications.map(cert => {
        const title = escapeLatex(cert.title || cert.name || 'Certification');
        const org = cert.issuingOrganization ? escapeLatex(cert.issuingOrganization) : '';
        const year = cert.year ? ` (${escapeLatex(cert.year)})` : '';
        return `\\item ${title}${org ? ` -- ${org}` : ''}${year}`;
      }).join('\n');

      certificationsSection = `\\section*{Certifications}\n\\begin{itemize}\n${certItems}\n\\end{itemize}`;
    }

    // Build achievements section
    let achievementsSection = '';
    if (data?.achievements && data.achievements.length > 0) {
      const achItems = data.achievements.map(ach => {
        if (typeof ach === 'string') {
          return `\\item ${escapeLatex(ach)}`;
        }
        const title = escapeLatex(ach.title || 'Achievement');
        const desc = ach.description ? `: ${escapeLatex(ach.description)}` : '';
        const year = ach.year ? ` (${escapeLatex(ach.year)})` : '';
        return `\\item ${title}${desc}${year}`;
      }).join('\n');

      achievementsSection = `\\section*{Achievements}\n\\begin{itemize}\n${achItems}\n\\end{itemize}`;
    }

    return `\\documentclass[10pt,letterpaper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[top=0.4in,bottom=0.4in,left=0.5in,right=0.5in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

% ATS-Optimized formatting
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section formatting
\\titleformat{\\section}{\\normalsize\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

% Tight list spacing
\\setlist[itemize]{leftmargin=0.15in, topsep=2pt, itemsep=1pt, parsep=0pt}

\\begin{document}

%----------HEADER----------
\\begin{center}
{\\Large \\textbf{\\uppercase{${name}}}}

\\vspace{2pt}
${contactLine}
\\end{center}

${educationSection ? `%----------EDUCATION----------\n${educationSection}\n` : ''}
${experienceSection ? `%----------EXPERIENCE----------\n${experienceSection}\n` : ''}
${projectsSection ? `%----------PROJECTS----------\n${projectsSection}\n` : ''}
${skillsSection ? `%----------TECHNICAL SKILLS----------\n${skillsSection}\n` : ''}
${certificationsSection ? `%----------CERTIFICATIONS----------\n${certificationsSection}\n` : ''}
${achievementsSection ? `%----------ACHIEVEMENTS----------\n${achievementsSection}\n` : ''}
\\end{document}`;
  };

  // Extract meaningful error from LaTeX log
  const extractLatexError = (message) => {
    if (!message) return 'Compilation failed';

    // Look for LaTeX error patterns
    const errorMatch = message.match(/! LaTeX Error: (.+?)(?:\r?\n|$)/);
    if (errorMatch) return `LaTeX Error: ${errorMatch[1]}`;

    const lineMatch = message.match(/l\.(\d+)\s+(.+?)(?:\r?\n|$)/);
    if (lineMatch) return `Error at line ${lineMatch[1]}: ${lineMatch[2]}`;

    // Check for security/privilege error
    if (message.includes('elevated privileges')) {
      return 'MiKTeX security warning: Try running VS Code without administrator privileges, or use "Download .TEX" and compile with Overleaf/ShareLaTeX';
    }

    // Truncate if too long
    if (message.length > 200) {
      return message.substring(0, 200) + '...';
    }

    return message;
  };

  /**
   * Compile LaTeX to PDF via external online service (fallback).
   * External dependency: latex.ytotech.com (free LaTeX compilation API)
   * Privacy: Document content is sent to third-party server for compilation.
   * TOS/Privacy: https://latex.ytotech.com (check their terms before use)
   */
  const compileOnline = async () => {
    if (!latexCode) return;

    // Check for user consent before sending to external service
    const hasConsent = localStorage.getItem('externalCompileConsent');
    if (!hasConsent) {
      const userConsent = window.confirm(
        'Online compilation will send your LaTeX document to an external service (latex.ytotech.com).\\n\\n' +
        'Your document content will be transmitted to their servers for compilation.\\n\\n' +
        'Do you consent to using this external service?'
      );
      if (!userConsent) {
        setCompileError('Online compilation cancelled. Try downloading .TEX and using Overleaf instead.');
        return;
      }
      localStorage.setItem('externalCompileConsent', 'true');
    }

    setCompiling(true);
    setCompileError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      // Use latex.ytotech.com free API
      const resp = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{
            main: true,
            content: latexCode
          }]
        })
      });

      if (resp.ok) {
        const blob = await resp.blob();
        if (blob.type === 'application/pdf') {
          setPdfBlob(blob);
          // Use functional update to avoid stale closure
          setPdfUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setPreviewSynced(true);
          setCompileError(null);
        } else {
          // Error response
          const text = await blob.text();
          setCompileError('Online compilation failed: ' + text.substring(0, 200));
        }
      } else {
        setCompileError('Online compilation service unavailable');
      }
    } catch (e) {
      console.error('Online compile error:', e);
      setCompileError(
        e.name === 'AbortError'
          ? 'Online compilation timed out (60s). Try downloading .TEX and using Overleaf.'
          : 'Could not connect to online compiler. Try downloading .TEX and using Overleaf.'
      );
    } finally {
      clearTimeout(timeoutId);
      setCompiling(false);
    }
  };

  // Compile LaTeX to PDF via backend (local compiler)
  const compileLocal = async () => {
    if (!latexCode) return;
    setCompiling(true);
    setCompileError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const resp = await fetch(`${API_BASE_URL}/latex/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ latexCode })
      });

      if (resp.ok) {
        const contentType = resp.headers.get('content-type');
        if (contentType && contentType.includes('application/pdf')) {
          const blob = await resp.blob();
          setPdfBlob(blob);

          // Use functional update to avoid stale closure
          setPdfUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setPreviewSynced(true);
          setCompileError(null);
        } else {
          // Backend returned error
          const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Compile error:', errorData);
          const errorMsg = extractLatexError(errorData.message || errorData.error);

          // If local fails with privilege error, suggest online compiler
          if (errorData.message?.includes('elevated privileges')) {
            setCompileError(errorMsg);
            // Auto-switch to online compiler
            setUseOnlineCompiler(true);
          } else {
            setCompileError(errorMsg);
          }
          setPreviewSynced(true);
        }
      } else {
        const errorData = await resp.json().catch(() => ({ error: 'Compilation failed' }));
        console.error('Compile failed:', errorData);
        setCompileError(extractLatexError(errorData.message || errorData.error));
        setPreviewSynced(true);
      }
    } catch (e) {
      console.error('Compile error:', e);
      if (e.name === 'AbortError') {
        setCompileError('Compilation timeout: service did not respond within 60 seconds');
      } else {
        setCompileError('Network error: Could not connect to compilation service');
      }
      setPreviewSynced(true);
    } finally {
      clearTimeout(timeoutId);
      setCompiling(false);
    }
  };

  // Main compile function - chooses local or online (wrapped in useCallback for useEffect deps)
  const compileToPdf = useCallback(async () => {
    if (useOnlineCompiler) {
      await compileOnline();
    } else {
      await compileLocal();
    }
  }, [useOnlineCompiler]);

  // Auto-compile when code changes
  useEffect(() => {
    if (!autoCompile || !latexCode) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    setPreviewSynced(false);

    autoTimer.current = setTimeout(() => {
      // Compile LaTeX to PDF
      compileToPdf();
    }, 2000); // Wait 2s after typing stops

    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [latexCode, autoCompile, compileToPdf]);

  // Manual compile button
  const handleCompile = () => {
    compileToPdf();
  };

  const handleSaveToFile = () => {
    const blob = new Blob([latexCode], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.tex', '.pdf');
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      // Compile first then download - use appropriate endpoint based on useOnlineCompiler
      setCompiling(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const endpoint = useOnlineCompiler
          ? 'https://latex.ytotech.com/builds/sync'
          : `${API_BASE_URL}/latex/compile`;

        const fetchOptions = useOnlineCompiler
          ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              compiler: 'pdflatex',
              resources: [{ main: true, content: latexCode }]
            })
          }
          : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify({ latexCode })
          };

        const resp = await fetch(endpoint, fetchOptions);
        if (resp.ok) {
          const blob = await resp.blob();
          setPdfBlob(blob);

          // Revoke previous URL before creating new one
          setPdfUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });

          // Auto download using the blob directly
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = fileName.replace('.tex', '.pdf');
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(downloadUrl);
        }
      } catch (e) {
        console.error('Failed to compile:', e);
        if (e.name === 'AbortError') {
          setCompileError('Compilation timeout');
        }
      } finally {
        clearTimeout(timeoutId);
        setCompiling(false);
      }
    }
  };

  const renderEditor = () => {
    if (loading) {
      return (
        <div className="editor-loading">
          <div className="spinner"></div>
          <p>Loading LaTeX...</p>
        </div>
      );
    }

    if (monacoAvailable && Editor) {
      const MonacoEditor = Editor;
      return (
        <MonacoEditor
          height="100%"
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
      );
    }

    // Fallback textarea
    return (
      <textarea
        className="latex-textarea"
        value={latexCode}
        onChange={(e) => handleLatexChange(e.target.value)}
        spellCheck={false}
      />
    );
  };

  if (!open) return null;

  return (
    <div className="latex-editor-overlay">
      {/* Top Header */}
      <header className="latex-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📄</span>
            <span className="logo-text">ATS Resify</span>
            <span className="logo-badge">Editor</span>
          </div>
          <div className="breadcrumb">
            <span>My Resumes</span>
            <span className="separator">›</span>
            <span className="current">{fileName}</span>
          </div>
        </div>
        <div className="header-center">
          <label className="auto-compile-toggle">
            <input
              type="checkbox"
              checked={autoCompile}
              onChange={(e) => setAutoCompile(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Auto-Compile</span>
          </label>
        </div>
        <div className="header-right">
          <button className="header-btn export-btn" onClick={handleSaveToFile}>
            📤 Export .TEX
          </button>
          <button className="header-btn download-btn" onClick={handleDownloadPDF} disabled={compiling}>
            {compiling ? '⏳ Compiling...' : '📥 Download PDF'}
          </button>
          <button className="close-btn" onClick={onClose} title="Close Editor">
            ✕
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={`latex-main ${isResizing ? 'resizing' : ''}`} ref={containerRef}>
        {/* Editor Panel */}
        <div className="editor-panel" style={{ width: `${editorWidth}%` }}>
          <div className="editor-toolbar">
            <div className="file-tab">
              <span className="file-icon">📄</span>
              MAIN.TEX
            </div>
            <div className="toolbar-actions">
              <button className="toolbar-btn" title="Save (Coming Soon)" disabled>💾</button>
              <button className="toolbar-btn" title="Undo (Coming Soon)" disabled>↩️</button>
              <button className="toolbar-btn" title="Redo (Coming Soon)" disabled>↪️</button>
              <span className="separator">|</span>
              <button className="toolbar-btn" title="Find (Coming Soon)" disabled>🔍 Find</button>
              <button className="toolbar-btn" title="Settings (Coming Soon)" disabled>⚙️ Settings</button>
            </div>
          </div>
          <div className="editor-content">
            {renderEditor()}
          </div>
          <div className="editor-footer">
            <span>Ctrl + S Save</span>
            <span>Ctrl + Enter Compile</span>
            <span className="spacer"></span>
            <span>UTF-8</span>
            <span>LATEX</span>
            <span>SPACES: 4</span>
            <span>LINE 12, COL 24</span>
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          title="Drag to resize panels"
        >
          <div className="resize-line"></div>
        </div>

        {/* Preview Panel - PDF Preview */}
        <div className="preview-panel" style={{ width: `${100 - editorWidth}%` }}>
          <div className="preview-toolbar">
            <div className="preview-title">
              <span>📄 PDF Preview</span>
              <span className={`compile-status ${previewSynced ? 'synced' : 'compiling'}`}>
                {compiling ? '◐ Compiling...' : previewSynced ? '● Synced' : '○ Pending'}
              </span>
              {useOnlineCompiler && <span className="online-badge">🌐 Online</span>}
            </div>
            <div className="preview-actions">
              <label className="compiler-toggle" title="Toggle between local and online compiler">
                <input
                  type="checkbox"
                  checked={useOnlineCompiler}
                  onChange={(e) => setUseOnlineCompiler(e.target.checked)}
                />
                <span>Online Compiler</span>
              </label>
              <button className="compile-btn" onClick={handleCompile} disabled={compiling}>
                {compiling ? '⏳' : '▶'} Compile
              </button>
              <div className="zoom-controls">
                <button onClick={() => setZoom(Math.max(50, zoom - 10))}>−</button>
                <span className="zoom-level">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button>
                <button onClick={() => setZoom(100)} title="Reset Zoom">⛶</button>
              </div>
            </div>
          </div>
          <div className="preview-content">
            {compiling ? (
              <div className="compiling-overlay">
                <div className="spinner"></div>
                <p>Compiling LaTeX to PDF{useOnlineCompiler ? ' (Online)' : ''}...</p>
              </div>
            ) : compileError ? (
              <div className="compile-error">
                <div className="error-icon">⚠️</div>
                <h3>Compilation Error</h3>
                <p className="error-message">{compileError}</p>
                <div className="error-actions">
                  <button className="retry-btn" onClick={handleCompile}>
                    🔄 Retry Compile
                  </button>
                  <button
                    className="retry-btn"
                    onClick={() => { setUseOnlineCompiler(!useOnlineCompiler); setCompileError(null); }}
                    style={{ background: useOnlineCompiler ? '#38a169' : '#667eea' }}
                  >
                    🌐 {useOnlineCompiler ? 'Use Local' : 'Try Online Compiler'}
                  </button>
                  <button className="export-tex-btn" onClick={handleSaveToFile}>
                    📤 Download .TEX
                  </button>
                </div>
                <p className="error-hint">
                  💡 {useOnlineCompiler
                    ? 'Using online compiler. If it fails, download .tex and use Overleaf.'
                    : 'Local compilation failed. Try the online compiler or download .tex file.'}
                  {' '}
                  <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer">Open Overleaf</a>
                </p>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="pdf-viewer"
                title="PDF Preview"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            ) : (
              <div className="no-preview">
                <div className="no-preview-icon">📄</div>
                <h3>No PDF Preview</h3>
                <p>Click "Compile" or enable Auto-Compile to generate PDF preview</p>
                <button className="compile-btn-large" onClick={handleCompile} disabled={compiling}>
                  ▶ Compile Now
                </button>
              </div>
            )}
          </div>
          <div className="preview-footer">
            <span className="auto-compile-indicator">
              <span className={`indicator-dot ${autoCompile ? 'active' : ''}`}></span>
              Auto-Compile: {autoCompile ? 'ON' : 'OFF'}
            </span>
            <span className="preview-info">
              {pdfUrl ? 'PDF ready • Click to download' : 'Compile to see preview'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
