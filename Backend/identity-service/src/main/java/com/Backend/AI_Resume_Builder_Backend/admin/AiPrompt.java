package com.Backend.AI_Resume_Builder_Backend.admin;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_prompts")
public class AiPrompt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prompt_key", unique = true, nullable = false)
    private String promptKey;

    @Column(name = "prompt_name", nullable = false)
    private String promptName;

    @Column(name = "system_prompt", columnDefinition = "LONGTEXT", nullable = false)
    private String systemPrompt;

    @Column(name = "model_name", nullable = false)
    private String modelName = "gemini-2.5-flash";

    @Column(name = "temperature", nullable = false)
    private double temperature = 0.7;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AiPrompt() {}

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPromptKey() { return promptKey; }
    public void setPromptKey(String promptKey) { this.promptKey = promptKey; }
    public String getPromptName() { return promptName; }
    public void setPromptName(String promptName) { this.promptName = promptName; }
    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
