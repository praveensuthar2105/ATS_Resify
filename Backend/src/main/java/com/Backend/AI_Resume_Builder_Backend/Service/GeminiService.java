package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
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

    public Optional<String> generateContent(String prompt) {
        String requestBody;
        try {
            Map<String, Object> request = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0,
                            "topP", 1,
                            "topK", 1,
                            "responseMimeType", "application/json"));
            requestBody = OBJECT_MAPPER.writeValueAsString(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize Gemini request", e);
        }

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
                    String text = parts.get(0).path("text").asText("");
                    if (!text.isEmpty()) {
                        log.info("Gemini response received ({} chars)", text.length());
                        log.debug("===== GEMINI AI RAW RESPONSE (first 1000 chars) =====");
                        log.debug("{}", text.substring(0, Math.min(text.length(), 1000)));
                        if (text.length() > 1000) {
                            log.debug("... ({} total chars)", text.length());
                        }
                        log.debug("===== END GEMINI AI RESPONSE =====");
                        return Optional.of(text);
                    }
                }
            }
        }
        log.warn("Gemini returned empty or unparseable response");
        return Optional.empty();
    }
}
