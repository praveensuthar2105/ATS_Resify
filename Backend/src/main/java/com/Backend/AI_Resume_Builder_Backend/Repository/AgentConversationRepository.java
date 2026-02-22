package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.AgentConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentConversationRepository extends JpaRepository<AgentConversation, Long> {

    Optional<AgentConversation> findBySessionId(String sessionId);

    List<AgentConversation> findByUserIdAndActiveTrueOrderByUpdatedAtDesc(String userId);

    List<AgentConversation> findByUserIdOrderByUpdatedAtDesc(String userId);

    @Query("SELECT c FROM AgentConversation c WHERE c.userId = :userId AND c.agentType = :agentType AND c.active = true ORDER BY c.updatedAt DESC")
    List<AgentConversation> findActiveByUserAndType(@Param("userId") String userId, @Param("agentType") String agentType);

    @Query("SELECT COUNT(c) FROM AgentConversation c WHERE c.userId = :userId AND c.active = true")
    long countActiveByUser(@Param("userId") String userId);
}
