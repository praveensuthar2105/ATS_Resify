package com.Backend.AI_Resume_Builder_Backend.resume;

import com.Backend.AI_Resume_Builder_Backend.messaging.AtsScoreEvent;
import com.Backend.AI_Resume_Builder_Backend.resume.messaging.AtsScoreProducer;
import com.Backend.AI_Resume_Builder_Backend.resume.messaging.AtsScoreResultListener;
import java.util.HashMap;
import java.util.Map;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Async ATS scoring endpoint.
 * Accepts a PDF, extracts text, publishes to RabbitMQ,
 * and returns a jobId for polling.
 */
@RestController
@RequestMapping("/api/resume")
public class AtsAsyncController {

    private static final Logger log = LoggerFactory.getLogger(AtsAsyncController.class);
    private final AtsScoreProducer atsScoreProducer;
    private final AtsScoreResultListener resultListener;

    public AtsAsyncController(AtsScoreProducer atsScoreProducer,
                               AtsScoreResultListener resultListener) {
        this.atsScoreProducer = atsScoreProducer;
        this.resultListener = resultListener;
    }

    /**
     * Submit a resume for async ATS scoring.
     * Returns immediately with a jobId for polling.
     */
    @PostMapping("/ats-score/async")
    public ResponseEntity<Map<String, Object>> submitAtsScore(
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String jobDescription) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "File is required"));
            }

            // Extract text from PDF at the producer side
            String resumeText;
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper stripper = new PDFTextStripper();
                resumeText = stripper.getText(document);
            }

            if (resumeText == null || resumeText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Could not extract text from PDF"));
            }

            // Get user email from security context
            String userEmail = "anonymous";
            var auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getName())) {
                userEmail = auth.getName();
            }

            // Create and publish event
            AtsScoreEvent event = AtsScoreEvent.createRequest(
                    resumeText, jobDescription, userEmail);
            String jobId = atsScoreProducer.requestAtsScore(event);

            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("status", "PENDING");
            response.put("message", "ATS scoring request submitted. Poll /api/resume/ats-score/status/{jobId} for results.");

            return ResponseEntity.accepted().body(response);

        } catch (Exception e) {
            log.error("Failed to submit async ATS score", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Poll for ATS scoring result by jobId.
     */
    @GetMapping("/ats-score/status/{jobId}")
    public ResponseEntity<Map<String, Object>> getAtsScoreStatus(
            @PathVariable String jobId) {

        AtsScoreEvent event = resultListener.getResult(jobId);

        if (event == null) {
            return ResponseEntity.ok(Map.of(
                    "jobId", jobId,
                    "status", "PROCESSING",
                    "message", "Still processing. Please poll again."
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("jobId", jobId);
        response.put("status", event.getStatus());

        if ("COMPLETED".equals(event.getStatus())) {
            response.put("result", event.getResult());
            resultListener.consumeResult(jobId); // Clean up
        } else if ("FAILED".equals(event.getStatus())) {
            response.put("error", event.getErrorMessage());
            resultListener.consumeResult(jobId); // Clean up
        }

        return ResponseEntity.ok(response);
    }
}
