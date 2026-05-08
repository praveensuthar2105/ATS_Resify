package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query("SELECT r.templateType, COUNT(r) FROM Resume r GROUP BY r.templateType")
    List<Object[]> countByTemplateType();

    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count FROM resumes WHERE created_at >= :startDate GROUP BY DATE(created_at) ORDER BY date ASC", nativeQuery = true)
    List<Object[]> findResumeCountsAfter(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT MAX(r.createdAt) FROM Resume r WHERE r.user.id = :userId")
    LocalDateTime findLastActiveDateByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Resume r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT r.user.id, r.user.name, r.user.email, COUNT(r) as c FROM Resume r GROUP BY r.user.id, r.user.name, r.user.email ORDER BY c DESC")
    List<Object[]> findTopUsersByResumeCount(Pageable pageable);

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM Resume r WHERE r.createdAt >= :startDate")
    long countDistinctUsersAfter(@Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT COUNT(*) FROM resumes WHERE DATE(created_at) = CURDATE()", nativeQuery = true)
    long countResumesCreatedToday();

    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);
}
