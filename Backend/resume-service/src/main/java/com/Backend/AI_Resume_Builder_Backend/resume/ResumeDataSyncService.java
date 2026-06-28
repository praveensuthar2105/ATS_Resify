package com.Backend.AI_Resume_Builder_Backend.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class ResumeDataSyncService {

    private static final Logger log = LoggerFactory.getLogger(ResumeDataSyncService.class);
    private static final String DATA_KEY_PREFIX = "sync:resume:data:";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ResumeDataConverterService converter = new ResumeDataConverterService();

    @Autowired
    private UndoRedoService undoRedoService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Get central model
    public ResumeData getCentralModel(String userId) {
        String key = DATA_KEY_PREFIX + userId;
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            if (obj != null) {
                return MAPPER.readValue(obj.toString(), ResumeData.class);
            }
        } catch (Exception e) {
            log.error("Failed to read central model for user {}: {}", userId, e.getMessage());
        }
        return new ResumeData();
    }

    // Save central model
    private void saveCentralModel(String userId, ResumeData data) {
        String key = DATA_KEY_PREFIX + userId;
        try {
            String json = MAPPER.writeValueAsString(data);
            redisTemplate.opsForValue().set(key, json);
        } catch (Exception e) {
            log.error("Failed to save central model for user {}: {}", userId, e.getMessage());
        }
    }

    // Update from JSON - parse JSON, update central model, regenerate LaTeX
    public void updateFromJson(String userId, String json) {
        ResumeData data = converter.fromJson(json);
        saveCentralModel(userId, data);
        undoRedoService.recordState(userId, data, "JSON");
    }

    // Update from LaTeX - parse LaTeX, update central model, regenerate JSON
    public void updateFromLatex(String userId, String latex) {
        ResumeData data = converter.fromLatex(latex);
        saveCentralModel(userId, data);
        undoRedoService.recordState(userId, data, "LaTeX");
    }

    // Get current JSON representation
    public String getCurrentJson(String userId) {
        ResumeData data = getCentralModel(userId);
        return converter.toJson(data);
    }

    // Get current LaTeX representation
    public String getCurrentLatex(String userId) {
        ResumeData data = getCentralModel(userId);
        return converter.toLatex(data);
    }

    // Update central model directly
    public void updateCentralModel(String userId, ResumeData data) {
        saveCentralModel(userId, data);
        undoRedoService.recordState(userId, data, "Form");
    }

    // Undo last change
    public ResumeData undo(String userId) {
        ResumeData previous = undoRedoService.undo(userId);
        if (previous != null) {
            saveCentralModel(userId, previous);
            return previous;
        }
        return getCentralModel(userId);
    }

    // Redo last undone change
    public ResumeData redo(String userId) {
        ResumeData next = undoRedoService.redo(userId);
        if (next != null) {
            saveCentralModel(userId, next);
            return next;
        }
        return getCentralModel(userId);
    }

    public boolean canUndo(String userId) {
        return undoRedoService.canUndo(userId);
    }

    public boolean canRedo(String userId) {
        return undoRedoService.canRedo(userId);
    }
}