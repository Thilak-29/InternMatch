-- =========================================================
-- INTERNSHIP PLATFORM — FULL MYSQL WORKBENCH DATABASE SCHEMA
-- Converted to MySQL 8.0 DDL Syntax
-- Database: internmatch_db
-- User: root | Password: root
-- =========================================================

CREATE DATABASE IF NOT EXISTS internmatch_db;
USE internmatch_db;

SET FOREIGN_KEY_CHECKS = 0;

-- DROP ALL EXISTING TABLES BEFORE RE-CREATION
DROP TABLE IF EXISTS `downloads`;
DROP TABLE IF EXISTS `uploads`;
DROP TABLE IF EXISTS `cloudinary_metadata`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `videos`;
DROP TABLE IF EXISTS `images`;
DROP TABLE IF EXISTS `files`;
DROP TABLE IF EXISTS `retention`;
DROP TABLE IF EXISTS `conversion`;
DROP TABLE IF EXISTS `clicks`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `page_views`;
DROP TABLE IF EXISTS `yearly_statistics`;
DROP TABLE IF EXISTS `monthly_statistics`;
DROP TABLE IF EXISTS `daily_statistics`;
DROP TABLE IF EXISTS `ai_usage_analytics`;
DROP TABLE IF EXISTS `application_analytics`;
DROP TABLE IF EXISTS `recruiter_analytics`;
DROP TABLE IF EXISTS `student_analytics`;
DROP TABLE IF EXISTS `user_analytics`;
DROP TABLE IF EXISTS `moderation_queue`;
DROP TABLE IF EXISTS `blacklist`;
DROP TABLE IF EXISTS `user_suspension`;
DROP TABLE IF EXISTS `support_messages`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `reported_content`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `report_categories`;
DROP TABLE IF EXISTS `cms_pages`;
DROP TABLE IF EXISTS `banners`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `admin_permissions`;
DROP TABLE IF EXISTS `admin_roles`;
DROP TABLE IF EXISTS `admin_users`;
DROP TABLE IF EXISTS `recent_searches`;
DROP TABLE IF EXISTS `saved_filters`;
DROP TABLE IF EXISTS `search_filters`;
DROP TABLE IF EXISTS `popular_searches`;
DROP TABLE IF EXISTS `search_history`;
DROP TABLE IF EXISTS `course_recommendations`;
DROP TABLE IF EXISTS `learning_recommendations`;
DROP TABLE IF EXISTS `recommendation_feedback`;
DROP TABLE IF EXISTS `recommendation_history`;
DROP TABLE IF EXISTS `recommendation_engine_runs`;
DROP TABLE IF EXISTS `career_predictions`;
DROP TABLE IF EXISTS `mock_interview_scores`;
DROP TABLE IF EXISTS `mock_interview_answers`;
DROP TABLE IF EXISTS `mock_interview_questions`;
DROP TABLE IF EXISTS `mock_interviews`;
DROP TABLE IF EXISTS `learning_roadmap`;
DROP TABLE IF EXISTS `skill_gap_analysis`;
DROP TABLE IF EXISTS `resume_suggestions`;
DROP TABLE IF EXISTS `resume_reviews`;
DROP TABLE IF EXISTS `prompt_history`;
DROP TABLE IF EXISTS `ai_chat_history`;
DROP TABLE IF EXISTS `career_advisor_chats`;
DROP TABLE IF EXISTS `sms_notification`;
DROP TABLE IF EXISTS `email_notification`;
DROP TABLE IF EXISTS `push_notification`;
DROP TABLE IF EXISTS `notification_preferences`;
DROP TABLE IF EXISTS `notification_queue`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `notification_template`;
DROP TABLE IF EXISTS `typing_status`;
DROP TABLE IF EXISTS `message_read_status`;
DROP TABLE IF EXISTS `message_attachments`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversation_participants`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `interview_reminder`;
DROP TABLE IF EXISTS `interview_calendar`;
DROP TABLE IF EXISTS `interview_recording`;
DROP TABLE IF EXISTS `interview_notes`;
DROP TABLE IF EXISTS `interview_result`;
DROP TABLE IF EXISTS `interview_rating`;
DROP TABLE IF EXISTS `interview_feedback`;
DROP TABLE IF EXISTS `interview_participants`;
DROP TABLE IF EXISTS `interview_schedule`;
DROP TABLE IF EXISTS `interview_rounds`;
DROP TABLE IF EXISTS `interviews`;
DROP TABLE IF EXISTS `application_archive`;
DROP TABLE IF EXISTS `application_withdraw`;
DROP TABLE IF EXISTS `application_feedback`;
DROP TABLE IF EXISTS `application_communication`;
DROP TABLE IF EXISTS `application_skill_match`;
DROP TABLE IF EXISTS `application_ai_score`;
DROP TABLE IF EXISTS `application_timeline`;
DROP TABLE IF EXISTS `application_ratings`;
DROP TABLE IF EXISTS `application_notes`;
DROP TABLE IF EXISTS `application_resume`;
DROP TABLE IF EXISTS `application_documents`;
DROP TABLE IF EXISTS `application_status_history`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `recently_viewed`;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `bookmarks`;
DROP TABLE IF EXISTS `internship_moderation`;
DROP TABLE IF EXISTS `internship_approval`;
DROP TABLE IF EXISTS `internship_reports`;
DROP TABLE IF EXISTS `internship_saves`;
DROP TABLE IF EXISTS `internship_views`;
DROP TABLE IF EXISTS `featured_internships`;
DROP TABLE IF EXISTS `internship_analytics`;
DROP TABLE IF EXISTS `internship_status`;
DROP TABLE IF EXISTS `internship_videos`;
DROP TABLE IF EXISTS `internship_images`;
DROP TABLE IF EXISTS `internship_attachments`;
DROP TABLE IF EXISTS `internship_questions`;
DROP TABLE IF EXISTS `internship_eligibility`;
DROP TABLE IF EXISTS `internship_duration`;
DROP TABLE IF EXISTS `internship_salary`;
DROP TABLE IF EXISTS `internship_locations`;
DROP TABLE IF EXISTS `internship_benefits`;
DROP TABLE IF EXISTS `internship_requirements`;
DROP TABLE IF EXISTS `internship_tags`;
DROP TABLE IF EXISTS `internship_categories`;
DROP TABLE IF EXISTS `internship_skills`;
DROP TABLE IF EXISTS `internships`;
DROP TABLE IF EXISTS `recruiter_activity`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `company_billing`;
DROP TABLE IF EXISTS `company_subscriptions`;
DROP TABLE IF EXISTS `recruiter_invitations`;
DROP TABLE IF EXISTS `recruiter_permissions`;
DROP TABLE IF EXISTS `recruiter_team`;
DROP TABLE IF EXISTS `company_gallery`;
DROP TABLE IF EXISTS `company_social_links`;
DROP TABLE IF EXISTS `company_benefits`;
DROP TABLE IF EXISTS `company_culture`;
DROP TABLE IF EXISTS `company_size`;
DROP TABLE IF EXISTS `company_industry`;
DROP TABLE IF EXISTS `company_documents`;
DROP TABLE IF EXISTS `company_verification`;
DROP TABLE IF EXISTS `company_branches`;
DROP TABLE IF EXISTS `recruiter_profiles`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `saved_searches`;
DROP TABLE IF EXISTS `activity_history`;
DROP TABLE IF EXISTS `student_points`;
DROP TABLE IF EXISTS `student_badges`;
DROP TABLE IF EXISTS `student_verification`;
DROP TABLE IF EXISTS `profile_visibility`;
DROP TABLE IF EXISTS `profile_completion`;
DROP TABLE IF EXISTS `resume_keywords`;
DROP TABLE IF EXISTS `resume_ats_score`;
DROP TABLE IF EXISTS `resume_ai_analysis`;
DROP TABLE IF EXISTS `resume_parsing`;
DROP TABLE IF EXISTS `resume_downloads`;
DROP TABLE IF EXISTS `resume_versions`;
DROP TABLE IF EXISTS `resume_metadata`;
DROP TABLE IF EXISTS `codeforces_details`;
DROP TABLE IF EXISTS `codechef_details`;
DROP TABLE IF EXISTS `hackerrank_details`;
DROP TABLE IF EXISTS `leetcode_details`;
DROP TABLE IF EXISTS `github_details`;
DROP TABLE IF EXISTS `social_links`;
DROP TABLE IF EXISTS `portfolios`;
DROP TABLE IF EXISTS `preferred_industries`;
DROP TABLE IF EXISTS `preferred_roles`;
DROP TABLE IF EXISTS `preferred_locations`;
DROP TABLE IF EXISTS `expected_salary`;
DROP TABLE IF EXISTS `career_preferences`;
DROP TABLE IF EXISTS `student_interests`;
DROP TABLE IF EXISTS `interests`;
DROP TABLE IF EXISTS `student_languages`;
DROP TABLE IF EXISTS `student_skills`;
DROP TABLE IF EXISTS `student_certificates`;
DROP TABLE IF EXISTS `student_achievements`;
DROP TABLE IF EXISTS `student_projects`;
DROP TABLE IF EXISTS `student_experience`;
DROP TABLE IF EXISTS `student_education`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `oauth_accounts`;
DROP TABLE IF EXISTS `api_keys`;
DROP TABLE IF EXISTS `blocked_tokens`;
DROP TABLE IF EXISTS `active_sessions`;
DROP TABLE IF EXISTS `device_sessions`;
DROP TABLE IF EXISTS `failed_login_attempts`;
DROP TABLE IF EXISTS `login_history`;
DROP TABLE IF EXISTS `otp_verifications`;
DROP TABLE IF EXISTS `email_verification_tokens`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `timezone`;
DROP TABLE IF EXISTS `currency`;
DROP TABLE IF EXISTS `category_master`;
DROP TABLE IF EXISTS `industry_master`;
DROP TABLE IF EXISTS `language_master`;
DROP TABLE IF EXISTS `skill_master`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `degrees`;
DROP TABLE IF EXISTS `colleges`;
DROP TABLE IF EXISTS `cities`;
DROP TABLE IF EXISTS `states`;
DROP TABLE IF EXISTS `countries`;


-- =========================================================
-- SYSTEM / MASTER TABLES (create first — everything references these)
-- =========================================================

CREATE TABLE countries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    iso_code VARCHAR(5) UNIQUE
);

CREATE TABLE states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    state_id BIGINT NOT NULL REFERENCES states(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE colleges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT REFERENCES cities(id),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE degrees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- e.g. B.Tech, M.Tech
    level VARCHAR(50)                    -- UG / PG / Diploma
);

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL           -- e.g. CSE, ECE
);

CREATE TABLE skill_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100)
);

CREATE TABLE language_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE industry_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE category_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE currency (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,    -- INR, USD
    symbol VARCHAR(5)
);

CREATE TABLE timezone (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,   -- Asia/Kolkata
    utc_offset VARCHAR(10)
);

-- =========================================================
-- AUTHENTICATION
-- =========================================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255),
    password_hash TEXT,
    role VARCHAR(50) DEFAULT 'STUDENT',
    user_type VARCHAR(20) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(100)
);

CREATE TABLE role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME
);

CREATE TABLE email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME
);

CREATE TABLE otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50),                 -- login / signup / reset
    expires_at DATETIME NOT NULL,
    verified_at DATETIME
);

CREATE TABLE login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    logged_in_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE failed_login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE active_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_session_id BIGINT REFERENCES device_sessions(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    label VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME
);

CREATE TABLE oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,       -- google / github / linkedin
    provider_user_id VARCHAR(255) NOT NULL,
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- STUDENT MODULE
-- =========================================================

CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    phone VARCHAR(20),
    college VARCHAR(255),
    branch VARCHAR(255),
    cgpa DECIMAL(4,2),
    city VARCHAR(100),
    state VARCHAR(100),
    github VARCHAR(255),
    leetcode VARCHAR(255),
    bio TEXT,
    total_practice_score DECIMAL(7,2) DEFAULT 0.0,
    tests_completed INT DEFAULT 0,
    department_id BIGINT REFERENCES departments(id),
    college_id BIGINT REFERENCES colleges(id),
    date_of_birth DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    degree_id BIGINT REFERENCES degrees(id),
    college_id BIGINT REFERENCES colleges(id),
    start_year INT,
    end_year INT,
    grade VARCHAR(20)
);

CREATE TABLE student_experience (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150),
    company_name VARCHAR(150),
    start_date DATE,
    end_date DATE,
    description TEXT
);

CREATE TABLE student_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    project_url TEXT
);

CREATE TABLE student_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    achieved_on DATE
);

CREATE TABLE student_certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200),
    issuer VARCHAR(150),
    issued_on DATE,
    certificate_url TEXT
);

CREATE TABLE student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_id BIGINT REFERENCES skill_master(id),
    skill_name VARCHAR(100),
    proficiency VARCHAR(20),
    UNIQUE (student_id, skill_id)
);

CREATE TABLE student_languages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    language_id BIGINT NOT NULL REFERENCES language_master(id),
    proficiency VARCHAR(20),
    UNIQUE (student_id, language_id)
);

CREATE TABLE interests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE student_interests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    interest_id BIGINT NOT NULL REFERENCES interests(id),
    UNIQUE (student_id, interest_id)
);

CREATE TABLE career_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    work_mode VARCHAR(20),               -- remote / onsite / hybrid
    availability VARCHAR(50)
);

CREATE TABLE expected_salary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_preference_id BIGINT NOT NULL REFERENCES career_preferences(id) ON DELETE CASCADE,
    min_amount DECIMAL(12,2),
    max_amount DECIMAL(12,2),
    currency_id BIGINT REFERENCES currency(id)
);

CREATE TABLE preferred_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_preference_id BIGINT NOT NULL REFERENCES career_preferences(id) ON DELETE CASCADE,
    city_id BIGINT NOT NULL REFERENCES cities(id)
);

CREATE TABLE preferred_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_preference_id BIGINT NOT NULL REFERENCES career_preferences(id) ON DELETE CASCADE,
    role_title VARCHAR(150)
);

CREATE TABLE preferred_industries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_preference_id BIGINT NOT NULL REFERENCES career_preferences(id) ON DELETE CASCADE,
    industry_id BIGINT NOT NULL REFERENCES industry_master(id)
);

CREATE TABLE portfolios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    about TEXT,
    theme VARCHAR(50)
);

CREATE TABLE social_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50),                -- linkedin / instagram / twitter
    url TEXT
);

CREATE TABLE github_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    username VARCHAR(100),
    public_repos INT,
    followers INT,
    last_synced_at DATETIME
);

CREATE TABLE leetcode_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    username VARCHAR(100),
    problems_solved INT,
    rating INT,
    last_synced_at DATETIME
);

CREATE TABLE hackerrank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    username VARCHAR(100),
    badges_count INT,
    last_synced_at DATETIME
);

CREATE TABLE codechef_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    username VARCHAR(100),
    rating INT,
    last_synced_at DATETIME
);

CREATE TABLE codeforces_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    username VARCHAR(100),
    rating INT,
    last_synced_at DATETIME
);

CREATE TABLE resume_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    file_id BIGINT,                      -- FK to files(id)
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_metadata_id BIGINT NOT NULL REFERENCES resume_metadata(id) ON DELETE CASCADE,
    version_number INT,
    file_id BIGINT,                      -- FK to files(id)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_downloads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    downloaded_by BIGINT REFERENCES users(id),
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_parsing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL UNIQUE REFERENCES resume_versions(id) ON DELETE CASCADE,
    parsed_data JSON,
    parsed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_ai_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL UNIQUE REFERENCES resume_versions(id) ON DELETE CASCADE,
    analysis JSON,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_ats_score (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL UNIQUE REFERENCES resume_versions(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    breakdown JSON
);

CREATE TABLE resume_keywords (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL UNIQUE REFERENCES resume_versions(id) ON DELETE CASCADE,
    keyword VARCHAR(100)
);

CREATE TABLE profile_completion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile_visibility (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    visibility VARCHAR(20) DEFAULT 'public'
);

CREATE TABLE student_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    verified_at DATETIME
);

CREATE TABLE student_badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    badge_type VARCHAR(100),
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    points INT DEFAULT 0,
    reason VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_searches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT,
    filters JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- RECRUITER MODULE
-- =========================================================

CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    name VARCHAR(255),
    headquarters VARCHAR(255) DEFAULT 'Bengaluru',
    company_size VARCHAR(100) DEFAULT '51-200 Employees',
    industry VARCHAR(100) DEFAULT 'Technology',
    website TEXT,
    user_id BIGINT REFERENCES users(id),
    logo_file_id BIGINT,                 -- FK to files(id)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recruiter_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id),
    designation VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    city_id BIGINT REFERENCES cities(id),
    address TEXT
);

CREATE TABLE company_verification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    verified_at DATETIME
);

CREATE TABLE company_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_id BIGINT,                      -- FK to files(id)
    document_type VARCHAR(100)
);

CREATE TABLE company_industry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    industry_id BIGINT NOT NULL REFERENCES industry_master(id),
    UNIQUE (company_id, industry_id)
);

CREATE TABLE company_size (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    size_range VARCHAR(50)               -- e.g. 11-50
);

CREATE TABLE company_culture (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT
);

CREATE TABLE company_benefits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    benefit VARCHAR(150)
);

CREATE TABLE company_social_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    url TEXT
);

CREATE TABLE company_gallery (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_id BIGINT                       -- FK to files(id)
);

CREATE TABLE recruiter_team (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (company_id, user_id)
);

CREATE TABLE recruiter_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_team_id BIGINT NOT NULL REFERENCES recruiter_team(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (recruiter_team_id, permission_id)
);

CREATE TABLE recruiter_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_name VARCHAR(100),
    starts_at DATETIME,
    ends_at DATETIME
);

CREATE TABLE company_billing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    billing_email VARCHAR(255),
    gst_number VARCHAR(50)
);

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_billing_id BIGINT NOT NULL REFERENCES company_billing(id) ON DELETE CASCADE,
    amount DECIMAL(12,2),
    currency_id BIGINT REFERENCES currency(id),
    status VARCHAR(20),
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(12,2),
    method VARCHAR(50),
    status VARCHAR(20),
    paid_at DATETIME
);

CREATE TABLE recruiter_activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_profile_id BIGINT NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(100),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INTERNSHIP MODULE
-- =========================================================

CREATE TABLE internships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    posted_by BIGINT REFERENCES users(id),
    company_name VARCHAR(255) DEFAULT 'Google',
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) DEFAULT 'Artificial Intelligence',
    description TEXT,
    stipend INT DEFAULT 45000,
    duration_weeks INT DEFAULT 12,
    openings INT DEFAULT 3,
    total_seats INT DEFAULT 3,
    location VARCHAR(100) DEFAULT 'Bengaluru',
    location_type VARCHAR(50) DEFAULT 'Hybrid',
    deadline DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internship_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    skill_id BIGINT REFERENCES skill_master(id),
    skill_name VARCHAR(100),
    UNIQUE (internship_id, skill_id)
);

CREATE TABLE internship_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES category_master(id),
    UNIQUE (internship_id, category_id)
);

CREATE TABLE internship_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    tag_name VARCHAR(100)
);

CREATE TABLE internship_requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    requirement TEXT
);

CREATE TABLE internship_benefits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    benefit VARCHAR(150)
);

CREATE TABLE internship_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    city_id BIGINT REFERENCES cities(id),
    is_remote BOOLEAN DEFAULT FALSE
);

CREATE TABLE internship_salary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    min_amount DECIMAL(12,2),
    max_amount DECIMAL(12,2),
    currency_id BIGINT REFERENCES currency(id)
);

CREATE TABLE internship_duration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    duration_months INT,
    start_date DATE
);

CREATE TABLE internship_eligibility (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    criteria TEXT
);

CREATE TABLE internship_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    question TEXT,
    is_required BOOLEAN DEFAULT FALSE
);

CREATE TABLE internship_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    file_id BIGINT                       -- FK to files(id)
);

CREATE TABLE internship_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    file_id BIGINT
);

CREATE TABLE internship_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    file_id BIGINT
);

CREATE TABLE internship_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft',  -- draft/active/closed/expired
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internship_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    total_views INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE featured_internships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    featured_from DATETIME,
    featured_until DATETIME
);

CREATE TABLE internship_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internship_saves (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (internship_id, user_id)
);

CREATE TABLE internship_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    reported_by BIGINT REFERENCES users(id),
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internship_approval (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL UNIQUE REFERENCES internships(id) ON DELETE CASCADE,
    reviewed_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_at DATETIME
);

CREATE TABLE internship_moderation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    flagged_reason TEXT,
    moderated_by BIGINT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE (user_id, internship_id)
);

CREATE TABLE wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE (user_id, internship_id)
);

CREATE TABLE recently_viewed (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- APPLICATION MODULE
-- =========================================================

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES student_profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    status VARCHAR(30) DEFAULT 'APPLIED',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_by BIGINT REFERENCES users(id),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_id BIGINT
);

CREATE TABLE application_resume (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    resume_version_id BIGINT NOT NULL REFERENCES resume_versions(id)
);

CREATE TABLE application_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    rated_by BIGINT REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE application_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    event VARCHAR(150),
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_ai_score (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    breakdown JSON
);

CREATE TABLE application_skill_match (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    skill_id BIGINT REFERENCES skill_master(id),
    match_score DECIMAL(5,2)
);

CREATE TABLE application_communication (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id),
    message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    given_by BIGINT REFERENCES users(id),
    feedback TEXT
);

CREATE TABLE application_withdraw (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    reason TEXT,
    withdrawn_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_archive (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INTERVIEW MODULE
-- =========================================================

CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_rounds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    round_number INT,
    round_type VARCHAR(50)               -- technical / HR / managerial
);

CREATE TABLE interview_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_round_id BIGINT NOT NULL UNIQUE REFERENCES interview_rounds(id) ON DELETE CASCADE,
    scheduled_at DATETIME,
    duration_minutes INT,
    meeting_link TEXT
);

CREATE TABLE interview_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_round_id BIGINT NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30)                     -- interviewer / candidate
);

CREATE TABLE interview_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_round_id BIGINT NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
    given_by BIGINT REFERENCES users(id),
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_rating (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_feedback_id BIGINT NOT NULL REFERENCES interview_feedback(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE interview_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
    result VARCHAR(20),                  -- selected / rejected / on_hold
    decided_at DATETIME
);

CREATE TABLE interview_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_round_id BIGINT NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
    note TEXT,
    author_id BIGINT REFERENCES users(id)
);

CREATE TABLE interview_recording (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_round_id BIGINT NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
    file_id BIGINT
);

CREATE TABLE interview_calendar (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_schedule_id BIGINT NOT NULL REFERENCES interview_schedule(id) ON DELETE CASCADE,
    calendar_event_id VARCHAR(255)
);

CREATE TABLE interview_reminder (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_schedule_id BIGINT NOT NULL REFERENCES interview_schedule(id) ON DELETE CASCADE,
    remind_at DATETIME,
    sent BOOLEAN DEFAULT FALSE
);

-- =========================================================
-- MESSAGING MODULE
-- =========================================================

CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (conversation_id, user_id)
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_id BIGINT
);

CREATE TABLE message_read_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at DATETIME,
    UNIQUE (message_id, user_id)
);

CREATE TABLE typing_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- NOTIFICATION MODULE
-- =========================================================

CREATE TABLE notification_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    title_template TEXT,
    body_template TEXT
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES notification_template(id),
    title VARCHAR(255),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at DATETIME,
    processed_at DATETIME
);

CREATE TABLE notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE push_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    device_token TEXT,
    delivered_at DATETIME
);

CREATE TABLE email_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    email_address VARCHAR(255),
    delivered_at DATETIME
);

CREATE TABLE sms_notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    delivered_at DATETIME
);

-- =========================================================
-- AI MODULE
-- =========================================================

CREATE TABLE career_advisor_chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_advisor_chat_id BIGINT NOT NULL REFERENCES career_advisor_chats(id) ON DELETE CASCADE,
    role VARCHAR(20),                    -- user / assistant
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prompt_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT,
    feature VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_version_id BIGINT NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    overall_rating DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_suggestions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_review_id BIGINT NOT NULL REFERENCES resume_reviews(id) ON DELETE CASCADE,
    suggestion TEXT
);

CREATE TABLE skill_gap_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    target_role VARCHAR(150),
    analysis JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_roadmap (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_gap_analysis_id BIGINT NOT NULL REFERENCES skill_gap_analysis(id) ON DELETE CASCADE,
    step_number INT,
    title VARCHAR(200),
    resource_url TEXT
);

CREATE TABLE mock_interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    topic VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mock_interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mock_interview_id BIGINT NOT NULL REFERENCES mock_interviews(id) ON DELETE CASCADE,
    question TEXT
);

CREATE TABLE mock_interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mock_interview_question_id BIGINT NOT NULL REFERENCES mock_interview_questions(id) ON DELETE CASCADE,
    answer TEXT,
    ai_feedback TEXT
);

CREATE TABLE mock_interview_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mock_interview_id BIGINT NOT NULL UNIQUE REFERENCES mock_interviews(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    breakdown JSON
);

CREATE TABLE career_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    predicted_role VARCHAR(150),
    confidence DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_engine_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    run_type VARCHAR(50),
    run_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    internship_id BIGINT REFERENCES internships(id) ON DELETE SET NULL,
    score DECIMAL(5,2),
    recommended_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_history_id BIGINT NOT NULL REFERENCES recommendation_history(id) ON DELETE CASCADE,
    is_helpful BOOLEAN,
    comment TEXT
);

CREATE TABLE learning_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200),
    resource_url TEXT
);

CREATE TABLE course_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_name VARCHAR(200),
    provider VARCHAR(150),
    course_url TEXT
);

-- =========================================================
-- SEARCH MODULE
-- =========================================================

CREATE TABLE search_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    query TEXT,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE popular_searches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    query_text VARCHAR(255) UNIQUE NOT NULL,
    search_count INT DEFAULT 0
);

CREATE TABLE search_filters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    filter_type VARCHAR(50),
    options JSON
);

CREATE TABLE saved_filters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150),
    filters JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recent_searches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- ADMIN MODULE
-- =========================================================

CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(100)
);

CREATE TABLE admin_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE admin_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_role_id BIGINT NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (admin_role_id, permission_id)
);

CREATE TABLE system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(150) UNIQUE NOT NULL,
    value TEXT
);

CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT REFERENCES admin_users(id),
    title VARCHAR(255),
    body TEXT,
    published_at DATETIME
);

CREATE TABLE banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    file_id BIGINT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cms_pages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reported_by BIGINT REFERENCES users(id),
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reported_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES report_categories(id),
    content_type VARCHAR(50),
    content_id BIGINT
);

CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    status VARCHAR(20) DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    support_ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id),
    message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_suspension (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suspended_by BIGINT REFERENCES admin_users(id),
    reason TEXT,
    suspended_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    lifted_at DATETIME
);

CREATE TABLE blacklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moderation_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_type VARCHAR(50),
    content_id BIGINT,
    submitted_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- ANALYTICS MODULE
-- =========================================================

CREATE TABLE user_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(14,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(14,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recruiter_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_profile_id BIGINT NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(14,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(14,2),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_usage_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(100),
    tokens_used INT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL,
    metrics JSON
);

CREATE TABLE monthly_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_month DATE UNIQUE NOT NULL,
    metrics JSON
);

CREATE TABLE yearly_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_year INT UNIQUE NOT NULL,
    metrics JSON
);

CREATE TABLE page_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    page_url TEXT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_name VARCHAR(150),
    metadata JSON,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clicks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    element_id VARCHAR(150)
);

CREATE TABLE conversion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversion_type VARCHAR(100),
    converted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE retention (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cohort_date DATE,
    is_retained BOOLEAN
);

-- =========================================================
-- FILES
-- =========================================================

CREATE TABLE files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255),
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    width INT,
    height INT
);

CREATE TABLE videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    duration_seconds INT
);

CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    page_count INT
);

CREATE TABLE cloudinary_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL UNIQUE REFERENCES files(id) ON DELETE CASCADE,
    public_id VARCHAR(255),
    asset_id VARCHAR(255)
);

CREATE TABLE uploads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE downloads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    downloaded_by BIGINT REFERENCES users(id),
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE resume_metadata          ADD CONSTRAINT fk_resume_metadata_file        FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE resume_versions          ADD CONSTRAINT fk_resume_versions_file         FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE companies                ADD CONSTRAINT fk_companies_logo               FOREIGN KEY (logo_file_id) REFERENCES files(id);
ALTER TABLE company_documents        ADD CONSTRAINT fk_company_documents_file       FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE company_gallery          ADD CONSTRAINT fk_company_gallery_file         FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE internship_attachments   ADD CONSTRAINT fk_internship_attachments_file  FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE internship_images        ADD CONSTRAINT fk_internship_images_file       FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE internship_videos        ADD CONSTRAINT fk_internship_videos_file       FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE application_documents    ADD CONSTRAINT fk_application_documents_file   FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE interview_recording      ADD CONSTRAINT fk_interview_recording_file     FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE message_attachments      ADD CONSTRAINT fk_message_attachments_file     FOREIGN KEY (file_id) REFERENCES files(id);
ALTER TABLE banners                  ADD CONSTRAINT fk_banners_file                 FOREIGN KEY (file_id) REFERENCES files(id);

-- =========================================================
-- APP EXTENSION TABLES (Daily Practice & Assessments)
-- =========================================================

CREATE TABLE IF NOT EXISTS daily_questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_date DATE UNIQUE NOT NULL,
    coding_title VARCHAR(255),
    coding_prompt TEXT,
    coding_difficulty VARCHAR(50),
    aptitude_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_date DATE NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    time_taken_seconds INT,
    correctness_score DECIMAL(5,2),
    approach_score DECIMAL(5,2),
    time_bonus DECIMAL(5,2),
    final_score DECIMAL(5,2),
    UNIQUE (user_id, question_date)
);

CREATE TABLE IF NOT EXISTS assessment_results (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_title VARCHAR(255),
    score DECIMAL(5,2),
    proctored_status VARCHAR(50),
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internship_required_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

-- =========================================================
-- INITIAL SEED DATA
-- =========================================================

INSERT IGNORE INTO users (id, username, name, email, phone, password, user_type, role, is_active, is_verified) VALUES
(1, 'google', 'Google Recruiter', 'recruiter@google.com', '9876543210', 'google123', 'recruiter', 'RECRUITER', TRUE, TRUE),
(9, 'vignesh', 'Vignesh Student', 'vignesh@gmail.com', '9876543211', 'vignesh123', 'student', 'STUDENT', TRUE, TRUE),
(100, 'admin', 'Admin User', 'admin@internmatch.ai', '9876543212', 'admin123', 'admin', 'ADMIN', TRUE, TRUE);

INSERT IGNORE INTO companies (id, company_name, name, website) VALUES
(1, 'Google', 'Google', 'https://careers.google.com');

INSERT IGNORE INTO student_profiles (id, user_id, first_name, last_name, name, college, branch, cgpa, city, state, github, leetcode) VALUES
(1, 9, 'Vignesh', 'Candidate', 'vignesh', 'Karpagam College of Engineering (KCE), Coimbatore, Tamil Nadu', 'Computer Science & Engineering', 8.9, 'Coimbatore', 'Tamil Nadu', 'vigneshsankarakumar-1605', 'vigneshsankarakumar-1605');

INSERT IGNORE INTO internships (id, company_id, posted_by, company_name, title, domain, description, stipend, duration_weeks, openings, total_seats, location, location_type, status) VALUES
(1, 1, 1, 'Google', 'AI & Machine Learning Research Intern', 'Artificial Intelligence', 'Work on Large Language Models, PyTorch neural net optimization, and web search features.', 50000, 12, 5, 5, 'Bengaluru', 'Hybrid', 'ACTIVE'),
(2, 1, 1, 'Google', 'Full-Stack Software Engineering Intern', 'Software Development', 'Build scalable web infrastructure using React, TypeScript, and high-performance microservices.', 45000, 12, 3, 3, 'Hyderabad', 'Hybrid', 'ACTIVE');

INSERT IGNORE INTO internship_required_skills (internship_id, skill_name) VALUES
(1, 'Python'), (1, 'Machine Learning'), (1, 'FastAPI'), (1, 'React'),
(2, 'React'), (2, 'Java'), (2, 'Node.js'), (2, 'SQL');

SET FOREIGN_KEY_CHECKS = 1;
