package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.AtsScoreEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes ATS scoring requests to RabbitMQ.
 * The intelligence-service picks up these messages and processes them.
 */
@Service
public class AtsScoreProducer {

    private static final Logger log = LoggerFactory.getLogger(AtsScoreProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public AtsScoreProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Publishes an ATS scoring request event.
     *
     * @param event the scoring request with resume text and job description
     * @return the jobId for tracking
     */
    public String requestAtsScore(AtsScoreEvent event) {
        log.info("📤 Publishing ATS score request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EXCHANGE,
                RabbitMQConstants.ATS_SCORE_REQUEST_KEY,
                event
        );

        log.info("✅ ATS score request published successfully: jobId={}", event.getJobId());
        return event.getJobId();
    }
}
