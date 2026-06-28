package com.Backend.AI_Resume_Builder_Backend.ats.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.AtsScoreEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Consumes ATS scoring requests from RabbitMQ, processes them
 * using the existing AtsScoreService, and publishes results back.
 */
@Service
public class AtsScoreRequestListener {

    private static final Logger log = LoggerFactory.getLogger(AtsScoreRequestListener.class);
    private final AtsAsyncProcessor atsAsyncProcessor;
    private final RabbitTemplate rabbitTemplate;

    public AtsScoreRequestListener(AtsAsyncProcessor atsAsyncProcessor,
                                    RabbitTemplate rabbitTemplate) {
        this.atsAsyncProcessor = atsAsyncProcessor;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMQConstants.ATS_SCORE_REQUEST_QUEUE)
    public void onAtsScoreRequest(AtsScoreEvent event) {
        log.info("📥 Received ATS score request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        try {
            event.setStatus("PROCESSING");

            Map<String, Object> result = atsAsyncProcessor.processScore(
                    event.getResumeText(), event.getJobDescription());

            // Publish success result
            AtsScoreEvent resultEvent = AtsScoreEvent.createResult(event.getJobId(), result);
            resultEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.ATS_SCORE_RESULT_KEY,
                    resultEvent
            );

            log.info("✅ ATS score processed & result published: jobId={}", event.getJobId());

        } catch (Exception e) {
            log.error("❌ Failed to process ATS score: jobId={}", event.getJobId(), e);

            // Publish failure result
            AtsScoreEvent failureEvent = AtsScoreEvent.createFailure(
                    event.getJobId(), e.getMessage());
            failureEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.ATS_SCORE_RESULT_KEY,
                    failureEvent
            );
        }
    }
}
