-- ============================================================
-- TruthGuard — MySQL Database Schema
-- AI-Based Fake News Detection System
-- ============================================================
-- Run: mysql -u root -p < database_schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS truthguard
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE truthguard;

-- ---- users table ----
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)   PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(255),
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---- predictions table ----
CREATE TABLE IF NOT EXISTS predictions (
  id               VARCHAR(36)   PRIMARY KEY,
  user_id          VARCHAR(36)   NOT NULL,
  input_text       TEXT          NOT NULL,
  title            VARCHAR(500),
  label            ENUM('Fake','Real') NOT NULL,
  confidence       DECIMAL(6,4)  NOT NULL,
  prob_fake        DECIMAL(6,4)  NOT NULL,
  prob_real        DECIMAL(6,4)  NOT NULL,
  suspicious_words JSON,
  explanation      TEXT,
  source           VARCHAR(50)   NOT NULL DEFAULT 'manual',
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pred_user (user_id),
  INDEX idx_pred_created (created_at),
  INDEX idx_pred_label (label)
);

-- ---- reports table ----
CREATE TABLE IF NOT EXISTS reports (
  id         VARCHAR(36)   PRIMARY KEY,
  user_id    VARCHAR(36)   NOT NULL,
  title      VARCHAR(255)  NOT NULL,
  summary    TEXT,
  data       JSON,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_report_user (user_id)
);

-- ---- admin_logs table ----
CREATE TABLE IF NOT EXISTS admin_logs (
  id         VARCHAR(36)   PRIMARY KEY,
  admin_id   VARCHAR(36),
  action     VARCHAR(100)  NOT NULL,
  detail     TEXT,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_log_created (created_at)
);
