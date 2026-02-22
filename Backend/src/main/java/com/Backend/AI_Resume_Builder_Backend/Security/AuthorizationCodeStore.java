package com.Backend.AI_Resume_Builder_Backend.Security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for one-time authorization codes used in the OAuth2 login
 * flow.
 * Each code maps to token data and expires after 5 minutes.
 */
@Component
public class AuthorizationCodeStore {

    private static final long TTL_MILLIS = 5 * 60 * 1000; // 5 minutes

    private final ConcurrentHashMap<String, CodeEntry> store = new ConcurrentHashMap<>();

    public static class CodeEntry {
        private final String jwt;
        private final String email;
        private final String name;
        private final Instant expiresAt;

        public CodeEntry(String jwt, String email, String name) {
            this.jwt = jwt;
            this.email = email;
            this.name = name;
            this.expiresAt = Instant.now().plusMillis(TTL_MILLIS);
        }

        public String getJwt() {
            return jwt;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    /**
     * Store a one-time code with associated JWT and user info.
     */
    public void store(String code, String jwt, String email, String name) {
        // Clean up expired entries opportunistically
        store.entrySet().removeIf(entry -> entry.getValue().isExpired());
        store.put(code, new CodeEntry(jwt, email, name));
    }

    /**
     * Consume (retrieve and remove) a code. Returns null if code is invalid or
     * expired.
     */
    public CodeEntry consume(String code) {
        CodeEntry entry = store.remove(code);
        if (entry == null || entry.isExpired()) {
            return null;
        }
        return entry;
    }
}
