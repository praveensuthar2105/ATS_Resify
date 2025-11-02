package com.Backend.AI_Resume_Builder_Backend.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public GeminiService(@Value("${gemini.api.key:}") String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured. Please set 'gemini.api.key' in application.properties or environment variables.");
        }
        this.apiKey = apiKey.trim();
    }

    public String generateContent(String prompt) throws IOException {
        String requestBody = String.format("{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}",
                prompt.replace("\"", "\\\""));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_API_URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();
            System.out.println("Gemini API raw response: " + (responseBody == null ? "<empty>" : "<omitted>")); // Avoid
                                                                                                                // printing
                                                                                                                // sensitive
                                                                                                                // info
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new IOException("Gemini API did not return candidates: " + responseBody);
            }
            JsonNode content = candidates.get(0).path("content");
            JsonNode parts = content.path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                throw new IOException("Gemini API did not return parts: " + responseBody);
            }
            String text = parts.get(0).path("text").asText("");
            if (text == null || text.trim().isEmpty()) {
                throw new IOException("Gemini API returned empty text: " + responseBody);
            }
            return text;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Gemini API call interrupted", e);
        }
    }
}
