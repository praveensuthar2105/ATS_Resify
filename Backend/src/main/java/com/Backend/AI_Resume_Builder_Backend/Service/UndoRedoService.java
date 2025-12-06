package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UndoRedoService {
    private static class HistoryEntry {
        ResumeData data;
        long timestamp;
        String source;

        HistoryEntry(ResumeData data, long timestamp, String source) {
            this.data = deepCopy(data);
            this.timestamp = timestamp;
            this.source = source;
        }

        private static ResumeData deepCopy(ResumeData original) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writeValueAsString(original);
                return mapper.readValue(json, ResumeData.class);
            } catch (Exception e) {
                return original;
            }
        }
    }

    private List<HistoryEntry> history = new ArrayList<>();
    private int currentIndex = -1;
    private static final int MAX_HISTORY_SIZE = 50;

    public void recordState(ResumeData data, String source) {
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
    }

    public ResumeData undo() {
        if (canUndo()) {
            currentIndex--;
            return history.get(currentIndex).data;
        }
        return null;
    }

    public ResumeData redo() {
        if (canRedo()) {
            currentIndex++;
            return history.get(currentIndex).data;
        }
        return null;
    }

    public boolean canUndo() {
        return currentIndex > 0;
    }

    public boolean canRedo() {
        return currentIndex < history.size() - 1;
    }

    public ResumeData getCurrentState() {
        if (currentIndex >= 0 && currentIndex < history.size()) {
            return history.get(currentIndex).data;
        }
        return null;
    }

    public List<String> getHistory() {
        List<String> result = new ArrayList<>();
        for (int i = 0; i < history.size(); i++) {
            HistoryEntry entry = history.get(i);
            String marker = (i == currentIndex) ? " [CURRENT]" : "";
            result.add(entry.source + " at " + entry.timestamp + marker);
        }
        return result;
    }

    public void clear() {
        history.clear();
        currentIndex = -1;
    }
}
