package com.Backend.AI_Resume_Builder_Backend.ats;

import java.io.IOException;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;



/**
 * Service interface for evaluating resumes against ATS (Applicant Tracking System) criteria.
 * Provides scoring, keyword matching, and feedback generation.
 */
public interface AtsScoreService {

    /**
     * Evaluates a resume file for general ATS compatibility.
     * 
     * @param resumeFile the uploaded resume file (PDF, DOCX)
     * @return a map containing the score and detailed feedback
     * @throws IOException if the file cannot be read or parsed
     */
    Map<String, Object> getAtsScore(MultipartFile resumeFile) throws IOException;

    /**
     * Evaluates a resume file against a specific job description.
     * 
     * @param resumeFile the uploaded resume file (PDF, DOCX)
     * @param jobDescription the target job description to match against
     * @return a map containing the score, keyword match rates, and tailored feedback
     * @throws IOException if the file cannot be read or parsed
     */
    Map<String, Object> getAtsScore(MultipartFile resumeFile, String jobDescription) throws IOException;

    /**
     * Evaluates raw resume text against a specific job description.
     * 
     * @param resumeText the extracted text of the resume
     * @param jobDescription the target job description to match against
     * @return a map containing the score and keyword analysis
     * @throws IOException if the AI service fails to process the request
     */
    Map<String, Object> getAtsScoreFromText(String resumeText, String jobDescription) throws IOException;
}