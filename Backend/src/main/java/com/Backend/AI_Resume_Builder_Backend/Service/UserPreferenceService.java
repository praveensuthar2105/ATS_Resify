package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.UserPreference;
import com.Backend.AI_Resume_Builder_Backend.Repository.UserPreferenceRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for managing user preferences.
 * 
 * Handles:
 * 1. CRUD operations for explicit preference settings
 * 2. Auto-extraction of preferences from chat messages using Gemini
 * 3. Redis caching for fast preference lookups during AI prompts
 * 4. Building prompt context strings for injection into Gemini calls
 */
@Service
public class UserPreferenceService {

    private static final Logger log = LoggerFactory.getLogger(UserPreferenceService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String PREF_CACHE_PREFIX = "pref:user:";
    private static final long PREF_CACHE_TTL_MINUTES = 60; // 1 hour

    @Autowired
    private UserPreferenceRepository preferenceRepository;

    @Autowired
    private RedisCacheService redisCacheService;

    @Autowired
    private GeminiService geminiService;

    // ==================== CRUD Operations ====================

    /**
     * Get preferences for a user (from Redis cache first, then MySQL)
     */
    public UserPreference getPreferences(String userId) {
        // Try Redis cache first
        try {
            Object cached = redisCacheService.getCachedAIResponse(PREF_CACHE_PREFIX + userId);
            if (cached instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) cached;
                return mapToPreference(map, userId);
            }
        } catch (Exception e) {
            log.debug("Cache miss for user preferences: {}", userId);
        }

        // Fall back to MySQL
        UserPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> new UserPreference(userId));

        // Cache for next time
        cachePreferences(pref);

