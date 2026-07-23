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
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");
            String providerId = oAuth2User.getAttribute("sub");

            // Resolve existing account by providerId first (unique), then email.
            // Looking up only by email causes Duplicate entry on provider_id when:
            // - Google email changed, or
            // - email is missing/mismatched but sub (providerId) already exists.
            User user = resolveOrCreateUser(email, name, picture, providerId);

            // Preserve existing DB role. Only default brand-new users to USER.
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }

            // Break-glass: promote only if there are currently zero admins and email matches bootstrap config.
            String effectiveEmail = user.getEmail();
            if (shouldBootstrapAdmin(effectiveEmail)) {
                logger.warn("[AUTH] Bootstrap admin grant for {} (zero admins present)", effectiveEmail);
                user.setRole(Role.ADMIN);
            }

            userRepository.save(user);

            String tokenEmail = user.getEmail();
            String tokenName = user.getName() != null ? user.getName() : name;
            String token = jwtUtil.generateToken(tokenEmail, tokenName, user.getRole().toString());

            String code = UUID.randomUUID().toString();
            logger.info("[AUTH] Generated one-time code for {}", tokenEmail);
            authorizationCodeStore.store(code, token, tokenEmail, tokenName);

            String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                    .queryParam("code", code)
                    .build()
                    .toUriString();

            logger.info("[AUTH] Redirecting OAuth success for {}", tokenEmail);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception ex) {
            // Never leave the browser on a backend Whitelabel / static-resource 500 page.
            // Log full detail server-side; do not put internal exception text in the redirect URL (prod-safe).
            logger.error("[AUTH] OAuth success handling failed: {}", ex.getMessage(), ex);
            String failUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", "oauth_failed")
                    .queryParam("message", "Sign-in failed. Please try again.")
                    .build()
                    .encode()
                    .toUriString();
            getRedirectStrategy().sendRedirect(request, response, failUrl);
        }
    }

    /**
     * Find user by Google {@code sub} (providerId), else by email, else create.
     * Updates profile fields on existing users without re-inserting (avoids UK on provider_id).
     */
    private User resolveOrCreateUser(String email, String name, String picture, String providerId) {
        User matched = null;

        if (StringUtils.hasText(providerId)) {
            matched = userRepository.findByProviderId(providerId).orElse(null);
            if (matched != null) {
                logger.info("[AUTH] Matched existing user id={} by providerId", matched.getId());
            }
        }

        if (matched == null && StringUtils.hasText(email)) {
            matched = userRepository.findByEmail(email).orElse(null);
            if (matched != null) {
                logger.info("[AUTH] Matched existing user id={} by email", matched.getId());
            }
        }

        if (matched == null) {
            if (!StringUtils.hasText(email)) {
                throw new IllegalStateException(
                        "OAuth login missing email and no existing account for providerId=" + providerId);
            }
            if (!StringUtils.hasText(providerId)) {
                throw new IllegalStateException(
                        "OAuth login missing provider subject (sub) for email=" + email);
            }
            logger.info("[AUTH] Creating new user for email={}", email);
            User created = new User(email, name, picture, "google", providerId);
            created.setRole(Role.USER);
            return created;
        }

        // Effectively final reference for lambdas below
        final User user = matched;
        final Long userId = user.getId();

        // Existing user — refresh profile; never INSERT a second row for the same Google account.
        if (StringUtils.hasText(name)) {
            user.setName(name);
        }
        if (StringUtils.hasText(picture)) {
            user.setPicture(picture);
        }

        // Repair / link providerId if missing or outdated, without stealing another row's unique key
        if (StringUtils.hasText(providerId) && !providerId.equals(user.getProviderId())) {
            boolean providerIdOwnedByOther = userRepository.findByProviderId(providerId)
                    .filter(other -> other.getId() != null && !other.getId().equals(userId))
                    .isPresent();
            if (!providerIdOwnedByOther) {
                user.setProviderId(providerId);
            } else {
                logger.warn(
                        "[AUTH] providerId {} already linked to another user; keeping user id={} providerId={}",
                        providerId, userId, user.getProviderId());
            }
        }

        // Allow Google email change when the new address is not taken
        if (StringUtils.hasText(email) && !email.equalsIgnoreCase(user.getEmail())) {
            boolean emailTaken = userRepository.findByEmail(email)
                    .filter(other -> other.getId() != null && !other.getId().equals(userId))
                    .isPresent();
            if (!emailTaken) {
                logger.info("[AUTH] Updating email for user id={} from {} to {}",
                        userId, user.getEmail(), email);
                user.setEmail(email);
            } else {
                logger.warn(
                        "[AUTH] Google returned email {} already owned by another user; keeping {}",
                        email, user.getEmail());
            }
        }

        if (!StringUtils.hasText(user.getProvider())) {
            user.setProvider("google");
        }

        return user;
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
