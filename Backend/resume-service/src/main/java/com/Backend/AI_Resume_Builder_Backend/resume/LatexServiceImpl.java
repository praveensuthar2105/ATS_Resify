package com.Backend.AI_Resume_Builder_Backend.resume;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;




@Service
public class LatexServiceImpl implements LatexService {

    @Override
    public String generateLatexCode(Map<String, Object> resumeData, String templateType) throws IOException {
        return generateLatexCode(resumeData, templateType, null);
    }

    @Override
    public String generateLatexCode(Map<String, Object> resumeData, String templateType, Map<String, Object> sectionConfig) throws IOException {
        // Default to professional if template not specified
        if (templateType == null || templateType.trim().isEmpty()) {
            templateType = "ats";
        }

        // Load template
        String template = loadLatexTemplate(templateType);

        // Populate template with data
        String latexCode = populateTemplate(template, resumeData, templateType, sectionConfig);

        return latexCode;
    }

    @Override
    public Map<String, String> getAvailableTemplates() {
        Map<String, String> templates = new LinkedHashMap<>();
        templates.put("ats", "ATS-Optimized - Simple format that passes automated screening");
        templates.put("minimal", "Minimal Typographic - Elegant sans-serif design focused on pure typography");
        return templates;
    }

    @Override
    public String escapeLatexSpecialChars(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        // Escape LaTeX special characters
        text = text.replace("\\", "\\textbackslash{}");
        text = text.replace("&", "\\&");
        text = text.replace("%", "\\%");
        text = text.replace("$", "\\$");
        text = text.replace("#", "\\#");
        text = text.replace("_", "\\_");
        text = text.replace("{", "\\{");
        text = text.replace("}", "\\}");
        text = text.replace("~", "\\textasciitilde{}");
        text = text.replace("^", "\\textasciicircum{}");

        return text;
    }

    private String loadLatexTemplate(String templateType) throws IOException {
        String fileName = "latex_templates/" + templateType + "_template.tex";
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            if (!resource.exists()) {
                throw new IOException("LaTeX template not found: " + fileName);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new IOException("Failed to load LaTeX template: " + fileName, e);
        }
    }

