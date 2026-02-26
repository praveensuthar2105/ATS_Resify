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

            if (sectionName.includes('summary')) {
                result.summary = unescapeLatex(content);
            }
            else if (sectionName.includes('education')) {
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
                const skillLines = content.split(/\s*\\\\\s*|\n/).map(l => l.trim()).filter(l => l.length > 0);
                skillLines.forEach(line => {
                    const skillMatch = line.match(/\\textbf\{([^}]*)\}\s*:?\s*(.*)/);
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
};
