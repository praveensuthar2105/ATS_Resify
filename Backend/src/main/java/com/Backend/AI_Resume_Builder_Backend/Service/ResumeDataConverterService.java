package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class ResumeDataConverterService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Convert ResumeData to JSON string
    public String toJson(ResumeData resumeData) {
        validateResumeData(resumeData);
        try {
            return objectMapper.writeValueAsString(resumeData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert to JSON", e);
        }
    }

    // Convert JSON string to ResumeData
    public ResumeData fromJson(String json) {
        validateJson(json);
        try {
            ResumeData data = objectMapper.readValue(json, ResumeData.class);
            validateResumeData(data);
            return data;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON", e);
        }
    }

    // Validate JSON string
    private void validateJson(String json) {
        if (json == null || json.trim().isEmpty()) {
            throw new IllegalArgumentException("JSON cannot be null or empty");
        }
    }

    // Validate ResumeData object
    private void validateResumeData(ResumeData data) {
        if (data == null) {
            throw new IllegalArgumentException("ResumeData cannot be null");
        }
        // Add more validation rules as needed
    }

    // Convert ResumeData to LaTeX string
    public String toLatex(ResumeData resumeData) {
        StringBuilder sb = new StringBuilder();
        sb.append("\\section*{" + resumeData.getName() + "}\\\n");
        sb.append(resumeData.getEmail() + " | " + resumeData.getPhone() + " | " + resumeData.getAddress() + "\\\n");
        sb.append("\\section*{Summary}\\\n" + resumeData.getSummary() + "\\\n");
        sb.append("\\section*{Education}\\\n");
        if (resumeData.getEducationList() != null) {
            for (ResumeData.Education edu : resumeData.getEducationList()) {
                sb.append(edu.getDegree() + ", " + edu.getInstitution() + " (" + edu.getYear() + ")\\\n");
                sb.append(edu.getDetails() + "\\\n");
            }
        }
        sb.append("\\section*{Experience}\\\n");
        if (resumeData.getExperienceList() != null) {
            for (ResumeData.Experience exp : resumeData.getExperienceList()) {
                sb.append(exp.getTitle() + " at " + exp.getCompany() + " (" + exp.getDuration() + ")\\\n");
                sb.append(exp.getDescription() + "\\\n");
            }
        }
        sb.append("\\section*{Skills}\\\n");
        if (resumeData.getSkills() != null) {
            sb.append(String.join(", ", resumeData.getSkills()) + "\\\n");
        }
        sb.append("\\section*{Projects}\\\n");
        if (resumeData.getProjects() != null) {
            for (ResumeData.Project proj : resumeData.getProjects()) {
                sb.append(proj.getName() + ": " + proj.getDescription() + " (" + proj.getLink() + ")\\\n");
            }
        }
        return sb.toString();
    }

    // Parse LaTeX string to ResumeData (stub, needs advanced parsing)
    public ResumeData fromLatex(String latex) {
        // For demo, return empty ResumeData. Real implementation would parse LaTeX.
        return new ResumeData();
    }
}
