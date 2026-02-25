package com.Backend.AI_Resume_Builder_Backend.Repository;

import com.Backend.AI_Resume_Builder_Backend.Entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
