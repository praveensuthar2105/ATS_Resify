package com.Backend.AI_Resume_Builder_Backend.ats;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.Backend.AI_Resume_Builder_Backend.user.User;


@Entity
@Table(name = "ats_checks")
public class AtsCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Nullable for guest checks

    private boolean jobDescriptionProvided;

    @Column
    private Integer atsScore;

    @Column(columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(columnDefinition = "LONGTEXT")
    private String scoreBreakdown;

    @Column(columnDefinition = "LONGTEXT")
    private String suggestions;

    @Column
    private String fileName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public AtsCheck() {
    }

    public AtsCheck(User user, boolean jobDescriptionProvided) {
        this.user = user;
        this.jobDescriptionProvided = jobDescriptionProvided;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isJobDescriptionProvided() {
        return jobDescriptionProvided;
    }

    public void setJobDescriptionProvided(boolean jobDescriptionProvided) {
        this.jobDescriptionProvided = jobDescriptionProvided;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(Integer atsScore) {
        this.atsScore = atsScore;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }

    public String getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(String scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public String getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(String suggestions) {
        this.suggestions = suggestions;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}