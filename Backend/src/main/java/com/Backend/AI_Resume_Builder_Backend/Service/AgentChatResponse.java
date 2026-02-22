package com.Backend.AI_Resume_Builder_Backend.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for Agent Chat messages
 */
public class AgentChatResponse {

    private String sessionId;
    private String agentType;
    private String message;             // Main response text
    private List<String> suggestions;   // Follow-up suggestions
    private Map<String, Object> data;   // Structured data (improved bullets, scores, etc.)
    private boolean cached;             // Whether response was from cache
    private LocalDateTime timestamp;

    public AgentChatResponse() {
        this.timestamp = LocalDateTime.now();
        this.cached = false;
    }

    // Builder-style methods for fluent API
    public static AgentChatResponse of(String sessionId, String message) {
        AgentChatResponse response = new AgentChatResponse();
        response.sessionId = sessionId;
        response.message = message;
        return response;
    }

    public AgentChatResponse withAgentType(String agentType) {
        this.agentType = agentType;
        return this;
    }

    public AgentChatResponse withSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
        return this;
    }

    public AgentChatResponse withData(Map<String, Object> data) {
        this.data = data;
        return this;
    }

    public AgentChatResponse fromCache() {
        this.cached = true;
        return this;
    }

    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getAgentType() { return agentType; }
    public void setAgentType(String agentType) { this.agentType = agentType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public boolean isCached() { return cached; }
    public void setCached(boolean cached) { this.cached = cached; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
