package com.Backend.AI_Resume_Builder_Backend.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



/**
 * Repository for user preferences.
 * Each user has exactly one preferences record (1:1 relationship via userId).
 */
@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    /**
     * Find preferences by user ID (email)
     */
    Optional<UserPreference> findByUserId(String userId);

    /**
     * Check if a user has saved preferences
     */
    boolean existsByUserId(String userId);

    /**
     * Delete preferences for a user (privacy/account deletion)
     */
    void deleteByUserId(String userId);
}