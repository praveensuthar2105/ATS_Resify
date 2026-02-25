package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LatexServiceImpl implements LatexService {

    @Override
    public String generateLatexCode(Map<String, Object> resumeData, String templateType) throws IOException {
        // Default to professional if template not specified
        if (templateType == null || templateType.trim().isEmpty()) {
            templateType = "professional";
        }

        // Load template
        String template = loadLatexTemplate(templateType);

        // Populate template with data
        String latexCode = populateTemplate(template, resumeData, templateType);

        return latexCode;
    }

    @Override
    public Map<String, String> getAvailableTemplates() {
        Map<String, String> templates = new LinkedHashMap<>();
        templates.put("modern", "Modern CV - Clean and contemporary design with ModernCV package");
        templates.put("professional", "Professional - Classic two-column layout for all industries");
        templates.put("ats", "ATS-Optimized - Simple format that passes automated screening");
        templates.put("creative", "Creative - Bold and unique design for creative professionals");
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

    private String populateTemplate(String template, Map<String, Object> resumeData, String templateType) {
        // Extract personal information
        Map<String, Object> personalInfo = getMapValue(resumeData, "personalInformation");

        // Replace simple placeholders
        template = replacePlaceholder(template, "FULL_NAME",
                getStringValue(personalInfo, "fullName"));
        template = replacePlaceholder(template, "EMAIL",
                getStringValue(personalInfo, "email"));
        template = replacePlaceholder(template, "PHONE_NUMBER",
                getStringValue(personalInfo, "phoneNumber"));
        template = replacePlaceholder(template, "LOCATION",
                getStringValue(personalInfo, "location"));

        // Handle optional links
        // Optional sections in header/footer links
        template = handleOptionalSection(template, "LINKEDIN",
                getStringValue(personalInfo, "linkedIn"));
        template = handleOptionalSection(template, "GITHUB",
                getStringValue(personalInfo, "gitHub"));
        template = handleOptionalSection(template, "PORTFOLIO",
                getStringValue(personalInfo, "portfolio"));
        template = handleOptionalSection(template, "EMAIL",
                getStringValue(personalInfo, "email"));
        template = handleOptionalSection(template, "PHONE_NUMBER",
                getStringValue(personalInfo, "phoneNumber"));

        // LinkedIn and GitHub display (without https://)
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

        // Skills
        template = handleSkillsSection(template, resumeData);

        // Experience
        template = handleExperienceSection(template, resumeData);

        // Projects
        template = handleProjectsSection(template, resumeData, templateType);

        // Education
        template = handleEducationSection(template, resumeData);

        // Certifications
        template = handleCertificationsSection(template, resumeData);

        // Achievements
        template = handleAchievementsSection(template, resumeData);

        // Languages
        template = handleLanguagesSection(template, resumeData);

        // As a final safety step, strip any leftover Mustache-like tags so LaTeX never
        // sees
        // raw markers like {{#EMAIL}} or {{UNRESOLVED}} which can introduce # into TeX.
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
        Map<String, Object> skills = getMapValue(resumeData, "skills");

        if (skills == null || skills.isEmpty()) {
            template = removeSection(template, "HAS_SKILLS");
            return template;
        }

        // Check if any skill category has content
        boolean hasAnySkills = false;
        List<String> categories = Arrays.asList("languages", "frameworks", "databases", "tools", "cloud", "other");
        for (String category : categories) {
            List<String> categorySkills = getStringListValue(skills, category);
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
        template = handleSkillCategory(template, skills, "languages", "SKILL_LANGUAGES");
        template = handleSkillCategory(template, skills, "frameworks", "SKILL_FRAMEWORKS");
        template = handleSkillCategory(template, skills, "databases", "SKILL_DATABASES");
        template = handleSkillCategory(template, skills, "tools", "SKILL_TOOLS");
        template = handleSkillCategory(template, skills, "cloud", "SKILL_CLOUD");
        template = handleSkillCategory(template, skills, "other", "SKILL_OTHER");

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

    private String handleExperienceSection(String template, Map<String, Object> resumeData) {
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
            expEntry = expEntry.replace("{{LOCATION}}",
                    escapeLatexSpecialChars(getStringValue(exp, "location")));
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
                        responsibilityItems.append("      \\resumeItem{")
                                .append(escapeLatexSpecialChars(trimmedPoint))
                                .append("}\n");
                    }
                }
            }

            // If no items were created, add a placeholder item to avoid empty list
            if (responsibilityItems.length() == 0) {
                responsibilityItems.append("      \\resumeItem{Responsibility details pending}\n");
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

            // Handle project description - enforce exactly 3 point descriptions (6 lines
            // total)
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

            // Handle GitHub link (optional)
            String githubLink = getStringValue(project, "githubLink");
            if (githubLink != null && !githubLink.isEmpty()) {
                projEntry = projEntry.replace("{{#GITHUB_LINK}}", "");
                projEntry = projEntry.replace("{{/GITHUB_LINK}}", "");
                projEntry = projEntry.replace("{{GITHUB_LINK}}",
                        escapeLatexSpecialChars(githubLink));
            } else {
                projEntry = removeSection(projEntry, "GITHUB_LINK");
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
            eduEntry = eduEntry.replace("{{LOCATION}}",
                    escapeLatexSpecialChars(getStringValue(edu, "location")));
            eduEntry = eduEntry.replace("{{GRADUATION_YEAR}}",
                    escapeLatexSpecialChars(getStringValue(edu, "graduationYear")));
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
            certEntry = certEntry.replace("{{CERT_YEAR}}",
                    escapeLatexSpecialChars(getStringValue(cert, "year")));
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
            achEntry = achEntry.replace("{{ACH_YEAR}}",
                    escapeLatexSpecialChars(getStringValue(ach, "year")));
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

        int startIndex = template.indexOf(startTag);
        if (startIndex == -1)
            return template;

        int endIndex = template.indexOf(endTag);
        if (endIndex == -1)
            return template;

        return template.substring(0, startIndex) + template.substring(endIndex + endTag.length());
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
     * - professional/ats: Returns \\resumeItem{...} entries
     * - modern: Returns bullet points with \\ separators for cventry context
     * - creative: Returns bullet points or plain text
     */
    private String formatProjectDescription(String description, String projectTitle, String templateType) {
        // Parse and ensure exactly 3 points with fallback generation
        List<String> points = parseDescriptionPoints(description, projectTitle);

        // DEBUG: Log the points being formatted
        System.err.println("DEBUG: Formatting " + points.size() + " points for project: " + projectTitle);
        for (int i = 0; i < points.size(); i++) {
            System.err.println("  Point " + (i + 1) + ": " + points.get(i));
        }

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
        } else if ("ats".equals(templateType)) {
            // For ATS template, use simple bullet points as text
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("• ").append(escapeLatexSpecialChars(point)).append("\n");
            }
            String content = result.toString().trim();
            return content;
        } else {
            // For professional template, use \\resumeItem{...}
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("      \\resumeItem{").append(escapeLatexSpecialChars(point)).append("}\n");
            }
            String content = result.toString();
            if (content.endsWith("\n")) {
                content = content.substring(0, content.length() - 1);
            }
            System.err.println("DEBUG: Generated content length: " + content.length());
            return content;
        }
    }

    /**
     * Parse description string into exactly 3 points.
     * Handles various formats (bullets, newlines, etc.)
     * Always returns exactly 3 points (generates placeholders if needed).
     */
    private List<String> parseDescriptionPoints(String description, String projectTitle) {
        List<String> points = new ArrayList<>();

        if (description != null && !description.trim().isEmpty()) {
            String normalized = description.trim();
            String[] lines = normalized.split("\\n");

            for (String line : lines) {
                String trimmedLine = line.trim();
                if (trimmedLine.isEmpty()) {
                    continue;
                }

                // Remove bullet markers if present (-, •, *, 1., 2., etc.)
                String point = trimmedLine.replaceAll("^[-•*]\\s*|^\\d+\\.\\s*", "").trim();
                if (!point.isEmpty() && points.size() < 3) {
                    points.add(point);
                }
            }
        }

        // Always pad to exactly 3 points with generated content
        if (points.size() == 0) {
            System.err.println(
                    "WARNING: Project '" + projectTitle + "' has empty description. Generating placeholder content.");
        } else if (points.size() < 3) {
            System.err.println("WARNING: Project '" + projectTitle + "' has only " + points.size()
                    + " description points. Expected 3.");
        }

        while (points.size() < 3) {
            String placeholder = generateProjectPlaceholder(projectTitle, points.size() + 1);
            points.add(placeholder);
            System.err.println("  Added placeholder point " + points.size() + ": " + placeholder);
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
                return "Designed and developed " + projectTitle + " to deliver a high-quality solution";
            case 2:
                return "Implemented best practices for code quality, performance, and maintainability";
            case 3:
                return "Integrated modern technologies and frameworks for optimal user experience";
            default:
                return "Contributed to project success through technical excellence";
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
        } else if ("ats".equals(templateType)) {
            StringBuilder result = new StringBuilder();
            for (String point : points) {
                result.append("• ").append(escapeLatexSpecialChars(point)).append("\n");
            }
            return result.toString().trim();
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
