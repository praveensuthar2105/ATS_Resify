package com.Backend.AI_Resume_Builder_Backend.admin;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flags")
public class FeatureFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flag_key", unique = true, nullable = false)
    private String flagKey;

    @Column(name = "flag_name", nullable = false)
    private String flagName;

    @Column(name = "description")
    private String description;

    @Column(name = "enabled_global", nullable = false)
    private boolean enabledGlobal = true;

    @Column(name = "enabled_pro_only", nullable = false)
    private boolean enabledProOnly = false;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public FeatureFlag() {}

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFlagKey() { return flagKey; }
    public void setFlagKey(String flagKey) { this.flagKey = flagKey; }
    public String getFlagName() { return flagName; }
    public void setFlagName(String flagName) { this.flagName = flagName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isEnabledGlobal() { return enabledGlobal; }
    public void setEnabledGlobal(boolean enabledGlobal) { this.enabledGlobal = enabledGlobal; }
    public boolean isEnabledProOnly() { return enabledProOnly; }
    public void setEnabledProOnly(boolean enabledProOnly) { this.enabledProOnly = enabledProOnly; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
