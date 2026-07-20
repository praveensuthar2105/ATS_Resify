package com.Backend.AI_Resume_Builder_Backend.admin;

import java.sql.Connection;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.AI_Resume_Builder_Backend.common.GeminiService;
import com.Backend.AI_Resume_Builder_Backend.common.RedisCacheService;

/**
 * Public health endpoints for load balancers and ops probes.
 * Dangerous test-token mint endpoints are intentionally removed for production safety.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private RedisCacheService redisCacheService;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private GeminiService geminiService;

    private boolean isDatabaseAvailable() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lightweight readiness probe for load balancers.
     * Does not mint tokens or create users.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        boolean dbUp = isDatabaseAvailable();
        Map<String, Object> health = new HashMap<>();
        health.put("status", dbUp ? "UP" : "DOWN");
        health.put("timestamp", System.currentTimeMillis());
        health.put("service", "identity-service");
        return ResponseEntity.status(dbUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(health);
    }

    @GetMapping("/redis")
    public ResponseEntity<Map<String, Object>> redisHealth() {
        Map<String, Object> redisStatus = new HashMap<>();
        boolean redisAvailable = redisCacheService.isRedisAvailable();
        redisStatus.put("status", redisAvailable ? "UP" : "DOWN");
        redisStatus.put("available", redisAvailable);

        if (redisAvailable) {
            RedisCacheService.CacheStats stats = redisCacheService.getCacheStats();
            redisStatus.put("stats", Map.of(
                    "aiResponsesCached", stats.getAiResponsesCached(),
                    "activeSessions", stats.getActiveSessions(),
                    "userContextEntries", stats.getUserContextEntries()
            ));
        }

        redisStatus.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(redisAvailable ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(redisStatus);
    }

    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> fullHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        Map<String, Object> components = new HashMap<>();

        boolean redisUp = redisCacheService.isRedisAvailable();
        components.put("redis", Map.of(
                "status", redisUp ? "UP" : "DOWN",
                "critical", false
        ));

        boolean dbUp = isDatabaseAvailable();
        components.put("database", Map.of(
                "status", dbUp ? "UP" : "DOWN",
                "critical", true
        ));

        boolean aiUp = geminiService.isConfigured();
        components.put("aiService", Map.of(
                "status", aiUp ? "UP" : "DOWN",
                "critical", true
        ));

        // Critical deps: DB + AI. Redis is non-critical for basic identity.
        boolean overallUp = dbUp && aiUp;
        health.put("status", overallUp ? (redisUp ? "UP" : "DEGRADED") : "DOWN");
        health.put("timestamp", System.currentTimeMillis());
        health.put("components", components);

        HttpStatus status = overallUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(health);
    }
}
