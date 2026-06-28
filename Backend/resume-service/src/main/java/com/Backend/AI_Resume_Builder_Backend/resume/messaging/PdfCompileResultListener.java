package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.PdfCompileEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Listens for PDF compilation results and stores them
 * in-memory for polling by the async API endpoint.
 */
@Service
public class PdfCompileResultListener {

    private static final Logger log = LoggerFactory.getLogger(PdfCompileResultListener.class);

    /** In-memory store: jobId → event (result or failure). */
    private final Map<String, PdfCompileEvent> results = new ConcurrentHashMap<>();

    @RabbitListener(queues = RabbitMQConstants.PDF_COMPILE_RESULT_QUEUE)
    public void onPdfCompileResult(PdfCompileEvent event) {
        log.info("📥 Received PDF compile result: jobId={}, status={}",
                event.getJobId(), event.getStatus());

        results.put(event.getJobId(), event);

        if ("COMPLETED".equals(event.getStatus())) {
            log.info("✅ PDF compilation completed for jobId={}", event.getJobId());
        } else if ("FAILED".equals(event.getStatus())) {
            log.warn("❌ PDF compilation failed for jobId={}: {}",
                    event.getJobId(), event.getErrorMessage());
        }
    }

    /**
     * Poll for a result by jobId.
     */
    public PdfCompileEvent getResult(String jobId) {
        return results.get(jobId);
    }

    /**
     * Remove a result after retrieval (cleanup).
     */
    public PdfCompileEvent consumeResult(String jobId) {
        return results.remove(jobId);
    }
}
