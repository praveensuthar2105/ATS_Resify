package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.Role;
import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import com.Backend.AI_Resume_Builder_Backend.Repository.UserRepository;
import com.Backend.AI_Resume_Builder_Backend.Security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = { "http://localhost:5175", "http://localhost:5178", "http://localhost:5173",
        "http://localhost:5174" })
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all users (Admin only)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate admin role
            if (!isAdmin(authHeader)) {
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."),
                        HttpStatus.FORBIDDEN);
            }

            List<Map<String, Object>> users = userRepository.findAll().stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("email", user.getEmail());
                        userMap.put("name", user.getName());
                        userMap.put("picture", user.getPicture());
                        userMap.put("role", user.getRole().toString());
                        userMap.put("createdAt", user.getCreatedAt().toString());
                        return userMap;
                    })
                    .collect(Collectors.toList());

            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Unauthorized"), HttpStatus.UNAUTHORIZED);
        }
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

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setRole(Role.USER);
            userRepository.save(user);

            return new ResponseEntity<>(Map.of(
                    "message", "Admin role revoked successfully",
                    "userId", userId,
                    "email", user.getEmail(),
                    "role", user.getRole().toString()), HttpStatus.OK);
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
            String token = authHeader.replace("Bearer ", "");
            String currentUserEmail = jwtUtil.getEmailFromToken(token);

            User userToDelete = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Prevent admin from deleting themselves
            if (userToDelete.getEmail().equals(currentUserEmail)) {
                return new ResponseEntity<>(Map.of("error", "You cannot delete your own account"),
                        HttpStatus.BAD_REQUEST);
            }

            userRepository.delete(userToDelete);

            return new ResponseEntity<>(Map.of(
                    "message", "User deleted successfully",
                    "userId", userId,
                    "email", userToDelete.getEmail()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Helper method to check if user is admin
    private boolean isAdmin(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");

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
