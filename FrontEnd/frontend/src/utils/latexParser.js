export const parseLatexToResumeData = (latex) => {
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

        // Helper: unescape LaTeX special chars carefully
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

        // Extract name from header (Fuzzy: match \textbf{\uppercase{...}} or \textbf{...} or just \Huge{...})
        const nameMatch = latex.match(/\\textbf\{\\uppercase\{([^}]*)\}\}/i) ||
            latex.match(/\\textbf\{([^}]+)\}/i) ||
            latex.match(/\\Huge\{([^}]+)\}/i);

        if (nameMatch) {
            result.personalInformation.fullName = unescapeLatex(nameMatch[1]);
        }

        // Extract contact line (Fuzzy: look for the first \vspace or line loaded with contact markers)
        // We look for a line containing @ (email) or phone patterns
        const lines = latex.split('\n');
        let contactLine = '';
        for (let i = 0; i < Math.min(20, lines.length); i++) {
            const line = lines[i];
            if (line.includes('@') && (line.includes('$|$') || line.includes('|') || line.includes('href'))) {
                contactLine = line;
                break;
            }
        }

        if (contactLine) {
            // Split by common LaTeX delimiters like $|$ or just | or \quad
            const parts = contactLine.split(/\s*(?:\$\|\$|\||\\quad|\\hspace\{[^}]*\})\s*/).map(p => p.trim());
            parts.forEach(part => {
                const hrefMatch = part.match(/\\href\{([^}]*)\}\{([^}]*)\}/i);
                if (hrefMatch) {
                    const url = hrefMatch[1];
                    const label = hrefMatch[2].toLowerCase();
                    if (label.includes('linkedin')) result.personalInformation.linkedIn = unescapeLatex(url);
                    else if (label.includes('github')) result.personalInformation.gitHub = unescapeLatex(url);
                    else if (label.includes('portfolio') || label.includes('website')) result.personalInformation.portfolio = unescapeLatex(url);
                } else if (part.includes('@')) {
                    result.personalInformation.email = unescapeLatex(part.replace(/\\href\{[^}]*\}\{([^}]*)\}/, '$1'));
                } else if (part.match(/[+\d]{1,3}[-\s\.]?\d{3}[-\s\.]?\d{3,4}/)) {
                    result.personalInformation.phoneNumber = unescapeLatex(part);
                } else if (part && !part.startsWith('\\')) {
                    result.personalInformation.location = unescapeLatex(part);
                }
            });
        }

        // Split by sections (Fuzzy: matches \section*{...} or \section{...})
        const sectionRegex = /\\section\*?\{([^}]*)\}/gi;
        const sections = [];
        let match;
        while ((match = sectionRegex.exec(latex)) !== null) {
            sections.push({ name: match[1].toLowerCase().trim(), index: match.index + match[0].length });
        }

        const getSectionContent = (idx) => {
            const start = sections[idx].index;
            let end = latex.indexOf('\\end{document}');
            if (idx + 1 < sections.length) {
                // Find the exact start index of the next section declaration
                const nextSecStart = latex.indexOf(`\\section`, sections[idx + 1].index - 20);
                if (nextSecStart > start) end = nextSecStart;
            }
            return latex.substring(start, end > start ? end : latex.length).trim();
        };

        sections.forEach((sec, idx) => {
            const content = getSectionContent(idx);
            const sectionName = sec.name;

            if (sectionName.includes('summary') || sectionName.includes('objective')) {
                result.summary = unescapeLatex(content);
            }
            else if (sectionName.includes('education')) {
                const eduBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim() && !b.startsWith('\\end{itemize}'));
                eduBlocks.forEach(block => {
                    // Fuzzy match combinations of Textbf, Textit, and hfill
                    const uniMatch = block.match(/\\textbf\{([^}]+)\}(?:.*?\\hfill\s*(.*?)(?:\\\\|\n))?/i);
                    const degreeMatch = block.match(/\\textit\{([^}]+)\}/i);
                    const gpaMatch = block.match(/GPA:\s*([\d.]+)/i);

                    if (uniMatch && uniMatch[1].length > 2) {
                        // Check if there is a location attached to the university string
                        let university = uniMatch[1];
                        let location = '';
                        if (university.includes(',')) {
                            const parts = university.split(',');
                            university = parts[0];
                            location = parts[1];
                        }

                        result.education.push({
                            university: unescapeLatex(university.trim()),
                            location: unescapeLatex(location.trim()),
                            graduationYear: unescapeLatex(uniMatch[2] ? uniMatch[2].trim() : ''),
                            degree: unescapeLatex(degreeMatch ? degreeMatch[1] : ''),
                            gpa: gpaMatch ? gpaMatch[1] : '',
                        });
                    }
                });
            }
            else if (sectionName.includes('experience') || sectionName.includes('work')) {
                const expBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim() && !b.startsWith('\\end{itemize}'));
                expBlocks.forEach(block => {
                    const companyMatch = block.match(/\\textbf\{([^}]+)\}(?:.*?\\hfill\s*(.*?)(?:\\\\|\n))?/i);
                    const titleMatch = block.match(/\\textit\{([^}]+)\}/i);

                    // Extract bullet items robustly
                    const items = [];
                    const itemRegex = /\\item\s+([\s\S]+?)(?=\\item|\\end\{itemize\}|$)/gi;
                    let itemMatch;
                    while ((itemMatch = itemRegex.exec(block)) !== null) {
                        items.push(unescapeLatex(itemMatch[1].trim()));
                    }

                    if (companyMatch && companyMatch[1].length > 2) {
                        let company = companyMatch[1];
                        let location = '';
                        if (company.includes(',')) {
                            const parts = company.split(',');
                            company = parts[0];
                            location = parts[1];
                        }

                        result.experience.push({
                            company: unescapeLatex(company.trim()),
                            location: unescapeLatex(location.trim()),
                            duration: unescapeLatex(companyMatch[2] ? companyMatch[2].trim() : ''),
                            jobTitle: unescapeLatex(titleMatch ? titleMatch[1] : ''),
                            responsibility: items.length > 0 ? items.join('\n') : '',
                        });
                    }
                });
            }
            else if (sectionName.includes('project')) {
                const projBlocks = content.split(/(?=\\textbf\{)/).filter(b => b.trim() && !b.startsWith('\\end{itemize}'));
                projBlocks.forEach(block => {
                    const titleMatch = block.match(/\\textbf\{([^}]+)\}/i);
                    const techMatch = block.match(/\\textit\{([^}]+)\}/i);
                    const githubMatch = block.match(/\\href\{([^}]*)\}\{.*?github.*?\}/i);

                    // Extract bullet items
                    const items = [];
                    const itemRegex = /\\item\s+([\s\S]+?)(?=\\item|\\end\{itemize\}|$)/gi;
                    let itemMatch;
                    while ((itemMatch = itemRegex.exec(block)) !== null) {
                        items.push(unescapeLatex(itemMatch[1].trim()));
                    }

                    if (titleMatch && titleMatch[1].length > 2) {
                        // Strip any nested links from title
                        let safeTitle = titleMatch[1];
                        const titleHref = safeTitle.match(/\\href\{[^}]*\}\{([^}]*)\}/);
                        if (titleHref) safeTitle = titleHref[1];

                        result.projects.push({
                            title: unescapeLatex(safeTitle.split('|')[0]),
                            technologiesUsed: unescapeLatex(techMatch ? techMatch[1] : ''),
                            description: items.length > 0 ? items.join('\n') : '',
                            githubLink: githubMatch ? unescapeLatex(githubMatch[1]) : '',
                        });
                    }
                });
            }
            else if (sectionName.includes('skill')) {
                const skillLines = content.split(/\s*\\\\\s*|\n/).map(l => l.trim()).filter(l => l.length > 0 && l.includes('\\textbf'));
                skillLines.forEach(line => {
                    // Fuzzy match: \textbf{Language}: Java, C++ OR \textbf{Language} Java, C++
                    const skillMatch = line.match(/\\textbf\{([^}]+)\}\s*:?\s*(.*)/i);
                    if (skillMatch) {
                        let category = unescapeLatex(skillMatch[1].replace(/:$/, '').trim());
                        let itemsStr = unescapeLatex(skillMatch[2].replace(/:$/, '').trim());

                        result.skills.push({
                            title: category,
                            level: 'Intermediate',
                            items: itemsStr ? itemsStr.split(',').map(s => s.trim()).filter(Boolean) : []
                        });
                    }
                });
            }
            else if (sectionName.includes('certification')) {
                const itemRegex = /\\item\s+([\s\S]+?)(?=\\item|\\end\{itemize\}|$)/gi;
                let itemMatch;
                while ((itemMatch = itemRegex.exec(content)) !== null) {
                    const raw = unescapeLatex(itemMatch[1].trim());
                    // Fuzzy Split: Title -- Org (Year) OR Title - Org
                    const certParts = raw.match(/^(.+?)(?:\s*--?\s*(.+?))?(?:\s*\(([^)]+)\))?$/);
                    result.certifications.push({
                        title: certParts ? certParts[1].trim() : raw,
                        issuingOrganization: certParts && certParts[2] ? certParts[2].trim() : '',
                        year: certParts && certParts[3] ? certParts[3].trim() : '',
                    });
                }
            }
            else if (sectionName.includes('achievement')) {
                const itemRegex = /\\item\s+([\s\S]+?)(?=\\item|\\end\{itemize\}|$)/gi;
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
        return null; // Return null so EditResume.jsx doesn't wipe the form on a total failure
    }
};
