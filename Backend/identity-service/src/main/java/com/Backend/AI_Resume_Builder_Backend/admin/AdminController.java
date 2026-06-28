package com.Backend.AI_Resume_Builder_Backend.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import com.Backend.AI_Resume_Builder_Backend.ats.AtsCheck;
import com.Backend.AI_Resume_Builder_Backend.ats.AtsCheckRepository;
import com.Backend.AI_Resume_Builder_Backend.auth.JwtUtil;

import com.Backend.AI_Resume_Builder_Backend.resume.Resume;
import com.Backend.AI_Resume_Builder_Backend.resume.ResumeRepository;
import com.Backend.AI_Resume_Builder_Backend.support.ContactMessage;
import com.Backend.AI_Resume_Builder_Backend.support.ContactMessageRepository;
import com.Backend.AI_Resume_Builder_Backend.support.FeedbackRepository;
import com.Backend.AI_Resume_Builder_Backend.user.Role;
import com.Backend.AI_Resume_Builder_Backend.user.User;
import com.Backend.AI_Resume_Builder_Backend.user.UserRepository;



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
    private AtsCheckRepository atsCheckRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private SystemStatsService systemStatsService;

    private final RestClient restClient;

    @Autowired
    public AdminController(
            @Value("${resume.service.url:http://localhost:8082}") String resumeServiceUrl,
            RestClient.Builder restClientBuilder) {
        org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000); // 5 seconds
        requestFactory.setReadTimeout(10000);   // 10 seconds

        this.restClient = restClientBuilder
                .baseUrl(resumeServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Autowired
    private org.springframework.data.redis.connection.RedisConnectionFactory redisConnectionFactory;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all users (Admin only) - Paginated
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            Page<User> usersPage;
            if (search != null && !search.trim().isEmpty()) {
                usersPage = userRepository.searchUsers(search.trim(), pageable);
            } else {
                usersPage = userRepository.findAll(pageable);
            }
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
            // Verify services are not null
            if (systemStatsService == null) {
                logger.error("Critical Failure: systemStatsService is null in AdminController");
                throw new RuntimeException("System stats service unavailable");
            }

            long totalResumes = resumeRepository.count();
            long totalPdf = systemStatsService.getStatValue(SystemStatsService.KEY_PDF_COMPILATIONS);
            long totalAts = systemStatsService.getStatValue(SystemStatsService.KEY_ATS_CHECKS);

            // Template usage
            List<Object[]> templateStats = resumeRepository.countByTemplateType();
            List<Map<String, Object>> templateUsage = templateStats.stream().map(obj -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", obj[0] != null ? obj[0].toString() : "Unknown");
                map.put("value", obj[1] != null ? obj[1] : 0);
                return map;
            }).collect(Collectors.toList());

            // 30-day time series data
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

            // 1. Signups
            List<Object[]> signupStats = userRepository.findSignupsAfter(thirtyDaysAgo);
            List<Map<String, Object>> dailySignups = formatTimeSeries(signupStats);

            // 2. Resumes Created
            List<Object[]> resumeTimeSeries = resumeRepository.findResumeCountsAfter(thirtyDaysAgo);
            List<Map<String, Object>> dailyResumes = formatTimeSeries(resumeTimeSeries);

            // 3. ATS Checks
            List<Object[]> atsTimeSeries = atsCheckRepository.findAtsCheckCountsAfter(thirtyDaysAgo);
            List<Map<String, Object>> dailyAts = formatTimeSeries(atsTimeSeries);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalResumes", totalResumes);
            stats.put("totalPdf", totalPdf);
            stats.put("totalAts", totalAts);
            stats.put("templateUsage", templateUsage);
            stats.put("dailySignups", dailySignups);
            stats.put("dailyResumes", dailyResumes);
            stats.put("dailyAts", dailyAts);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("[ADMIN_STATS] FAILED: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<Map<String, Object>> formatTimeSeries(List<Object[]> rawData) {
        return rawData.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", obj[0].toString());
            map.put("count", obj[1]);
            return map;
        }).collect(Collectors.toList());
    }

    // Get all resumes (Admin only) - Paginated
    @GetMapping("/resumes")
    public ResponseEntity<?> getAllResumes(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
            }

            Page<Resume> resumePage = resumeRepository.findAll(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("content", resumePage.getContent().stream().map(resume -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", resume.getId());
                map.put("email", resume.getUser().getEmail());
                map.put("userName", resume.getUser().getName());
                map.put("candidateName", resume.getCandidateName());
                map.put("resumeJson", resume.getResumeJson() != null ? resume.getResumeJson().substring(0, Math.min(resume.getResumeJson().length(), 200)) + "..." : null);
                map.put("templateType", resume.getTemplateType());
                map.put("createdAt", resume.getCreatedAt().toString());
                return map;
            }).collect(Collectors.toList()));
            response.put("currentPage", resumePage.getNumber());
            response.put("totalElements", resumePage.getTotalElements());
            response.put("totalPages", resumePage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching resumes for admin", e);
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/resumes/{id}")
    public ResponseEntity<?> getResumeById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
            }
            
            Resume resume = resumeRepository.findById(id).orElse(null);
            if (resume == null) {
                return new ResponseEntity<>(Map.of("error", "Resume not found"), HttpStatus.NOT_FOUND);
            }
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", resume.getId());
            map.put("email", resume.getUser().getEmail());
            map.put("userName", resume.getUser().getName());
            map.put("candidateName", resume.getCandidateName());
            map.put("resumeJson", resume.getResumeJson());
            map.put("templateType", resume.getTemplateType());
            map.put("createdAt", resume.getCreatedAt().toString());
            
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            logger.error("Error fetching resume details", e);
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/ats-checks")
    public ResponseEntity<?> getAllAtsChecks(
            @RequestHeader("Authorization") String authHeader,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        try {
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
            }

            Page<AtsCheck> atsPage = atsCheckRepository.findAll(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("content", atsPage.getContent().stream().map(check -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", check.getId());
                map.put("email", check.getUser() != null ? check.getUser().getEmail() : "GUEST");
                map.put("userName", check.getUser() != null ? check.getUser().getName() : "GUEST");
                map.put("atsScore", check.getAtsScore());
                map.put("jobDescriptionProvided", check.isJobDescriptionProvided());
                map.put("fileName", check.getFileName());
                String snippet = check.getResumeText();
                if (snippet != null && snippet.length() > 100) {
                    snippet = snippet.substring(0, 100) + "...";
                }
                map.put("resumeSnippet", snippet);
                map.put("createdAt", check.getCreatedAt().toString());
                return map;
            }).collect(Collectors.toList()));
            response.put("currentPage", atsPage.getNumber());
            response.put("totalElements", atsPage.getTotalElements());
            response.put("totalPages", atsPage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching ATS checks", e);
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/ats-checks/{id}")
    public ResponseEntity<?> getAtsCheckById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied."), HttpStatus.FORBIDDEN);
            }
            
            AtsCheck check = atsCheckRepository.findById(id).orElse(null);
            if (check == null) {
                return new ResponseEntity<>(Map.of("error", "ATS Check not found"), HttpStatus.NOT_FOUND);
            }
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", check.getId());
            map.put("email", check.getUser() != null ? check.getUser().getEmail() : "GUEST");
            map.put("userName", check.getUser() != null ? check.getUser().getName() : "GUEST");
            map.put("atsScore", check.getAtsScore());
            map.put("jobDescriptionProvided", check.isJobDescriptionProvided());
            map.put("fileName", check.getFileName());
            map.put("resumeText", check.getResumeText());
            map.put("scoreBreakdown", check.getScoreBreakdown());
            map.put("suggestions", check.getSuggestions());
            map.put("createdAt", check.getCreatedAt().toString());
            
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            logger.error("Error fetching ATS check details", e);
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
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
            try {
                Map<?, ?> status = restClient.get()
                        .uri("/api/latex/health")
                        .header("Authorization", authHeader)
                        .retrieve()
                        .body(Map.class);
                health.put("latex", status);
            } catch (Exception e) {
                health.put("latex", Map.of("status", "DOWN", "error", e.getMessage()));
            }

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
            try {
                Map<?, ?> queue = restClient.get()
                        .uri("/api/latex/queue")
                        .header("Authorization", authHeader)
                        .retrieve()
                        .body(Map.class);
                health.put("queue", queue);
            } catch (Exception e) {
                health.put("queue", Map.of("usage", 0, "error", e.getMessage()));
            }

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
        String cleaned = data.trim();
        if (cleaned.startsWith("=") || cleaned.startsWith("+") || cleaned.startsWith("-") || cleaned.startsWith("@")) {
            cleaned = "'" + cleaned;
        }
        String escaped = cleaned.replaceAll("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\r")) {
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

    // --- Phase 2 Endpoints ---

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        if (!isAdmin(authHeader)) return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
        
        java.util.Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return new ResponseEntity<>(Map.of("error", "User not found"), HttpStatus.NOT_FOUND);
        
        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("provider", user.getProvider());
        profile.put("createdAt", user.getCreatedAt());
        
        long resumeCount = resumeRepository.countByUserId(id);
        long atsCount = atsCheckRepository.countByUserId(id);
        LocalDateTime lastActive = resumeRepository.findLastActiveDateByUserId(id);
        
        profile.put("resumeCount", resumeCount);
        profile.put("atsCount", atsCount);
        profile.put("lastActive", lastActive);
        
        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(id);
        List<AtsCheck> atsChecks = atsCheckRepository.findByUserIdOrderByCreatedAtDesc(id);
        
        profile.put("resumes", resumes.stream().map(r -> Map.of(
            "id", r.getId(),
            "templateType", r.getTemplateType(),
            "createdAt", r.getCreatedAt()
        )).collect(Collectors.toList()));
        
        profile.put("atsChecks", atsChecks.stream().map(a -> Map.of(
            "id", a.getId(),
            "atsScore", a.getAtsScore() != null ? a.getAtsScore() : 0,
            "createdAt", a.getCreatedAt()
        )).collect(Collectors.toList()));
        
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/stats/engagement")
    public ResponseEntity<?> getEngagementStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
        
        Map<String, Object> stats = new HashMap<>();
        
        long mau = resumeRepository.countDistinctUsersAfter(LocalDateTime.now().minusDays(30));
        long dau = resumeRepository.countDistinctUsersAfter(LocalDateTime.now().minusDays(1));
        double dauMauRatio = mau > 0 ? ((double) dau / mau) * 100 : 0.0;
        stats.put("dauMauRatio", dauMauRatio);
        
        long powerUsers = 0;
        List<Object[]> topUsersData = resumeRepository.findTopUsersByResumeCount(org.springframework.data.domain.PageRequest.of(0, 100));
        for (Object[] row : topUsersData) {
            if (((Number) row[3]).longValue() >= 5) powerUsers++;
        }
        stats.put("powerUsers", powerUsers);
        
        double retentionRate = mau > 0 ? 45.5 : 0.0; // Mock retention for now
        stats.put("retentionRate", retentionRate);
        
        long resumeUsers = resumeRepository.countDistinctUsersAfter(LocalDateTime.now().minusDays(30));
        long atsUsers = atsCheckRepository.countDistinctUsersAfter(LocalDateTime.now().minusDays(30));
        
        Map<String, Long> featureUsage = new HashMap<>();
        featureUsage.put("resumeBuilder", resumeUsers);
        featureUsage.put("atsScanner", atsUsers);
        stats.put("featureUsage", featureUsage);
        
        return ResponseEntity.ok(stats);
    }


    @GetMapping("/feedback/summary")
    public ResponseEntity<?> getFeedbackSummary(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
        
        Map<String, Object> summary = new HashMap<>();
        Double avgRating = feedbackRepository.getAverageRating();
        summary.put("averageRating", avgRating != null ? avgRating : 0.0);
        
        List<Object[]> distributionData = feedbackRepository.countByRating();
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) distribution.put(i, 0L);
        for (Object[] row : distributionData) {
            distribution.put((Integer) row[0], (Long) row[1]);
        }
        summary.put("ratingDistribution", distribution);
        
        long totalFeedback = feedbackRepository.count();
        long withMessage = feedbackRepository.countWithMessages();
        summary.put("totalFeedback", totalFeedback);
        summary.put("withMessageCount", withMessage);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/live-stats")
    public ResponseEntity<?> getLiveStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
        
        Map<String, Object> liveStats = new HashMap<>();
        long resumesToday = resumeRepository.countResumesCreatedToday();
        long atsChecksToday = atsCheckRepository.countAtsChecksCreatedToday();
        
        liveStats.put("resumesToday", resumesToday);
        liveStats.put("atsChecksToday", atsChecksToday);
        liveStats.put("onlineUsers", Math.max(1, (int)(resumesToday * 1.5))); 
        
        return ResponseEntity.ok(liveStats);
    }

    @GetMapping("/export/resumes")
    public void exportResumesCsv(@RequestHeader("Authorization") String authHeader, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        if (!isAdmin(authHeader)) {
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"resumes_export.csv\"");
        
        java.io.PrintWriter writer = response.getWriter();
        writer.println("ID,User ID,User Email,Template Type,Candidate Name,Created At");
        
        List<Resume> resumes = resumeRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        for (Resume r : resumes) {
            String email = r.getUser() != null ? r.getUser().getEmail() : "N/A";
            String cName = r.getCandidateName() != null ? r.getCandidateName().replace(",", " ") : "N/A";
            writer.printf("%d,%d,%s,%s,%s,%s\n", 
                r.getId(), 
                r.getUser() != null ? r.getUser().getId() : 0,
                email, 
                r.getTemplateType(),
                cName,
                r.getCreatedAt()
            );
        }
        writer.flush();
    }

    @GetMapping("/export/analytics")
    public void exportAnalyticsCsv(@RequestHeader("Authorization") String authHeader, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        if (!isAdmin(authHeader)) {
            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"analytics_summary.csv\"");
        
        java.io.PrintWriter writer = response.getWriter();
        writer.println("Metric,Value");
        
        writer.printf("Total Users,%d\n", userRepository.count());
        writer.printf("Total Resumes,%d\n", resumeRepository.count());
        writer.printf("Total ATS Checks,%d\n", atsCheckRepository.count());
        writer.printf("Total Feedback,%d\n", feedbackRepository.count());
        
        Double avgRating = feedbackRepository.getAverageRating();
        writer.printf("Average Feedback Rating,%.2f\n", avgRating != null ? avgRating : 0.0);
        
        writer.flush();
    }
}