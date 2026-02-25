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

    private final String apiKey;
    private final RestClient restClient;
    private final String vertexUrl;

    public GeminiService(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${vertex.project.id:}") String projectId,
            @Value("${vertex.location:us-central1}") String location,
            @Value("${vertex.model:gemini-2.0-flash}") String model,
            RestClient.Builder restClientBuilder) {

        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured. Please set 'gemini.api.key' in application.properties or environment variables.");
        }
        if (projectId == null || projectId.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Vertex AI Project ID is not configured. Please set 'vertex.project.id' in application.properties or environment variables.");
        }

        this.apiKey = apiKey.trim();

        // Vertex AI endpoint format:
        // https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent
        String baseUrl = String.format(
                "https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/%s",
                location.trim(), projectId.trim(), location.trim(), model.trim());

        this.vertexUrl = baseUrl + ":generateContent";
        this.restClient = restClientBuilder.baseUrl(this.vertexUrl).build();

        // Log config at startup (key masked for security)
        String masked = this.apiKey.length() > 10
                ? this.apiKey.substring(0, 8) + "..." + this.apiKey.substring(this.apiKey.length() - 4)
                : "***";
        log.info("GeminiService initialized with Vertex AI — URL: {} | Key: {}", this.vertexUrl, masked);
    }

    public Optional<String> generateContent(String prompt) {
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
            throw new RuntimeException("Failed to serialize Gemini request", e);
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
            log.error("Vertex AI HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Vertex AI error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(),
                    e);
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.error("Vertex AI server error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Vertex AI server error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Vertex AI call failed: {}", e.getMessage(), e);
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
                        log.info("Vertex AI response received ({} chars)", text.length());
                        log.debug("===== VERTEX AI RAW RESPONSE (first 1000 chars) =====");
                        log.debug("{}", text.substring(0, Math.min(text.length(), 1000)));
                        if (text.length() > 1000) {
                            log.debug("... ({} total chars)", text.length());
                        }
                        log.debug("===== END VERTEX AI RESPONSE =====");
                        return Optional.of(text);
                    }
                }
            }
        }
        log.warn("Vertex AI returned empty or unparseable response");
        return Optional.empty();
    }
}
