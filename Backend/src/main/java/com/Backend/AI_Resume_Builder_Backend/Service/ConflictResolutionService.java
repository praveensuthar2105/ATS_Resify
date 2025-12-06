package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ConflictResolutionService {
    private Map<String, Long> lastUpdateTimestamps = new HashMap<>();
    private Map<String, String> lastUpdateSources = new HashMap<>();

    public enum UpdateSource {
        JSON, LATEX, FORM
    }

    public boolean canUpdate(String userId, UpdateSource source, long timestamp) {
        String key = userId;
        Long lastTimestamp = lastUpdateTimestamps.get(key);

        if (lastTimestamp == null) {
            // First update, allow it
            recordUpdate(userId, source, timestamp);
            return true;
        }

        // Check if this update is more recent
        if (timestamp > lastTimestamp) {
            recordUpdate(userId, source, timestamp);
            return true;
        }

        return false;
    }

    public void recordUpdate(String userId, UpdateSource source, long timestamp) {
        lastUpdateTimestamps.put(userId, timestamp);
        lastUpdateSources.put(userId, source.name());
    }

    public Map<String, Object> detectConflict(String userId, UpdateSource currentSource, long timestamp) {
        Map<String, Object> result = new HashMap<>();
        String key = userId;
        Long lastTimestamp = lastUpdateTimestamps.get(key);
        String lastSource = lastUpdateSources.get(key);

        if (lastTimestamp != null && timestamp < lastTimestamp) {
            result.put("conflict", true);
            result.put("message", "Concurrent modification detected. Last update was from " + lastSource);
            result.put("lastSource", lastSource);
            result.put("lastTimestamp", lastTimestamp);
        } else {
            result.put("conflict", false);
        }

        return result;
    }

    public ResumeData mergeChanges(ResumeData base, ResumeData incoming, UpdateSource source) {
        // Simple merge strategy: prefer incoming changes
        // In production, implement more sophisticated merge logic
        return incoming;
    }
}
