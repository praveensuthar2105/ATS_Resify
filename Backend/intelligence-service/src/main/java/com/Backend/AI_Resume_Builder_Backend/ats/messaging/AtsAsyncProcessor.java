package com.Backend.AI_Resume_Builder_Backend.ats.messaging;

import com.Backend.AI_Resume_Builder_Backend.ats.AtsScoreService;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Processes ATS scoring requests asynchronously.
 * Delegates to the existing AtsScoreService for the actual AI analysis,
 * but works with pre-extracted resume text instead of MultipartFile.
 *
 * This bridge allows the RabbitMQ listener to reuse all existing
 * scoring logic without modifying the synchronous service.
 */
@Service
public class AtsAsyncProcessor {

    private static final Logger log = LoggerFactory.getLogger(AtsAsyncProcessor.class);
    private final AtsScoreService atsScoreService;

    public AtsAsyncProcessor(AtsScoreService atsScoreService) {
        this.atsScoreService = atsScoreService;
    }

    /**
     * Processes ATS scoring from pre-extracted resume text.
     * The PDF was already parsed at the producer side (resume-service).
     *
     * @param resumeText    the extracted text from the resume PDF
     * @param jobDescription optional job description for targeted scoring
     * @return the ATS scoring result map
     */
    public Map<String, Object> processScore(String resumeText, String jobDescription) {
        log.info("🔬 Processing async ATS score (text length: {} chars)", 
                resumeText != null ? resumeText.length() : 0);

        try {
            // Use the existing scoring logic via the text-based method
            // We need to add a text-based scoring method to AtsScoreService
            return atsScoreService.getAtsScoreFromText(resumeText, jobDescription);
        } catch (Exception e) {
            log.error("ATS async processing failed", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Processing failed");
            error.put("message", e.getMessage());
            return error;
        }
    }
}
