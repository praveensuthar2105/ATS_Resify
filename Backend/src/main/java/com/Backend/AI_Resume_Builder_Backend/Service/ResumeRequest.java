package com.Backend.AI_Resume_Builder_Backend.Service;

public class ResumeRequest {
    private String userResumeDescription;
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