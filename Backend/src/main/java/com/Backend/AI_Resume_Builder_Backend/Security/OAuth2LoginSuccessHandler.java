package com.Backend.AI_Resume_Builder_Backend.Security;

import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import com.Backend.AI_Resume_Builder_Backend.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JwtUtil jwtUtil;

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

                // Grant ADMIN role to special user
                if (email != null && email.equals("sutharaarti1863@gmail.com")) {
                        user.setRole(com.Backend.AI_Resume_Builder_Backend.Entity.Role.ADMIN);
                } else {
                        user.setRole(com.Backend.AI_Resume_Builder_Backend.Entity.Role.USER);
                }

                userRepository.save(user);

                // Generate JWT token with role
                String token = jwtUtil.generateToken(email, name, user.getRole().toString());

                // Redirect to frontend with token
                String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/auth/callback")
                                .queryParam("token", token)
                                .queryParam("name", name)
                                .queryParam("email", email)
                                .build()
                                .toUriString();

                getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
}
