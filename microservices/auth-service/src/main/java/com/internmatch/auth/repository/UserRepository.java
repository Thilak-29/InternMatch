package com.internmatch.auth.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;

@Repository
public class UserRepository {

    private static final Logger log = LoggerFactory.getLogger(UserRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        if (list == null) return Collections.emptyList();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    public List<Map<String, Object>> findByUsernameOrEmail(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT id, username, name, email, password, role, created_at FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
                    identifier.trim(), identifier.trim()
            );
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Database error in findByUsernameOrEmail for identifier {}: {}", identifier, e.getMessage());
            return Collections.emptyList();
        }
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
                    Integer.class,
                    username != null ? username.trim() : "",
                    email != null ? email.trim() : ""
            );
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Database error in existsByUsernameOrEmail: {}", e.getMessage());
            return false;
        }
    }

    public int saveUser(String username, String name, String email, String password, String role) {
        try {
            // First check if user already exists
            List<Map<String, Object>> existing = findByUsernameOrEmail(email != null ? email : username);
            if (!existing.isEmpty()) {
                Object idObj = existing.get(0).get("id");
                if (idObj != null) {
                    return Integer.parseInt(idObj.toString());
                }
            }

            jdbcTemplate.update(
                    "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                    username.trim(), name.trim(), email.trim(), password, role.toUpperCase().trim()
            );

            // Fetch the newly generated user record
            List<Map<String, Object>> created = findByUsernameOrEmail(username.trim());
            if (!created.isEmpty()) {
                Object idObj = created.get(0).get("id");
                if (idObj != null) {
                    return Integer.parseInt(idObj.toString());
                }
            }
        } catch (Exception e) {
            log.error("Error creating user {}: {}", username, e.getMessage());
        }
        return -1;
    }

    public void saveStudentProfile(int userId, String name, String college, int gradYear, double cgpa,
                                   String location, String resumeFileName, String leetcode, String github,
                                   String yearOfStudy, String degree, String department, String gender,
                                   String linkedin, String portfolio, String skills) {
        if (userId <= 0) return;
        try {
            jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id = ?", userId);
            jdbcTemplate.update(
                    "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, resume_file_name, leetcode, github, year_of_study, degree, branch, gender, linkedin, portfolio, skills) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    userId, name, college, gradYear, cgpa, location, resumeFileName, leetcode, github, yearOfStudy, degree, department, gender, linkedin, portfolio, skills
            );
            log.info("Saved student profile for user_id {}", userId);
        } catch (Exception e) {
            log.error("Error saving student profile for user_id {}: {}", userId, e.getMessage());
            try {
                jdbcTemplate.update(
                        "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, leetcode, github, skills) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        userId, name, college, gradYear, cgpa, location, leetcode, github, skills
                );
            } catch (Exception e2) {
                log.error("Fallback error saving student profile for user_id {}: {}", userId, e2.getMessage());
            }
        }
    }

    public void saveCompanyProfile(int userId, String companyName, String industry, String website,
                                   String location, String description) {
        if (userId <= 0) return;
        try {
            jdbcTemplate.update("DELETE FROM companies WHERE user_id = ?", userId);
            jdbcTemplate.update(
                    "INSERT INTO companies (user_id, company_name, industry, website, location, description) VALUES (?, ?, ?, ?, ?, ?)",
                    userId, companyName, industry, website, location, description
            );
            log.info("Saved company profile for user_id {}", userId);
        } catch (Exception e) {
            log.error("Error saving company profile for user_id {}: {}", userId, e.getMessage());
        }
    }

    public List<Map<String, Object>> getAllUsersWithProfiles() {
        try {
            String sql = "SELECT u.id, u.username, u.name, u.email, u.role, u.created_at, " +
                    "sp.college, sp.branch, sp.degree, sp.cgpa, sp.skills, sp.leetcode, sp.github, sp.address as city, sp.gender, sp.year_of_study, sp.grad_year, sp.linkedin, sp.portfolio, " +
                    "c.company_name, c.industry, c.location as company_location, c.website " +
                    "FROM users u " +
                    "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                    "LEFT JOIN companies c ON u.id = c.user_id " +
                    "WHERE u.role != 'ADMIN' ORDER BY u.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql);
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Error querying all users with profiles: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public boolean deleteUserById(int userId) {
        if (userId <= 0) return false;
        try {
            jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM applications WHERE student_id = ? OR company_id = ?", userId, userId);
            jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM companies WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM internships WHERE company_id = ?", userId);
            int rows = jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
            return rows > 0;
        } catch (Exception e) {
            log.error("Error deleting user {}: {}", userId, e.getMessage());
            return false;
        }
    }
}
