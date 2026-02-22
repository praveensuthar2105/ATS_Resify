package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.ResumeData;
import com.Backend.AI_Resume_Builder_Backend.Service.ResumeDataSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resume-sync")
public class ResumeSyncController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeSyncController.class);

    @Autowired
    private ResumeDataSyncService syncService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/data")
    public ResponseEntity<ResumeData> getResumeData() {
        return ResponseEntity.ok(syncService.getCentralModel());
    }

    @GetMapping("/json")
    public ResponseEntity<Map<String, String>> getResumeJson() {
        Map<String, String> response = new HashMap<>();
        response.put("json", syncService.getCurrentJson());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latex")
    public ResponseEntity<Map<String, String>> getResumeLatex() {
        Map<String, String> response = new HashMap<>();
        response.put("latex", syncService.getCurrentLatex());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/update-from-json")
    public ResponseEntity<Map<String, Object>> updateFromJson(@RequestBody Map<String, String> request) {
        try {
            String json = request.get("json");
            if (json == null || json.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "The 'json' field is required and must not be blank");
                return ResponseEntity.badRequest().body(response);
            }

            syncService.updateFromJson(json);

            // Broadcast updates via WebSocket
            messagingTemplate.convertAndSend("/topic/resume/json", syncService.getCurrentJson());
            messagingTemplate.convertAndSend("/topic/resume/latex", syncService.getCurrentLatex());
            messagingTemplate.convertAndSend("/topic/resume/data", syncService.getCentralModel());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume updated from JSON");
            response.put("latex", syncService.getCurrentLatex());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("ResumeSyncController error in updateFromJson", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An internal error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/update-from-latex")
    public ResponseEntity<Map<String, Object>> updateFromLatex(@RequestBody Map<String, String> request) {
        try {
            String latex = request.get("latex");
            if (latex == null || latex.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "The 'latex' field is required and must not be blank");
                return ResponseEntity.badRequest().body(response);
            }

            syncService.updateFromLatex(latex);

            // Broadcast updates via WebSocket
            messagingTemplate.convertAndSend("/topic/resume/json", syncService.getCurrentJson());
            messagingTemplate.convertAndSend("/topic/resume/latex", syncService.getCurrentLatex());
            messagingTemplate.convertAndSend("/topic/resume/data", syncService.getCentralModel());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume updated from LaTeX");
            response.put("json", syncService.getCurrentJson());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("ResumeSyncController error in updateFromLatex", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An internal error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/update-data")
    public ResponseEntity<Map<String, Object>> updateData(@RequestBody ResumeData data) {
        try {
            syncService.updateCentralModel(data);

            // Broadcast updates via WebSocket
            messagingTemplate.convertAndSend("/topic/resume/json", syncService.getCurrentJson());
            messagingTemplate.convertAndSend("/topic/resume/latex", syncService.getCurrentLatex());
            messagingTemplate.convertAndSend("/topic/resume/data", syncService.getCentralModel());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume data updated");
            response.put("json", syncService.getCurrentJson());
            response.put("latex", syncService.getCurrentLatex());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("ResumeSyncController error in updateData", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An internal error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undo() {
        try {
            ResumeData data = syncService.undo();

            // Broadcast updates via WebSocket
            messagingTemplate.convertAndSend("/topic/resume/json", syncService.getCurrentJson());
            messagingTemplate.convertAndSend("/topic/resume/latex", syncService.getCurrentLatex());
            messagingTemplate.convertAndSend("/topic/resume/data", data);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Undo successful");
            response.put("data", data);
            response.put("canUndo", syncService.canUndo());
            response.put("canRedo", syncService.canRedo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("ResumeSyncController error in undo", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An internal error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/redo")
    public ResponseEntity<Map<String, Object>> redo() {
        try {
            ResumeData data = syncService.redo();

            // Broadcast updates via WebSocket
            messagingTemplate.convertAndSend("/topic/resume/json", syncService.getCurrentJson());
            messagingTemplate.convertAndSend("/topic/resume/latex", syncService.getCurrentLatex());
            messagingTemplate.convertAndSend("/topic/resume/data", data);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Redo successful");
            response.put("data", data);
            response.put("canUndo", syncService.canUndo());
            response.put("canRedo", syncService.canRedo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("ResumeSyncController error in redo", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "An internal error occurred");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
