package com.Backend.AI_Resume_Builder_Backend.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis Cache Service for AI Agent
 * 
 * Provides utility methods for cache operations including:
 * - Manual cache management
 * - Cache key generation for AI responses
 * - Cache health checks
 * - Cache statistics
 */
@Service
public class RedisCacheService {

    private static final Logger logger = LoggerFactory.getLogger(RedisCacheService.class);
    
    private static final String AI_CACHE_PREFIX = "ai:agent:";
    private static final String SESSION_PREFIX = "session:";
    private static final String USER_CONTEXT_PREFIX = "context:user:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * Check if Redis is available and responding
     */
    public boolean isRedisAvailable() {
        try {
            String pingResult = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();
            return "PONG".equals(pingResult);
        } catch (Exception e) {
            logger.warn("Redis health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Store AI response in cache with custom TTL
     */
    public void cacheAIResponse(String key, Object response, long ttlMinutes) {
        try {
            String cacheKey = AI_CACHE_PREFIX + key;
            redisTemplate.opsForValue().set(cacheKey, response, Duration.ofMinutes(ttlMinutes));
            logger.debug("Cached AI response: {}", cacheKey);
        } catch (Exception e) {
            logger.error("Failed to cache AI response: {}", e.getMessage());
        }
    }

    /**
     * Retrieve cached AI response
     */
    public Object getCachedAIResponse(String key) {
        try {
            String cacheKey = AI_CACHE_PREFIX + key;
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                logger.debug("Cache hit: {}", cacheKey);
            }
            return cached;
        } catch (Exception e) {
            logger.error("Failed to retrieve cached AI response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Store user session context for AI agent
     */
    public void storeSessionContext(String sessionId, Object context, long ttlMinutes) {
        try {
            String key = SESSION_PREFIX + sessionId;
            redisTemplate.opsForValue().set(key, context, Duration.ofMinutes(ttlMinutes));
            logger.debug("Stored session context: {}", sessionId);
        } catch (Exception e) {
            logger.error("Failed to store session context: {}", e.getMessage());
        }
    }

    /**
     * Retrieve user session context
     */
    public Object getSessionContext(String sessionId) {
        try {
            String key = SESSION_PREFIX + sessionId;
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            logger.error("Failed to retrieve session context: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extend session TTL (keep-alive)
     */
    public void extendSessionTTL(String sessionId, long ttlMinutes) {
        try {
            String key = SESSION_PREFIX + sessionId;
            redisTemplate.expire(key, ttlMinutes, TimeUnit.MINUTES);
        } catch (Exception e) {
            logger.error("Failed to extend session TTL: {}", e.getMessage());
        }
    }

    /**
     * Store user-specific context (preferences, history summary)
     */
    public void storeUserContext(String userId, String contextType, Object context) {
        try {
            String key = USER_CONTEXT_PREFIX + userId + ":" + contextType;
            redisTemplate.opsForValue().set(key, context, Duration.ofHours(24));
            logger.debug("Stored user context: {}", key);
        } catch (Exception e) {
            logger.error("Failed to store user context: {}", e.getMessage());
        }
    }

    /**
     * Retrieve user-specific context
     */
    public Object getUserContext(String userId, String contextType) {
        try {
            String key = USER_CONTEXT_PREFIX + userId + ":" + contextType;
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            logger.error("Failed to retrieve user context: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Generate cache key for bullet improvement
     * Uses hash of original bullet + job role for uniqueness
     */
    public String generateBulletCacheKey(String originalBullet, String targetRole) {
        String combined = originalBullet.toLowerCase().trim() + "|" + 
                         (targetRole != null ? targetRole.toLowerCase().trim() : "generic");
        return "bullet:" + Math.abs(combined.hashCode());
    }

    /**
     * Generate cache key for job matching
     */
    public String generateJobMatchCacheKey(String resumeHash, String jobDescriptionHash) {
        return "jobmatch:" + resumeHash + ":" + jobDescriptionHash;
    }

    /**
     * Clear all caches for a specific user (for logout/privacy)
     */
    public void clearUserCaches(String userId) {
        try {
            Set<String> keys = redisTemplate.keys(USER_CONTEXT_PREFIX + userId + ":*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                logger.info("Cleared {} cache entries for user {}", keys.size(), userId);
            }
        } catch (Exception e) {
            logger.error("Failed to clear user caches: {}", e.getMessage());
        }
    }

    /**
     * Clear session cache
     */
    public void clearSession(String sessionId) {
        try {
            String key = SESSION_PREFIX + sessionId;
            redisTemplate.delete(key);
            logger.debug("Cleared session: {}", sessionId);
        } catch (Exception e) {
            logger.error("Failed to clear session: {}", e.getMessage());
        }
    }

    /**
     * Get cache statistics (for monitoring)
     */
    public CacheStats getCacheStats() {
        try {
            Long aiCacheCount = countKeys(AI_CACHE_PREFIX + "*");
            Long sessionCount = countKeys(SESSION_PREFIX + "*");
            Long userContextCount = countKeys(USER_CONTEXT_PREFIX + "*");
            
            return new CacheStats(aiCacheCount, sessionCount, userContextCount, isRedisAvailable());
        } catch (Exception e) {
            logger.error("Failed to get cache stats: {}", e.getMessage());
            return new CacheStats(0L, 0L, 0L, false);
        }
    }

    private Long countKeys(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? (long) keys.size() : 0L;
    }

    /**
     * Simple stats record for cache monitoring
     */
    public static class CacheStats {
        private final Long aiResponsesCached;
        private final Long activeSessions;
        private final Long userContextEntries;
        private final boolean redisAvailable;

        public CacheStats(Long aiResponsesCached, Long activeSessions, 
                         Long userContextEntries, boolean redisAvailable) {
            this.aiResponsesCached = aiResponsesCached;
            this.activeSessions = activeSessions;
            this.userContextEntries = userContextEntries;
            this.redisAvailable = redisAvailable;
        }

        public Long getAiResponsesCached() { return aiResponsesCached; }
        public Long getActiveSessions() { return activeSessions; }
        public Long getUserContextEntries() { return userContextEntries; }
        public boolean isRedisAvailable() { return redisAvailable; }
    }
}
