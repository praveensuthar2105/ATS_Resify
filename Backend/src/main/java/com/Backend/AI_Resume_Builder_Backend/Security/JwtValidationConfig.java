package com.Backend.AI_Resume_Builder_Backend.Security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Validates that the JWT secret is configured and meets minimum strength
 * requirements.
 * Fails application startup if the secret is missing or too short.
 */
@Configuration
public class JwtValidationConfig {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @PostConstruct
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured. Set the 'jwt.secret' property or JWT_SECRET environment variable.");
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                    "JWT secret is too short (" + jwtSecret.length() + " chars). "
                            + "Must be at least 32 characters for adequate security.");
        }
    }
}
