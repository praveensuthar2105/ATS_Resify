package com.Backend.AI_Resume_Builder_Backend.Controller;

import com.Backend.AI_Resume_Builder_Backend.Entity.ContactMessage;
import com.Backend.AI_Resume_Builder_Backend.Entity.Feedback;
import com.Backend.AI_Resume_Builder_Backend.Repository.ContactMessageRepository;
import com.Backend.AI_Resume_Builder_Backend.Repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    /**
     * Submit feedback (no auth required).
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "");
        String email = (String) body.getOrDefault("email", "");
        int rating = body.get("rating") != null ? ((Number) body.get("rating")).intValue() : 0;
        String message = (String) body.getOrDefault("message", "");

        if (name.isBlank() || email.isBlank() || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and rating (1-5) are required."));
        }

        Feedback feedback = new Feedback(name.trim(), email.trim(), rating, message.trim());
        feedbackRepository.save(feedback);

        return ResponseEntity.ok(Map.of("message", "Thank you for your feedback!"));
    }

    /**
     * Submit a contact message (no auth required).
     */
    @PostMapping("/contact")
    public ResponseEntity<?> submitContact(@RequestBody Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "");
        String email = (String) body.getOrDefault("email", "");
        String subject = (String) body.getOrDefault("subject", "");
        String message = (String) body.getOrDefault("message", "");

        if (name.isBlank() || email.isBlank() || subject.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required."));
        }

        ContactMessage contact = new ContactMessage(name.trim(), email.trim(), subject.trim(), message.trim());
        contactMessageRepository.save(contact);

        return ResponseEntity.ok(Map.of("message", "Your message has been sent. We'll get back to you soon!"));
    }
}
