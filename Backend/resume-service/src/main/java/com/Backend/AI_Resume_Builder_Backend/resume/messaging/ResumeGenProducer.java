package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes resume generation requests to RabbitMQ.
 */
@Service
public class ResumeGenProducer {

    private static final Logger log = LoggerFactory.getLogger(ResumeGenProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public ResumeGenProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Publishes a resume generation request.
     *
     * @param event the generation request
     * @return the jobId
     */
    public String requestGeneration(ResumeGenEvent event) {
        log.info("📤 Publishing Resume Gen request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EXCHANGE,
                RabbitMQConstants.RESUME_GEN_REQUEST_KEY,
                event
        );

        return event.getJobId();
    }
}
