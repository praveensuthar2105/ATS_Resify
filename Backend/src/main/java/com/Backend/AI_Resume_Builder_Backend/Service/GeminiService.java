package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class GeminiService {
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    private final String apiKey;
    private final RestClient restClient;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey, RestClient.Builder restClientBuilder) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured. Please set 'gemini.api.key' in application.properties or environment variables.");
        }
        this.apiKey = apiKey.trim();
        this.restClient = restClientBuilder.baseUrl(GEMINI_API_URL).build();
    }

    public String generateContent(String prompt) {
        String requestBody = String.format("{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}",
                prompt.replace("\"", "\\\""));

        JsonNode response = restClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        if (response != null) {
            JsonNode candidates = response.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
        }
        return "";
    }
}
