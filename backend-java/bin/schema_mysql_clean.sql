CREATE DATABASE IF NOT EXISTS internmatch_db;
USE internmatch_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS ai_chats;
DROP TABLE IF EXISTS assessment_results;
DROP TABLE IF EXISTS daily_attempts;
DROP TABLE IF EXISTS daily_questions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS internship_skills;
DROP TABLE IF EXISTS internships;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT',
    user_type VARCHAR(20) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(20),
    college VARCHAR(255),
    branch VARCHAR(255),
    cgpa DECIMAL(4,2) DEFAULT 8.50,
    city VARCHAR(100),
    state VARCHAR(100),
    github VARCHAR(255),
    leetcode VARCHAR(255),
    bio TEXT,
    total_practice_score DECIMAL(7,2) DEFAULT 0.0,
    tests_completed INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    company_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    headquarters VARCHAR(255) DEFAULT 'Bengaluru',
    company_size VARCHAR(100) DEFAULT '51-200 Employees',
    industry VARCHAR(100) DEFAULT 'Technology',
    website VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE internships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT,
    posted_by BIGINT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE internship_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(255),
    status VARCHAR(30) DEFAULT 'APPLIED',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    round_type VARCHAR(50) DEFAULT 'Technical',
    scheduled_at DATETIME,
    meeting_link VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    body TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_date DATE UNIQUE NOT NULL,
    coding_title VARCHAR(255),
    coding_prompt TEXT,
    coding_difficulty VARCHAR(50),
    aptitude_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_date DATE NOT NULL,
    time_taken_seconds INT DEFAULT 90,
    final_score DECIMAL(5,2) DEFAULT 98.5,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, question_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE assessment_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    test_title VARCHAR(255),
    score DECIMAL(5,2),
    proctored_status VARCHAR(50) DEFAULT 'PASSED',
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    prompt TEXT,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (id, username, name, email, password, role, user_type) VALUES
(1, 'google', 'Google Recruiter', 'recruiter@google.com', 'google123', 'RECRUITER', 'recruiter'),
(9, 'vignesh', 'Vignesh Student', 'vignesh@gmail.com', 'vignesh123', 'STUDENT', 'student'),
(100, 'admin', 'Admin User', 'admin@internmatch.ai', 'admin123', 'ADMIN', 'admin');

INSERT INTO companies (id, user_id, company_name, name, headquarters, company_size, industry, website) VALUES
(1, 1, 'Google', 'Google', 'Bengaluru', '51-200 Employees', 'Technology', 'https://careers.google.com');

INSERT INTO student_profiles (id, user_id, name, phone, college, branch, cgpa, city, state, github, leetcode, bio, total_practice_score, tests_completed) VALUES
(1, 9, 'Vignesh Student', '9876543211', 'Karpagam College of Engineering (KCE), Coimbatore, Tamil Nadu', 'Computer Science & Engineering', 8.90, 'Coimbatore', 'Tamil Nadu', 'vigneshsankarakumar-1605', 'vigneshsankarakumar-1605', 'Passionate AI developer', 150.0, 3);

INSERT INTO internships (id, company_id, posted_by, company_name, title, domain, description, stipend, duration_weeks, openings, total_seats, location, location_type, status) VALUES
(1, 1, 1, 'Google', 'AI & Machine Learning Research Intern', 'Artificial Intelligence', 'Work on Large Language Models, PyTorch neural net optimization, and web search features.', 50000, 12, 5, 5, 'Bengaluru', 'Hybrid', 'ACTIVE'),
(2, 1, 1, 'Google', 'Full-Stack Software Engineering Intern', 'Software Development', 'Build scalable web infrastructure using React, TypeScript, and high-performance microservices.', 45000, 12, 3, 3, 'Hyderabad', 'Hybrid', 'ACTIVE');

INSERT INTO internship_skills (internship_id, skill_name) VALUES
(1, 'Python'), (1, 'Machine Learning'), (1, 'FastAPI'), (1, 'React'),
(2, 'React'), (2, 'Java'), (2, 'Node.js'), (2, 'SQL');

SET FOREIGN_KEY_CHECKS = 1;
