package com.Backend.AI_Resume_Builder_Backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores individual messages in an agent conversation.
 * Messages can be from USER or ASSISTANT.
 */
@Entity
@Table(name = "agent_messages", indexes = {
    @Index(name = "idx_msg_conversation", columnList = "conversation_id"),
    @Index(name = "idx_msg_created", columnList = "createdAt")
})
public class AgentMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AgentConversation conversation;

    @Column(nullable = false, length = 15)
    private String role; // USER, ASSISTANT

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 30)
    private String actionType; // IMPROVE_BULLET, MATCH_JOB, GENERATE_CONTENT, CHAT, SUGGESTION

    @Column(columnDefinition = "JSON")
    private String metadata; // JSON metadata (original text, scores, etc.)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public AgentMessage() {}

    public AgentMessage(String role, String content, String actionType) {
        this.role = role;
        this.content = content;
        this.actionType = actionType;
    }

    public AgentMessage(AgentConversation conversation, String role, String content, String actionType) {
        this.conversation = conversation;
        this.role = role;
        this.content = content;
        this.actionType = actionType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AgentConversation getConversation() { return conversation; }
    public void setConversation(AgentConversation conversation) { this.conversation = conversation; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
