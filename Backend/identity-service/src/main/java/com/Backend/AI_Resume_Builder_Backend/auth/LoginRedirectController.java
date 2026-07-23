package com.Backend.AI_Resume_Builder_Backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Backend has no login UI. Spring Security's default OAuth failure path is
 * {@code /login?error}, which otherwise becomes "No static resource login."
 * Redirect all {@code /login} hits to the SPA login page.
 */
@Controller
public class LoginRedirectController {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping({ "/login", "/login/" })
    public String loginRedirect(
            @org.springframework.web.bind.annotation.RequestParam(value = "error", required = false) String error) {

        // Uses app.frontend-url / FRONTEND_URL — production must set FRONTEND_URL to the public SPA origin.
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendUrl + "/login");
        if (error != null && !error.isBlank()) {
            // Only pass a stable error code, never raw backend exception text
            builder.queryParam("error", "oauth_failed");
            builder.queryParam("message", "Sign-in failed. Please try again.");
        }
        return "redirect:" + builder.build().encode().toUriString();
    }
}
