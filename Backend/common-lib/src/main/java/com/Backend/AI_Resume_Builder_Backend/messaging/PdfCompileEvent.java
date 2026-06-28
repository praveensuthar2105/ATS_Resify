package com.Backend.AI_Resume_Builder_Backend.messaging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Event DTO for asynchronous LaTeX → PDF compilation.
 * 
 * Flow: LatexController publishes request → PdfCompileListener compiles →
 *       publishes result with Base64-encoded PDF bytes.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PdfCompileEvent implements Serializable {

    private String jobId;
    private String latexCode;       // LaTeX source code to compile
    private String pdfBase64;       // Base64-encoded PDF bytes (in result)
    private String status;          // PENDING, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private String userEmail;
    private Instant createdAt;

    public PdfCompileEvent() {
        this.jobId = UUID.randomUUID().toString();
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    // ── Static Factory Methods ──

    public static PdfCompileEvent createRequest(String latexCode, String userEmail) {
        PdfCompileEvent event = new PdfCompileEvent();
        event.setLatexCode(latexCode);
        event.setUserEmail(userEmail);
        return event;
    }

    public static PdfCompileEvent createResult(String jobId, String pdfBase64) {
        PdfCompileEvent event = new PdfCompileEvent();
        event.setJobId(jobId);
        event.setPdfBase64(pdfBase64);
        event.setStatus("COMPLETED");
        return event;
    }

    public static PdfCompileEvent createFailure(String jobId, String errorMessage) {
        PdfCompileEvent event = new PdfCompileEvent();
        event.setJobId(jobId);
        event.setErrorMessage(errorMessage);
        event.setStatus("FAILED");
        return event;
    }

    // ── Getters and Setters ──

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getLatexCode() { return latexCode; }
    public void setLatexCode(String latexCode) { this.latexCode = latexCode; }

    public String getPdfBase64() { return pdfBase64; }
    public void setPdfBase64(String pdfBase64) { this.pdfBase64 = pdfBase64; }

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
        return "PdfCompileEvent{jobId='" + jobId + "', status='" + status +
               "', userEmail='" + userEmail + "', createdAt=" + createdAt + "}";
    }
}