        return pref;
    }

    /**
     * Save or update user preferences
     */
    @Transactional
    public UserPreference savePreferences(String userId, Map<String, Object> updates) {
        UserPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> new UserPreference(userId));

        // Apply updates
        applyUpdates(pref, updates);

        // Save to MySQL
        pref = preferenceRepository.save(pref);
        log.info("Saved preferences for user: {}", userId);

        // Update Redis cache
        cachePreferences(pref);

        return pref;
    }

    /**
     * Delete user preferences (privacy)
     */
    @Transactional
    public void deletePreferences(String userId) {
        preferenceRepository.deleteByUserId(userId);
        redisCacheService.cacheAIResponse(PREF_CACHE_PREFIX + userId, null, 1);
        log.info("Deleted preferences for user: {}", userId);
    }

    // ==================== Prompt Context ====================

    /**
     * Get the prompt context string for a user.
     * This is injected into every Gemini call so the AI respects user preferences.
     */
    public String getPromptContext(String userId) {
        if (userId == null || userId.isEmpty() || "anonymous".equals(userId)) {
            return "";
        }

        UserPreference pref = getPreferences(userId);
        // Only return context if user has actually set something meaningful
        if (pref.getId() == null && pref.getTargetRole() == null && pref.getCustomNotes() == null) {
            return ""; // Default new user — no specific preferences yet
        }
        return pref.toPromptContext();
    }

    // ==================== Auto-Extraction ====================

    /**
     * Analyze a user message for implicit preference signals.
     * Called after each chat message to detect phrases like:
     * - "I prefer formal tone"
     * - "I'm targeting Google"
     * - "I'm a senior engineer"
     * - "Keep it concise"
     * 
     * Uses lightweight regex for common patterns, and Gemini for complex ones.
     */
    @Transactional
    public void extractPreferencesFromMessage(String userId, String message) {
        if (userId == null || "anonymous".equals(userId) || message == null) return;

        Map<String, Object> extracted = new HashMap<>();

        // Fast regex extraction for common patterns
        extractWithRegex(message, extracted);

        // If regex found something, save immediately (no AI call needed)
        if (!extracted.isEmpty()) {
            log.info("Auto-extracted {} preference(s) from message for user: {}", extracted.size(), userId);
            savePreferences(userId, extracted);
            return;
        }

        // For more nuanced signals, use Gemini (async, fire-and-forget)
        extractWithAI(userId, message);
    }

    /**
     * Fast regex-based preference extraction for common patterns
     */
    private void extractWithRegex(String message, Map<String, Object> extracted) {
        String lower = message.toLowerCase().trim();

        // Tone preferences
        if (matchesAny(lower, "prefer.*formal", "formal tone", "keep it formal", "more formal")) {
            extracted.put("tone", "formal");
        } else if (matchesAny(lower, "prefer.*casual", "casual tone", "keep it casual", "more casual", "relaxed tone")) {
            extracted.put("tone", "casual");
        } else if (matchesAny(lower, "prefer.*creative", "creative tone", "creative writing")) {
            extracted.put("tone", "creative");
        } else if (matchesAny(lower, "prefer.*technical", "technical tone", "more technical")) {
            extracted.put("tone", "technical");
        } else if (matchesAny(lower, "prefer.*professional", "professional tone")) {
            extracted.put("tone", "professional");
        }

        // Verbosity
        if (matchesAny(lower, "keep it concise", "be concise", "shorter", "more concise", "brief")) {
            extracted.put("verbosity", "concise");
        } else if (matchesAny(lower, "more detail", "be detailed", "elaborate", "more verbose")) {
            extracted.put("verbosity", "detailed");
        }

        // Target role
        Pattern rolePattern = Pattern.compile(
            "(?:targeting|target role|applying for|want to be|aiming for|looking for)\\s*(?:a\\s+)?(?:role\\s+(?:as|in)\\s+)?[\"']?([^\"',.]{3,50})[\"']?",
            Pattern.CASE_INSENSITIVE
        );
        Matcher roleMatcher = rolePattern.matcher(message);
        if (roleMatcher.find()) {
            extracted.put("targetRole", roleMatcher.group(1).trim());
        }

        // Target company
        Pattern companyPattern = Pattern.compile(
            "(?:targeting|applying (?:to|at)|want to (?:join|work at)|aiming for)\\s+(?:companies like\\s+)?([A-Z][\\w\\s,]+?)(?:\\.|$|,\\s*(?:and|or))",
            Pattern.CASE_INSENSITIVE
        );
        Matcher companyMatcher = companyPattern.matcher(message);
        if (companyMatcher.find()) {
            extracted.put("targetCompanies", companyMatcher.group(1).trim());
        }

        // Experience level
        if (matchesAny(lower, "i'm a senior", "senior level", "senior engineer", "senior developer", "i am senior")) {
            extracted.put("experienceLevel", "senior");
        } else if (matchesAny(lower, "entry level", "i'm a junior", "fresh graduate", "new grad", "fresher", "i am a junior")) {
            extracted.put("experienceLevel", "entry");
        } else if (matchesAny(lower, "mid level", "mid-level", "i have \\d+ years")) {
            extracted.put("experienceLevel", "mid");
        } else if (matchesAny(lower, "executive", "director", "vp level", "c-level")) {
            extracted.put("experienceLevel", "executive");
        }

        // Industry
        Pattern industryPattern = Pattern.compile(
            "(?:in the|targeting|in)\\s+(tech|finance|healthcare|fintech|edtech|e-?commerce|consulting|banking|biotech|automotive|gaming)\\s+(?:industry|sector|field|space)",
            Pattern.CASE_INSENSITIVE
        );
        Matcher industryMatcher = industryPattern.matcher(message);
        if (industryMatcher.find()) {
            extracted.put("targetIndustry", industryMatcher.group(1).trim());
        }

        // ATS preference
        if (matchesAny(lower, "ats friendly", "ats compatible", "ats optimized", "optimize for ats", "ats ready")) {
            extracted.put("atsOptimized", true);
        }

        // Page count
        if (matchesAny(lower, "one page", "1 page", "single page")) {
            extracted.put("maxPages", 1);
        } else if (matchesAny(lower, "two page", "2 page", "two-page")) {
            extracted.put("maxPages", 2);
        }
    }

    /**
     * Use Gemini AI to extract nuanced preferences from a message.
     * Only called when regex doesn't find anything — avoids unnecessary API calls.
     */
    private void extractWithAI(String userId, String message) {
        // Only attempt AI extraction for messages that look like they contain preferences
        String lower = message.toLowerCase();
        boolean looksLikePreference = lower.contains("prefer") || lower.contains("i want") ||
                lower.contains("i like") || lower.contains("always") || lower.contains("my style") ||
                lower.contains("i'm a") || lower.contains("i am a") || lower.contains("targeting") ||
                lower.contains("career") || lower.contains("switch") || lower.contains("industry");

        if (!looksLikePreference) return;

        String prompt = String.format("""
            Analyze this message from a resume builder user and extract any implicit preferences about how they want their resume written.
            
            Message: "%s"
            
            Extract ONLY if clearly stated or strongly implied. Return a JSON object with ONLY the fields that apply:
            {
              "tone": "professional|casual|formal|creative|technical",
              "verbosity": "concise|moderate|detailed",
              "targetRole": "<job title they're targeting>",
              "targetIndustry": "<industry>",
              "experienceLevel": "entry|mid|senior|executive",
              "targetCompanies": "<comma-separated company names>",
              "customNotes": "<any other relevant career context, e.g. 'career switching from finance to tech'>"
            }
            
            If NO preferences are detected, return: {}
            Return ONLY valid JSON, no explanation.
            """, message);

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                String json = response.get().trim();
                Map<String, Object> extracted = MAPPER.readValue(json, new TypeReference<>() {});
                if (!extracted.isEmpty()) {
                    log.info("AI extracted {} preference(s) for user: {}", extracted.size(), userId);
                    savePreferences(userId, extracted);
                }
            }
        } catch (Exception e) {
            log.debug("AI preference extraction skipped: {}", e.getMessage());
        }
    }

    // ==================== Helper Methods ====================

    private boolean matchesAny(String text, String... patterns) {
        for (String pattern : patterns) {
            if (Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(text).find()) {
                return true;
            }
        }
        return false;
    }

    private void applyUpdates(UserPreference pref, Map<String, Object> updates) {
        updates.forEach((key, value) -> {
            if (value == null) return;
            switch (key) {
                case "tone" -> pref.setTone(value.toString());
                case "verbosity" -> pref.setVerbosity(value.toString());
                case "preferActionVerbs" -> pref.setPreferActionVerbs(Boolean.parseBoolean(value.toString()));
                case "preferMetrics" -> pref.setPreferMetrics(Boolean.parseBoolean(value.toString()));
                case "targetRole" -> pref.setTargetRole(value.toString());
                case "targetIndustry" -> pref.setTargetIndustry(value.toString());
                case "experienceLevel" -> pref.setExperienceLevel(value.toString());
                case "targetCompanies" -> pref.setTargetCompanies(value.toString());
                case "preferredTemplate" -> pref.setPreferredTemplate(value.toString());
                case "maxPages" -> pref.setMaxPages(Integer.parseInt(value.toString()));
                case "atsOptimized" -> pref.setAtsOptimized(Boolean.parseBoolean(value.toString()));
                case "customNotes" -> pref.setCustomNotes(value.toString());
                default -> log.debug("Unknown preference key: {}", key);
            }
        });
    }

    private void cachePreferences(UserPreference pref) {
        try {
            Map<String, Object> cacheData = preferenceToMap(pref);
            redisCacheService.cacheAIResponse(PREF_CACHE_PREFIX + pref.getUserId(), cacheData, PREF_CACHE_TTL_MINUTES);
        } catch (Exception e) {
            log.debug("Failed to cache preferences: {}", e.getMessage());
        }
    }

    /**
     * Convert entity to map for caching and API responses
     */
    public Map<String, Object> preferenceToMap(UserPreference pref) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("tone", pref.getTone());
        map.put("verbosity", pref.getVerbosity());
        map.put("preferActionVerbs", pref.isPreferActionVerbs());
        map.put("preferMetrics", pref.isPreferMetrics());
        map.put("targetRole", pref.getTargetRole());
        map.put("targetIndustry", pref.getTargetIndustry());
        map.put("experienceLevel", pref.getExperienceLevel());
        map.put("targetCompanies", pref.getTargetCompanies());
        map.put("preferredTemplate", pref.getPreferredTemplate());
        map.put("maxPages", pref.getMaxPages());
        map.put("atsOptimized", pref.isAtsOptimized());
        map.put("customNotes", pref.getCustomNotes());
        return map;
    }

    private UserPreference mapToPreference(Map<String, Object> map, String userId) {
        UserPreference pref = new UserPreference(userId);
        if (map.get("tone") != null) pref.setTone(map.get("tone").toString());
        if (map.get("verbosity") != null) pref.setVerbosity(map.get("verbosity").toString());
        if (map.get("preferActionVerbs") != null) pref.setPreferActionVerbs(Boolean.parseBoolean(map.get("preferActionVerbs").toString()));
        if (map.get("preferMetrics") != null) pref.setPreferMetrics(Boolean.parseBoolean(map.get("preferMetrics").toString()));
        if (map.get("targetRole") != null) pref.setTargetRole(map.get("targetRole").toString());
        if (map.get("targetIndustry") != null) pref.setTargetIndustry(map.get("targetIndustry").toString());
        if (map.get("experienceLevel") != null) pref.setExperienceLevel(map.get("experienceLevel").toString());
        if (map.get("targetCompanies") != null) pref.setTargetCompanies(map.get("targetCompanies").toString());
        if (map.get("preferredTemplate") != null) pref.setPreferredTemplate(map.get("preferredTemplate").toString());
        if (map.get("maxPages") != null) pref.setMaxPages(Integer.parseInt(map.get("maxPages").toString()));
        if (map.get("atsOptimized") != null) pref.setAtsOptimized(Boolean.parseBoolean(map.get("atsOptimized").toString()));
        if (map.get("customNotes") != null) pref.setCustomNotes(map.get("customNotes").toString());
        return pref;
    }
}
