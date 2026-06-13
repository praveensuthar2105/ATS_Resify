package com.Backend.AI_Resume_Builder_Backend.support;

import org.springframework.data.jpa.repository.JpaRepository;


public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    long countByReadFalse();
}