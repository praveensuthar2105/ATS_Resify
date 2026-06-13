package com.Backend.AI_Resume_Builder_Backend.support;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    @Query("SELECT f.rating, COUNT(f) FROM Feedback f GROUP BY f.rating")
    List<Object[]> countByRating();

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.message IS NOT NULL AND f.message != ''")
    long countWithMessages();
}