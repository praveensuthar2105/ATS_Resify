package com.Backend.AI_Resume_Builder_Backend.messaging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Event DTO for asynchronous Resume Generation (Gemini AI).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResumeGenEvent implements Serializable {

    private String jobId;
    private String userResumeDescription;
    private String templateType;
    private Map<String, Object> resultData; // The structured AI response
    private String status;                  // PENDING, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private String userEmail;
    private Instant createdAt;

    public ResumeGenEvent() {
        this.jobId = UUID.randomUUID().toString();
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    // ── Static Factory Methods ──

    public static ResumeGenEvent createRequest(String userResumeDescription, String templateType, String userEmail) {
        ResumeGenEvent event = new ResumeGenEvent();
        event.setUserResumeDescription(userResumeDescription);
        event.setTemplateType(templateType);
        event.setUserEmail(userEmail);
        return event;
    }

    public static ResumeGenEvent createResult(String jobId, Map<String, Object> resultData) {
        ResumeGenEvent event = new ResumeGenEvent();
        event.setJobId(jobId);
        event.setResultData(resultData);
        event.setStatus("COMPLETED");
        return event;
    }

    public static ResumeGenEvent createFailure(String jobId, String errorMessage) {
        ResumeGenEvent event = new ResumeGenEvent();
        event.setJobId(jobId);
        event.setErrorMessage(errorMessage);
        event.setStatus("FAILED");
        return event;
    }

    // ── Getters and Setters ──

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getUserResumeDescription() { return userResumeDescription; }
    public void setUserResumeDescription(String userResumeDescription) { this.userResumeDescription = userResumeDescription; }

    public String getTemplateType() { return templateType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }

    public Map<String, Object> getResultData() { return resultData; }
    public void setResultData(Map<String, Object> resultData) { this.resultData = resultData; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "ResumeGenEvent{jobId='" + jobId + "', status='" + status +
               "', userEmail='" + userEmail + "', createdAt=" + createdAt + "}";
    }
}
