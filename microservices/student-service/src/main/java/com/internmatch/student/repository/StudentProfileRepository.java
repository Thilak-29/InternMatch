package com.internmatch.student.repository;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class StudentProfileRepository {

    private static final Logger log = LoggerFactory.getLogger(StudentProfileRepository.class);
    private final JdbcTemplate jdbcTemplate;

    private final Map<Integer, Map<String, Object>> profileCache = new ConcurrentHashMap<>();

    public StudentProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initSchema() {
        log.info("Ensuring student_profiles table schema contains all profile columns...");
        String[] columns = {
            "bio TEXT",
            "leetcode VARCHAR(500)",
            "github VARCHAR(500)",
            "linkedin VARCHAR(500)",
            "portfolio VARCHAR(500)",
            "address VARCHAR(1000)",
            "location VARCHAR(500)",
            "year_of_study VARCHAR(100)",
            "phone VARCHAR(100)",
            "gender VARCHAR(100)",
            "dob VARCHAR(100)",
            "skills VARCHAR(2000)",
            "avatar_url VARCHAR(1000)",
            "resume_file_name VARCHAR(500)",
            "resume_content_type VARCHAR(100)",
            "resume_text TEXT"
        };

        for (String col : columns) {
            try {
                jdbcTemplate.execute("ALTER TABLE student_profiles ADD COLUMN " + col);
            } catch (Exception ignored) {
                try {
                    // Try Oracle ALTER syntax if MySQL syntax failed
                    jdbcTemplate.execute("ALTER TABLE student_profiles ADD (" + col.replace("TEXT", "VARCHAR2(2000)").replace("VARCHAR", "VARCHAR2") + ")");
                } catch (Exception ignored2) {}
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
        if (userId <= 0) return null;

        if (profileCache.containsKey(userId)) {
            return profileCache.get(userId);
        }

        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT u.name as user_name, u.email as user_email, sp.* " +
                            "FROM users u " +
                            "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                            "WHERE u.id = ?",
                    userId
            );
            if (!dbRows.isEmpty()) {
                Map<String, Object> row = new HashMap<>(dbRows.get(0));
                if ((row.get("name") == null || row.get("name").toString().trim().isEmpty() || "Student Candidate".equalsIgnoreCase(row.get("name").toString().trim())) && row.get("user_name") != null) {
                    row.put("name", row.get("user_name"));
                }
                Map<String, Object> norm = normalizeMap(row);
                profileCache.put(userId, norm);
                return norm;
            }

            List<Map<String, Object>> userRows = jdbcTemplate.queryForList(
                    "SELECT id, name, email FROM users WHERE id = ?",
                    userId
            );
            if (!userRows.isEmpty()) {
                Map<String, Object> u = userRows.get(0);
                String emailStr = u.get("email") != null ? u.get("email").toString() : "";
                String defaultName = u.get("name") != null && !u.get("name").toString().trim().isEmpty()
                        ? u.get("name").toString().trim()
                        : (emailStr.contains("@") ? emailStr.split("@")[0] : "Student Candidate");

                Map<String, Object> fresh = new HashMap<>();
                fresh.put("user_id", userId);
                fresh.put("id", userId);
                fresh.put("name", defaultName);
                fresh.put("email", emailStr);
                fresh.put("phone", u.get("phone") != null ? u.get("phone") : "");
                fresh.put("gender", u.get("gender") != null ? u.get("gender") : "Prefer not to say");
                fresh.put("dob", u.get("dob") != null ? u.get("dob") : "");
                fresh.put("college", "");
                fresh.put("degree", "");
                fresh.put("branch", "");
                fresh.put("department", "");
                fresh.put("year_of_study", "");
                fresh.put("cgpa", "");
                fresh.put("grad_year", 2026);
                fresh.put("address", "");
                fresh.put("location", "");
                fresh.put("skills", "");
                fresh.put("bio", "");
                fresh.put("leetcode", "");
                fresh.put("github", "");
                fresh.put("linkedin", "");
                fresh.put("portfolio", "");
                Map<String, Object> norm = normalizeMap(fresh);
                profileCache.put(userId, norm);
                return norm;
            }
        } catch (Exception e) {
            log.warn("DB fetch for user_id {} notice: {}, using default structure", userId, e.getMessage());
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("user_id", userId);
        fallback.put("id", userId);
        fallback.put("name", "");
        fallback.put("email", "");
        fallback.put("phone", "");
        fallback.put("gender", "Prefer not to say");
        fallback.put("college", "");
        fallback.put("degree", "");
        fallback.put("branch", "");
        fallback.put("year_of_study", "");
        fallback.put("cgpa", "");
        fallback.put("grad_year", 2026);
        fallback.put("address", "");
        fallback.put("skills", "");
        fallback.put("bio", "");
        fallback.put("leetcode", "");
        fallback.put("github", "");
        fallback.put("linkedin", "");
        fallback.put("portfolio", "");
        Map<String, Object> norm = normalizeMap(fallback);
        profileCache.put(userId, norm);
        return norm;
    }

    public void updateProfile(int userId, String name, String phone, String gender, String dob,
                              String college, int gradYear, double cgpa,
                              String location, String leetcode, String github, String yearOfStudy,
                              String degree, String branch, String linkedin,
                              String portfolio, String bio, String skills, String avatarUrl) {
        if (userId <= 0) return;

        Map<String, Object> updated = new HashMap<>();
        updated.put("user_id", userId);
        updated.put("id", userId);
        updated.put("name", name);
        updated.put("phone", phone);
        updated.put("gender", gender);
        updated.put("dob", dob);
        updated.put("college", college);
        updated.put("grad_year", gradYear);
        updated.put("cgpa", cgpa);
        updated.put("address", location);
        updated.put("location", location);
        updated.put("leetcode", leetcode);
        updated.put("github", github);
        updated.put("year_of_study", yearOfStudy);
        updated.put("degree", degree);
        updated.put("branch", branch);
        updated.put("department", branch);
        updated.put("linkedin", linkedin);
        updated.put("portfolio", portfolio);
        updated.put("bio", bio);
        updated.put("skills", skills);
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            updated.put("avatar_url", avatarUrl);
            updated.put("avatar", avatarUrl);
        }

        // 1. Synchronously persist to Database (users + student_profiles)
        try {
            if (name != null && !name.trim().isEmpty()) {
                try {
                    jdbcTemplate.update("UPDATE users SET name = ? WHERE id = ?", name.trim(), userId);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        try {
            Integer count = 0;
            try {
                count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_profiles WHERE user_id = ?", Integer.class, userId);
            } catch (Exception ignored) {}

            if (count != null && count > 0) {
                try {
                    jdbcTemplate.update(
                            "UPDATE student_profiles SET name = ?, phone = ?, gender = ?, dob = ?, college = ?, grad_year = ?, cgpa = ?, address = ?, " +
                                    "leetcode = ?, github = ?, year_of_study = ?, degree = ?, branch = ?, linkedin = ?, portfolio = ?, bio = ?, skills = ?, avatar_url = ? " +
                                    "WHERE user_id = ?",
                            name, phone, gender, dob, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills, avatarUrl, userId
                    );
                } catch (Exception e) {
                    jdbcTemplate.update(
                            "UPDATE student_profiles SET name = ?, college = ?, grad_year = ?, cgpa = ?, degree = ?, branch = ?, skills = ?, avatar_url = ? WHERE user_id = ?",
                            name, college, gradYear, cgpa, degree, branch, skills, avatarUrl, userId
                    );
                }
            } else {
                try {
                    jdbcTemplate.update(
                            "INSERT INTO student_profiles (user_id, name, phone, gender, dob, college, grad_year, cgpa, address, leetcode, github, year_of_study, degree, branch, linkedin, portfolio, bio, skills, avatar_url) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            userId, name, phone, gender, dob, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, linkedin, portfolio, bio, skills, avatarUrl
                    );
                } catch (Exception e) {
                    jdbcTemplate.update(
                            "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, degree, branch, skills, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            userId, name, college, gradYear, cgpa, degree, branch, skills, avatarUrl
                    );
                }
            }
            log.info("Database profile persistence successful for user_id {}", userId);
        } catch (Exception e) {
            log.warn("Database profile persistence error for user_id {}: {}", userId, e.getMessage());
        }

        // 2. Store in memory cache
        profileCache.put(userId, normalizeMap(updated));

        // 3. Background sync to company-service
        new Thread(() -> {
            try {
                java.net.URL url = new java.net.URL("http://localhost:8083/api/v1/company/profile/sync");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                String jsonPayload = String.format(
                        "{\"user_id\":%d, \"name\":\"%s\", \"phone\":\"%s\", \"college\":\"%s\", \"degree\":\"%s\", \"branch\":\"%s\", \"cgpa\":%s, \"skills\":\"%s\"}",
                        userId,
                        name != null ? name : "",
                        phone != null ? phone : "",
                        college != null ? college : "",
                        degree != null ? degree : "",
                        branch != null ? branch : "",
                        String.valueOf(cgpa),
                        skills != null ? skills : ""
                );
                conn.getOutputStream().write(jsonPayload.getBytes("UTF-8"));
                conn.getResponseCode();
            } catch (Exception ignored) {}
        }).start();
    }

    public void updateResumeScore(int userId, int score, String fileName) {
        if (userId <= 0) return;
        if (profileCache.containsKey(userId)) {
            Map<String, Object> cached = profileCache.get(userId);
            cached.put("resume_score", score);
            cached.put("RESUME_SCORE", score);
            if (fileName != null && !fileName.trim().isEmpty()) {
                cached.put("resume_file_name", fileName);
                cached.put("RESUME_FILE_NAME", fileName);
            }
        }
        try {
            jdbcTemplate.update("UPDATE student_profiles SET resume_score = ?, resume_file_name = ? WHERE user_id = ?", score, fileName, userId);
            log.info("Updated resume_score={} for user_id={}", score, userId);
        } catch (Exception e) {
            try {
                jdbcTemplate.update("UPDATE student_profiles SET resume_score = ? WHERE user_id = ?", score, userId);
            } catch (Exception ignored) {}
        }
    }

    public void updateResumeText(int userId, String text) {
        if (userId <= 0 || text == null) return;
        if (profileCache.containsKey(userId)) {
            Map<String, Object> cached = profileCache.get(userId);
            cached.put("resume_text", text);
            cached.put("RESUME_TEXT", text);
        }
        try {
            jdbcTemplate.update("UPDATE student_profiles SET resume_text = ? WHERE user_id = ?", text, userId);
        } catch (Exception ignored) {}
    }

    public void saveResumeData(int userId, byte[] data, String fileName, String contentType) {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_profiles WHERE user_id = ?", Integer.class, userId);
            if (count == null || count == 0) {
                jdbcTemplate.update("INSERT INTO student_profiles (user_id, resume_file_name, resume_content_type, resume_data) VALUES (?, ?, ?, ?)", userId, fileName, contentType != null ? contentType : "application/pdf", data);
            } else {
                jdbcTemplate.update(
                    "UPDATE student_profiles SET resume_data = ?, resume_file_name = ?, resume_content_type = ? WHERE user_id = ?",
                    data, fileName, contentType != null ? contentType : "application/pdf", userId
                );
            }
            if (profileCache.containsKey(userId)) {
                profileCache.get(userId).put("resume_file_name", fileName);
                profileCache.get(userId).put("RESUME_FILE_NAME", fileName);
                profileCache.get(userId).put("resume_content_type", contentType);
            }
            log.info("Saved resume binary ({} bytes) for user_id={}", data != null ? data.length : 0, userId);
        } catch (Exception e) {
            log.warn("Could not save resume_data for user_id={}: {}", userId, e.getMessage());
        }
    }

    public Map<String,Object> getResumeData(int userId) {
        try {
            List<Map<String,Object>> rows = jdbcTemplate.queryForList(
                "SELECT resume_data, resume_file_name, resume_content_type FROM student_profiles WHERE user_id = ?",
                userId
            );
            if (!rows.isEmpty()) return rows.get(0);
        } catch (Exception e) {
            log.warn("Could not fetch resume_data for user_id={}: {}", userId, e.getMessage());
        }
        return Collections.emptyMap();
    }
}
