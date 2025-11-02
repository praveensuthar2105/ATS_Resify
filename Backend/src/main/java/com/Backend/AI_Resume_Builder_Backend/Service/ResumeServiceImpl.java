package com.Backend.AI_Resume_Builder_Backend.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResumeServiceImpl implements ResumeService {
    private final GeminiService geminiService;

    public ResumeServiceImpl(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @Override
    public Map<String, Object> generateResumeResponse(String userResumeDescription) throws IOException {
        return generateResumeResponse(userResumeDescription, "modern"); // default template
    }

    public Map<String, Object> generateResumeResponse(String userResumeDescription, String templateType)
            throws IOException {
        Map<String, Object> result = new HashMap<>();
        try {
            // Validate input
            if (userResumeDescription == null || userResumeDescription.trim().isEmpty()) {
                throw new IllegalArgumentException("User resume description cannot be null or empty");
            }

            // Default to "modern" if templateType is null or empty
            if (templateType == null || templateType.trim().isEmpty()) {
                templateType = "modern";
            }

            String promptString = this.loadPromptFromFile("resume_prompt.txt");
            String promptContent = this.putValueToTemplate(promptString, Map.of(
                    "userResumeDescription", userResumeDescription,
                    "templateType", templateType));
            String response = geminiService.generateContent(promptContent);
            if (response == null || response.trim().isEmpty()) {
                result.put("error", "Gemini AI service returned empty response");
                result.put("details",
                        "Check Gemini API key, quota, or prompt format. See backend logs for raw response.");
                return result;
            }
            Map<String, Object> stringMap = parseMultipleResponses(response);
            return stringMap;
        } catch (Exception e) {
            System.err.println("Error in generateResumeResponse: " + e.getMessage());
            e.printStackTrace();
            result.put("error", "Exception in resume generation");
            result.put("message", e.getMessage());
            return result;
        }
    }

    String loadPromptFromFile(String fileName) throws IOException {
        try {
            ClassPathResource resource = new ClassPathResource(fileName);
            if (!resource.exists()) {
                throw new IOException("Prompt file not found: " + fileName);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new IOException("Failed to load prompt file: " + fileName, e);
        }
    }

    String putValueToTemplate(String template, Map<String, String> values) {
        if (template == null) {
            throw new IllegalArgumentException("Template cannot be null");
        }

        for (Map.Entry<String, String> entry : values.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue() : "";
            template = template.replace(placeholder, value);
        }
        return template;
    }

    public static Map<String, Object> parseMultipleResponses(String response) {
        Map<String, Object> result = new HashMap<>();

        if (response == null || response.trim().isEmpty()) {
            result.put("think", null);
            result.put("data", null);
            return result;
        }

        // Parse think section
        int thinkStart = response.indexOf("<think>");
        int thinkEnd = response.indexOf("</think>");
        if (thinkStart != -1 && thinkEnd != -1 && thinkEnd > thinkStart) {
            String thinkContent = response.substring(thinkStart + 7, thinkEnd).trim();
            result.put("think", thinkContent);
        } else {
            result.put("think", null);
        }

        // Parse JSON section
        int jsonStart = response.indexOf("```json");
        int jsonEnd = response.indexOf("```", jsonStart + 7);
        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            String jsonContent = response.substring(jsonStart + 7, jsonEnd).trim();
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map data = mapper.readValue(jsonContent, Map.class);
                result.put("data", data);
            } catch (Exception e) {
                System.err.println("Invalid JSON format: " + e.getMessage());
                result.put("data", null);
                result.put("error", "Failed to parse JSON response");
            }
        } else {
            result.put("data", null);
        }

        return result;
    }
}
