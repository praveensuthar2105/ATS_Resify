package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ResumeDataSyncService {
    private final ResumeDataConverterService converter = new ResumeDataConverterService();

    @Autowired
    private UndoRedoService undoRedoService;

    private ResumeData centralModel = new ResumeData();

    // Get central model
    public ResumeData getCentralModel() {
        return centralModel;
    }

    // Update from JSON - parse JSON, update central model, regenerate LaTeX
    public void updateFromJson(String json) {
        centralModel = converter.fromJson(json);
        undoRedoService.recordState(centralModel, "JSON");
    }

    // Update from LaTeX - parse LaTeX, update central model, regenerate JSON
    public void updateFromLatex(String latex) {
        centralModel = converter.fromLatex(latex);
        undoRedoService.recordState(centralModel, "LaTeX");
    }

    // Get current JSON representation
    public String getCurrentJson() {
        return converter.toJson(centralModel);
    }

    // Get current LaTeX representation
    public String getCurrentLatex() {
        return converter.toLatex(centralModel);
    }

    // Update central model directly
    public void updateCentralModel(ResumeData data) {
        this.centralModel = data;
        undoRedoService.recordState(centralModel, "Form");
    }

    // Undo last change
    public ResumeData undo() {
        ResumeData previous = undoRedoService.undo();
        if (previous != null) {
            centralModel = previous;
        }
        return centralModel;
    }

    // Redo last undone change
    public ResumeData redo() {
        ResumeData next = undoRedoService.redo();
        if (next != null) {
            centralModel = next;
        }
        return centralModel;
    }

    public boolean canUndo() {
        return undoRedoService.canUndo();
    }

    public boolean canRedo() {
        return undoRedoService.canRedo();
    }
}
