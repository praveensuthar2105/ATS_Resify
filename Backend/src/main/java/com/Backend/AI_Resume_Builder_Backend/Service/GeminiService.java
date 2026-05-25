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

    private final RestClient restClient;
    private final String geminiUrl;
    private final String apiKey;

    public GeminiService(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String model,
            RestClient.Builder restClientBuilder) {

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API Key is not configured. Requests will fail unless mock data is used.");
        }
        this.apiKey = apiKey;

        // Gemini AI Studio endpoint format:
        // https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
        this.geminiUrl = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent",
                model.trim());

        this.restClient = restClientBuilder.baseUrl(this.geminiUrl).build();

        log.info("GeminiService initialized with Google AI Studio — URL: {}", this.geminiUrl);
    }

    public Optional<String> generateContent(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API Key is not configured.");
        }

        String requestBody;
        try {
            Map<String, Object> request = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0,
                            "topP", 1,
                            "topK", 1,
                            "responseMimeType", "application/json"));
            requestBody = OBJECT_MAPPER.writeValueAsString(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize Gemini API request", e);
        }

        JsonNode response;
        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Gemini API HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(),
                    e);
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.error("Gemini API server error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Gemini API server error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw e;
        }

        if (response != null) {
            JsonNode candidates = response.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText("");
                    if (!text.isEmpty()) {
                        log.info("Gemini API response received ({} chars)", text.length());
                        log.debug("===== GEMINI API RAW RESPONSE (first 1000 chars) =====");
                        log.debug("{}", text.substring(0, Math.min(text.length(), 1000)));
                        if (text.length() > 1000) {
                            log.debug("... ({} total chars)", text.length());
                        }
                        log.debug("===== END GEMINI API RESPONSE =====");
                        return Optional.of(text);
                    }
                }
            }
        }
        log.warn("Gemini API returned empty or unparseable response");
        return Optional.empty();
    }
}
