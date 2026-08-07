-- =========================================================
-- INTERNMATCH AI — MYSQL WORKBENCH DATABASE SCHEMA (MySQL 8.0)
-- Host: localhost:3306 | User: root | Password: root
-- Database: internmatch_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS internmatch_db;
USE internmatch_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    college VARCHAR(255),
    branch VARCHAR(100) DEFAULT 'Computer Science & Engineering',
    cgpa DECIMAL(4,2) DEFAULT 8.50,
    grad_year INT DEFAULT 2026,
    city VARCHAR(100),
    state VARCHAR(100),
    github VARCHAR(255),
    leetcode VARCHAR(255),
    linkedin VARCHAR(255),
    bio TEXT,
    resume_filename VARCHAR(255) DEFAULT 'Candidate_Resume.pdf',
    total_practice_score DECIMAL(10,2) DEFAULT 0.00,
    tests_completed INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    headquarters VARCHAR(255) DEFAULT 'Bengaluru',
    company_size VARCHAR(100) DEFAULT '51-200 Employees',
    industry VARCHAR(100) DEFAULT 'Technology',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS internships (
    internship_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) DEFAULT 'Artificial Intelligence',
    description TEXT,
    stipend INT DEFAULT 45000,
    duration_weeks INT DEFAULT 12,
    openings INT DEFAULT 3,
    total_seats INT DEFAULT 3,
    location VARCHAR(255) DEFAULT 'Bengaluru',
    location_type VARCHAR(50) DEFAULT 'Hybrid',
    deadline DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_deleted TINYINT DEFAULT 0,
    posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 5. INTERNSHIP REQUIRED SKILLS
CREATE TABLE IF NOT EXISTS internship_required_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE
);

-- 6. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPLIED',
    cover_note TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 8. DAILY QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS daily_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(10) UNIQUE NOT NULL,
    coding_question JSON NOT NULL,
    aptitude_questions JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. DAILY ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS daily_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_date VARCHAR(10) NOT NULL,
    coding_answer TEXT,
    aptitude_answers JSON,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME NULL,
    time_taken_seconds INT DEFAULT 0,
    correctness_score DECIMAL(5,2) DEFAULT 0.00,
    approach_score DECIMAL(5,2) DEFAULT 0.00,
    time_bonus DECIMAL(5,2) DEFAULT 0.00,
    final_score DECIMAL(5,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_daily_attempt (user_id, question_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 10. ASSESSMENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS assessment_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT DEFAULT 1,
    application_id INT DEFAULT 1,
    user_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.00,
    malpractice_flags INT DEFAULT 0,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- SEED INITIAL SEED DATA
INSERT IGNORE INTO users (user_id, username, name, email, password, role) VALUES
(1, 'google', 'Google India Recruiter', 'recruiter@google.com', 'pass123', 'COMPANY'),
(9, 'vignesh', 'vignesh', 'vignesh@gmail.com', 'vignesh123', 'STUDENT'),
(10, 'admin', 'SIH Super Admin', 'admin@pm scheme.gov.in', 'admin123', 'ADMIN');

INSERT IGNORE INTO student_profiles (profile_id, user_id, name, phone, college, branch, cgpa, grad_year, city, state, github, leetcode, bio, total_practice_score, tests_completed) VALUES
(1, 9, 'vignesh', '9876543210', 'Karpagam College of Engineering (KCE), Coimbatore, Tamil Nadu', 'Computer Science & Engineering', 8.90, 2026, 'Coimbatore', 'Tamil Nadu', 'vigneshsankarakumar-1605', 'vigneshsankarakumar-1605', 'Passionate AI engineer & competitive coder aiming for PM Scheme internships.', 98.50, 1);

INSERT IGNORE INTO companies (company_id, user_id, company_name, headquarters, company_size, industry) VALUES
(1, 1, 'Google', 'Bengaluru', '10000+ Employees', 'Artificial Intelligence & Search');

INSERT IGNORE INTO internships (internship_id, company_id, company_name, title, domain, description, stipend, duration_weeks, openings, total_seats, location, location_type, deadline, status) VALUES
(1, 1, 'Google', 'AI & Machine Learning Research Intern', 'Artificial Intelligence', 'Work on Large Language Models, PyTorch neural net optimization, and web search features.', 50000, 12, 5, 5, 'Bengaluru', 'Hybrid', '2026-08-30', 'ACTIVE'),
(2, 1, 'Google', 'Full-Stack Software Engineering Intern', 'Software Development', 'Build scalable web infrastructure using React, TypeScript, and high-performance microservices.', 45000, 12, 3, 3, 'Hyderabad', 'Hybrid', '2026-08-30', 'ACTIVE');

INSERT IGNORE INTO internship_required_skills (internship_id, skill_name) VALUES
(1, 'Python'), (1, 'Machine Learning'), (1, 'FastAPI'), (1, 'React'),
(2, 'React'), (2, 'Java'), (2, 'Node.js'), (2, 'SQL');

INSERT IGNORE INTO student_skills (user_id, skill_name) VALUES
(9, 'Python'), (9, 'React'), (9, 'Machine Learning'), (9, 'FastAPI'), (9, 'C++'), (9, 'SQL');
