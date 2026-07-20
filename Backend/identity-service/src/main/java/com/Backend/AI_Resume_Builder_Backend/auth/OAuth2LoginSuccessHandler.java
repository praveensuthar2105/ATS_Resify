package com.Backend.AI_Resume_Builder_Backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import com.Backend.AI_Resume_Builder_Backend.user.Role;
import com.Backend.AI_Resume_Builder_Backend.user.User;
import com.Backend.AI_Resume_Builder_Backend.user.UserRepository;

/**
 * OAuth2 success handler.
 * Database role is the source of truth. Login never re-promotes admins from a hardcoded email list.
 * Optional break-glass bootstrap: when zero admins exist and BOOTSTRAP_ADMIN_EMAIL matches, grant ADMIN once.
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthorizationCodeStore authorizationCodeStore;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Optional one-time bootstrap email when the system has zero ADMIN users.
     * Never re-grants on subsequent logins once any admin exists.
     */
    @Value("${app.bootstrap-admin-email:}")
    private String bootstrapAdminEmail;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        User user = userRepository.findByEmail(email)
                .orElse(new User(email, name, picture, "google", providerId));

        user.setName(name);
        user.setPicture(picture);

        // Preserve existing DB role. Only default brand-new users to USER.
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        // Break-glass: promote only if there are currently zero admins and email matches bootstrap config.
        if (shouldBootstrapAdmin(email)) {
            logger.warn("[AUTH] Bootstrap admin grant for {} (zero admins present)", email);
            user.setRole(Role.ADMIN);
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(email, name, user.getRole().toString());

        String code = UUID.randomUUID().toString();
        logger.info("[AUTH] Generated one-time code for {}", email);
        authorizationCodeStore.store(code, token, email, name);

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("code", code)
                .build()
                .toUriString();

        logger.info("[AUTH] Redirecting OAuth success for {}", email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private boolean shouldBootstrapAdmin(String email) {
        if (!StringUtils.hasText(bootstrapAdminEmail) || !StringUtils.hasText(email)) {
            return false;
        }
        if (!bootstrapAdminEmail.trim().equalsIgnoreCase(email.trim())) {
            return false;
        }
        long adminCount = userRepository.countByRole(Role.ADMIN);
        return adminCount == 0;
    }
}
