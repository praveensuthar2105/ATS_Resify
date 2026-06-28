package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.PdfCompileEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes LaTeX → PDF compilation requests to RabbitMQ.
 * The PdfCompileListener picks up and processes them asynchronously.
 */
@Service
public class PdfCompileProducer {

    private static final Logger log = LoggerFactory.getLogger(PdfCompileProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public PdfCompileProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Publishes a PDF compilation request.
     *
     * @param event the compile request with LaTeX code
     * @return the jobId for tracking
     */
    public String requestCompile(PdfCompileEvent event) {
        log.info("📤 Publishing PDF compile request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        rabbitTemplate.convertAndSend(
                RabbitMQConstants.EXCHANGE,
                RabbitMQConstants.PDF_COMPILE_REQUEST_KEY,
                event
        );

        log.info("✅ PDF compile request published: jobId={}", event.getJobId());
        return event.getJobId();
    }
}
