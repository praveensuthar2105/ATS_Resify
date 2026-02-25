package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderId(String providerId);

    @Query("SELECT DATE(u.createdAt) as date, COUNT(u) as count FROM User u WHERE u.createdAt >= :startDate GROUP BY DATE(u.createdAt) ORDER BY date ASC")
    List<Object[]> findSignupsAfter(@Param("startDate") LocalDateTime startDate);
}
