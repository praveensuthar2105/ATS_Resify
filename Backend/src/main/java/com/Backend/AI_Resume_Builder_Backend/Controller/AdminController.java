package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.AdminAuditLog;
<<<<<<< HEAD
import com.Backend.AI_Resume_Builder_Backend.Entity.Role;
import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import com.Backend.AI_Resume_Builder_Backend.Repository.AdminAuditLogRepository;
=======
import com.Backend.AI_Resume_Builder_Backend.Entity.ContactMessage;
import com.Backend.AI_Resume_Builder_Backend.Entity.Feedback;
import com.Backend.AI_Resume_Builder_Backend.Entity.Role;
import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import com.Backend.AI_Resume_Builder_Backend.Repository.AdminAuditLogRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.ContactMessageRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.FeedbackRepository;
>>>>>>> 36da45bb (Fix: MySQL reserved keyword, OAuth failure handling, and port configuration)
import com.Backend.AI_Resume_Builder_Backend.Repository.ResumeRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.UserRepository;
import com.Backend.AI_Resume_Builder_Backend.Security.JwtUtil;
import com.Backend.AI_Resume_Builder_Backend.Service.LatexCompileService;
import com.Backend.AI_Resume_Builder_Backend.Service.SystemStatsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminAuditLogRepository adminAuditLogRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
<<<<<<< HEAD
=======
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
>>>>>>> 36da45bb (Fix: MySQL reserved keyword, OAuth failure handling, and port configuration)
    private SystemStatsService systemStatsService;

    @Autowired
    private LatexCompileService latexCompileService;

    @Autowired
    private org.springframework.data.redis.connection.RedisConnectionFactory redisConnectionFactory;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all users (Admin only) - Paginated
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            Page<User> usersPage = userRepository.findAll(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("content", usersPage.getContent().stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("name", user.getName());
                userMap.put("picture", user.getPicture());
                userMap.put("role", user.getRole() != null ? user.getRole().toString() : null);
                userMap.put("createdAt", user.getCreatedAt().toString());
                return userMap;
            }).collect(Collectors.toList()));
            response.put("currentPage", usersPage.getNumber());
            response.put("totalElements", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (AuthenticationException e) {
            return new ResponseEntity<>(Map.of("error", "Unauthorized"), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            logger.error("AdminController error in getAllUsers", e);
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get analytics stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }

        try {
            long totalResumes = resumeRepository.count();
            long totalPdf = systemStatsService.getStatValue(SystemStatsService.KEY_PDF_COMPILATIONS);
            long totalAts = systemStatsService.getStatValue(SystemStatsService.KEY_ATS_CHECKS);

            // Template usage
            List<Object[]> templateStats = resumeRepository.countByTemplateType();
            List<Map<String, Object>> templateUsage = templateStats.stream().map(obj -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", obj[0]);
                map.put("value", obj[1]);
                return map;
            }).collect(Collectors.toList());

            // Daily signups (last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Object[]> signupStats = userRepository.findSignupsAfter(thirtyDaysAgo);
            List<Map<String, Object>> dailySignups = signupStats.stream().map(obj -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", obj[0].toString());
                map.put("count", obj[1]);
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalResumes", totalResumes);
            stats.put("totalPdf", totalPdf);
            stats.put("totalAts", totalAts);
            stats.put("templateUsage", templateUsage);
            stats.put("dailySignups", dailySignups);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get system health
    @GetMapping("/system-health")
    public ResponseEntity<?> getSystemHealth(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }

        try {
            Map<String, Object> health = new HashMap<>();

            // Latex Compiler
            health.put("latex", latexCompileService.getCompilerStatus());

            // DB
            try {
                long count = userRepository.count();
                health.put("database", Map.of("status", "UP", "userCount", count));
            } catch (Exception e) {
                health.put("database", Map.of("status", "DOWN", "error", e.getMessage()));
            }

            // Redis
            try {
                redisConnectionFactory.getConnection().ping();
                health.put("redis", Map.of("status", "UP"));
            } catch (Exception e) {
                health.put("redis", Map.of("status", "DOWN", "error", e.getMessage()));
            }

            // Queue
            health.put("queue", Map.of("usage", latexCompileService.getQueueUsage()));

            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get audit logs
    @GetMapping("/audit-log")
    public ResponseEntity<?> getAuditLogs(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminAuditLogRepository.findAll(pageable));
    }

    // Export users to CSV
    @GetMapping(value = "/users/export", produces = "text/csv")
    public ResponseEntity<?> exportUsersToCsv(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }

        List<User> users = userRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Email,Role,Joined At,Provider\n");

        for (User user : users) {
            csv.append(user.getId()).append(",");
            csv.append(escapeCsv(user.getName())).append(",");
            csv.append(escapeCsv(user.getEmail())).append(",");
            csv.append(user.getRole()).append(",");
            csv.append(user.getCreatedAt()).append(",");
            csv.append(user.getProvider()).append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=users.csv")
                .body(csv.toString());
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";
        String escaped = data.replaceAll("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    // Grant admin role to a user
    @PutMapping("/grant-admin/{userId}")
    public ResponseEntity<?> grantAdminRole(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setRole(Role.ADMIN);
            userRepository.save(user);

            // Log action
            String token = extractToken(authHeader);
            String adminEmail = jwtUtil.getEmailFromToken(token);
            adminAuditLogRepository.save(
                    new AdminAuditLog(adminEmail, AdminAuditLog.Action.GRANT_ADMIN, user.getEmail()));

            return new ResponseEntity<>(Map.of(
                    "message", "Admin role granted successfully",
                    "userId", userId,
                    "email", user.getEmail(),
                    "role", user.getRole().toString()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Revoke admin role from a user
    @PutMapping("/revoke-admin/{userId}")
    public ResponseEntity<?> revokeAdminRole(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            // Prevent admin from revoking their own admin role
            String token = extractToken(authHeader);
            if (token != null) {
                String currentUserEmail = jwtUtil.getEmailFromToken(token);
                User targetUser = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                if (targetUser.getEmail().equals(currentUserEmail)) {
                    return new ResponseEntity<>(Map.of("error", "You cannot revoke your own admin role"),
                            HttpStatus.FORBIDDEN);
                }

                targetUser.setRole(Role.USER);
                userRepository.save(targetUser);

                // Log action
                adminAuditLogRepository.save(new AdminAuditLog(currentUserEmail, AdminAuditLog.Action.REVOKE_ADMIN,
                        targetUser.getEmail()));

                return new ResponseEntity<>(Map.of(
                        "message", "Admin role revoked successfully",
                        "userId", userId,
                        "email", targetUser.getEmail(),
                        "role", targetUser.getRole().toString()), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Invalid authorization header"),
                        HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Delete a user
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            // Get current admin's email to prevent self-deletion
            String token = extractToken(authHeader);
            if (token == null) {
                return new ResponseEntity<>(Map.of("error", "Invalid authorization header"),
                        HttpStatus.UNAUTHORIZED);
            }
            String currentUserEmail = jwtUtil.getEmailFromToken(token);

            User userToDelete = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Prevent admin from deleting themselves
            if (userToDelete.getEmail().equals(currentUserEmail)) {
                return new ResponseEntity<>(Map.of("error", "You cannot delete your own account"),
                        HttpStatus.BAD_REQUEST);
            }

            userRepository.delete(userToDelete);

            // Log action
            adminAuditLogRepository.save(new AdminAuditLog(currentUserEmail, AdminAuditLog.Action.DELETE_USER,
                    userToDelete.getEmail()));

            return new ResponseEntity<>(Map.of(
                    "message", "User deleted successfully",
                    "userId", userId,
                    "email", userToDelete.getEmail()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Get all feedbacks (Admin only) - Paginated
    @GetMapping("/feedback")
    public ResponseEntity<?> getAllFeedback(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(feedbackRepository.findAll(pageable));
    }

    // Get all contact messages (Admin only) - Paginated
    @GetMapping("/contacts")
    public ResponseEntity<?> getAllContacts(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        Page<ContactMessage> contactPage = contactMessageRepository.findAll(pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("content", contactPage.getContent());
        response.put("totalElements", contactPage.getTotalElements());
        response.put("totalPages", contactPage.getTotalPages());
        response.put("unreadCount", contactMessageRepository.countByReadFalse());
        return ResponseEntity.ok(response);
    }

    // Mark a contact message as read (Admin only)
    @PutMapping("/contacts/{id}/read")
    public ResponseEntity<?> markContactAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setRead(true);
        contactMessageRepository.save(msg);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // Delete feedback (Admin only)
    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<?> deleteFeedback(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        feedbackRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Feedback deleted"));
    }

    // Delete contact message (Admin only)
    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<?> deleteContact(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
        }
        contactMessageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Contact message deleted"));
    }

    /**
     * Extracts the Bearer token from the Authorization header.
     * Returns null if the header is null, blank, or malformed.
     */
    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.trim().startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.trim().substring(7).trim();
        return token.isEmpty() ? null : token;
    }

    // Helper method to check if user is admin
    private boolean isAdmin(String authHeader) {
        try {
            String token = extractToken(authHeader);
            if (token == null) {
                return false;
            }

            if (!jwtUtil.validateToken(token)) {
                return false;
            }

            String role = jwtUtil.getRoleFromToken(token);
            return "ADMIN".equals(role);
        } catch (Exception e) {
            return false;
        }
    }
}
