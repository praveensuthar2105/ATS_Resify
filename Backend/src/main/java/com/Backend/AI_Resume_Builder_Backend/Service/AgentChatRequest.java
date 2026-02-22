package com.Backend.AI_Resume_Builder_Backend.Service;

/**
 * Request DTO for Agent Chat messages
 */
public class AgentChatRequest {
    
    private String sessionId;      // null for new conversation
    private String userId;         // email or identifier
    private String message;
    private String agentType;      // BULLET_IMPROVER, JOB_MATCHER, CONTENT_GENERATOR, GENERAL
    private String context;        // Optional: current resume JSON or LaTeX
    private String jobDescription; // Optional: for job matching
    private String targetRole;     // Optional: target job role

    public AgentChatRequest() {}

    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAgentType() { return agentType; }
    public void setAgentType(String agentType) { this.agentType = agentType; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
}
