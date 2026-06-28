package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.PdfCompileEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import com.Backend.AI_Resume_Builder_Backend.resume.LatexCompileService;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Consumes PDF compilation requests from RabbitMQ.
 * Compiles LaTeX → PDF using the existing LatexCompileService,
 * then publishes the result (Base64-encoded PDF) back to the result queue.
 */
@Service
public class PdfCompileListener {

    private static final Logger log = LoggerFactory.getLogger(PdfCompileListener.class);
    private final LatexCompileService latexCompileService;
    private final RabbitTemplate rabbitTemplate;

    public PdfCompileListener(LatexCompileService latexCompileService,
                               RabbitTemplate rabbitTemplate) {
        this.latexCompileService = latexCompileService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitMQConstants.PDF_COMPILE_REQUEST_QUEUE)
    public void onPdfCompileRequest(PdfCompileEvent event) {
        log.info("📥 Received PDF compile request: jobId={}, user={}",
                event.getJobId(), event.getUserEmail());

        try {
            event.setStatus("PROCESSING");

            // Compile LaTeX → PDF bytes using existing service
            byte[] pdfBytes = latexCompileService.compileToPdf(event.getLatexCode());

            // Encode as Base64 for JSON transport
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

            // Publish success result
            PdfCompileEvent resultEvent = PdfCompileEvent.createResult(
                    event.getJobId(), pdfBase64);
            resultEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.PDF_COMPILE_RESULT_KEY,
                    resultEvent
            );

            log.info("✅ PDF compiled & result published: jobId={} ({}KB)",
                    event.getJobId(), pdfBytes.length / 1024);

        } catch (Exception e) {
            log.error("❌ PDF compilation failed: jobId={}", event.getJobId(), e);

            // Publish failure result
            PdfCompileEvent failureEvent = PdfCompileEvent.createFailure(
                    event.getJobId(), e.getMessage());
            failureEvent.setUserEmail(event.getUserEmail());

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.EXCHANGE,
                    RabbitMQConstants.PDF_COMPILE_RESULT_KEY,
                    failureEvent
            );
        }
    }
}
