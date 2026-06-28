package com.Backend.AI_Resume_Builder_Backend.resume;

import java.io.IOException;
import java.util.Map;


/**
 * Service interface for generating and managing AI-powered resumes.
 */
public interface ResumeService {

	/**
	 * Generates a resume payload based on the user's description.
	 * 
	 * @param userResumeDescription the raw description provided by the user
	 * @return a map representing the generated JSON resume data
	 * @throws IOException if there is an error interacting with the AI service or parsing the prompt
	 */
	Map<String, Object> generateResumeResponse(String userResumeDescription) throws IOException;

	/**
	 * Generates a resume payload based on the user's description and a specific template format.
	 * 
	 * @param userResumeDescription the raw description provided by the user
	 * @param templateType the target LaTeX template (e.g., "ats", "modern")
	 * @return a map representing the generated JSON resume data formatted for the template
	 * @throws IOException if there is an error interacting with the AI service or parsing the prompt
	 */
	Map<String, Object> generateResumeResponse(String userResumeDescription, String templateType) throws IOException;

	/**
	 * Persists the generated resume to the database.
	 * 
	 * @param email the user's email address (for linking the resume)
	 * @param templateType the template type used for generation
	 * @param jsonObject the generated JSON structure
	 */
	void saveResumeToDb(String email, String templateType, Map<String, Object> jsonObject);

}