package com.Backend.AI_Resume_Builder_Backend.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SystemStatsRepository extends JpaRepository<SystemStats, String> {

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE SystemStats s SET s.value = s.value + 1 WHERE s.key = :key")
    int incrementValue(@org.springframework.data.repository.query.Param("key") String key);
}