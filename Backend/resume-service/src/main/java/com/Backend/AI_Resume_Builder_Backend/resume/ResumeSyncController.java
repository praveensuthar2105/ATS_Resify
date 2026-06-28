package com.Backend.AI_Resume_Builder_Backend.resume;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resume-sync")
public class ResumeSyncController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeSyncController.class);

    @Autowired
    private ResumeDataSyncService syncService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private String getUserId(Authentication authentication) {
        return (authentication != null) ? authentication.getName() : "anonymous";
    }

    private void broadcastUpdates(String userId) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/resume/json", syncService.getCurrentJson(userId));
            messagingTemplate.convertAndSendToUser(userId, "/queue/resume/latex", syncService.getCurrentLatex(userId));
            messagingTemplate.convertAndSendToUser(userId, "/queue/resume/data", syncService.getCentralModel(userId));
        } catch (Exception e) {
            logger.error("Failed to broadcast updates via WebSocket for user {}: {}", userId, e.getMessage());
        }
    }

    @GetMapping("/data")
    public ResponseEntity<ResumeData> getResumeData(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(syncService.getCentralModel(userId));
    }

    @GetMapping("/json")
    public ResponseEntity<Map<String, String>> getResumeJson(Authentication authentication) {
        String userId = getUserId(authentication);
        Map<String, String> response = new HashMap<>();
        response.put("json", syncService.getCurrentJson(userId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latex")
    public ResponseEntity<Map<String, String>> getResumeLatex(Authentication authentication) {
        String userId = getUserId(authentication);
        Map<String, String> response = new HashMap<>();
        response.put("latex", syncService.getCurrentLatex(userId));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/update-from-json")
    public ResponseEntity<Map<String, Object>> updateFromJson(@RequestBody Map<String, String> request, Authentication authentication) {
        String userId = getUserId(authentication);
        try {
            String json = request.get("json");
            if (json == null || json.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "The 'json' field is required and must not be blank");
                return ResponseEntity.badRequest().body(response);
            }

            syncService.updateFromJson(userId, json);

            // Broadcast updates via WebSocket
            broadcastUpdates(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume updated from JSON");
            response.put("latex", syncService.getCurrentLatex(userId));
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
    public ResponseEntity<Map<String, Object>> updateFromLatex(@RequestBody Map<String, String> request, Authentication authentication) {
        String userId = getUserId(authentication);
        try {
            String latex = request.get("latex");
            if (latex == null || latex.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "The 'latex' field is required and must not be blank");
                return ResponseEntity.badRequest().body(response);
            }

            syncService.updateFromLatex(userId, latex);

            // Broadcast updates via WebSocket
            broadcastUpdates(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume updated from LaTeX");
            response.put("json", syncService.getCurrentJson(userId));
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
    public ResponseEntity<Map<String, Object>> updateData(@RequestBody ResumeData data, Authentication authentication) {
        String userId = getUserId(authentication);
        try {
            syncService.updateCentralModel(userId, data);

            // Broadcast updates via WebSocket
            broadcastUpdates(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resume data updated");
            response.put("json", syncService.getCurrentJson(userId));
            response.put("latex", syncService.getCurrentLatex(userId));
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
    public ResponseEntity<Map<String, Object>> undo(Authentication authentication) {
        String userId = getUserId(authentication);
        try {
            ResumeData data = syncService.undo(userId);

            // Broadcast updates via WebSocket
            broadcastUpdates(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Undo successful");
            response.put("data", data);
            response.put("canUndo", syncService.canUndo(userId));
            response.put("canRedo", syncService.canRedo(userId));
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
    public ResponseEntity<Map<String, Object>> redo(Authentication authentication) {
        String userId = getUserId(authentication);
        try {
            ResumeData data = syncService.redo(userId);

            // Broadcast updates via WebSocket
            broadcastUpdates(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Redo successful");
            response.put("data", data);
            response.put("canUndo", syncService.canUndo(userId));
            response.put("canRedo", syncService.canRedo(userId));
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