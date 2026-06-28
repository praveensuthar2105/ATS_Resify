package com.Backend.AI_Resume_Builder_Backend.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class UndoRedoService {

    private static final Logger log = LoggerFactory.getLogger(UndoRedoService.class);
    private static final String HISTORY_KEY_PREFIX = "sync:resume:history:";
    private static final int MAX_HISTORY_SIZE = 50;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public static class HistoryEntry {
        private ResumeData data;
        private long timestamp;
        private String source;

        public HistoryEntry() {}

        public HistoryEntry(ResumeData data, long timestamp, String source) {
            this.data = deepCopy(data);
            this.timestamp = timestamp;
            this.source = source;
        }

        public ResumeData getData() { return data; }
        public void setData(ResumeData data) { this.data = data; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        private static ResumeData deepCopy(ResumeData original) {
            if (original == null) return null;
            try {
                String json = MAPPER.writeValueAsString(original);
                return MAPPER.readValue(json, ResumeData.class);
            } catch (Exception e) {
                return original;
            }
        }
    }

    public static class HistoryState {
        private List<HistoryEntry> history = new ArrayList<>();
        private int currentIndex = -1;

        public HistoryState() {}

        public List<HistoryEntry> getHistory() { return history; }
        public void setHistory(List<HistoryEntry> history) { this.history = history; }
        public int getCurrentIndex() { return currentIndex; }
        public void setCurrentIndex(int currentIndex) { this.currentIndex = currentIndex; }
    }

    private HistoryState getHistoryState(String userId) {
        String key = HISTORY_KEY_PREFIX + userId;
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            if (obj != null) {
                return MAPPER.readValue(obj.toString(), HistoryState.class);
            }
        } catch (Exception e) {
            log.error("Failed to read history state for user {}: {}", userId, e.getMessage());
        }
        return new HistoryState();
    }

    private void saveHistoryState(String userId, HistoryState state) {
        String key = HISTORY_KEY_PREFIX + userId;
        try {
            String json = MAPPER.writeValueAsString(state);
            redisTemplate.opsForValue().set(key, json);
        } catch (Exception e) {
            log.error("Failed to save history state for user {}: {}", userId, e.getMessage());
        }
    }

    public void recordState(String userId, ResumeData data, String source) {
        HistoryState state = getHistoryState(userId);
        List<HistoryEntry> history = state.getHistory();
        int currentIndex = state.getCurrentIndex();

        // Remove all entries after current index (if we're in the middle of history)
        if (currentIndex < history.size() - 1) {
            history.subList(currentIndex + 1, history.size()).clear();
        }

        // Add new entry
        history.add(new HistoryEntry(data, System.currentTimeMillis(), source));
        currentIndex++;

        // Limit history size
        if (history.size() > MAX_HISTORY_SIZE) {
            history.remove(0);
            currentIndex--;
        }

        state.setCurrentIndex(currentIndex);
        saveHistoryState(userId, state);
    }

    public ResumeData undo(String userId) {
        HistoryState state = getHistoryState(userId);
        if (canUndo(userId)) {
            int idx = state.getCurrentIndex() - 1;
            state.setCurrentIndex(idx);
            saveHistoryState(userId, state);
            return state.getHistory().get(idx).getData();
        }
        return null;
    }

    public ResumeData redo(String userId) {
        HistoryState state = getHistoryState(userId);
        if (canRedo(userId)) {
            int idx = state.getCurrentIndex() + 1;
            state.setCurrentIndex(idx);
            saveHistoryState(userId, state);
            return state.getHistory().get(idx).getData();
        }
        return null;
    }

    public boolean canUndo(String userId) {
        HistoryState state = getHistoryState(userId);
        return state.getCurrentIndex() > 0;
    }

    public boolean canRedo(String userId) {
        HistoryState state = getHistoryState(userId);
        return state.getCurrentIndex() < state.getHistory().size() - 1;
    }

    public ResumeData getCurrentState(String userId) {
        HistoryState state = getHistoryState(userId);
        List<HistoryEntry> history = state.getHistory();
        int currentIndex = state.getCurrentIndex();
        if (currentIndex >= 0 && currentIndex < history.size()) {
            return history.get(currentIndex).getData();
        }
        return null;
    }

    public List<String> getHistory(String userId) {
        HistoryState state = getHistoryState(userId);
        List<HistoryEntry> history = state.getHistory();
        int currentIndex = state.getCurrentIndex();
        List<String> result = new ArrayList<>();
        for (int i = 0; i < history.size(); i++) {
            HistoryEntry entry = history.get(i);
            String marker = (i == currentIndex) ? " [CURRENT]" : "";
            result.add(entry.getSource() + " at " + entry.getTimestamp() + marker);
        }
        return result;
    }

    public void clear(String userId) {
        String key = HISTORY_KEY_PREFIX + userId;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Failed to clear history state for user {}: {}", userId, e.getMessage());
        }
    }
}