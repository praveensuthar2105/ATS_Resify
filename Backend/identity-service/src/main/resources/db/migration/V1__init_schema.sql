-- Table structures for our consolidated 3-Service database schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `provider` varchar(255) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK6jdo1l976be85wv43w6x6e6x2` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ats_optimized` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `custom_notes` text,
  `experience_level` varchar(30) DEFAULT NULL,
  `max_pages` int NOT NULL,
  `prefer_action_verbs` bit(1) NOT NULL,
  `prefer_metrics` bit(1) NOT NULL,
  `preferred_template` varchar(50) DEFAULT NULL,
  `target_companies` varchar(500) DEFAULT NULL,
  `target_industry` varchar(200) DEFAULT NULL,
  `target_role` varchar(200) DEFAULT NULL,
  `tone` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `verbosity` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pref_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` enum('DELETE_USER','GRANT_ADMIN','REVOKE_ADMIN') NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `target_user_email` varchar(255) NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `agent_conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `agent_type` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `session_id` varchar(64) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgsk0vn8ytfwxef6evaf3nhrke` (`session_id`),
  KEY `idx_conv_user_id` (`user_id`),
  KEY `idx_conv_session` (`session_id`),
  KEY `idx_conv_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `agent_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_type` varchar(30) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `metadata` json DEFAULT NULL,
  `role` varchar(15) NOT NULL,
  `conversation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conversation` (`conversation_id`),
  KEY `idx_msg_created` (`created_at`),
  CONSTRAINT `FK4a5dh5bsvskl3w1exbmb0grfc` FOREIGN KEY (`conversation_id`) REFERENCES `agent_conversations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ats_checks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `job_description_provided` bit(1) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `ats_score` int DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `resume_text` longtext,
  `score_breakdown` longtext,
  `suggestions` longtext,
  PRIMARY KEY (`id`),
  KEY `FKhgvsh5x9m2mp9vn93jesh58i` (`user_id`),
  CONSTRAINT `FKhgvsh5x9m2mp9vn93jesh58i` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `subject` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text,
  `name` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `resumes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `template_type` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  `candidate_name` varchar(255) DEFAULT NULL,
  `resume_json` longtext,
  PRIMARY KEY (`id`),
  KEY `FK340nuaivxiy99hslr3sdydfvv` (`user_id`),
  CONSTRAINT `FK340nuaivxiy99hslr3sdydfvv` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `system_stats` (
  `stat_key` varchar(255) NOT NULL,
  `stat_value` bigint NOT NULL,
  PRIMARY KEY (`stat_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
