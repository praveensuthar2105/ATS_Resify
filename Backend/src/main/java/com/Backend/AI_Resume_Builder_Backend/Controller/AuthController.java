package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Security.AuthorizationCodeStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles the one-time authorization code exchange.
 * The frontend sends the code received via URL redirect and gets back the JWT +
 * user info.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthorizationCodeStore authorizationCodeStore;

    /**
     * Exchange a one-time authorization code for JWT token and user info.
     * POST /auth/exchange { "code": "..." }
     */
    @PostMapping("/exchange")
    public ResponseEntity<Map<String, Object>> exchangeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        logger.info("[AUTH] Received exchange request for code: {}", code);

        if (code == null || code.trim().isEmpty()) {
            logger.warn("[AUTH] Exchange request missing code");
            return new ResponseEntity<>(
                    Map.of("error", "Authorization code is required"),
                    HttpStatus.BAD_REQUEST);
        }

        AuthorizationCodeStore.CodeEntry entry = authorizationCodeStore.consume(code.trim());

        if (entry == null) {
            logger.warn("[AUTH] Exchange failed: code not found or expired: {}", code);
            return new ResponseEntity<>(
                    Map.of("error", "Invalid or expired authorization code"),
                    HttpStatus.UNAUTHORIZED);
        }

        logger.info("[AUTH] Exchange successful for code: {}", code);

        return ResponseEntity.ok(Map.of(
                "token", entry.getJwt(),
                "email", entry.getEmail(),
                "name", entry.getName()));
    }
}
