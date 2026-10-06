package com.Backend.AI_Resume_Builder_Backend.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;



@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RestClient restClient;
    private final String geminiUrl;
    private final String apiKey;

    public GeminiService(
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash-lite}") String model,
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

        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(15000); // 15 seconds
        requestFactory.setReadTimeout(120000);   // 120 seconds for AI processing

        org.springframework.http.converter.json.MappingJackson2HttpMessageConverter jsonConverter = 
                new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter();
        jsonConverter.setSupportedMediaTypes(List.of(
                org.springframework.http.MediaType.APPLICATION_JSON,
                org.springframework.http.MediaType.APPLICATION_OCTET_STREAM,
                org.springframework.http.MediaType.TEXT_PLAIN
        ));

        this.restClient = restClientBuilder
                .baseUrl(this.geminiUrl)
                .requestFactory(requestFactory)
                .messageConverters(converters -> converters.add(0, jsonConverter))
                .build();

        log.info("GeminiService initialized with Google AI Studio — URL: {} (readTimeout=120s)", this.geminiUrl);
    }

    public Optional<String> generateContent(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API Key is not configured.");
        }

        Map<String, Object> request = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", 0,
                        "topP", 1,
                        "topK", 1,
                        "responseMimeType", "application/json"));

        JsonNode response = null;
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = restClient.post()
                        .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .accept(org.springframework.http.MediaType.APPLICATION_JSON, org.springframework.http.MediaType.ALL)
                        .body(request)
                        .retrieve()
                        .body(JsonNode.class);
                break;
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                if (e.getStatusCode().value() == 429 && attempt < maxRetries) {
                    log.warn("Gemini API rate limited (429). Retrying attempt {}/{} in {}ms...", attempt, maxRetries, attempt * 1500);
                    try { Thread.sleep(attempt * 1500L); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    continue;
                }
                log.error("Gemini API HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException("Gemini API error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(),
                        e);
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                if ((e.getStatusCode().value() == 503 || e.getStatusCode().value() == 500) && attempt < maxRetries) {
                    log.warn("Gemini API server busy ({}) on attempt {}/{}. Retrying in {}ms...", e.getStatusCode(), attempt, maxRetries, attempt * 2000);
                    try { Thread.sleep(attempt * 2000L); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    continue;
                }
                log.error("Gemini API server error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException(
                        "Gemini API server error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
            } catch (Exception e) {
                log.error("Gemini API call failed: {}", e.getMessage(), e);
                throw e;
            }
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

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }
}