package com.Backend.AI_Resume_Builder_Backend.admin;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tier_configs")
public class TierConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_name", unique = true, nullable = false)
    private String tierName;

    @Column(name = "max_resumes_per_month", nullable = false)
    private int maxResumesPerMonth = 10;

    @Column(name = "max_ats_checks_per_day", nullable = false)
    private int maxAtsChecksPerDay = 5;

    @Column(name = "ai_model_allowed", nullable = false)
    private String aiModelAllowed = "gemini-2.5-flash";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TierConfig() {}

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }
    public int getMaxResumesPerMonth() { return maxResumesPerMonth; }
    public void setMaxResumesPerMonth(int maxResumesPerMonth) { this.maxResumesPerMonth = maxResumesPerMonth; }
    public int getMaxAtsChecksPerDay() { return maxAtsChecksPerDay; }
    public void setMaxAtsChecksPerDay(int maxAtsChecksPerDay) { this.maxAtsChecksPerDay = maxAtsChecksPerDay; }
    public String getAiModelAllowed() { return aiModelAllowed; }
    public void setAiModelAllowed(String aiModelAllowed) { this.aiModelAllowed = aiModelAllowed; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
