package com.Backend.AI_Resume_Builder_Backend.Security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.time.Duration;

/**
 * Redis-backed store for one-time authorization codes used in the OAuth2 login
 * flow.
 * Each code maps to token data and expires after 5 minutes.
 * Using Redis ensures that codes are shared across all backend instances.
 */
@Component
public class AuthorizationCodeStore {

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationCodeStore.class);
    private static final String REDIS_KEY_PREFIX = "auth_code:";
    private static final long TTL_MINUTES = 5;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public static class CodeEntry implements Serializable {
        private String jwt;
        private String email;
        private String name;

        // Default constructor for JSON deserialization
        public CodeEntry() {
        }

        public CodeEntry(String jwt, String email, String name) {
            this.jwt = jwt;
            this.email = email;
            this.name = name;
        }

        public String getJwt() {
            return jwt;
        }

        public void setJwt(String jwt) {
            this.jwt = jwt;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    /**
     * Store a one-time code with associated JWT and user info in Redis.
     */
    public void store(String code, String jwt, String email, String name) {
        String key = REDIS_KEY_PREFIX + code;
        logger.info("[AUTH] Storing code in Redis: {}, for email: {}", code, email);
        CodeEntry entry = new CodeEntry(jwt, email, name);
        try {
            Duration ttl = Duration.ofMinutes(TTL_MINUTES);
            redisTemplate.opsForValue().set(key, entry, ttl);
            logger.info("[AUTH] Successfully stored code in Redis");
        } catch (Exception e) {

            logger.error("[AUTH] FAILED to store code in Redis: {}", e.getMessage(), e);
        }
    }

    /**
     * Consume (retrieve and remove) a code from Redis.
     * Returns null if code is invalid or expired.
     */
    public CodeEntry consume(String code) {
        String key = REDIS_KEY_PREFIX + code;
        logger.info("[AUTH] Consuming code from Redis: {}", code);
        try {
            // Use separate get and delete for compatibility with Redis versions < 6.2
            Object value = redisTemplate.opsForValue().get(key);
            
            if (value == null) {
                logger.warn("[AUTH] Code not found or expired in Redis: {}", code);
                return null;
            }

            // Delete the key immediately after reading to ensure one-time use
            redisTemplate.delete(key);

            if (value instanceof CodeEntry) {
                logger.info("[AUTH] Successfully consumed code from Redis");
                return (CodeEntry) value;
            }
            logger.error("[AUTH] Invalid data type in Redis for code {}: {}", code, value.getClass().getName());
        } catch (Exception e) {
            logger.error("[AUTH] FAILED to consume code from Redis: {}", e.getMessage(), e);
        }
        return null;
    }

}