    private String populateTemplate(String template, Map<String, Object> resumeData, String templateType, Map<String, Object> sectionConfig) {
        // Extract personal information
        Map<String, Object> personalInfo = getMapValue(resumeData, "personalInformation");

        // Replace personal details in header
        template = replacePlaceholder(template, "FULL_NAME",
                getStringValue(personalInfo, "fullName"));
        
        // Handle optional header details cleanly.
        String personalLocation = getStringValue(personalInfo, "location");
        if (personalLocation != null && !personalLocation.trim().isEmpty()) {
            template = template.replace("{{#LOCATION}}", "");
            template = template.replace("{{/LOCATION}}", "");
            template = template.replace("{{LOCATION}}", escapeLatexSpecialChars(personalLocation));
        } else {
            template = removeSection(template, "LOCATION");
        }

        template = template.replace("{{EMAIL}}", escapeLatexSpecialChars(getStringValue(personalInfo, "email")));
        String phoneVal = getStringValue(personalInfo, "phoneNumber");
        if (phoneVal != null && !phoneVal.trim().isEmpty()) {
            template = template.replace("{{PHONE_NUMBER}}", escapeLatexSpecialChars(phoneVal));
        } else {
            template = template.replace("{{PHONE_NUMBER}}", "");
        }

        // Handle optional links
        template = handleOptionalSection(template, "LINKEDIN",
                getStringValue(personalInfo, "linkedIn"));
        template = handleOptionalSection(template, "GITHUB",
                getStringValue(personalInfo, "gitHub"));
        template = handleOptionalSection(template, "PORTFOLIO",
                getStringValue(personalInfo, "portfolio"));

        // LinkedIn and GitHub display
        String linkedin = getStringValue(personalInfo, "linkedIn");
        String github = getStringValue(personalInfo, "gitHub");
        String linkedinDisplay = linkedin.replace("https://", "").replace("http://", "");
        String githubDisplay = github.replace("https://", "").replace("http://", "");
        template = replacePlaceholder(template, "LINKEDIN_DISPLAY",
                escapeLatexSpecialChars(linkedinDisplay));
        template = replacePlaceholder(template, "GITHUB_DISPLAY",
                escapeLatexSpecialChars(githubDisplay));

        // Summary
        template = handleOptionalSection(template, "SUMMARY",
                getStringValue(resumeData, "summary"));

        // Pre-render each section segment first inside the template
        template = handleSkillsSection(template, resumeData);
        template = handleExperienceSection(template, resumeData, templateType);
        template = handleProjectsSection(template, resumeData, templateType);
        template = handleEducationSection(template, resumeData);
        template = handleCertificationsSection(template, resumeData);
        template = handleAchievementsSection(template, resumeData);
        template = handleLanguagesSection(template, resumeData);

        // Dynamically slice and rearrange sections based on sectionConfig
        List<String> order = null;
        Map<String, String> titles = new HashMap<>();
        List<String> hidden = new ArrayList<>();

        if (sectionConfig != null) {
            Object orderObj = sectionConfig.get("order");
            if (orderObj instanceof List) {
                order = new ArrayList<>();
                for (Object o : (List<?>) orderObj) {
                    if (o != null) order.add(o.toString().toLowerCase().trim());
                }
            }

            Object titlesObj = sectionConfig.get("titles");
            if (titlesObj instanceof Map) {
                for (Map.Entry<?, ?> entry : ((Map<?, ?>) titlesObj).entrySet()) {
                    if (entry.getKey() != null && entry.getValue() != null) {
                        titles.put(entry.getKey().toString().toLowerCase().trim(), entry.getValue().toString());
                    }
                }
            }

            Object hiddenObj = sectionConfig.get("hidden");
            if (hiddenObj instanceof List) {
                for (Object h : (List<?>) hiddenObj) {
                    if (h != null) hidden.add(h.toString().toLowerCase().trim());
                }
            }
        }

        // Standard fallback order if none was provided
        if (order == null || order.isEmpty()) {
            order = Arrays.asList("education", "experience", "projects", "skills", "certifications", "achievements");
        }

        // Segment extraction helper
        Map<String, String> sectionContents = new HashMap<>();
        List<String> allKeys = Arrays.asList("education", "experience", "projects", "skills", "certifications", "achievements");

        for (String key : allKeys) {
            String beginTag = "%BEGIN_" + key.toUpperCase();
            String endTag = "%END_" + key.toUpperCase();
            int startIndex = template.indexOf(beginTag);
            int endIndex = template.indexOf(endTag);

            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                // Extract inner block content including the end tag line
                int lineEndIndex = template.indexOf("\n", endIndex);
                if (lineEndIndex == -1) lineEndIndex = template.length();
                
                String fullBlock = template.substring(startIndex, lineEndIndex);
                String innerContent = template.substring(startIndex + beginTag.length(), endIndex).trim();

                // Store clean inner content (or empty if set to hidden/disabled)
                if (hidden.contains(key) || innerContent.isEmpty()) {
                    sectionContents.put(key, "");
                } else {
                    // Check if user customized the section title/header name
                    String customTitle = titles.get(key);
                    if (customTitle != null && !customTitle.trim().isEmpty()) {
                        // Replace standard latex title declarations inside the inner content
                        String escapedTitle = escapeLatexSpecialChars(customTitle);
                        innerContent = innerContent.replace("\\section*{Education}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Education}", "\\section{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Experience}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Experience}", "\\section{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Projects}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Projects}", "\\section{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Technical Skills}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Skills}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Skills}", "\\section{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Certifications}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Certifications}", "\\section{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section*{Achievements}", "\\section*{" + escapedTitle + "}");
                        innerContent = innerContent.replace("\\section{Achievements}", "\\section{" + escapedTitle + "}");
                    }
                    sectionContents.put(key, innerContent);
                }

                // Delete the original static block from the master template string
                template = template.substring(0, startIndex) + template.substring(lineEndIndex);
            }
        }

        // Reassemble the sections dynamically back into the template body
        StringBuilder bodyBuilder = new StringBuilder();
        for (String key : order) {
            String content = sectionContents.get(key);
            if (content != null && !content.trim().isEmpty()) {
                bodyBuilder.append("\n\n").append(content);
            }
        }

