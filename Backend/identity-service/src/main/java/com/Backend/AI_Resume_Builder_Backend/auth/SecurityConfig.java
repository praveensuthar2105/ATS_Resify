package com.Backend.AI_Resume_Builder_Backend.auth;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.util.UriComponentsBuilder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

        @Autowired
        private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

        @Autowired
        private JwtAuthenticationFilter jwtAuthFilter;

        @Value("${app.frontend-url:http://localhost:5173}")
        private String frontendUrl;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/public/**",
                                                                "/oauth2/**",
                                                                "/login",
                                                                "/login/**",
                                                                "/auth/**",
                                                                "/api/health/**",
                                                                "/actuator/health",
                                                                "/actuator/info",
                                                                "/api/resume/generate",
                                                                "/api/resume/ats-score",
                                                                "/api/resume/import/**",
                                                                "/api/latex/templates",
                                                                "/",
                                                                "/favicon.ico",
                                                                "/logo.png",
                                                                "/index.html",
                                                                "/assets/**",
                                                                "/static/**",
                                                                "/error",
                                                                "/health")
                                                .permitAll()
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                // This app has no server-rendered login page; OAuth starts at
                                                // /oauth2/authorization/google and the UI lives on the frontend.
                                                .loginPage(frontendUrl + "/login")
                                                .successHandler(oAuth2LoginSuccessHandler)
                                                .failureHandler((request, response, exception) -> {
                                                        // Full exception stays in server logs only (no internal leak to browser/URL)
                                                        logger.warn("[AUTH] OAuth2 login failed: {}",
                                                                        exception.getMessage(), exception);
                                                        String redirectUrl = UriComponentsBuilder
                                                                        .fromUriString(frontendUrl + "/login")
                                                                        .queryParam("error", "oauth_failed")
                                                                        .queryParam("message",
                                                                                        "Sign-in failed. Please try again.")
                                                                        .build()
                                                                        .encode()
                                                                        .toUriString();
                                                        response.sendRedirect(redirectUrl);
                                                }))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        // Browser navigations → frontend login; API clients → JSON
                                                        String accept = request.getHeader("Accept");
                                                        boolean wantsHtml = accept != null
                                                                        && accept.contains("text/html");
                                                        if (wantsHtml) {
                                                                response.sendRedirect(frontendUrl + "/login");
                                                                return;
                                                        }
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Unauthorized\",\"loginUrl\":\"/oauth2/authorization/google\"}");
                                                }));

                return http.build();
        }

        @Value("${cors.allowed-origins:https://atsresify.me,https://www.atsresify.me,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000}")
        private String[] allowedOrigins;

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
                configuration.setAllowedMethods(
                                Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}