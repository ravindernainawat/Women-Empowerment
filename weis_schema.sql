-- =====================================================================
-- WEIS (Women Empowerment & Inclusion System) — Tier 1 Core Schema
-- Engine: MySQL 8.0+
-- Scope: Core pipeline (users, skills, skill-gap, recommendations,
--         mentorship, safety) — deliberately excludes non-core tables
--         from the full 39-table blueprint to avoid overengineering.
-- Repo: https://github.com/ravindernainawat/Women-Empowerment.git
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. USERS — core identity table for all platform participants
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('mentee', 'mentor', 'admin') NOT NULL DEFAULT 'mentee',
    phone           VARCHAR(20),
    location        VARCHAR(150),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 2. SKILLS — master catalog of skills used across the platform
-- ---------------------------------------------------------------------
CREATE TABLE skills (
    skill_id        INT AUTO_INCREMENT PRIMARY KEY,
    skill_name      VARCHAR(100) NOT NULL UNIQUE,
    category        VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 3. USER_SKILLS — a user's current skill inventory
-- ---------------------------------------------------------------------
CREATE TABLE user_skills (
    user_skill_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    skill_id           INT NOT NULL,
    proficiency_level  ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_skill (user_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 4. SKILL_GAP_ASSESSMENTS — one assessment run against a target role
-- ---------------------------------------------------------------------
CREATE TABLE skill_gap_assessments (
    assessment_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    target_role     VARCHAR(150) NOT NULL,
    overall_score   DECIMAL(5,2),
    assessed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 5. ASSESSMENT_GAP_DETAILS — per-skill breakdown of a gap assessment
-- ---------------------------------------------------------------------
CREATE TABLE assessment_gap_details (
    gap_detail_id   INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id   INT NOT NULL,
    skill_id        INT NOT NULL,
    required_level  ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    current_level   ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    gap_score       DECIMAL(5,2),
    FOREIGN KEY (assessment_id) REFERENCES skill_gap_assessments(assessment_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id)      REFERENCES skills(skill_id)                    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 6. COURSES — learning content catalog feeding the recommender
-- ---------------------------------------------------------------------
CREATE TABLE courses (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    provider        VARCHAR(150),
    skill_id        INT,
    url             VARCHAR(255),
    duration_hours  INT,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 7. RECOMMENDATIONS — output of the recommendation engine
-- ---------------------------------------------------------------------
CREATE TABLE recommendations (
    recommendation_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL,
    course_id           INT NOT NULL,
    match_score         DECIMAL(5,2),
    recommended_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status               ENUM('pending', 'viewed', 'enrolled', 'completed') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 8. MENTORS — mentor profile extension of a user
-- ---------------------------------------------------------------------
CREATE TABLE mentors (
    mentor_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    expertise_area  VARCHAR(150),
    bio             TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 9. MENTORSHIP_REQUESTS — mentee <-> mentor matching workflow
-- ---------------------------------------------------------------------
CREATE TABLE mentorship_requests (
    request_id      INT AUTO_INCREMENT PRIMARY KEY,
    mentee_id       INT NOT NULL,
    mentor_id       INT NOT NULL,
    status          ENUM('pending', 'accepted', 'declined', 'completed') NOT NULL DEFAULT 'pending',
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentee_id) REFERENCES users(user_id)     ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 10. SAFETY_REPORTS — safety pillar incident reporting
-- ---------------------------------------------------------------------
CREATE TABLE safety_reports (
    report_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    incident_type   VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    status          ENUM('submitted', 'under_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'submitted',
    reported_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Indexes to support common lookup patterns
-- ---------------------------------------------------------------------
CREATE INDEX idx_recommendations_user   ON recommendations(user_id);
CREATE INDEX idx_assessments_user       ON skill_gap_assessments(user_id);
CREATE INDEX idx_safety_reports_user    ON safety_reports(user_id);
CREATE INDEX idx_courses_skill          ON courses(skill_id);
