package com.Backend.AI_Resume_Builder_Backend.resume.messaging;

import com.Backend.AI_Resume_Builder_Backend.messaging.ResumeGenEvent;
import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * Listens for Resume Generation results and stores them
 * in-memory for polling by the async API endpoint.
 */
@Service
public class ResumeGenResultListener {

    private static final Logger log = LoggerFactory.getLogger(ResumeGenResultListener.class);

    private final Map<String, ResumeGenEvent> results = new ConcurrentHashMap<>();

    @RabbitListener(queues = RabbitMQConstants.RESUME_GEN_RESULT_QUEUE)
    public void onResumeGenResult(ResumeGenEvent event) {
        log.info("📥 Received Resume Gen result: jobId={}, status={}",
                event.getJobId(), event.getStatus());

        results.put(event.getJobId(), event);

        if ("COMPLETED".equals(event.getStatus())) {
            log.info("✅ Resume Gen completed for jobId={}", event.getJobId());
        } else if ("FAILED".equals(event.getStatus())) {
            log.warn("❌ Resume Gen failed for jobId={}: {}",
                    event.getJobId(), event.getErrorMessage());
        }
    }

    public ResumeGenEvent getResult(String jobId) {
        return results.get(jobId);
    }

    public ResumeGenEvent consumeResult(String jobId) {
        return results.remove(jobId);
    }

    public void putResult(String jobId, ResumeGenEvent event) {
        results.put(jobId, event);
    }
}
