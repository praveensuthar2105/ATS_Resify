package com.Backend.AI_Resume_Builder_Backend.Service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResumeRequest {
    @NotBlank(message = "userResumeDescription must not be blank")
    @Size(max = 50000, message = "userResumeDescription cannot exceed 50000 characters")
    private String userResumeDescription;

    @Pattern(regexp = "modern|classic|minimal|professional|ats", message = "templateType must be one of: modern, classic, minimal, professional, ats")
    private String templateType;

    private String message;

    // No-arg constructor required by Jackson for deserialization
    public ResumeRequest() {
    }

    public ResumeRequest(String userResumeDescription) {
        this.userResumeDescription = userResumeDescription;
        this.templateType = "modern"; // default
    }

    public ResumeRequest(String userResumeDescription, String templateType) {
        this.userResumeDescription = userResumeDescription;
        this.templateType = templateType;
    }

    // Getter / Setter
    public String getUserResumeDescription() {
        return userResumeDescription;
    }

    public void setUserResumeDescription(String userResumeDescription) {
        this.userResumeDescription = userResumeDescription;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "ResumeRequest{" +
                "userResumeDescription='" + userResumeDescription + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}