package com.Backend.AI_Resume_Builder_Backend.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI Agent Service: Bullet Point Improver
 * 
 * Transforms weak resume bullet points into strong, quantified, 
 * action-verb-led STAR-method bullets using Gemini AI.
 * 
 * Features:
 * - Improves individual bullet points
 * - Batch improves all bullets in an experience section
 * - Generates multiple alternative versions
 * - Provides improvement explanations
 * - Results cached in Redis (24h TTL)
 */
@Service
public class BulletImproverService {

    private static final Logger log = LoggerFactory.getLogger(BulletImproverService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private RedisCacheService redisCacheService;

    /**
     * Improve a single bullet point
     * Cached by content hash + target role
     */
    @Cacheable(value = "bulletImprovement", key = "#originalBullet.hashCode() + '_' + (#targetRole != null ? #targetRole.hashCode() : 0)")
    public Map<String, Object> improveBullet(String originalBullet, String targetRole, String context) {
        log.info("Improving bullet point (cache miss): {}", originalBullet.substring(0, Math.min(50, originalBullet.length())));

        String prompt = buildImproveBulletPrompt(originalBullet, targetRole, context);

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                Map<String, Object> result = MAPPER.readValue(response.get(), new TypeReference<>() {});
                result.put("original", originalBullet);
                result.put("cached", false);
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to improve bullet point: {}", e.getMessage());
        }

        return Map.of(
            "original", originalBullet,
            "improved", originalBullet,
            "alternatives", List.of(),
            "explanation", "Unable to improve at this time. Please try again.",
            "error", true
        );
    }

    /**
     * Batch improve multiple bullet points
     */
    public List<Map<String, Object>> improveBullets(List<String> bullets, String targetRole, String context) {
        log.info("Batch improving {} bullet points for role: {}", bullets.size(), targetRole);

        String prompt = buildBatchImprovementPrompt(bullets, targetRole, context);

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                Map<String, Object> parsed = MAPPER.readValue(response.get(), new TypeReference<>() {});
                Object improvementsObj = parsed.get("improvements");
                if (improvementsObj instanceof List<?> improvements) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> result = (List<Map<String, Object>>) improvements;
                    return result;
                }
            }
        } catch (Exception e) {
            log.error("Failed batch bullet improvement: {}", e.getMessage());
        }

        // Fallback: return originals
        return bullets.stream()
            .map(b -> Map.<String, Object>of("original", b, "improved", b, "error", true))
            .toList();
    }

    /**
     * Get writing suggestions for a bullet in real-time
     */
    public Map<String, Object> getSuggestions(String partialBullet, String targetRole) {
        String prompt = String.format("""
            You are a resume writing assistant. The user is typing a bullet point for their resume.
            
            Partial bullet: "%s"
            Target role: %s
            
            Respond in JSON format:
            {
              "completions": ["<3 possible completions for this bullet>"],
              "tips": ["<2 quick writing tips relevant to this bullet>"],
              "actionVerbs": ["<3 strong action verbs that could start this bullet>"]
            }
            
            Focus on quantifiable achievements, impact metrics, and strong action verbs.
            """, partialBullet, targetRole != null ? targetRole : "general");

        try {
            Optional<String> response = geminiService.generateContent(prompt);
            if (response.isPresent()) {
                return MAPPER.readValue(response.get(), new TypeReference<>() {});
            }
        } catch (Exception e) {
            log.error("Failed to get suggestions: {}", e.getMessage());
        }

        return Map.of("completions", List.of(), "tips", List.of(), "actionVerbs", List.of());
    }

    private String buildImproveBulletPrompt(String bullet, String targetRole, String context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("""
            You are an expert resume writer and career coach. Improve the following resume bullet point
            using the STAR method (Situation, Task, Action, Result). Make it impactful with:
            - Strong action verb at the start
            - Quantified results (numbers, percentages, dollar amounts)
            - Clear demonstration of impact
            - Industry-relevant keywords
            
            """);

        if (targetRole != null && !targetRole.isEmpty()) {
            prompt.append("Target role: ").append(targetRole).append("\n");
        }
        if (context != null && !context.isEmpty()) {
            prompt.append("Additional context: ").append(context).append("\n");
        }

        prompt.append(String.format("""
            
            Original bullet point: "%s"
            
            Respond in JSON format:
            {
              "improved": "<best improved version>",
              "alternatives": ["<2 more alternative versions>"],
              "explanation": "<brief explanation of what was improved and why>",
              "score": {
                "before": <1-10 score of original>,
                "after": <1-10 score of improved>
              },
              "keywords": ["<relevant ATS keywords added>"]
            }
            """, bullet));

        return prompt.toString();
    }

    private String buildBatchImprovementPrompt(List<String> bullets, String targetRole, String context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("""
            You are an expert resume writer. Improve ALL of the following resume bullet points.
            Use strong action verbs, quantify results, and demonstrate impact.
            
            """);

        if (targetRole != null) {
            prompt.append("Target role: ").append(targetRole).append("\n");
        }
        if (context != null) {
            prompt.append("Context: ").append(context).append("\n");
        }

        prompt.append("\nBullet points to improve:\n");
        for (int i = 0; i < bullets.size(); i++) {
            prompt.append(String.format("%d. \"%s\"\n", i + 1, bullets.get(i)));
        }

        prompt.append("""
            
            Respond in JSON format:
            {
              "improvements": [
                {
                  "original": "<original bullet>",
                  "improved": "<improved version>",
                  "explanation": "<brief explanation>"
                }
              ]
            }
            """);

        return prompt.toString();
    }
}
