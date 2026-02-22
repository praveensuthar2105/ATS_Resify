package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.AgentConversation;
import com.Backend.AI_Resume_Builder_Backend.Entity.AgentMessage;
import com.Backend.AI_Resume_Builder_Backend.Entity.UserPreference;
import com.Backend.AI_Resume_Builder_Backend.Service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI Agent Controller
 * 
 * REST API endpoints for the AI Resume Agent:
 * 
 * POST /api/agent/chat - Send a message to the agent
 * POST /api/agent/bullet/improve - Improve a bullet point
 * POST /api/agent/bullet/batch - Batch improve bullets
 * POST /api/agent/bullet/suggest - Get real-time suggestions
 * POST /api/agent/job/match - Analyze job match
 * POST /api/agent/job/keywords - Keyword gap analysis
 * POST /api/agent/job/tailor - Generate tailored content
 * POST /api/agent/content/summary - Generate professional summary
 * POST /api/agent/content/experience - Generate experience bullets
 * POST /api/agent/content/project - Generate project description
 * POST /api/agent/content/skills - Generate skills section
 * GET /api/agent/conversations - Get user's conversations
 * GET /api/agent/conversation/{id} - Get conversation messages
 * DELETE /api/agent/conversation/{id} - End conversation
 */
@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private static final Logger log = LoggerFactory.getLogger(AgentController.class);

    @Autowired
    private AgentChatService agentChatService;

    @Autowired
    private BulletImproverService bulletImproverService;

    @Autowired
    private JobMatcherService jobMatcherService;

    @Autowired
    private ContentGeneratorService contentGeneratorService;

    @Autowired
    private UserPreferenceService userPreferenceService;

    // ==================== Main Chat Endpoint ====================

    /**
     * Main agent chat endpoint - routes to appropriate service
     */
    @PostMapping("/chat")
    public ResponseEntity<AgentChatResponse> chat(@RequestBody AgentChatRequest request) {
        log.info("Agent chat request - type: {}, user: {}", request.getAgentType(), request.getUserId());

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    AgentChatResponse.of(request.getSessionId(), "Please provide a message."));
        }

        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    AgentChatResponse.of(null, "User ID is required."));
        }

        AgentChatResponse response = agentChatService.processMessage(request);
        return ResponseEntity.ok(response);
    }

    // ==================== Bullet Improvement Endpoints ====================

    /**
     * Improve a single bullet point (direct, no chat session needed)
     */
    @PostMapping("/bullet/improve")
    public ResponseEntity<Map<String, Object>> improveBullet(@RequestBody Map<String, String> request) {
        String bullet = request.get("bullet");
        String targetRole = request.get("targetRole");
        String context = request.get("context");

        if (bullet == null || bullet.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bullet text is required"));
        }

        Map<String, Object> result = bulletImproverService.improveBullet(bullet.trim(), targetRole, context);
        return ResponseEntity.ok(result);
    }

    /**
     * Batch improve multiple bullet points
     */
    @PostMapping("/bullet/batch")
    public ResponseEntity<Map<String, Object>> batchImproveBullets(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> bullets = (List<String>) request.get("bullets");
        String targetRole = (String) request.get("targetRole");
        String context = (String) request.get("context");

        if (bullets == null || bullets.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "At least one bullet is required"));
        }

        List<Map<String, Object>> results = bulletImproverService.improveBullets(bullets, targetRole, context);
        return ResponseEntity.ok(Map.of("improvements", results, "count", results.size()));
    }

    /**
     * Get real-time writing suggestions
     */
    @PostMapping("/bullet/suggest")
    public ResponseEntity<Map<String, Object>> getSuggestions(@RequestBody Map<String, String> request) {
        String partialBullet = request.get("text");
        String targetRole = request.get("targetRole");

        if (partialBullet == null || partialBullet.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        Map<String, Object> suggestions = bulletImproverService.getSuggestions(partialBullet, targetRole);
        return ResponseEntity.ok(suggestions);
    }

    // ==================== Job Matching Endpoints ====================

    /**
     * Analyze resume vs job description match
     */
    @PostMapping("/job/match")
    public ResponseEntity<Map<String, Object>> analyzeJobMatch(@RequestBody Map<String, String> request) {
        String resumeContent = request.get("resumeContent");
        String jobDescription = request.get("jobDescription");

        if (resumeContent == null || jobDescription == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Both resumeContent and jobDescription are required"));
        }

        Map<String, Object> analysis = jobMatcherService.analyzeMatch(resumeContent, jobDescription);
        return ResponseEntity.ok(analysis);
    }

    /**
     * Get keyword gap analysis
     */
    @PostMapping("/job/keywords")
    public ResponseEntity<Map<String, Object>> getKeywordGaps(@RequestBody Map<String, String> request) {
        String resumeContent = request.get("resumeContent");
        String jobDescription = request.get("jobDescription");

        if (resumeContent == null || jobDescription == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Both resumeContent and jobDescription are required"));
        }

        Map<String, Object> gaps = jobMatcherService.getKeywordGaps(resumeContent, jobDescription);
        return ResponseEntity.ok(gaps);
    }

    /**
     * Generate tailored content for a specific job
     */
    @PostMapping("/job/tailor")
    public ResponseEntity<Map<String, Object>> tailorContent(@RequestBody Map<String, String> request) {
        String currentContent = request.get("currentContent");
        String jobDescription = request.get("jobDescription");
        String section = request.get("section");

        if (currentContent == null || jobDescription == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "currentContent and jobDescription are required"));
        }

        Map<String, Object> tailored = jobMatcherService.generateTailoredContent(currentContent, jobDescription,
                section);
        return ResponseEntity.ok(tailored);
    }

    // ==================== Content Generation Endpoints ====================

    /**
     * Generate a professional summary
     */
    @PostMapping("/content/summary")
    public ResponseEntity<Map<String, Object>> generateSummary(@RequestBody Map<String, Object> request) {
        String jobTitle = (String) request.getOrDefault("jobTitle", "Software Engineer");
        int yearsExp = request.containsKey("yearsExperience") ? ((Number) request.get("yearsExperience")).intValue()
                : 3;
        String targetRole = (String) request.get("targetRole");
        String keySkills = (String) request.get("keySkills");

        Map<String, Object> summary = contentGeneratorService.generateSummary(jobTitle, yearsExp, targetRole,
                keySkills);
        return ResponseEntity.ok(summary);
    }

    /**
     * Generate experience bullet points
     */
    @PostMapping("/content/experience")
    public ResponseEntity<Map<String, Object>> generateExperience(@RequestBody Map<String, String> request) {
        String jobTitle = request.getOrDefault("jobTitle", "Software Engineer");
        String company = request.getOrDefault("company", "Company");
        String description = request.get("description");
        String targetRole = request.get("targetRole");

        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Description of responsibilities is required"));
        }

        Map<String, Object> bullets = contentGeneratorService.generateExperienceBullets(
                jobTitle, company, description, targetRole);
        return ResponseEntity.ok(bullets);
    }

    /**
     * Generate a project description
     */
    @PostMapping("/content/project")
    public ResponseEntity<Map<String, Object>> generateProject(@RequestBody Map<String, String> request) {
        String projectName = request.getOrDefault("projectName", "Project");
        String techStack = request.get("techStack");
        String outline = request.get("outline");
        String targetRole = request.get("targetRole");

        if (outline == null || outline.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Project outline is required"));
        }

        Map<String, Object> project = contentGeneratorService.generateProjectDescription(
                projectName, techStack, outline, targetRole);
        return ResponseEntity.ok(project);
    }

    /**
     * Generate a skills section
     */
    @PostMapping("/content/skills")
    public ResponseEntity<Map<String, Object>> generateSkills(@RequestBody Map<String, Object> request) {
        String targetRole = (String) request.getOrDefault("targetRole", "Software Engineer");
        @SuppressWarnings("unchecked")
        List<String> currentSkills = (List<String>) request.get("currentSkills");
        String jobDescription = (String) request.get("jobDescription");

        Map<String, Object> skills = contentGeneratorService.generateSkillsSection(
                targetRole, currentSkills, jobDescription);
        return ResponseEntity.ok(skills);
    }

    // ==================== User Preferences ====================

    /**
     * Get user preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences(@RequestParam String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        UserPreference pref = userPreferenceService.getPreferences(userId);
        Map<String, Object> result = userPreferenceService.preferenceToMap(pref);
        result.put("userId", userId);
        result.put("hasStoredPreferences", pref.getId() != null);

        return ResponseEntity.ok(result);
    }

    /**
     * Update user preferences (partial update — only specified fields are changed)
     */
    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @RequestParam String userId,
            @RequestBody Map<String, Object> updates) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        UserPreference pref = userPreferenceService.savePreferences(userId, updates);
        Map<String, Object> result = userPreferenceService.preferenceToMap(pref);
        result.put("userId", userId);
        result.put("saved", true);

        return ResponseEntity.ok(result);
    }

    /**
     * Delete user preferences
     */
    @DeleteMapping("/preferences")
    public ResponseEntity<Map<String, String>> deletePreferences(@RequestParam String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }

        userPreferenceService.deletePreferences(userId);
        return ResponseEntity.ok(Map.of("status", "deleted", "userId", userId));
    }

    // ==================== Conversation Management ====================

    /**
     * Get all conversations for a user
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getUserConversations(@RequestParam String userId) {
        List<AgentConversation> conversations = agentChatService.getUserConversations(userId);

        List<Map<String, Object>> result = conversations.stream()
                .map(conv -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("sessionId", conv.getSessionId());
                    map.put("title", conv.getTitle());
                    map.put("agentType", conv.getAgentType());
                    map.put("active", conv.isActive());
                    map.put("createdAt", conv.getCreatedAt());
                    map.put("updatedAt", conv.getUpdatedAt());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    /**
     * Get messages for a specific conversation
     */
    @GetMapping("/conversation/{sessionId}")
    public ResponseEntity<Map<String, Object>> getConversation(@PathVariable String sessionId) {
        List<AgentMessage> messages = agentChatService.getSessionMessages(sessionId);

        List<Map<String, Object>> messageMaps = messages.stream()
                .map(msg -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("role", msg.getRole());
                    map.put("content", msg.getContent());
                    map.put("actionType", msg.getActionType());
                    map.put("createdAt", msg.getCreatedAt());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "messages", messageMaps,
                "count", messageMaps.size()));
    }

    /**
     * End a conversation
     */
    @DeleteMapping("/conversation/{sessionId}")
    public ResponseEntity<Map<String, String>> endConversation(@PathVariable String sessionId) {
        agentChatService.endConversation(sessionId);
        return ResponseEntity.ok(Map.of("status", "ended", "sessionId", sessionId));
    }
}
