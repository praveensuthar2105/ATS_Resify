package com.Backend.AI_Resume_Builder_Backend.agent;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface AgentMessageRepository extends JpaRepository<AgentMessage, Long> {

    List<AgentMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT m FROM AgentMessage m WHERE m.conversation.id = :convId ORDER BY m.createdAt DESC")
    List<AgentMessage> findRecentMessages(@Param("convId") Long conversationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM AgentMessage m WHERE m.conversation.id = :convId")
    long countByConversation(@Param("convId") Long conversationId);

    @Query("SELECT m FROM AgentMessage m WHERE m.conversation.sessionId = :sessionId ORDER BY m.createdAt ASC")
    List<AgentMessage> findBySessionId(@Param("sessionId") String sessionId);
}