package com.internmatch.auth.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
                Integer.class, username, email
        );
        return count != null && count > 0;
    }

    public List<Map<String, Object>> findByUsernameOrEmail(String identifier) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
                identifier, identifier
        );
    }

    public void saveUser(String username, String name, String email, String password, String role) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                    username, name, email, password, role
            );
        } catch (Exception e) {}
    }

    public void saveStudentProfile(int userId, String name, String college, int gradYear, double cgpa,
                                   String location, String resumeFileName, String leetcode, String github,
                                   String yearOfStudy, String degree, String department) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, resume_file_name, leetcode, github, year_of_study, degree, branch, skills, resume_score, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'React, Java, SQL, Python', 88, 'Male')",
                    userId, name, college, gradYear, cgpa, location, resumeFileName, leetcode, github, yearOfStudy, degree, department
            );
        } catch (Exception e) {}
    }

    public void saveCompanyProfile(int userId, String companyName, String industry, String website,
                                   String location, String description) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO company_profiles (user_id, company_name, industry, website, location, description) VALUES (?, ?, ?, ?, ?, ?)",
                    userId, companyName, industry, website, location, description
            );
        } catch (Exception e) {}
    }
}
