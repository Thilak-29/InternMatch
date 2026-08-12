-- ====================================================================
-- InternMatch AI — Complete MySQL Workbench Database Script
-- Execute this script directly inside MySQL Workbench to initialize internmatch_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS internmatch_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internmatch_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'STUDENT',
  phone VARCHAR(50),
  gender VARCHAR(50),
  dob VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(150),
  college VARCHAR(255) DEFAULT 'PSG College of Technology',
  degree VARCHAR(100) DEFAULT 'B.Tech',
  branch VARCHAR(100) DEFAULT 'Software Engineering',
  department VARCHAR(100) DEFAULT 'Software Engineering',
  year_of_study VARCHAR(50) DEFAULT '4th Year',
  grad_year INT DEFAULT 2026,
  cgpa DECIMAL(4,2) DEFAULT 8.90,
  address VARCHAR(255) DEFAULT 'Coimbatore',
  phone VARCHAR(50),
  gender VARCHAR(50) DEFAULT 'Male',
  resume_file_name VARCHAR(255),
  leetcode VARCHAR(150),
  github VARCHAR(150),
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  skills TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(150) DEFAULT 'Software & Cloud Systems',
  website VARCHAR(255) DEFAULT 'https://nvidia.com',
  location VARCHAR(255) DEFAULT 'Coimbatore / Hybrid',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(100) DEFAULT 'Engineering',
  required_skills TEXT,
  work_mode VARCHAR(50) DEFAULT 'Hybrid',
  grad_year INT DEFAULT 2026,
  location VARCHAR(255) DEFAULT 'Coimbatore',
  duration VARCHAR(100) DEFAULT '3 Months',
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  stipend DECIMAL(10,2) DEFAULT 25000.00,
  openings INT DEFAULT 5,
  application_deadline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  internship_id INT NOT NULL,
  company_id INT DEFAULT 1,
  student_name VARCHAR(150),
  candidate_name VARCHAR(150),
  company_name VARCHAR(255),
  role_title VARCHAR(255),
  title VARCHAR(255),
  location VARCHAR(255),
  stipend DECIMAL(10,2),
  work_mode VARCHAR(50),
  duration VARCHAR(50),
  test_score DECIMAL(5,2) DEFAULT 0.00,
  match_score DECIMAL(5,2) DEFAULT 90.00,
  status VARCHAR(50) DEFAULT 'APPLIED',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'INFO',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- INITIAL SEED DATA FOR DEMO & TESTING
-- ====================================================================

-- Seed System Admin
INSERT INTO users (id, username, name, email, password_hash, role)
VALUES (15, 'thilakvignesh', 'Thilak Vignesh (Admin)', 'thilakvignesh@gmail.com', 'ThilakVignesh', 'ADMIN')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Recruiter Companies
INSERT INTO users (id, username, name, email, password_hash, role)
VALUES (30, 'nvidia', 'NVIDIA Corporation', 'recruiter@nvidia.com', 'nvidia123', 'COMPANY')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO companies (id, user_id, company_name, industry, website, location, description)
VALUES (1, 30, 'NVIDIA Corporation', 'AI & Cloud Infrastructure', 'https://nvidia.com', 'Bengaluru / Hybrid', 'Global AI compute leader')
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- Seed Sample Active Internships
INSERT INTO internships (id, company_id, company_name, title, domain, required_skills, work_mode, location, stipend, openings, status)
VALUES 
(1, 1, 'NVIDIA Corporation', 'Full-Stack AI Systems Intern', 'Software Engineering', 'React, Java, Spring Boot, SQL, Python', 'Hybrid', 'Coimbatore', 35000.00, 5, 'ACTIVE'),
(2, 1, 'NVIDIA Corporation', 'Backend Cloud Microservices Developer', 'Backend Engineering', 'Java, Spring Boot, MySQL, Docker, Kubernetes', 'Remote', 'Bengaluru', 40000.00, 3, 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

COMMIT;
