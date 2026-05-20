package com.Backend.AI_Resume_Builder_Backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RestClient restClient;
    private final String vertexUrl;

    public GeminiService(
            @Value("${vertex.project.id:}") String projectId,
            @Value("${vertex.location:us-central1}") String location,
            @Value("${vertex.model:gemini-3.1-pro-preview}") String model,
            RestClient.Builder restClientBuilder) {

        if (projectId == null || projectId.trim().isEmpty()) {
            throw new IllegalStateException("Vertex Project ID is not configured.");
        }
        if (location == null || location.trim().isEmpty()) {
            throw new IllegalStateException("Vertex Location is not configured.");
        }

        // Vertex AI endpoint format:
        // https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent
        String baseUrl = String.format(
                "https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/%s",
                location.trim(),
                projectId.trim(),
                location.trim(),
                model.trim());

        this.vertexUrl = baseUrl + ":generateContent";
        this.restClient = restClientBuilder.baseUrl(this.vertexUrl).build();

        log.info("GeminiService initialized with Google Cloud Vertex AI — URL: {}", this.vertexUrl);
    }

    private String getAccessToken() {
        try {
            // Log environment for debugging
            String envVar = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
            if (envVar != null) {
                log.warn("GOOGLE_APPLICATION_CREDENTIALS is still set to: {}", envVar);
            }
            
            GoogleCredentials credentials;
            try {
                credentials = GoogleCredentials.getApplicationDefault();
            } catch (Exception e) {
                log.warn("GoogleCredentials.getApplicationDefault() failed: {}. Attempting manual load from AppData...", e.getMessage());
                
                // Fallback: manually read from %APPDATA%\gcloud\application_default_credentials.json
                String appData = System.getenv("APPDATA");
                if (appData == null) {
                    throw new RuntimeException("APPDATA environment variable not found.", e);
                }
                java.nio.file.Path adcPath = java.nio.file.Paths.get(appData, "gcloud", "application_default_credentials.json");
                if (!java.nio.file.Files.exists(adcPath)) {
                    throw new RuntimeException("ADC file not found at " + adcPath, e);
                }
                
                try (java.io.InputStream is = java.nio.file.Files.newInputStream(adcPath)) {
                    credentials = com.google.auth.oauth2.UserCredentials.fromStream(is);
                }
            }

            credentials = credentials.createScoped(java.util.Collections.singletonList("https://www.googleapis.com/auth/cloud-platform"));
            credentials.refreshIfExpired();
            return credentials.getAccessToken().getTokenValue();
        } catch (Exception e) {
            log.error("Authentication failure", e);
            throw new RuntimeException("Failed to get Google Cloud credentials. Did you run 'gcloud auth application-default login'?", e);
        }
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
            throw new RuntimeException("Failed to serialize Vertex AI request", e);
        }

        JsonNode response;
        try {
            response = restClient.post()
                    .header("Authorization", "Bearer " + getAccessToken())
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
