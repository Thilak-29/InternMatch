-- InternMatch AI Platform - Oracle Database Schema Definition
-- Universal Oracle Version Compatibility (Oracle 10g/11g/12c/19c/21c)

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE notifications CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE applications CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE screening_tests CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE internships CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE companies CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE student_profiles CASCADE CONSTRAINTS';
   EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_users';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_student_profiles';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_companies';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_internships';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_screening_tests';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_applications';
   EXECUTE IMMEDIATE 'DROP SEQUENCE seq_notifications';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- Sequences
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_student_profiles START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_companies START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_internships START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_screening_tests START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_applications START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_notifications START WITH 1 INCREMENT BY 1 NOCACHE;

-- 1. Users Table
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(100) NOT NULL UNIQUE,
    name VARCHAR2(150),
    email VARCHAR2(150) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER trg_users_bi
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_users.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 2. Student Profiles Table
CREATE TABLE student_profiles (
    id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL UNIQUE,
    name VARCHAR2(150),
    phone VARCHAR2(30),
    dob VARCHAR2(30),
    gender VARCHAR2(20),
    address VARCHAR2(500),
    college VARCHAR2(200),
    degree VARCHAR2(100),
    branch VARCHAR2(100),
    year_of_study VARCHAR2(20),
    cgpa NUMBER(4,2) DEFAULT 8.5,
    grad_year NUMBER(4) DEFAULT 2026,
    skills VARCHAR2(1000),
    github VARCHAR2(150),
    leetcode VARCHAR2(150),
    linkedin VARCHAR2(150),
    portfolio VARCHAR2(150),
    codechef VARCHAR2(150),
    hackerrank VARCHAR2(150),
    bio VARCHAR2(1000),
    resume_file_name VARCHAR2(255),
    resume_parsed_text VARCHAR2(2000),
    resume_score NUMBER(3) DEFAULT 82,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER trg_student_profiles_bi
BEFORE INSERT ON student_profiles
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_student_profiles.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 3. Companies Table
CREATE TABLE companies (
    id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL UNIQUE,
    company_name VARCHAR2(150) NOT NULL,
    industry VARCHAR2(100),
    website VARCHAR2(150),
    location VARCHAR2(150),
    description VARCHAR2(2000),
    CONSTRAINT fk_company_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER trg_companies_bi
BEFORE INSERT ON companies
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_companies.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 4. Internships Table
CREATE TABLE internships (
    id NUMBER PRIMARY KEY,
    company_id NUMBER NOT NULL,
    company_name VARCHAR2(150) NOT NULL,
    title VARCHAR2(150) NOT NULL,
    domain VARCHAR2(100),
    required_skills VARCHAR2(1000),
    work_mode VARCHAR2(50) DEFAULT 'Hybrid',
    grad_year NUMBER(4) DEFAULT 2026,
    location VARCHAR2(150),
    duration VARCHAR2(50) DEFAULT '3 Months',
    start_date VARCHAR2(30),
    end_date VARCHAR2(30),
    stipend NUMBER(10,2) DEFAULT 25000,
    openings NUMBER(5) DEFAULT 5,
    status VARCHAR2(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER trg_internships_bi
BEFORE INSERT ON internships
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_internships.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 5. Screening Tests Table
CREATE TABLE screening_tests (
    id NUMBER PRIMARY KEY,
    internship_id NUMBER NOT NULL,
    test_title VARCHAR2(150) NOT NULL,
    passing_score NUMBER(3) DEFAULT 60,
    duration_minutes NUMBER(4) DEFAULT 45,
    aptitude_json VARCHAR2(2000),
    coding_json VARCHAR2(2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER trg_screening_tests_bi
BEFORE INSERT ON screening_tests
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_screening_tests.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 6. Applications Table
CREATE TABLE applications (
    id NUMBER PRIMARY KEY,
    student_id NUMBER NOT NULL,
    internship_id NUMBER NOT NULL,
    status VARCHAR2(50) DEFAULT 'APPLIED',
    timeline_stage VARCHAR2(50) DEFAULT 'APPLIED',
    test_score NUMBER(5,2) DEFAULT 0,
    ai_resume_match NUMBER(3) DEFAULT 85,
    offer_letter_url VARCHAR2(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER trg_applications_bi
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_applications.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/

-- 7. Notifications Table
CREATE TABLE notifications (
    id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    message VARCHAR2(1000) NOT NULL,
    type VARCHAR2(50) DEFAULT 'GENERAL',
    is_read NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER trg_notifications_bi
BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_notifications.NEXTVAL INTO :NEW.id FROM DUAL;
    END IF;
END;
/
