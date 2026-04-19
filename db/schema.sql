-- Hostinger MySQL / MariaDB: ejecuta esto en phpMyAdmin o en la consola SQL del hosting.
CREATE TABLE IF NOT EXISTS bracket_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(64) NOT NULL,
  predicted_winner_code VARCHAR(8) NOT NULL,
  predicted_winner_name VARCHAR(128) NOT NULL,
  submitted_at DATETIME(3) NOT NULL,
  groups_json JSON NOT NULL,
  scores_json JSON NOT NULL COMMENT 'Consentimientos y metadatos (p. ej. contestConsent, marketingConsent)',
  knockout_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bracket_submissions_entry_id (entry_id),
  KEY idx_bracket_submissions_email (email),
  KEY idx_bracket_submissions_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
