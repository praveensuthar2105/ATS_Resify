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
import org.springframework.web.util.UriComponentsBuilder;

import com.Backend.AI_Resume_Builder_Backend.user.Role;
import com.Backend.AI_Resume_Builder_Backend.user.User;
import com.Backend.AI_Resume_Builder_Backend.user.UserRepository;




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

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                        Authentication authentication) throws IOException {
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

                String email = oAuth2User.getAttribute("email");
                String name = oAuth2User.getAttribute("name");
                String picture = oAuth2User.getAttribute("picture");
                String providerId = oAuth2User.getAttribute("sub");

                // Save or update user
                User user = userRepository.findByEmail(email)
                                .orElse(new User(email, name, picture, "google", providerId));

                user.setName(name);
                user.setPicture(picture);

                // Guarantee admin accounts
                if (email != null && (email.equals("praveensuthar1863@gmail.com") ||
                                email.equals("sutharaartu1863@gmail.com") ||
                                email.equals("praveensuthar2105@gmail.com") ||
                                email.equals("sutharaarti1863@gmail.com"))) {
                        user.setRole(com.Backend.AI_Resume_Builder_Backend.user.Role.ADMIN);
                } else if (user.getRole() == null) {
                        user.setRole(com.Backend.AI_Resume_Builder_Backend.user.Role.USER);
                }

                userRepository.save(user);

                // Generate JWT token with role
                String token = jwtUtil.generateToken(email, name, user.getRole().toString());

                // Generate a one-time authorization code instead of putting JWT in URL
                String code = UUID.randomUUID().toString();
                logger.info("[AUTH] Generated one-time code for {}: {}", email, code);
                authorizationCodeStore.store(code, token, email, name);

                // Redirect to frontend with one-time code (not the JWT)
                String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                                .queryParam("code", code)
                                .build()
                                .toUriString();

                logger.info("[AUTH] Redirecting to: {}", redirectUrl);
                getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        }
}