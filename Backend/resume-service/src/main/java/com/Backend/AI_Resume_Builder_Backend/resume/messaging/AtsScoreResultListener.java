package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.AtsScoreEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Listens for ATS scoring results from intelligence-service.
 * Stores results in an in-memory map for polling by the API controller.
 */
@Service
public class AtsScoreResultListener {

    private static final Logger log = LoggerFactory.getLogger(AtsScoreResultListener.class);

    /** In-memory store: jobId → event (result or failure). */
    private final Map<String, AtsScoreEvent> results = new ConcurrentHashMap<>();

    @RabbitListener(queues = RabbitMQConstants.ATS_SCORE_RESULT_QUEUE)
    public void onAtsScoreResult(AtsScoreEvent event) {
        log.info("📥 Received ATS score result: jobId={}, status={}",
                event.getJobId(), event.getStatus());

        results.put(event.getJobId(), event);

        if ("COMPLETED".equals(event.getStatus())) {
            log.info("✅ ATS scoring completed for jobId={}", event.getJobId());
        } else if ("FAILED".equals(event.getStatus())) {
            log.warn("❌ ATS scoring failed for jobId={}: {}",
                    event.getJobId(), event.getErrorMessage());
        }
    }

    /**
     * Poll for a result by jobId.
     *
     * @param jobId the job identifier
     * @return the event if available, null otherwise
     */
    public AtsScoreEvent getResult(String jobId) {
        return results.get(jobId);
    }

    /**
     * Remove a result after it has been retrieved (cleanup).
     */
    public AtsScoreEvent consumeResult(String jobId) {
        return results.remove(jobId);
    }
}
