-- V2 Migration: Admin Command Center (AI Ops, Feature Flags, Quotas, Security Alerts)
-- ponytail mode: minimal, highly focused tables with zero unnecessary abstraction.

CREATE TABLE IF NOT EXISTS `ai_prompts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `prompt_key` varchar(100) NOT NULL,
  `prompt_name` varchar(255) NOT NULL,
  `system_prompt` longtext NOT NULL,
  `model_name` varchar(100) NOT NULL DEFAULT 'gemini-2.5-flash',
  `temperature` double NOT NULL DEFAULT 0.7,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_prompt_key` (`prompt_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `feature_flags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `flag_key` varchar(100) NOT NULL,
  `flag_name` varchar(255) NOT NULL,
  `description` text,
  `enabled_global` bit(1) NOT NULL DEFAULT b'1',
  `enabled_pro_only` bit(1) NOT NULL DEFAULT b'0',
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_flag_key` (`flag_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tier_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tier_name` varchar(50) NOT NULL,
  `max_resumes_per_month` int NOT NULL DEFAULT 10,
  `max_ats_checks_per_day` int NOT NULL DEFAULT 5,
  `ai_model_allowed` varchar(100) NOT NULL DEFAULT 'gemini-2.5-flash',
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tier_name` (`tier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `security_alerts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `alert_type` varchar(100) NOT NULL,
  `ip_address` varchar(100) NOT NULL,
  `details` text,
  `severity` varchar(20) NOT NULL DEFAULT 'WARN',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_alert_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default base seeds so Admin Dashboard is instantly populated with live controls
INSERT INTO `ai_prompts` (`prompt_key`, `prompt_name`, `system_prompt`, `model_name`, `temperature`, `updated_at`)
VALUES 
('ats_checker', 'ATS Score Engine & Suggestions', 'You are an expert technical recruiter and ATS parsing engine. Evaluate the candidate resume against the provided job description and give actionable suggestions.', 'gemini-2.5-flash', 0.5, NOW()),
('bullet_improver', 'Resume Action Bullet Polish', 'You are an executive resume writer. Rewrite the resume bullet points to use strong action verbs and quantified impact metrics.', 'gemini-2.5-flash', 0.7, NOW())
ON DUPLICATE KEY UPDATE `updated_at`=NOW();

INSERT INTO `feature_flags` (`flag_key`, `flag_name`, `description`, `enabled_global`, `enabled_pro_only`, `updated_at`)
VALUES 
('ai_cover_letter', 'AI Cover Letter Generator', 'Generate tailored cover letters based on resume and job posting.', b'1', b'0', NOW()),
('tectonic_engine', 'Tectonic LaTeX Compiler Engine', 'Enable high-speed Tectonic PDF compiler fallback in resume-service.', b'1', b'0', NOW()),
('realtime_ws_sync', 'WebSocket Real-time Resume Sync', 'Live bi-directional resume collaboration across devices.', b'1', b'0', NOW())
ON DUPLICATE KEY UPDATE `updated_at`=NOW();

INSERT INTO `tier_configs` (`tier_name`, `max_resumes_per_month`, `max_ats_checks_per_day`, `ai_model_allowed`, `updated_at`)
VALUES 
('FREE', 3, 5, 'gemini-2.5-flash', NOW()),
('PRO', 999, 999, 'gemini-2.5-pro', NOW())
ON DUPLICATE KEY UPDATE `updated_at`=NOW();
