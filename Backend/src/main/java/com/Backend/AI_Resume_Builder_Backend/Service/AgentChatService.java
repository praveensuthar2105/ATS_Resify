package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.AgentConversation;
import com.Backend.AI_Resume_Builder_Backend.Entity.AgentMessage;
import com.Backend.AI_Resume_Builder_Backend.Repository.AgentConversationRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.AgentMessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Agent Chat Service (Orchestrator)
 * 
 * Central service that:
 * 1. Manages conversation sessions (create, retrieve, persist)
 * 2. Routes user messages to the appropriate agent service
 * 3. Builds context-aware prompts with conversation history
 * 4. Handles the general chat fallback
 * 5. Coordinates between Redis cache and MySQL persistence
 */
@Service
public class AgentChatService {

    private static final Logger log = LoggerFactory.getLogger(AgentChatService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final int MAX_CONTEXT_MESSAGES = 10;

    @Autowired
    private BulletImproverService bulletImproverService;

    @Autowired
    private JobMatcherService jobMatcherService;

    @Autowired
    private ContentGeneratorService contentGeneratorService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private RedisCacheService redisCacheService;

    @Autowired
    private AgentConversationRepository conversationRepository;

    @Autowired
    private AgentMessageRepository messageRepository;

    @Autowired
    private UserPreferenceService userPreferenceService;

    /**
     * Process an incoming chat message
     * Main entry point for the AI Agent
     */
    @Transactional
    public AgentChatResponse processMessage(AgentChatRequest request) {
        log.info("Processing agent message - type: {}, session: {}", request.getAgentType(), request.getSessionId());

        // 1. Get or create conversation session
        AgentConversation conversation = getOrCreateConversation(request);

        // 2. Save user message
        AgentMessage userMessage = new AgentMessage("USER", request.getMessage(), request.getAgentType());
        conversation.addMessage(userMessage);

        // 2.5. Auto-extract preferences from the user's message (async-like, non-blocking)
        try {
            userPreferenceService.extractPreferencesFromMessage(request.getUserId(), request.getMessage());
        } catch (Exception e) {
            log.debug("Preference extraction skipped: {}", e.getMessage());
        }

        // 2.6. Enrich request with stored preferences (fill in missing targetRole, etc.)
        enrichRequestWithPreferences(request);

        // 3. Route to appropriate agent based on type
        Map<String, Object> agentResult;
        String agentType = request.getAgentType() != null ? request.getAgentType().toUpperCase() : "GENERAL";

        try {
            agentResult = switch (agentType) {
                case "BULLET_IMPROVER" -> handleBulletImprover(request, conversation);
                case "JOB_MATCHER" -> handleJobMatcher(request, conversation);
                case "CONTENT_GENERATOR" -> handleContentGenerator(request, conversation);
                default -> handleGeneralChat(request, conversation);
            };
        } catch (Exception e) {
            log.error("Agent processing error: {}", e.getMessage(), e);
            agentResult = Map.of(
                "message", "I apologize, but I encountered an error processing your request. Please try again.",
                "error", true
            );
        }

        // 4. Build response
        String responseMessage = extractMessage(agentResult);
        List<String> suggestions = extractSuggestions(agentResult);

        // 5. Save assistant message
        AgentMessage assistantMessage = new AgentMessage("ASSISTANT", responseMessage, agentType);
        try {
            assistantMessage.setMetadata(MAPPER.writeValueAsString(agentResult));
        } catch (Exception e) {
            log.warn("Failed to serialize agent result metadata: {}", e.getMessage());
        }
        conversation.addMessage(assistantMessage);

        // 6. Persist conversation
        conversationRepository.save(conversation);

        // 7. Cache session context in Redis
        cacheSessionContext(conversation);

        // 8. Build and return response
        AgentChatResponse response = AgentChatResponse.of(conversation.getSessionId(), responseMessage)
                .withAgentType(agentType)
                .withSuggestions(suggestions)
                .withData(agentResult);

        Boolean isCached = (Boolean) agentResult.get("cached");
        if (Boolean.TRUE.equals(isCached)) {
            response.fromCache();
        }

        return response;
    }

    /**
     * Handle bullet point improvement requests
     */
    private Map<String, Object> handleBulletImprover(AgentChatRequest request, AgentConversation conversation) {
        String message = request.getMessage().trim();

        // Check if message contains multiple bullets (newline-separated)
        String[] lines = message.split("\n");
        List<String> bullets = Arrays.stream(lines)
                .map(l -> l.replaceAll("^[•\\-\\*\\d+\\.\\s]+", "").trim())
                .filter(l -> !l.isEmpty())
                .toList();

        if (bullets.size() > 1) {
            // Batch improvement
            List<Map<String, Object>> results = bulletImproverService.improveBullets(
                    bullets, request.getTargetRole(), request.getContext());

            String formattedResponse = formatBatchBulletResponse(results);

            Map<String, Object> result = new HashMap<>();
            result.put("message", formattedResponse);
            result.put("improvements", results);
            result.put("suggestions", List.of(
                    "Would you like me to adjust the tone?",
                    "Want me to add more quantified metrics?",
                    "Should I tailor these for a specific job posting?"
            ));
            return result;
        } else {
            // Single bullet improvement
            Map<String, Object> result = bulletImproverService.improveBullet(
                    message, request.getTargetRole(), request.getContext());

            String improved = (String) result.getOrDefault("improved", message);
            String explanation = (String) result.getOrDefault("explanation", "");

            Map<String, Object> response = new HashMap<>(result);
            response.put("message", String.format("**Improved:**\n%s\n\n**Why:** %s", improved, explanation));
            response.put("suggestions", List.of(
                    "Show me alternative versions",
                    "Make it more concise",
                    "Add more technical keywords"
            ));
            return response;
        }
    }

    /**
     * Handle job matching requests
     */
    private Map<String, Object> handleJobMatcher(AgentChatRequest request, AgentConversation conversation) {
        String resumeContent = request.getContext();
        String jobDescription = request.getJobDescription();

        if (jobDescription == null || jobDescription.isEmpty()) {
            // User might be pasting the JD as the message
            jobDescription = request.getMessage();
        }

        if (resumeContent == null || resumeContent.isEmpty()) {
            return Map.of(
                "message", "I need your resume content to analyze the match. Please provide your resume text or ensure you have a resume loaded in the editor.",
                "suggestions", List.of(
                    "Load my current resume",
                    "I'll paste my resume content"
                )
            );
        }

        // Detect intent from message
        String msg = request.getMessage().toLowerCase();

        if (msg.contains("keyword") || msg.contains("gap") || msg.contains("missing")) {
            Map<String, Object> gaps = jobMatcherService.getKeywordGaps(resumeContent, jobDescription);
            gaps.put("message", formatKeywordGapResponse(gaps));
            return gaps;
        } else if (msg.contains("tailor") || msg.contains("rewrite") || msg.contains("adapt")) {
            Map<String, Object> tailored = jobMatcherService.generateTailoredContent(
                    resumeContent, jobDescription, request.getTargetRole());
            tailored.put("message", formatTailoredResponse(tailored));
            return tailored;
        } else {
            // Full match analysis
            Map<String, Object> analysis = jobMatcherService.analyzeMatch(resumeContent, jobDescription);
            analysis.put("message", formatMatchAnalysis(analysis));
            analysis.put("suggestions", List.of(
                "Show me missing keywords",
                "Tailor my resume for this job",
                "Which sections need the most work?"
            ));
            return analysis;
        }
    }

    /**
     * Handle content generation requests
     */
    private Map<String, Object> handleContentGenerator(AgentChatRequest request, AgentConversation conversation) {
        String msg = request.getMessage().toLowerCase();

        if (msg.contains("summary") || msg.contains("objective") || msg.contains("about me")) {
            return handleSummaryGeneration(request);
        } else if (msg.contains("experience") || msg.contains("bullet") || msg.contains("work history")) {
            return handleExperienceGeneration(request);
        } else if (msg.contains("project")) {
            return handleProjectGeneration(request);
        } else if (msg.contains("skill")) {
            return handleSkillsGeneration(request);
        } else {
            // General content generation
            Map<String, Object> result = contentGeneratorService.generateContent(
                    request.getMessage(), request.getContext());
            result = new HashMap<>(result);
            result.put("suggestions", List.of(
                "Generate a professional summary",
                "Create experience bullet points",
                "Build a skills section"
            ));
            return result;
        }
    }

    /**
     * Handle general chat - acts as a resume advisor
     */
    private Map<String, Object> handleGeneralChat(AgentChatRequest request, AgentConversation conversation) {
        // Build context from conversation history
        String conversationContext = buildConversationContext(conversation);

        // Load user preferences for personalized responses
        String preferencesContext = userPreferenceService.getPromptContext(request.getUserId());

        String prompt = String.format("""
            You are an expert AI resume writing assistant. You help users create, improve, and optimize 
            their resumes. You are knowledgeable about ATS systems, industry trends, and best practices.
            
            %s
            
            %s
            
            %s
            
            User message: %s
            
            Respond in JSON format:
            {
              "message": "<your helpful response>",
              "suggestions": ["<2-3 follow-up actions the user might want>"],
              "detectedIntent": "<what the user seems to want: IMPROVE_BULLET|MATCH_JOB|GENERATE_CONTENT|ADVICE|OTHER>"
            }
            
            Be conversational, helpful, and proactive. If you detect the user wants something specific
            (like improving a bullet point), suggest switching to that specialized mode.
            """,
                preferencesContext,
                conversationContext.isEmpty() ? "" : "Previous conversation:\n" + conversationContext,
                request.getContext() != null ? "Current resume context:\n" + request.getContext() : "",
                request.getMessage());

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                Map<String, Object> result = MAPPER.readValue(response.get(), new TypeReference<>() {});
                return result;
            }
        } catch (Exception e) {
            log.error("General chat failed: {}", e.getMessage());
        }

