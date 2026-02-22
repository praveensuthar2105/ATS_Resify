package com.Backend.AI_Resume_Builder_Backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores user preferences for the AI Resume Agent.
 * 
 * These preferences are automatically injected into every AI prompt
 * so the agent "remembers" how the user likes to work.
 * 
 * Preferences can be:
 * - Explicitly set via the settings UI
 * - Auto-extracted from conversation messages (e.g. "I prefer formal tone")
 */
@Entity
@Table(name = "user_preferences", indexes = {
    @Index(name = "idx_pref_user_id", columnList = "user_id", unique = true)
})
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 255)
    private String userId;

    // ==================== Writing Style ====================

    /** Preferred writing tone: professional, casual, formal, creative, technical */
    @Column(length = 50)
    private String tone = "professional";

    /** Verbosity level: concise, moderate, detailed */
    @Column(length = 30)
    private String verbosity = "moderate";

    /** Whether the user prefers action verbs at the start of bullets */
    @Column(nullable = false)
    private boolean preferActionVerbs = true;

    /** Whether to include quantified metrics in bullets */
    @Column(nullable = false)
    private boolean preferMetrics = true;

    // ==================== Career Context ====================

    /** Target job role (e.g. "Software Engineer", "Product Manager") */
    @Column(length = 200)
    private String targetRole;

    /** Target industry (e.g. "Tech", "Finance", "Healthcare") */
    @Column(length = 200)
    private String targetIndustry;

    /** Experience level: entry, mid, senior, executive */
    @Column(length = 30)
    private String experienceLevel;

    /** Target companies (comma-separated, e.g. "Google, Meta, Amazon") */
    @Column(length = 500)
    private String targetCompanies;

    // ==================== Resume Preferences ====================

    /** Preferred resume template: professional, modern, creative, ats */
    @Column(length = 50)
    private String preferredTemplate;

    /** Max resume length: 1 or 2 pages */
    @Column(nullable = false)
    private int maxPages = 1;

    /** Whether to prioritize ATS compatibility */
    @Column(nullable = false)
    private boolean atsOptimized = true;

    // ==================== Custom Notes ====================

    /** Free-text user notes for the agent (e.g. "I'm career switching from finance") */
    @Column(columnDefinition = "TEXT")
    private String customNotes;

    // ==================== Metadata ====================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==================== Constructors ====================

    public UserPreference() {}

    public UserPreference(String userId) {
        this.userId = userId;
    }

    // ==================== Prompt Builder ====================

    /**
     * Build a context string that gets injected into every AI prompt.
     * This is how the agent "remembers" user preferences.
     */
    public String toPromptContext() {
        StringBuilder sb = new StringBuilder();
        sb.append("USER PREFERENCES (always respect these):\n");

        if (tone != null) sb.append("- Writing tone: ").append(tone).append("\n");
        if (verbosity != null) sb.append("- Detail level: ").append(verbosity).append("\n");
        if (preferActionVerbs) sb.append("- Start bullets with strong action verbs\n");
        if (preferMetrics) sb.append("- Include quantified metrics and numbers when possible\n");
        if (targetRole != null && !targetRole.isEmpty())
            sb.append("- Target role: ").append(targetRole).append("\n");
        if (targetIndustry != null && !targetIndustry.isEmpty())
            sb.append("- Target industry: ").append(targetIndustry).append("\n");
        if (experienceLevel != null && !experienceLevel.isEmpty())
            sb.append("- Experience level: ").append(experienceLevel).append("\n");
        if (targetCompanies != null && !targetCompanies.isEmpty())
            sb.append("- Target companies: ").append(targetCompanies).append("\n");
        if (atsOptimized) sb.append("- Prioritize ATS-friendly formatting and keywords\n");
        if (maxPages > 0) sb.append("- Resume should fit in ").append(maxPages).append(" page(s)\n");
        if (customNotes != null && !customNotes.isEmpty())
            sb.append("- Additional context: ").append(customNotes).append("\n");

        return sb.toString();
    }

    // ==================== Getters and Setters ====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public String getVerbosity() { return verbosity; }
    public void setVerbosity(String verbosity) { this.verbosity = verbosity; }

    public boolean isPreferActionVerbs() { return preferActionVerbs; }
    public void setPreferActionVerbs(boolean preferActionVerbs) { this.preferActionVerbs = preferActionVerbs; }

    public boolean isPreferMetrics() { return preferMetrics; }
    public void setPreferMetrics(boolean preferMetrics) { this.preferMetrics = preferMetrics; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTargetIndustry() { return targetIndustry; }
    public void setTargetIndustry(String targetIndustry) { this.targetIndustry = targetIndustry; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getTargetCompanies() { return targetCompanies; }
    public void setTargetCompanies(String targetCompanies) { this.targetCompanies = targetCompanies; }

    public String getPreferredTemplate() { return preferredTemplate; }
    public void setPreferredTemplate(String preferredTemplate) { this.preferredTemplate = preferredTemplate; }

    public int getMaxPages() { return maxPages; }
    public void setMaxPages(int maxPages) { this.maxPages = maxPages; }

    public boolean isAtsOptimized() { return atsOptimized; }
    public void setAtsOptimized(boolean atsOptimized) { this.atsOptimized = atsOptimized; }

    public String getCustomNotes() { return customNotes; }
    public void setCustomNotes(String customNotes) { this.customNotes = customNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