        // Insert the re-ordered block sections back right before \end{document}
        int docEndIndex = template.lastIndexOf("\\end{document}");
        if (docEndIndex != -1) {
            template = template.substring(0, docEndIndex) + bodyBuilder.toString() + "\n\n" + template.substring(docEndIndex);
        }

        return sanitizeTemplateArtifacts(template);
    }

    /**
     * Remove any leftover Mustache-like artifacts to avoid LaTeX errors if a
     * placeholder/section
     * slips through. This is a defensive cleanup that runs after all normal
     * replacements.
     *
     * Examples removed:
     * - {{#SECTION}} ... {{/SECTION}}
     * - {{PLACEHOLDER}}
     * - {{{PLACEHOLDER}}}
     */
    private String sanitizeTemplateArtifacts(String template) {
        if (template == null || template.isEmpty())
            return template;

        // 1) Remove any remaining section blocks of the form {{#NAME}} ... {{/NAME}}
        // Use DOTALL-like behavior by matching across newlines with (?s) and reluctant
        // quantifier
        // Java does not support inline DOTALL in String#replaceAll, so we use (?s) at
        // pattern start
        template = template.replaceAll("(?s)\\{\\{#\\s*([A-Za-z0-9_]+)\\s*\\}\\}.*?\\{\\{/\\s*\\1\\s*\\}\\}", "");

        // 2) Remove any remaining triple-braced placeholders {{{NAME}}}
        template = template.replaceAll("\\{\\{\\{\\s*[A-Za-z0-9_]+\\s*\\}\\}\\}", "");

        // 3) Remove any remaining double-braced placeholders {{NAME}}
        template = template.replaceAll("\\{\\{\\s*[A-Za-z0-9_]+\\s*\\}\\}", "");

        return template;
    }

    private String handleSkillsSection(String template, Map<String, Object> resumeData) {
        Object skillsObj = resumeData.get("skills");
        Map<String, Object> skillsMap = new HashMap<>();

        if (skillsObj instanceof List) {
            // Editor format: [{ title: 'Languages', items: ['Java', 'C++'] }]
            List<?> list = (List<?>) skillsObj;
            for (Object item : list) {
                if (item instanceof Map) {
                    Map<?, ?> entry = (Map<?, ?>) item;
                    Object titleObj = entry.get("title");
                    Object itemsObj = entry.get("items");
                    if (titleObj != null) {
                        String categoryKey = titleObj.toString().toLowerCase().trim()
                            .replace("developer tools", "tools")
                            .replace("cloud/devops", "cloud");
                        List<String> listItems = new ArrayList<>();
                        if (itemsObj instanceof List) {
                            for (Object val : (List<?>) itemsObj) {
                                if (val != null) listItems.add(val.toString());
                            }
                        } else if (itemsObj instanceof String) {
                            String strVal = (String) itemsObj;
                            if (!strVal.trim().isEmpty()) {
                                for (String part : strVal.split(",")) {
                                    listItems.add(part.trim());
                                }
                            }
                        }
                        if (!listItems.isEmpty()) {
                            skillsMap.put(categoryKey, listItems);
                        }
                    }
                }
            }
        } else if (skillsObj instanceof Map) {
            // Traditional Map format
            skillsMap = getMapValue(resumeData, "skills");
        }

        if (skillsMap.isEmpty()) {
            template = removeSection(template, "HAS_SKILLS");
            return template;
        }

        // Check if any skill category has content
        boolean hasAnySkills = false;
        List<String> categories = Arrays.asList("languages", "frameworks", "databases", "tools", "cloud", "other");
        for (String category : categories) {
            List<String> categorySkills = getStringListValue(skillsMap, category);
            if (categorySkills != null && !categorySkills.isEmpty()) {
                hasAnySkills = true;
                break;
            }
        }

        if (!hasAnySkills) {
            template = removeSection(template, "HAS_SKILLS");
            return template;
        }

        template = template.replace("{{#HAS_SKILLS}}", "");
        template = template.replace("{{/HAS_SKILLS}}", "");

        // Handle each skill category
        template = handleSkillCategory(template, skillsMap, "languages", "SKILL_LANGUAGES");
        template = handleSkillCategory(template, skillsMap, "frameworks", "SKILL_FRAMEWORKS");
        template = handleSkillCategory(template, skillsMap, "databases", "SKILL_DATABASES");
        template = handleSkillCategory(template, skillsMap, "tools", "SKILL_TOOLS");
        template = handleSkillCategory(template, skillsMap, "cloud", "SKILL_CLOUD");
        template = handleSkillCategory(template, skillsMap, "other", "SKILL_OTHER");

        return template;
    }

    private String handleSkillCategory(String template, Map<String, Object> skills, String category,
            String placeholder) {
        List<String> categorySkills = getStringListValue(skills, category);

        if (categorySkills == null || categorySkills.isEmpty()) {
            template = removeSection(template, placeholder);
            return template;
        }

        // Join skills with comma and space, then escape for LaTeX
        String skillsString = escapeLatexSpecialChars(String.join(", ", categorySkills));

        template = template.replace("{{#" + placeholder + "}}", "");
        template = template.replace("{{/" + placeholder + "}}", "");
        template = template.replace("{{" + placeholder + "}}", skillsString);

        return template;
    }

    private String handleExperienceSection(String template, Map<String, Object> resumeData, String templateType) {
        List<Map<String, Object>> experiences = getListValue(resumeData, "experience");

        if (experiences == null || experiences.isEmpty()) {
            template = removeSection(template, "HAS_EXPERIENCE");
            return template;
        }

        template = template.replace("{{#HAS_EXPERIENCE}}", "");
        template = template.replace("{{/HAS_EXPERIENCE}}", "");

        StringBuilder expContent = new StringBuilder();
        String expTemplate = extractLoopTemplate(template, "EXPERIENCE");

        for (Map<String, Object> exp : experiences) {
            String expEntry = expTemplate;
            expEntry = expEntry.replace("{{JOB_TITLE}}",
                    escapeLatexSpecialChars(getStringValue(exp, "jobTitle")));
            expEntry = expEntry.replace("{{COMPANY}}",
                    escapeLatexSpecialChars(getStringValue(exp, "company")));
            expEntry = handleOptionalSection(expEntry, "LOCATION",
                    getStringValue(exp, "location"));
            expEntry = expEntry.replace("{{DURATION}}",
                    escapeLatexSpecialChars(getStringValue(exp, "duration")));

            // Handle responsibility - split by bullets or newlines and create multiple
            // \resumeItem entries
            String responsibility = getStringValue(exp, "responsibility");
            StringBuilder responsibilityItems = new StringBuilder();

            if (responsibility != null && !responsibility.trim().isEmpty()) {
                // Split by common bullet separators: bullets (•, -, *), newlines, or numbered
                // points
                String[] points = responsibility.split("(?m)^\\s*[-•*]\\s*|(?m)^\\s*\\d+\\.\\s*|\\n+");

                for (String point : points) {
                    String trimmedPoint = point.trim();
                    if (!trimmedPoint.isEmpty()) {
                        if ("minimal".equals(templateType) || "ats".equals(templateType)) {
                            responsibilityItems.append("  \\item ").append(escapeLatexSpecialChars(trimmedPoint))
                                    .append("\n");
                        } else {
                            responsibilityItems.append("      \\resumeItem{")
                                    .append(escapeLatexSpecialChars(trimmedPoint))
                                    .append("}\n");
                        }
                    }
                }
            }

            // If no items were created, add a placeholder item to avoid empty list
            if (responsibilityItems.length() == 0) {
                if ("minimal".equals(templateType) || "ats".equals(templateType)) {
                    responsibilityItems.append("  \\item Responsibility details pending\n");
                } else {
                    responsibilityItems.append("      \\resumeItem{Responsibility details pending}\n");
                }
            }

            // Replace placeholder with items (don't trim the content as it contains
            // necessary whitespace)
            String responsibilityContent = responsibilityItems.toString();
            // Remove only the trailing newline if present
            if (responsibilityContent.endsWith("\n")) {
                responsibilityContent = responsibilityContent.substring(0, responsibilityContent.length() - 1);
            }
            expEntry = expEntry.replace("{{RESPONSIBILITY}}", responsibilityContent);
            expContent.append(expEntry);
        }

        template = replaceLoop(template, "EXPERIENCE", expContent.toString());
        return template;
    }

    private String handleProjectsSection(String template, Map<String, Object> resumeData, String templateType) {
        List<Map<String, Object>> projects = getListValue(resumeData, "projects");

        if (projects == null || projects.isEmpty()) {
            template = removeSection(template, "HAS_PROJECTS");
            return template;
        }

        template = template.replace("{{#HAS_PROJECTS}}", "");
        template = template.replace("{{/HAS_PROJECTS}}", "");

        StringBuilder projContent = new StringBuilder();
        String projTemplate = extractLoopTemplate(template, "PROJECTS");

        for (Map<String, Object> project : projects) {
            String projEntry = projTemplate;
            String projectTitle = getStringValue(project, "title");
            projEntry = projEntry.replace("{{PROJECT_TITLE}}",
                    escapeLatexSpecialChars(projectTitle));

            // Handle project description — variable bullet count based on project content (2–7)
            String description = getStringValue(project, "description");
            String descriptionContent = formatProjectDescription(description, projectTitle, templateType);

            // CRITICAL: Ensure description content is never empty
            if (descriptionContent == null || descriptionContent.trim().isEmpty()) {
                System.err.println("CRITICAL ERROR: Description content is empty for project: " + projectTitle);
                descriptionContent = generateFallbackProjectDescription(projectTitle, templateType);
                System.err.println("  Using fallback: " + descriptionContent);
            }

            projEntry = projEntry.replace("{{PROJECT_DESCRIPTION}}", descriptionContent);

            // Handle technologies (could be array or string)
            Object techObj = project.get("technologiesUsed");
            String technologies = "";
            if (techObj instanceof List) {
                technologies = String.join(", ", (List<String>) techObj);
            } else if (techObj instanceof String) {
                technologies = (String) techObj;
            }
            projEntry = projEntry.replace("{{TECHNOLOGIES}}",
                    escapeLatexSpecialChars(technologies));

            // Handle GitHub link (optional) & Live link (optional)
            String githubLink = getStringValue(project, "githubLink").trim();
            String liveLink = getStringValue(project, "liveLink").trim();
            if (liveLink.isEmpty()) {
                liveLink = getStringValue(project, "liveUrl").trim(); // backup key
            }

            // Enforce proper URL protocols so PDF href compilations are clickable
            if (!githubLink.isEmpty() && !githubLink.toLowerCase().startsWith("http://") && !githubLink.toLowerCase().startsWith("https://")) {
                githubLink = "https://" + githubLink;
            }
            if (!liveLink.isEmpty() && !liveLink.toLowerCase().startsWith("http://") && !liveLink.toLowerCase().startsWith("https://")) {
                liveLink = "https://" + liveLink;
            }

            boolean hasLinks = (!githubLink.isEmpty() || !liveLink.isEmpty());

            if (hasLinks) {
                projEntry = projEntry.replace("{{#HAS_PROJECT_LINKS}}", "");
                projEntry = projEntry.replace("{{/HAS_PROJECT_LINKS}}", "");
            } else {
                projEntry = removeSection(projEntry, "HAS_PROJECT_LINKS");
            }

            if (!githubLink.isEmpty()) {
                projEntry = projEntry.replace("{{#GITHUB_LINK}}", "");
                projEntry = projEntry.replace("{{/GITHUB_LINK}}", "");
                projEntry = projEntry.replace("{{GITHUB_LINK}}",
                        escapeLatexSpecialChars(githubLink));
            } else {
                projEntry = removeSection(projEntry, "GITHUB_LINK");
            }

            if (!liveLink.isEmpty()) {
                projEntry = projEntry.replace("{{#LIVE_LINK}}", "");
                projEntry = projEntry.replace("{{/LIVE_LINK}}", "");
                projEntry = projEntry.replace("{{LIVE_LINK}}",
                        escapeLatexSpecialChars(liveLink));
            } else {
                projEntry = removeSection(projEntry, "LIVE_LINK");
            }

            projContent.append(projEntry);
        }

        template = replaceLoop(template, "PROJECTS", projContent.toString());
        return template;
    }

    private String handleEducationSection(String template, Map<String, Object> resumeData) {
        List<Map<String, Object>> education = getListValue(resumeData, "education");

        if (education == null || education.isEmpty()) {
            template = removeSection(template, "HAS_EDUCATION");
            return template;
        }

        template = template.replace("{{#HAS_EDUCATION}}", "");
        template = template.replace("{{/HAS_EDUCATION}}", "");

        StringBuilder eduContent = new StringBuilder();
        String eduTemplate = extractLoopTemplate(template, "EDUCATION");

        for (Map<String, Object> edu : education) {
            String eduEntry = eduTemplate;
            eduEntry = eduEntry.replace("{{DEGREE}}",
                    escapeLatexSpecialChars(getStringValue(edu, "degree")));
            eduEntry = eduEntry.replace("{{UNIVERSITY}}",
                    escapeLatexSpecialChars(getStringValue(edu, "university")));
            eduEntry = handleOptionalSection(eduEntry, "LOCATION",
                    getStringValue(edu, "location"));
            eduEntry = eduEntry.replace("{{GRADUATION_YEAR}}",
                    escapeLatexSpecialChars(getStringValue(edu, "graduationYear")));
            eduEntry = handleOptionalSection(eduEntry, "GPA",
                    getStringValue(edu, "gpa"));
            eduContent.append(eduEntry);
        }

        template = replaceLoop(template, "EDUCATION", eduContent.toString());
        return template;
    }

    private String handleCertificationsSection(String template, Map<String, Object> resumeData) {
        List<Map<String, Object>> certifications = getListValue(resumeData, "certifications");

        if (certifications == null || certifications.isEmpty()) {
            template = removeSection(template, "HAS_CERTIFICATIONS");
            return template;
        }

        template = template.replace("{{#HAS_CERTIFICATIONS}}", "");
        template = template.replace("{{/HAS_CERTIFICATIONS}}", "");

        StringBuilder certContent = new StringBuilder();
        String certTemplate = extractLoopTemplate(template, "CERTIFICATIONS");

        for (Map<String, Object> cert : certifications) {
            String certEntry = certTemplate;
            certEntry = certEntry.replace("{{CERT_TITLE}}",
                    escapeLatexSpecialChars(getStringValue(cert, "title")));
            certEntry = certEntry.replace("{{ISSUING_ORG}}",
                    escapeLatexSpecialChars(getStringValue(cert, "issuingOrganization")));
            certEntry = handleOptionalSection(certEntry, "CERT_YEAR",
                    getStringValue(cert, "year"));
            certContent.append(certEntry);
        }

        template = replaceLoop(template, "CERTIFICATIONS", certContent.toString());
        return template;
    }

    private String handleAchievementsSection(String template, Map<String, Object> resumeData) {
        List<Map<String, Object>> achievements = getListValue(resumeData, "achievements");

        if (achievements == null || achievements.isEmpty()) {
            template = removeSection(template, "HAS_ACHIEVEMENTS");
            return template;
        }

        template = template.replace("{{#HAS_ACHIEVEMENTS}}", "");
        template = template.replace("{{/HAS_ACHIEVEMENTS}}", "");

        StringBuilder achContent = new StringBuilder();
        String achTemplate = extractLoopTemplate(template, "ACHIEVEMENTS");

        for (Map<String, Object> ach : achievements) {
            String achEntry = achTemplate;
            achEntry = achEntry.replace("{{ACH_TITLE}}",
                    escapeLatexSpecialChars(getStringValue(ach, "title")));
            achEntry = handleOptionalSection(achEntry, "ACH_DESCRIPTION",
                    getStringValue(ach, "description"));
            achEntry = handleOptionalSection(achEntry, "ACH_YEAR",
                    getStringValue(ach, "year"));
            achContent.append(achEntry);
        }

        template = replaceLoop(template, "ACHIEVEMENTS", achContent.toString());
        return template;
    }

    private String handleLanguagesSection(String template, Map<String, Object> resumeData) {
        // Always remove the Languages section - languages are not included in resume
        template = removeSection(template, "HAS_LANGUAGES");
        return template;
    }

    // Helper methods
    private String replacePlaceholder(String template, String placeholder, String value) {
        return template.replace("{{" + placeholder + "}}", escapeLatexSpecialChars(value));
    }

    private String handleOptionalSection(String template, String sectionName, String value) {
        if (value == null || value.trim().isEmpty()) {
            return removeSection(template, sectionName);
        }
        template = template.replace("{{#" + sectionName + "}}", "");
        template = template.replace("{{/" + sectionName + "}}", "");
        template = template.replace("{{" + sectionName + "}}", escapeLatexSpecialChars(value));
        return template;
    }

    private String removeSection(String template, String sectionName) {
        String startTag = "{{#" + sectionName + "}}";
        String endTag = "{{/" + sectionName + "}}";

        while (true) {
            int startIndex = template.indexOf(startTag);
            if (startIndex == -1)
                break;

            int endIndex = template.indexOf(endTag, startIndex + startTag.length());
            if (endIndex == -1)
                break;

            template = template.substring(0, startIndex) + template.substring(endIndex + endTag.length());
        }
        return template;
    }

    private String extractLoopTemplate(String template, String loopName) {
        String startTag = "{{#" + loopName + "}}";
        String endTag = "{{/" + loopName + "}}";

        int startIndex = template.indexOf(startTag);
        int endIndex = template.indexOf(endTag);

        if (startIndex == -1 || endIndex == -1)
            return "";

        return template.substring(startIndex + startTag.length(), endIndex);
    }

    private String replaceLoop(String template, String loopName, String content) {
        String startTag = "{{#" + loopName + "}}";
        String endTag = "{{/" + loopName + "}}";

        int startIndex = template.indexOf(startTag);
        int endIndex = template.indexOf(endTag);

        if (startIndex == -1 || endIndex == -1)
            return template;

        return template.substring(0, startIndex) + content + template.substring(endIndex + endTag.length());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMapValue(Map<String, Object> map, String key) {
        if (map == null)
            return new HashMap<>();
        Object value = map.get(key);
        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }
        return new HashMap<>();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getListValue(Map<String, Object> map, String key) {
        if (map == null)
            return new ArrayList<>();
        Object value = map.get(key);
        if (value instanceof List) {
            return (List<Map<String, Object>>) value;
        }
        return new ArrayList<>();
    }

    private List<String> getStringListValue(Map<String, Object> map, String key) {
        if (map == null)
            return new ArrayList<>();
        Object value = map.get(key);
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            List<String> stringList = new ArrayList<>();
            for (Object item : list) {
                if (item != null) {
                    stringList.add(item.toString());
                }
            }
            return stringList;
        }
        return new ArrayList<>();
    }

    private String getStringValue(Map<String, Object> map, String key) {
        if (map == null)
            return "";
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }

    /**
     * Format project description based on template type.
     * Bullet count is project-dependent (not fixed at 3).
     * - professional/ats: Returns \\resumeItem{...} entries
     * - modern: Returns bullet points with \\ separators for cventry context
     * - creative: Returns bullet points or plain text
     */
    private String formatProjectDescription(String description, String projectTitle, String templateType) {
        List<String> points = parseDescriptionPoints(description, projectTitle);

        if ("modern".equals(templateType)) {
            // For modern template (cventry context), use bullet points with \\ separators
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < points.size(); i++) {
                result.append("\\textbullet~").append(escapeLatexSpecialChars(points.get(i)));
                if (i < points.size() - 1) {
                    result.append(" \\\\");
                }
            }
            return result.toString();
        } else if ("creative".equals(templateType)) {
            // For creative template, use bullet points
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("\\textbullet~").append(escapeLatexSpecialChars(point)).append("\n\n");
            }
            String content = result.toString().trim();
            return content;
        } else if ("ats".equals(templateType) || "minimal".equals(templateType)) {
            // For ATS and minimal templates, use \item
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("  \\item ").append(escapeLatexSpecialChars(point)).append("\n");
            }
            String content = result.toString();
            if (content.endsWith("\n")) {
                content = content.substring(0, content.length() - 1);
            }
            return content;
        } else {
            // Fallback: use \resumeItem{...} (Professional style)
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("      \\resumeItem{").append(escapeLatexSpecialChars(point)).append("}\n");
            }
            String content = result.toString();
            if (content.endsWith("\n")) {
                content = content.substring(0, content.length() - 1);
            }
            return content;
        }
    }

    private static final int MAX_PROJECT_BULLETS = 7;

    /**
     * Parse description string into bullet points.
     * Count is project-dependent: keep all real bullets (capped at 7).
     * Only pads with placeholders when the description is empty (min 2 bullets).
     * Does NOT force every project to exactly 3 points.
     */
    private List<String> parseDescriptionPoints(String description, String projectTitle) {
        List<String> points = new ArrayList<>();

        if (description != null && !description.trim().isEmpty()) {
            String normalized = description.trim();
            // Prefer newline-separated bullets; also split on literal "\n" from JSON strings
            String[] lines = normalized.replace("\\n", "\n").split("\\n");

            for (String line : lines) {
                String trimmedLine = line.trim();
                if (trimmedLine.isEmpty()) {
                    continue;
                }

                // Strip typical lead bullets, keeping the actual point message
                String point = trimmedLine.replaceAll("^[-•*]\\s*|^\\d+\\.\\s*", "").trim();
                if (!point.isEmpty() && points.size() < MAX_PROJECT_BULLETS) {
                    points.add(point);
                }
            }

            // Fallback: single paragraph without newlines — keep as one detailed bullet
            // rather than inventing extra points
            if (points.isEmpty()) {
                String single = normalized.replaceAll("^[-•*]\\s*", "").trim();
                if (!single.isEmpty()) {
                    points.add(single);
                }
            }
        }

        // Only generate placeholders when completely empty (never pad a real 2–4 bullet list to 3)
        if (points.isEmpty()) {
            points.add(generateProjectPlaceholder(projectTitle, 1));
            points.add(generateProjectPlaceholder(projectTitle, 2));
        }

        return points;
    }

    /**
     * Generate a placeholder description point for a project when no description is
     * provided.
     * Creates generic but relevant bullet points based on the project name.
     */
    private String generateProjectPlaceholder(String projectTitle, int pointNumber) {
        if (projectTitle == null || projectTitle.isEmpty()) {
            projectTitle = "Project";
        }

        switch (pointNumber) {
            case 1:
                return "Designed and developed " + projectTitle + " with a clear focus on reliability and usability";
            case 2:
                return "Implemented core features using modern tools and practices suited to the problem space";
            default:
                return "Improved quality through testing, iteration, and careful technical trade-offs";
        }
    }

    /**
     * Generate complete fallback description content when formatProjectDescription
     * returns empty.
     * This is a last resort to ensure we never have empty descriptions in LaTeX.
     */
    private String generateFallbackProjectDescription(String projectTitle, String templateType) {
        List<String> points = new ArrayList<>();
        points.add(generateProjectPlaceholder(projectTitle, 1));
        points.add(generateProjectPlaceholder(projectTitle, 2));
        points.add(generateProjectPlaceholder(projectTitle, 3));

        if ("modern".equals(templateType)) {
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < points.size(); i++) {
                result.append("\\textbullet~").append(escapeLatexSpecialChars(points.get(i)));
                if (i < points.size() - 1) {
                    result.append(" \\\\");
                }
            }
            return result.toString();
        } else if ("creative".equals(templateType)) {
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("\\textbullet~").append(escapeLatexSpecialChars(point)).append("\n\n");
            }
            return result.toString().trim();
        } else if ("ats".equals(templateType) || "minimal".equals(templateType)) {
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("  \\item ").append(escapeLatexSpecialChars(point)).append("\n");
            }
            String content = result.toString();
            if (content.endsWith("\n")) {
                content = content.substring(0, content.length() - 1);
            }
            return content;
        } else {
            // Professional template
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("      \\resumeItem{").append(escapeLatexSpecialChars(point)).append("}\n");
            }
            String content = result.toString();
            if (content.endsWith("\n")) {
                content = content.substring(0, content.length() - 1);
            }
            return content;
        }
    }
}