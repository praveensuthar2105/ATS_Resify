package com.Backend.AI_Resume_Builder_Backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
}
