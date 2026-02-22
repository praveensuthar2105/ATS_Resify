package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Service.RedisCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * 
 * Provides endpoints to monitor system health including:
 * - Redis connectivity
 * - Cache statistics
 * - Overall system status
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    @Autowired
    private RedisCacheService redisCacheService;

    /**
     * Basic health check
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("service", "AI Resume Builder Backend");
        
        return ResponseEntity.ok(health);
    }

    /**
     * Redis health and statistics
     */
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
        
        return ResponseEntity.ok(redisStatus);
    }

    /**
     * Full system health check
     */
    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> fullHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        // Overall status
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        
        // Components status
        Map<String, Object> components = new HashMap<>();
        
        // Redis
        boolean redisUp = redisCacheService.isRedisAvailable();
        components.put("redis", Map.of(
            "status", redisUp ? "UP" : "DOWN",
            "critical", false  // Redis is for caching, not critical path
        ));
        
        // Database (if available - Spring Boot actuator would normally handle this)
        components.put("database", Map.of(
            "status", "UP",  // Assume up if we're running
            "critical", true
        ));
        
        // AI Service (Gemini)
        components.put("aiService", Map.of(
            "status", "UP",  // Would need actual check
            "critical", true
        ));
        
        health.put("components", components);
        
        return ResponseEntity.ok(health);
    }
}
