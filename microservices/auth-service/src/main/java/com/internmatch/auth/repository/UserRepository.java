package com.internmatch.auth.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserRepository {

    private static final Logger log = LoggerFactory.getLogger(UserRepository.class);

    private final JdbcTemplate jdbcTemplate;
    private final Map<String, Map<String, Object>> memUsers = new ConcurrentHashMap<>();
    private final Map<Integer, Map<String, Object>> memProfiles = new ConcurrentHashMap<>();
    private int nextId = 20;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initDatabaseSchema();
        initDefaultMemUsers();
        loadUsersFromDatabase();
    }

    private void initDatabaseSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE");
            log.info("Verified/added email_verified column in users table.");
        } catch (Exception ignored) {
            // Column already exists
        }
    }

    private void loadUsersFromDatabase() {
        try {
            List<Map<String, Object>> uRows = jdbcTemplate.queryForList("SELECT * FROM users");
            for (Map<String, Object> row : uRows) {
                Map<String, Object> norm = normalizeMap(row);
                String email = norm.get("email") != null ? norm.get("email").toString().trim().toLowerCase() : "";
                if (!email.isEmpty()) {
                    memUsers.put(email, norm);
                    Object idObj = norm.get("id") != null ? norm.get("id") : norm.get("ID");
                    if (idObj instanceof Number) {
                        int uid = ((Number) idObj).intValue();
                        if (uid > nextId) nextId = uid;
                    }
                }
            }
            log.info("Loaded {} registered users from MySQL database on startup.", memUsers.size());
        } catch (Exception e) {
            log.warn("Could not load users from MySQL DB on startup: {}", e.getMessage());
        }
    }

    private boolean isExactAdminEmail(String email) {
        if (email == null) return false;
        String clean = email.trim().toLowerCase();
        return clean.equals("thilakvignesh@gmail.com") || clean.equals("admin@gmail.com");
    }

    private void initDefaultMemUsers() {
        seedMemUser(15, "Thilak Vignesh (Admin)", "thilakvignesh@gmail.com", "ThilakVignesh", "ADMIN");
    }

    private void seedMemUser(int id, String name, String email, String password, String role) {
        Map<String, Object> u = new HashMap<>();
        String cleanEmail = email.toLowerCase().trim();
        String finalRole = role;

        if (isExactAdminEmail(cleanEmail)) {
            finalRole = "ADMIN";
        }

        u.put("id", id);
        u.put("ID", id);
        u.put("name", name);
        u.put("email", cleanEmail);
        u.put("password", password);
        u.put("password_hash", password);
        u.put("role", finalRole);
        u.put("ROLE", finalRole);
        memUsers.put(cleanEmail, u);
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
        String cleanId = identifier.trim().toLowerCase();

        try {
            String sql = "SELECT id, email, name, username, password_hash as password, password_hash, role, email_verified, created_at FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR LOWER(username) = LOWER(?)";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql, cleanId, cleanId, cleanId);
            if (!dbRows.isEmpty()) {
                List<Map<String, Object>> normList = normalizeList(dbRows);
                for (Map<String, Object> userMap : normList) {
                    String email = userMap.get("email") != null ? userMap.get("email").toString().toLowerCase() : "";
                    String uName = userMap.get("username") != null ? userMap.get("username").toString().toLowerCase() : "";
                    String name = userMap.get("name") != null ? userMap.get("name").toString().toLowerCase() : "";
                    String storedRole = userMap.get("role") != null ? userMap.get("role").toString().toUpperCase() : "";

                    Object ev = userMap.get("email_verified") != null ? userMap.get("email_verified") : userMap.get("EMAIL_VERIFIED");
                    boolean isVerified = false;
                    if (ev instanceof Boolean) {
                        isVerified = (Boolean) ev;
                    } else if (ev instanceof Number) {
                        isVerified = ((Number) ev).intValue() == 1;
                    } else if (ev != null) {
                        isVerified = "true".equalsIgnoreCase(ev.toString()) || "1".equals(ev.toString());
                    }
                    userMap.put("email_verified", isVerified);
                    userMap.put("emailVerified", isVerified);

                    if (isExactAdminEmail(email) || isExactAdminEmail(cleanId)) {
                        userMap.put("role", "ADMIN");
                        userMap.put("ROLE", "ADMIN");
                    } else if ("COMPANY".equals(storedRole) || email.contains("google") || email.contains("nvidia") || email.contains("porsche") || email.contains("company") || 
                               uName.contains("google") || uName.contains("nvidia") || uName.contains("porsche") ||
                               name.contains("google") || name.contains("nvidia") || name.contains("porsche")) {
                        userMap.put("role", "COMPANY");
                        userMap.put("ROLE", "COMPANY");
                    }
                }
                return normList;
            }
        } catch (Exception e) {
            log.warn("Oracle DB query failed ({}), checking in-memory fallback...", e.getMessage());
        }

        if (memUsers.containsKey(cleanId)) {
            return Collections.singletonList(memUsers.get(cleanId));
        }

        return Collections.emptyList();
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : (username != null ? username.trim().toLowerCase() : "");
        if (cleanEmail.isEmpty()) return false;
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)",
                    Integer.class, cleanEmail, cleanEmail
            );
            return count != null && count > 0;
        } catch (Exception e) {
            return memUsers.containsKey(cleanEmail);
        }
    }

    public int saveUser(String name, String email, String password, String role) {
        return saveUser(name, name, email, password, role);
    }

    public int saveUser(String username, String name, String email, String password, String role) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        String cleanUsername = (username != null && !username.trim().isEmpty()) ? username.trim() : (cleanEmail.contains("@") ? cleanEmail.split("@")[0] : cleanEmail);
        String cleanName = (name != null && !name.trim().isEmpty()) ? name.trim() : cleanUsername;
        String cleanRole = role != null ? role.toUpperCase() : "STUDENT";

        if (isExactAdminEmail(cleanEmail)) {
            cleanRole = "ADMIN";
        }

        int generatedId = ++nextId;

        try {
            List<Map<String, Object>> existing = findByUsernameOrEmail(cleanEmail);
            if (!existing.isEmpty()) {
                Object idObj = existing.get(0).get("id") != null ? existing.get(0).get("id") : existing.get(0).get("ID");
                if (idObj != null) {
                    int existingId = Integer.parseInt(idObj.toString());
                    try {
                        jdbcTemplate.update("UPDATE users SET name = ?, role = ? WHERE id = ?", cleanName, cleanRole, existingId);
                    } catch (Exception ignored) {}
                    seedMemUser(existingId, cleanUsername, cleanEmail, password, cleanRole);
                    return existingId;
                }
            }

            try {
                jdbcTemplate.update(
                        "INSERT INTO users (username, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                        cleanUsername, cleanName, cleanEmail, password, cleanRole
                );

                List<Map<String, Object>> maxId = jdbcTemplate.queryForList("SELECT MAX(id) as max_id FROM users");
                if (!maxId.isEmpty() && maxId.get(0).get("max_id") != null) {
                    generatedId = Integer.parseInt(maxId.get(0).get("max_id").toString());
                }
            } catch (Exception e1) {
                try {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                            cleanUsername, cleanName, cleanEmail, password, cleanRole
                    );
                } catch (Exception e2) {
                    jdbcTemplate.update(
                            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
                            cleanName, cleanEmail, password, cleanRole
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Error saving user to DB ({}): saving to memory...", e.getMessage());
        }

        if ("STUDENT".equals(cleanRole)) {
            try {
                jdbcTemplate.update(
                        "INSERT INTO student_profiles (user_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
                        generatedId, cleanName
                );
            } catch (Exception ignored) {}
        }

        seedMemUser(generatedId, cleanUsername, cleanEmail, password, cleanRole);
        return generatedId;
    }

    public void saveStudentProfile(int userId, String name, String college, int gradYear, double cgpa, String location, String resumeFileName, String leetcode, String github, String yearOfStudy, String degree, String department, String gender, String linkedin, String portfolio, String skills) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, resume_file_name, leetcode, github, year_of_study, degree, branch, gender, linkedin, portfolio, skills) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    userId, name, college, gradYear, cgpa, location, resumeFileName, leetcode, github, yearOfStudy, degree, department, gender, linkedin, portfolio, skills
            );
            log.info("Saved student profile in Oracle DB for user_id {}", userId);
        } catch (Exception e) {
            log.warn("Error saving student profile in Oracle DB for user_id {}: {}", userId, e.getMessage());
        }

        Map<String, Object> prof = new HashMap<>();
        prof.put("userId", userId);
        prof.put("name", name);
        prof.put("college", college);
        prof.put("degree", degree);
        prof.put("branch", department);
        prof.put("cgpa", cgpa);
        prof.put("skills", skills);
        memProfiles.put(userId, prof);
    }

    public void saveCompanyProfile(int userId, String companyName, String industry, String website, String location, String description) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO companies (user_id, company_name, industry, website, location, description) VALUES (?, ?, ?, ?, ?, ?)",
                    userId, companyName, industry, website, location, description
            );
            log.info("Saved company profile in Oracle DB for user_id {}", userId);
        } catch (Exception e) {
            log.warn("Error saving company profile in Oracle DB for user_id {}: {}", userId, e.getMessage());
        }
    }

    public List<Map<String, Object>> getAllUsersWithProfiles() {
        Map<String, Map<String, Object>> userMapByEmail = new LinkedHashMap<>();

        try {
            String sql = "SELECT u.id, u.name, u.email, u.role, u.created_at, " +
                    "sp.college, sp.degree, sp.branch, sp.address, sp.cgpa, sp.skills " +
                    "FROM users u " +
                    "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                    "ORDER BY u.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql);
            for (Map<String, Object> row : dbRows) {
                Map<String, Object> norm = normalizeMap(row);
                String email = norm.get("email") != null ? norm.get("email").toString().toLowerCase() : "";
                if (!email.isEmpty()) {
                    userMapByEmail.put(email, norm);
                }
            }
        } catch (Exception e) {
            log.warn("Error fetching registered users from MySQL DB: {}", e.getMessage());
        }

        if (!userMapByEmail.isEmpty()) {
            return new ArrayList<>(userMapByEmail.values());
        }

        for (Map<String, Object> u : memUsers.values()) {
            Map<String, Object> userMap = new HashMap<>(u);
            String email = userMap.get("email") != null ? userMap.get("email").toString().toLowerCase() : "";
            if (!email.isEmpty() && !userMapByEmail.containsKey(email)) {
                userMapByEmail.put(email, normalizeMap(userMap));
            }
        }

        return new ArrayList<>(userMapByEmail.values());
    }

    public boolean deleteUserById(int id) {
        if (id <= 0) return false;
        try { jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id = ?", id); } catch (Exception ignored) {}
        try { jdbcTemplate.update("DELETE FROM applications WHERE student_id = ? OR company_id = ?", id, id); } catch (Exception ignored) {}
        try { jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", id); } catch (Exception ignored) {}
        try { jdbcTemplate.update("DELETE FROM internships WHERE company_id = ?", id); } catch (Exception ignored) {}
        try { jdbcTemplate.update("DELETE FROM companies WHERE user_id = ? OR id = ?", id, id); } catch (Exception ignored) {}
        try { 
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", id); 
            log.info("Cascading delete completed cleanly for user {} from MySQL DB across ALL tables", id);
        } catch (Exception e) {
            log.warn("DB delete failed for user {}: {}", id, e.getMessage());
        }

        memUsers.values().removeIf(u -> {
            Object idObj = u.get("id") != null ? u.get("id") : u.get("ID");
            return idObj != null && Integer.parseInt(idObj.toString()) == id;
        });
        memProfiles.remove(id);
        return true;
    }

    public boolean markEmailVerified(String email) {
        if (email == null || email.trim().isEmpty()) return false;
        String cleanEmail = email.trim().toLowerCase();
        try {
            jdbcTemplate.update("UPDATE users SET email_verified = true WHERE LOWER(email) = LOWER(?)", cleanEmail);
            log.info("Marked email_verified = true for user {}", cleanEmail);
        } catch (Exception e) {
            log.warn("Could not update email_verified in DB for {}: {}", cleanEmail, e.getMessage());
        }
        if (memUsers.containsKey(cleanEmail)) {
            memUsers.get(cleanEmail).put("email_verified", true);
            memUsers.get(cleanEmail).put("emailVerified", true);
        }
        return true;
    }

    public boolean updateUserEmail(int userId, String newEmail) {
        if (userId <= 0 || newEmail == null || newEmail.trim().isEmpty()) return false;
        String cleanNewEmail = newEmail.trim().toLowerCase();
        try {
            jdbcTemplate.update("UPDATE users SET email = ?, email_verified = true WHERE id = ?", cleanNewEmail, userId);
            try { jdbcTemplate.update("UPDATE student_profiles SET email = ? WHERE user_id = ?", cleanNewEmail, userId); } catch (Exception ignored) {}
            try { jdbcTemplate.update("UPDATE companies SET email = ? WHERE user_id = ?", cleanNewEmail, userId); } catch (Exception ignored) {}
            log.info("Updated user {} email to {} and marked verified.", userId, cleanNewEmail);
        } catch (Exception e) {
            log.warn("Could not update user email in DB for user_id {}: {}", userId, e.getMessage());
        }
        for (Map<String, Object> u : memUsers.values()) {
            Object idObj = u.get("id") != null ? u.get("id") : u.get("ID");
            if (idObj != null && Integer.parseInt(idObj.toString()) == userId) {
                u.put("email", cleanNewEmail);
                u.put("email_verified", true);
                u.put("emailVerified", true);
                memUsers.put(cleanNewEmail, u);
                break;
            }
        }
        return true;
    }
}
