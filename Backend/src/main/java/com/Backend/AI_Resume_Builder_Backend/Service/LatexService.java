package com.Backend.AI_Resume_Builder_Backend.Service;

import java.io.IOException;
import java.util.Map;

public interface LatexService {

    /**
     * Generate LaTeX code from resume data
     * 
     * @param resumeData   The resume data in JSON format
     * @param templateType The template type (modern, professional, ats, creative)
     * @return LaTeX source code as String
     * @throws IOException if template file cannot be read
     */
    String generateLatexCode(Map<String, Object> resumeData, String templateType) throws IOException;

    /**
     * Get list of available LaTeX templates
     * 
     * @return Map of template names and descriptions
     */
    Map<String, String> getAvailableTemplates();

    /**
     * Escape special LaTeX characters in text
     * 
     * @param text The text to escape
     * @return Escaped text safe for LaTeX
     */
    String escapeLatexSpecialChars(String text);
}
