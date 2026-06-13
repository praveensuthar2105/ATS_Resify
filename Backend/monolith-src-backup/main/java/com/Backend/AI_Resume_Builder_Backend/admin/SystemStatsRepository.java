package com.Backend.AI_Resume_Builder_Backend.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SystemStatsRepository extends JpaRepository<SystemStats, String> {
}