package com.Backend.AI_Resume_Builder_Backend.messaging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Event DTO for asynchronous ATS scoring.
 * Used for both request (resume-service → intelligence-service)
 * and result (intelligence-service → resume-service) messages.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AtsScoreEvent implements Serializable {

    private String jobId;
    private String resumeText;
    private String jobDescription;
    private String userEmail;
    private Map<String, Object> result;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private Instant createdAt;

    public AtsScoreEvent() {
        this.jobId = UUID.randomUUID().toString();
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    // ── Static Factory Methods ──

    public static AtsScoreEvent createRequest(String resumeText, String jobDescription, String userEmail) {
        AtsScoreEvent event = new AtsScoreEvent();
        event.setResumeText(resumeText);
        event.setJobDescription(jobDescription);
        event.setUserEmail(userEmail);
        return event;
    }

    public static AtsScoreEvent createResult(String jobId, Map<String, Object> result) {
        AtsScoreEvent event = new AtsScoreEvent();
        event.setJobId(jobId);
        event.setResult(result);
        event.setStatus("COMPLETED");
        return event;
    }

    public static AtsScoreEvent createFailure(String jobId, String errorMessage) {
        AtsScoreEvent event = new AtsScoreEvent();
        event.setJobId(jobId);
        event.setErrorMessage(errorMessage);
        event.setStatus("FAILED");
        return event;
    }

    // ── Getters and Setters ──

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Map<String, Object> getResult() { return result; }
    public void setResult(Map<String, Object> result) { this.result = result; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "AtsScoreEvent{jobId='" + jobId + "', status='" + status +
               "', userEmail='" + userEmail + "', createdAt=" + createdAt + "}";
    }
}
