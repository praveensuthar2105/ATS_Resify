package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.AtsCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AtsCheckRepository extends JpaRepository<AtsCheck, Long> {
    
    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count FROM ats_checks WHERE created_at >= :startDate GROUP BY DATE(created_at) ORDER BY date ASC", nativeQuery = true)
    List<Object[]> findAtsCheckCountsAfter(@Param("startDate") LocalDateTime startDate);
}