        return Map.of(
            "message", "I'm your AI resume assistant! I can help you:\n\n" +
                       "• **Improve bullet points** - Make your experience shine\n" +
                       "• **Match job descriptions** - Tailor your resume for specific jobs\n" +
                       "• **Generate content** - Create summaries, bullets, and more\n\n" +
                       "What would you like help with?",
            "suggestions", List.of("Improve my bullet points", "Analyze a job description", "Generate a professional summary")
        );
    }

    // ==================== Helper Methods ====================

    /**
     * Enrich the incoming request with stored user preferences.
     * If the user hasn't specified targetRole in this request but has one saved, use the saved one.
     */
    private void enrichRequestWithPreferences(AgentChatRequest request) {
        try {
            if (request.getUserId() == null || "anonymous".equals(request.getUserId())) return;

            com.Backend.AI_Resume_Builder_Backend.Entity.UserPreference pref =
                    userPreferenceService.getPreferences(request.getUserId());

            if (pref.getId() == null) return; // No stored preferences

            // Fill in targetRole if not provided in this request
            if ((request.getTargetRole() == null || request.getTargetRole().isEmpty())
                    && pref.getTargetRole() != null && !pref.getTargetRole().isEmpty()) {
                request.setTargetRole(pref.getTargetRole());
                log.debug("Enriched request with stored targetRole: {}", pref.getTargetRole());
            }
        } catch (Exception e) {
            log.debug("Failed to enrich request with preferences: {}", e.getMessage());
        }
    }

    private AgentConversation getOrCreateConversation(AgentChatRequest request) {
        if (request.getSessionId() != null && !request.getSessionId().isEmpty()) {
            Optional<AgentConversation> existing = conversationRepository.findBySessionId(request.getSessionId());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        // Create new conversation
        String sessionId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String agentType = request.getAgentType() != null ? request.getAgentType() : "GENERAL";
        AgentConversation conversation = new AgentConversation(sessionId, request.getUserId(), agentType);
        return conversationRepository.save(conversation);
    }

    private String buildConversationContext(AgentConversation conversation) {
        if (conversation.getId() == null) return "";

        List<AgentMessage> recentMessages = messageRepository.findRecentMessages(
                conversation.getId(), PageRequest.of(0, MAX_CONTEXT_MESSAGES));

        if (recentMessages.isEmpty()) return "";

        // Reverse to chronological order
        Collections.reverse(recentMessages);

        return recentMessages.stream()
                .map(m -> m.getRole() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));
    }

    private void cacheSessionContext(AgentConversation conversation) {
        try {
            Map<String, Object> sessionData = Map.of(
                "sessionId", conversation.getSessionId(),
                "userId", conversation.getUserId(),
                "agentType", conversation.getAgentType(),
                "messageCount", conversation.getMessages().size()
            );
            redisCacheService.storeSessionContext(conversation.getSessionId(), sessionData, 30);
        } catch (Exception e) {
            log.warn("Failed to cache session context: {}", e.getMessage());
        }
    }

    private String extractMessage(Map<String, Object> result) {
        Object msg = result.get("message");
        if (msg != null) return msg.toString();

        Object content = result.get("content");
        if (content != null) return content.toString();

        return "I've processed your request. Check the data for details.";
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSuggestions(Map<String, Object> result) {
        Object suggestions = result.get("suggestions");
        if (suggestions instanceof List<?>) {
            return ((List<?>) suggestions).stream()
                    .map(Object::toString)
                    .toList();
        }
        return List.of();
    }

    // ==================== Response Formatters ====================

    private String formatBatchBulletResponse(List<Map<String, Object>> results) {
        StringBuilder sb = new StringBuilder("Here are your improved bullet points:\n\n");
        for (int i = 0; i < results.size(); i++) {
            Map<String, Object> r = results.get(i);
            sb.append(String.format("**%d. Original:** %s\n", i + 1, r.get("original")));
            sb.append(String.format("   **Improved:** %s\n\n", r.get("improved")));
        }
        return sb.toString();
    }

    private String formatKeywordGapResponse(Map<String, Object> gaps) {
        StringBuilder sb = new StringBuilder("**Keyword Gap Analysis:**\n\n");
        Object score = gaps.get("keywordScore");
        if (score != null) {
            sb.append(String.format("**Match Score:** %s%%\n\n", score));
        }

        appendList(sb, "✅ Matched Keywords", gaps.get("matchedKeywords"));
        appendList(sb, "❌ Missing Keywords", gaps.get("missingKeywords"));

        return sb.toString();
    }

    private String formatTailoredResponse(Map<String, Object> tailored) {
        String content = (String) tailored.getOrDefault("tailoredContent", "");
        return "**Tailored Content:**\n\n" + content;
    }

    private String formatMatchAnalysis(Map<String, Object> analysis) {
        StringBuilder sb = new StringBuilder();

        Object score = analysis.get("overallScore");
        if (score != null) {
            sb.append(String.format("## Match Score: %s/100\n\n", score));
        }

        Object verdict = analysis.get("summaryVerdict");
        if (verdict != null) {
            sb.append(verdict).append("\n\n");
        }

        appendList(sb, "💪 Strengths", analysis.get("strengths"));
        appendList(sb, "📝 Gaps to Address", analysis.get("gaps"));

        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private void appendList(StringBuilder sb, String title, Object listObj) {
        if (listObj instanceof List<?> list && !list.isEmpty()) {
            sb.append("**").append(title).append(":**\n");
            for (Object item : list) {
                sb.append("• ").append(item).append("\n");
            }
            sb.append("\n");
        }
    }

    // ==================== Specialized Generation Handlers ====================

    private Map<String, Object> handleSummaryGeneration(AgentChatRequest request) {
        // Parse job title, years from message or use defaults
        String msg = request.getMessage();
        Map<String, Object> result = contentGeneratorService.generateSummary(
                request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer",
                5, request.getTargetRole(), msg);

        result = new HashMap<>(result);
        String summary = (String) result.getOrDefault("summary", "");
        result.put("message", "**Generated Summary:**\n\n" + summary);
        result.put("suggestions", List.of(
            "Make it more concise",
            "Add leadership focus",
            "Tailor for a specific company"
        ));
        return result;
    }

    private Map<String, Object> handleExperienceGeneration(AgentChatRequest request) {
        Map<String, Object> result = contentGeneratorService.generateExperienceBullets(
                request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer",
                "Company", request.getMessage(), request.getTargetRole());

        result = new HashMap<>(result);
        @SuppressWarnings("unchecked")
        List<String> bullets = (List<String>) result.getOrDefault("bullets", List.of());
        StringBuilder sb = new StringBuilder("**Generated Experience Bullets:**\n\n");
        for (String bullet : bullets) {
            sb.append("• ").append(bullet).append("\n");
        }
        result.put("message", sb.toString());
        return result;
    }

    private Map<String, Object> handleProjectGeneration(AgentChatRequest request) {
        Map<String, Object> result = contentGeneratorService.generateProjectDescription(
                "Project", null, request.getMessage(), request.getTargetRole());
        result = new HashMap<>(result);
        String desc = (String) result.getOrDefault("description", "");
        result.put("message", "**Generated Project Description:**\n\n" + desc);
        return result;
    }

    private Map<String, Object> handleSkillsGeneration(AgentChatRequest request) {
        Map<String, Object> result = contentGeneratorService.generateSkillsSection(
                request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer",
                null, request.getJobDescription());
        result = new HashMap<>(result);
        result.put("message", "**Generated Skills Section:**\n\nSee the categorized skills in the data below.");
        return result;
    }

    // ==================== Conversation Management ====================

    /**
     * Get conversation history for a user
     */
    public List<AgentConversation> getUserConversations(String userId) {
        return conversationRepository.findByUserIdAndActiveTrueOrderByUpdatedAtDesc(userId);
    }

    /**
     * Get messages for a specific session
     */
    public List<AgentMessage> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionId(sessionId);
    }

    /**
     * End a conversation session
     */
    @Transactional
    public void endConversation(String sessionId) {
        conversationRepository.findBySessionId(sessionId).ifPresent(conv -> {
            conv.setActive(false);
            conversationRepository.save(conv);
            redisCacheService.clearSession(sessionId);
        });
    }
}
