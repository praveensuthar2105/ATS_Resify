package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import com.Backend.AI_Resume_Builder_Backend.resume.ResumeService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Consumes Resume Generation requests.
 * Calls Gemini AI via ResumeService, and publishes the result back.
 */
@Service
public class ResumeGenListener {

    private static final Logger log = LoggerFactory.getLogger(ResumeGenListener.class);
    private final ResumeService resumeService;
    private final RabbitTemplate rabbitTemplate;

    public ResumeGenListener(ResumeService resumeService, RabbitTemplate rabbitTemplate) {
        this.resumeService = resumeService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMQConstants.RESUME_GEN_REQUEST_QUEUE)
    public void onResumeGenRequest(ResumeGenEvent event) {
        log.info("📥 Received Resume Gen request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        try {
            event.setStatus("PROCESSING");

            // Generate resume using Gemini AI
            Map<String, Object> resultData = resumeService.generateResumeResponse(
                    event.getUserResumeDescription(), event.getTemplateType());

            if (resultData.containsKey("error")) {
                throw new RuntimeException(resultData.get("error").toString());
            }

            // Publish success result
            ResumeGenEvent resultEvent = ResumeGenEvent.createResult(
                    event.getJobId(), resultData);
            resultEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.RESUME_GEN_RESULT_KEY,
                    resultEvent
            );

            log.info("✅ Resume Gen completed & published: jobId={}", event.getJobId());

        } catch (Exception e) {
            log.error("❌ Resume Gen failed: jobId={}", event.getJobId(), e);

            // Publish failure result
            ResumeGenEvent failureEvent = ResumeGenEvent.createFailure(
                    event.getJobId(), e.getMessage());
            failureEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.RESUME_GEN_RESULT_KEY,
                    failureEvent
            );
        }
    }
}
