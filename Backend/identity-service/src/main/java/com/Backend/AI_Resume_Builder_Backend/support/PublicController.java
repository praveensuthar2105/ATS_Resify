package com.Backend.AI_Resume_Builder_Backend.support;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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

    public static class FeedbackRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        private int rating;

        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ContactRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Subject is required")
        private String subject;

        @NotBlank(message = "Message is required")
        private String message;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    /**
     * Submit feedback (no auth required).
     */
    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody FeedbackRequest body) {
        Feedback feedback = new Feedback(
                body.getName().trim(), 
                body.getEmail().trim(), 
                body.getRating(), 
                body.getMessage() != null ? body.getMessage().trim() : ""
        );
        feedbackRepository.save(feedback);
        return ResponseEntity.ok(Map.of("message", "Thank you for your feedback!"));
    }

    /**
     * Submit a contact message (no auth required).
     */
    @PostMapping("/contact")
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactRequest body) {
        ContactMessage contact = new ContactMessage(
                body.getName().trim(), 
                body.getEmail().trim(), 
                body.getSubject().trim(), 
                body.getMessage().trim()
        );
        contactMessageRepository.save(contact);
        return ResponseEntity.ok(Map.of("message", "Your message has been sent. We'll get back to you soon!"));
    }
}