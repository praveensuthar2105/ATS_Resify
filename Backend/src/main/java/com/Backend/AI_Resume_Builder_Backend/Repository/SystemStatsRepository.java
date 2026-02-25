package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.SystemStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemStatsRepository extends JpaRepository<SystemStats, String> {
}
