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
 * AI Agent Service: Content Generator
 * 
 * Generates resume content from scratch or partial info:
 * - Professional summaries from job title + experience
 * - Experience bullet points from role descriptions
 * - Project descriptions from brief outlines
 * - Skills sections tailored to target roles
 * 
 * Results cached in Redis (24h TTL)
 */
@Service
public class ContentGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(ContentGeneratorService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private GeminiService geminiService;

    /**
     * Generate a professional summary/objective
     */
    @Cacheable(value = "contentGeneration", key = "'summary_' + #jobTitle.hashCode() + '_' + #yearsExp + '_' + (#targetRole != null ? #targetRole.hashCode() : 0)")
    public Map<String, Object> generateSummary(String jobTitle, int yearsExp, String targetRole, String keySkills) {
        log.info("Generating professional summary for: {} ({}yr exp)", jobTitle, yearsExp);

        String prompt = String.format("""
            You are an expert resume writer. Generate a compelling professional summary for a resume.
            
            Current/Recent Job Title: %s
            Years of Experience: %d
            Target Role: %s
            Key Skills: %s
            
            Respond in JSON format:
            {
              "summary": "<a powerful 3-4 sentence professional summary>",
              "alternatives": [
                "<a more concise 2-sentence version>",
                "<a version emphasizing leadership/impact>"
              ],
              "tips": ["<2 tips for personalizing this summary further>"]
            }
            
            Use strong action words. Quantify achievements where possible.
            Focus on value proposition - what can this person bring to the employer.
            """, jobTitle, yearsExp, targetRole != null ? targetRole : jobTitle, keySkills != null ? keySkills : "");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate summary: {}", e.getMessage());
        }

        return Map.of("summary", "", "alternatives", List.of(), "error", true);
    }

    /**
     * Generate experience bullet points from a role description
     */
    public Map<String, Object> generateExperienceBullets(String jobTitle, String company, String briefDescription, String targetRole) {
        log.info("Generating experience bullets for: {} at {}", jobTitle, company);

        String prompt = String.format("""
            You are an expert resume writer. Generate impactful bullet points for a work experience entry.
            
            Job Title: %s
            Company: %s
            Brief Description of Responsibilities: %s
            Target Role for Resume: %s
            
            Respond in JSON format:
            {
              "bullets": [
                "<4-6 strong bullet points using STAR method>"
              ],
              "highlights": "<which bullet best demonstrates leadership/impact>",
              "keywords": ["<ATS-friendly keywords included>"]
            }
            
            Rules:
            - Start each bullet with a strong past-tense action verb
            - Include quantified results (numbers, percentages, dollar amounts)
            - Demonstrate impact and value delivered
            - Use industry-specific terminology
            - Keep each bullet to 1-2 lines
            """, jobTitle, company, briefDescription, targetRole != null ? targetRole : "similar role");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate experience bullets: {}", e.getMessage());
        }

        return Map.of("bullets", List.of(), "error", true);
    }

    /**
     * Generate a project description
     */
    public Map<String, Object> generateProjectDescription(String projectName, String techStack, String briefOutline, String targetRole) {
        String prompt = String.format("""
            You are an expert resume writer. Generate a compelling project description for a resume.
            
            Project Name: %s
            Tech Stack: %s
            Brief Outline: %s
            Target Role: %s
            
            Respond in JSON format:
            {
              "description": "<2-3 sentence project description highlighting impact and tech>",
              "bullets": ["<2-3 key achievement bullets for this project>"],
              "techHighlights": ["<most impressive/relevant tech to emphasize>"]
            }
            
            Focus on: technical complexity, problem solved, scale/impact, and relevant technologies.
            """, projectName, techStack != null ? techStack : "", briefOutline, targetRole != null ? targetRole : "");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate project description: {}", e.getMessage());
        }

        return Map.of("description", "", "bullets", List.of(), "error", true);
    }

    /**
     * Generate a skills section organized by category
     */
    @Cacheable(value = "contentGeneration", key = "'skills_' + #targetRole.hashCode() + '_' + (#currentSkills != null ? #currentSkills.hashCode() : 0)")
    public Map<String, Object> generateSkillsSection(String targetRole, List<String> currentSkills, String jobDescription) {
        String prompt = String.format("""
            You are an expert resume writer and career advisor. Generate an optimized skills section.
            
            Target Role: %s
            Current Skills: %s
            Job Description: %s
            
            Respond in JSON format:
            {
              "categorizedSkills": {
                "Programming Languages": ["<relevant languages>"],
                "Frameworks & Libraries": ["<relevant frameworks>"],
                "Tools & Technologies": ["<relevant tools>"],
                "Soft Skills": ["<relevant soft skills>"]
              },
              "missingCritical": ["<skills you should consider adding>"],
              "recommended": ["<nice-to-have skills for this role>"],
              "tips": "<advice on how to present skills for this role>"
            }
            
            Only include skills categories relevant to the target role.
            Prioritize skills mentioned in the job description.
            """, targetRole,
                currentSkills != null ? String.join(", ", currentSkills) : "none specified",
                jobDescription != null ? jobDescription : "not specified");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate skills section: {}", e.getMessage());
        }

        return Map.of("categorizedSkills", Map.of(), "error", true);
    }

    /**
     * General content generation based on user prompt
     */
    public Map<String, Object> generateContent(String userPrompt, String resumeContext) {
        String prompt = String.format("""
            You are a professional resume writing assistant. Help the user with their resume content request.
            
            User request: %s
            
            %s
            
            Respond in JSON format:
            {
              "content": "<the generated content>",
              "explanation": "<brief explanation of the approach taken>",
              "suggestions": ["<2-3 follow-up suggestions to improve further>"]
            }
            
            Be specific, professional, and focus on creating ATS-friendly content.
            """, userPrompt, resumeContext != null ? "Current resume context:\n" + resumeContext : "");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to generate content: {}", e.getMessage());
        }

        return Map.of("content", "", "error", true);
    }
}
