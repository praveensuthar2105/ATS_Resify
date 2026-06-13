package com.Backend.AI_Resume_Builder_Backend.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

public class PromptUtils {
    private static final Logger log = LoggerFactory.getLogger(PromptUtils.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static String loadPromptFromFile(String fileName) throws IOException {
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

    public static String putValueToTemplate(String template, Map<String, String> values) {
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
        String jsonContent = response;

        // Remove think section if present to get to the JSON part
        if (thinkEnd != -1) {
            jsonContent = response.substring(thinkEnd + 8).trim();
        }

        int jsonStart = jsonContent.indexOf("```json");
        if (jsonStart != -1) {
            int jsonEnd = jsonContent.indexOf("```", jsonStart + 7);
            if (jsonEnd != -1) {
                jsonContent = jsonContent.substring(jsonStart + 7, jsonEnd).trim();
            } else {
                jsonContent = jsonContent.substring(jsonStart + 7).trim();
            }
        } else {
            jsonStart = jsonContent.indexOf("```");
            if (jsonStart != -1) {
                int jsonEnd = jsonContent.indexOf("```", jsonStart + 3);
                if (jsonEnd != -1) {
                    jsonContent = jsonContent.substring(jsonStart + 3, jsonEnd).trim();
                } else {
                    jsonContent = jsonContent.substring(jsonStart + 3).trim();
                }
            } else {
                int braceStart = jsonContent.indexOf("{");
                int braceEnd = jsonContent.lastIndexOf("}");
                if (braceStart != -1 && braceEnd != -1 && braceEnd > braceStart) {
                    jsonContent = jsonContent.substring(braceStart, braceEnd + 1).trim();
                }
            }
        }

        if (!jsonContent.trim().endsWith("}")) {
            int braceStart = jsonContent.indexOf("{");
            int braceEnd = jsonContent.lastIndexOf("}");
            if (braceStart != -1 && braceEnd != -1 && braceEnd > braceStart) {
                jsonContent = jsonContent.substring(braceStart, braceEnd + 1).trim();
            }
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = OBJECT_MAPPER.readValue(jsonContent, Map.class);
            result.put("data", data);
        } catch (Exception e) {
            log.error("Invalid JSON format: {}", e.getMessage());
            log.debug("Response content (first 500 chars): {}",
                    response.substring(0, Math.min(response.length(), 500)));
            result.put("data", null);
            result.put("error", "Failed to parse JSON response");
        }

        return result;
    }
}
