package com.Backend.AI_Resume_Builder_Backend.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Agent Service: Job Description Matcher
 * 
 * Analyzes resume content against a job description and provides:
 * - Match score (0-100)
 * - Missing keywords and skills
 * - Tailored improvement suggestions
 * - Gap analysis with actionable recommendations
 * 
 * Results cached in Redis (1h TTL since JDs change frequently)
 */
@Service
public class JobMatcherService {

    private static final Logger log = LoggerFactory.getLogger(JobMatcherService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private GeminiService geminiService;

    /**
     * Analyze resume against a job description
     * Returns detailed match analysis with scores and recommendations
     */
    @Cacheable(value = "jobMatching", key = "#resumeContent.hashCode() + '_' + #jobDescription.hashCode()")
    public Map<String, Object> analyzeMatch(String resumeContent, String jobDescription) {
        log.info("Analyzing job match (cache miss)");

        String prompt = buildMatchAnalysisPrompt(resumeContent, jobDescription);

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                Map<String, Object> result = MAPPER.readValue(response.get(), new TypeReference<>() {});
                result.put("cached", false);
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to analyze job match: {}", e.getMessage());
        }

        return Map.of(
            "overallScore", 0,
            "error", true,
            "message", "Unable to analyze match at this time."
        );
    }

    /**
     * Get keyword gap analysis between resume and job description
     */
    public Map<String, Object> getKeywordGaps(String resumeContent, String jobDescription) {
        String prompt = String.format("""
            You are an ATS (Applicant Tracking System) expert. Analyze the keyword match between 
            this resume and job description.
            
            RESUME:
            %s
            
            JOB DESCRIPTION:
            %s
            
            Respond in JSON format:
            {
              "matchedKeywords": ["<keywords found in both resume and JD>"],
              "missingKeywords": ["<important keywords in JD but NOT in resume>"],
              "extraKeywords": ["<relevant keywords in resume not in JD but still valuable>"],
              "keywordScore": <0-100 percentage match>,
              "priorityAdds": [
                {
                  "keyword": "<most important missing keyword>",
                  "importance": "HIGH|MEDIUM|LOW",
                  "suggestion": "<how to naturally add this keyword to the resume>"
                }
              ]
            }
            """, resumeContent, jobDescription);

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed keyword gap analysis: {}", e.getMessage());
        }

        return Map.of("matchedKeywords", List.of(), "missingKeywords", List.of(), "keywordScore", 0);
    }

    /**
     * Generate tailored bullet points for a specific job description
     */
    public Map<String, Object> generateTailoredContent(String currentExperience, String jobDescription, String targetSection) {
        String prompt = String.format("""
            You are an expert resume writer. The user wants to tailor their resume for a specific job.
            
            CURRENT EXPERIENCE/CONTENT:
            %s
            
            TARGET JOB DESCRIPTION:
            %s
            
            SECTION TO TAILOR: %s
            
            Respond in JSON format:
            {
              "tailoredContent": "<rewritten content optimized for this job>",
              "keyChanges": ["<list of key changes made and why>"],
              "addedKeywords": ["<keywords from JD that were naturally incorporated>"],
              "fitScore": <1-10 how well the tailored content matches the JD>
            }
            """, currentExperience, jobDescription, targetSection != null ? targetSection : "experience");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate tailored content: {}", e.getMessage());
        }

        return Map.of("tailoredContent", currentExperience, "error", true);
    }

    private String buildMatchAnalysisPrompt(String resumeContent, String jobDescription) {
        return String.format("""
            You are a senior recruiter and ATS expert. Perform a comprehensive analysis of how well 
            this resume matches the job description.
            
            RESUME:
            %s
            
            JOB DESCRIPTION:
            %s
            
            Provide a detailed analysis in JSON format:
            {
              "overallScore": <0-100 match percentage>,
              "categoryScores": {
                "skills": <0-100>,
                "experience": <0-100>,
                "education": <0-100>,
                "keywords": <0-100>
              },
              "strengths": ["<top 3-5 areas where resume matches well>"],
              "gaps": ["<top 3-5 areas where resume falls short>"],
              "recommendations": [
                {
                  "priority": "HIGH|MEDIUM|LOW",
                  "area": "<section to improve>",
                  "suggestion": "<specific actionable suggestion>",
                  "impact": "<expected impact on match score>"
                }
              ],
              "missingSkills": ["<skills mentioned in JD but not in resume>"],
              "matchedSkills": ["<skills found in both>"],
              "summaryVerdict": "<2-3 sentence overall assessment>"
            }
            """, resumeContent, jobDescription);
    }
}
