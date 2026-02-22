package com.Backend.AI_Resume_Builder_Backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Stores AI Agent conversation sessions.
 * Each user can have multiple conversations (sessions).
 */
@Entity
@Table(name = "agent_conversations", indexes = {
    @Index(name = "idx_conv_user_id", columnList = "user_id"),
    @Index(name = "idx_conv_session", columnList = "sessionId"),
    @Index(name = "idx_conv_updated", columnList = "updatedAt")
})
public class AgentConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sessionId;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(length = 100)
    private String title;

    @Column(length = 30)
    private String agentType; // BULLET_IMPROVER, JOB_MATCHER, CONTENT_GENERATOR, GENERAL

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<AgentMessage> messages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public AgentConversation() {}

    public AgentConversation(String sessionId, String userId, String agentType) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.agentType = agentType;
        this.title = agentType + " Session";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAgentType() { return agentType; }
    public void setAgentType(String agentType) { this.agentType = agentType; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<AgentMessage> getMessages() { return messages; }
    public void setMessages(List<AgentMessage> messages) { this.messages = messages; }

    public void addMessage(AgentMessage message) {
        messages.add(message);
        message.setConversation(this);
    }
}
