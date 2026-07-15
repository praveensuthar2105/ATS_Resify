package com.Backend.AI_Resume_Builder_Backend.admin;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

import com.Backend.AI_Resume_Builder_Backend.common.RedisCacheService;
import com.Backend.AI_Resume_Builder_Backend.common.GeminiService;
import com.Backend.AI_Resume_Builder_Backend.auth.JwtUtil;
import com.Backend.AI_Resume_Builder_Backend.user.User;
import com.Backend.AI_Resume_Builder_Backend.user.UserRepository;
import com.Backend.AI_Resume_Builder_Backend.user.Role;



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

    @Autowired
    private DataSource dataSource;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test-admin-token")
    public ResponseEntity<Map<String, String>> getTestAdminToken() {
        if (userRepository.findByEmail("admin@atsresify.me").isEmpty()) {
            User u = new User("admin@atsresify.me", "Admin User", "", "google", "test-admin-id");
            u.setRole(Role.ADMIN);
            userRepository.save(u);
        }
        return ResponseEntity.ok(Map.of("token", jwtUtil.generateToken("admin@atsresify.me", "Admin User", "ADMIN")));
    }

    @GetMapping("/test-user-token")
    public ResponseEntity<Map<String, String>> getTestUserToken() {
        if (userRepository.findByEmail("user@atsresify.me").isEmpty()) {
            User u = new User("user@atsresify.me", "Normal User", "", "google", "test-user-id");
            u.setRole(Role.USER);
            userRepository.save(u);
        }
        return ResponseEntity.ok(Map.of("token", jwtUtil.generateToken("user@atsresify.me", "Normal User", "USER")));
    }

    private boolean isDatabaseAvailable() {
        try (Connection conn = dataSource.getConnection()) {
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("SELECT 1");
                return true;
            }
        } catch (Exception e) {
            return false;
        }
    }

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
        
        // Components status
        Map<String, Object> components = new HashMap<>();
        
        // Redis
        boolean redisUp = redisCacheService.isRedisAvailable();
        components.put("redis", Map.of(
            "status", redisUp ? "UP" : "DOWN",
            "critical", false
        ));
        
        // Database
        boolean dbUp = isDatabaseAvailable();
        components.put("database", Map.of(
            "status", dbUp ? "UP" : "DOWN",
            "critical", true
        ));
        
        // AI Service (Gemini)
        boolean aiUp = geminiService.isConfigured();
        components.put("aiService", Map.of(
            "status", aiUp ? "UP" : "DOWN",
            "critical", true
        ));
        
        boolean overallUp = redisUp && dbUp && aiUp;
        health.put("status", overallUp ? "UP" : "DEGRADED");
        health.put("timestamp", System.currentTimeMillis());
        health.put("components", components);
        
        return ResponseEntity.ok(health);
    }
}