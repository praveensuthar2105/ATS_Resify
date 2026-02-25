package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query("SELECT r.templateType, COUNT(r) FROM Resume r GROUP BY r.templateType")
    List<Object[]> countByTemplateType();
}
