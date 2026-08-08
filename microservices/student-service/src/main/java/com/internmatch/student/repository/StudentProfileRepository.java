package com.internmatch.student.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class StudentProfileRepository {

    private static final Logger log = LoggerFactory.getLogger(StudentProfileRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public StudentProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initSchemaColumns();
    }

    private void initSchemaColumns() {
        // Ensure student_profiles and users tables have phone, gender, dob columns in Oracle DB
        String[] alterQueries = {
                "ALTER TABLE student_profiles ADD (phone VARCHAR2(50))",
                "ALTER TABLE student_profiles ADD (gender VARCHAR2(50))",
                "ALTER TABLE student_profiles ADD (dob VARCHAR2(50))",
                "ALTER TABLE users ADD (phone VARCHAR2(50))",
                "ALTER TABLE users ADD (gender VARCHAR2(50))",
                "ALTER TABLE users ADD (dob VARCHAR2(50))"
        };
        for (String q : alterQueries) {
            try {
                jdbcTemplate.execute(q);
            } catch (Exception ignored) {
                // Column already exists
            }
        }
    }

    private Map<String, Object> normalizeMap(Map<String, Object> raw) {
        if (raw == null) return Collections.emptyMap();
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    public Map<String, Object> findByUserId(int userId) {
        if (userId <= 0) {
            return null;
        }
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT sp.*, u.username, u.name as user_name, u.email as user_email, " +
                            "u.phone as user_phone, u.gender as user_gender, u.dob as user_dob " +
                            "FROM student_profiles sp " +
                            "LEFT JOIN users u ON sp.user_id = u.id " +
                            "WHERE sp.user_id = ?",
                    userId
            );
            if (!dbRows.isEmpty()) {
                Map<String, Object> row = new HashMap<>(dbRows.get(0));
                // Fallback phone/gender to users table if student_profiles column is empty
                if ((row.get("phone") == null || row.get("phone").toString().trim().isEmpty()) && row.get("user_phone") != null) {
                    row.put("phone", row.get("user_phone"));
                }
                if ((row.get("gender") == null || row.get("gender").toString().trim().isEmpty()) && row.get("user_gender") != null) {
                    row.put("gender", row.get("user_gender"));
                }
                if ((row.get("dob") == null || row.get("dob").toString().trim().isEmpty()) && row.get("user_dob") != null) {
                    row.put("dob", row.get("user_dob"));
                }
                return normalizeMap(row);
            }

            // Check if user exists in users table but profile not yet completed
            List<Map<String, Object>> userRows = jdbcTemplate.queryForList(
                    "SELECT id, username, name, email, phone, gender, dob FROM users WHERE id = ?",
                    userId
            );
            if (!userRows.isEmpty()) {
                Map<String, Object> u = userRows.get(0);
                Map<String, Object> fresh = new HashMap<>();
                fresh.put("user_id", userId);
                fresh.put("id", userId);
                fresh.put("name", u.get("name"));
                fresh.put("email", u.get("email"));
                fresh.put("phone", u.get("phone") != null ? u.get("phone") : "");
                fresh.put("gender", u.get("gender") != null ? u.get("gender") : "Prefer not to say");
                fresh.put("dob", u.get("dob") != null ? u.get("dob") : "");
                fresh.put("username", u.get("username"));
                fresh.put("college", "Karpagam College of Engineering");
                fresh.put("degree", "B.E.");
                fresh.put("branch", "Computer Science & Engineering");
                fresh.put("department", "Computer Science & Engineering");
                fresh.put("year_of_study", "3rd Year");
                fresh.put("cgpa", 8.0);
                fresh.put("grad_year", 2026);
                fresh.put("address", "");
                fresh.put("location", "");
                fresh.put("skills", "");
                fresh.put("leetcode", "");
                fresh.put("github", "");
                fresh.put("linkedin", "");
                fresh.put("portfolio", "");
                fresh.put("bio", "");
                return normalizeMap(fresh);
            }
        } catch (Exception e) {
            log.error("Database error fetching profile for user_id {}: {}", userId, e.getMessage());
        }

        return null;
    }

    public void updateProfile(int userId, String name, String phone, String gender, String dob,
                              String college, int gradYear, double cgpa,
                              String location, String leetcode, String github, String yearOfStudy,
                              String degree, String branch, String linkedin,
                              String portfolio, String bio, String skills) {
        if (userId <= 0) return;
        try {
            // Update users table with name, phone, gender, dob
            jdbcTemplate.update(
                    "UPDATE users SET name = COALESCE(?, name), phone = ?, gender = ?, dob = ? WHERE id = ?",
                    (name != null && !name.trim().isEmpty()) ? name.trim() : null,
                    phone, gender, dob, userId
            );

            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM student_profiles WHERE user_id = ?",
                    Integer.class, userId
            );

            if (count != null && count > 0) {
                try {
                    jdbcTemplate.update(
                            "UPDATE student_profiles SET name = ?, phone = ?, gender = ?, dob = ?, college = ?, grad_year = ?, cgpa = ?, address = ?, " +
                                    "leetcode = ?, github = ?, year_of_study = ?, degree = ?, branch = ?, " +
                                    "linkedin = ?, portfolio = ?, bio = ?, skills = ? WHERE user_id = ?",
                            name, phone, gender, dob, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills, userId
                    );
                } catch (Exception e) {
                    // Fallback without new columns if needed
                    jdbcTemplate.update(
                            "UPDATE student_profiles SET name = ?, college = ?, grad_year = ?, cgpa = ?, address = ?, " +
                                    "leetcode = ?, github = ?, year_of_study = ?, degree = ?, branch = ?, " +
                                    "linkedin = ?, portfolio = ?, bio = ?, skills = ? WHERE user_id = ?",
                            name, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills, userId
                    );
                }
            } else {
                try {
                    jdbcTemplate.update(
                            "INSERT INTO student_profiles (user_id, name, phone, gender, dob, college, grad_year, cgpa, address, leetcode, github, year_of_study, degree, branch, linkedin, portfolio, bio, skills) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            userId, name, phone, gender, dob, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills
                    );
                } catch (Exception e) {
                    jdbcTemplate.update(
                            "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, leetcode, github, year_of_study, degree, branch, linkedin, portfolio, bio, skills) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            userId, name, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills
                    );
                }
            }
            log.info("Successfully persisted phone, gender, and student profile for user_id {}", userId);
        } catch (Exception e) {
            log.error("Error updating profile for user_id {}: {}", userId, e.getMessage());
        }
    }
}
