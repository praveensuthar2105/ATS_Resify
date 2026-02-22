package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Security.AuthorizationCodeStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthTokenController {

    @Autowired
    private AuthorizationCodeStore codeStore;

    /**
     * Exchange a one-time authorization code for a JWT token.
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> exchangeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.trim().isEmpty()) {
            return new ResponseEntity<>(Map.of("error", "Authorization code is required"), HttpStatus.BAD_REQUEST);
        }

        AuthorizationCodeStore.CodeEntry entry = codeStore.consume(code.trim());
        if (entry == null) {
            return new ResponseEntity<>(Map.of("error", "Invalid or expired authorization code"),
                    HttpStatus.UNAUTHORIZED);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", entry.getJwt());
        response.put("email", entry.getEmail());
        response.put("name", entry.getName());
        return ResponseEntity.ok(response);
    }
}
