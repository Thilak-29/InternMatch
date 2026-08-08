package com.internmatch.auth.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;
    private final Map<String, Map<String, Object>> memoryUsers = new ConcurrentHashMap<>();

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initMockData();
    }

    private Map<String, Object> normalizeMap(Map<String, Object> raw) {
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    private void initMockData() {
        addUserToMemory(3, "thilak", "Thilak P", "thilak@gmail.com", "123456", "STUDENT");
        addUserToMemory(12, "demo1@gmail.com", "Vignesh Sankarakumar", "demo1@gmail.com", "123456", "STUDENT");
        addUserToMemory(10, "nvidia", "NVIDIA Corporation", "nvidia@gmail.com", "123456", "COMPANY");
        addUserToMemory(11, "google", "Google Cloud Labs", "google@gmail.com", "123456", "COMPANY");
        addUserToMemory(15, "thilakvignesh", "Thilak Vignesh (Admin)", "thilakvignesh@gmail.com", "ThilakVignesh", "ADMIN");
    }

    private void addUserToMemory(int id, String username, String name, String email, String password, String role) {
        Map<String, Object> u = new HashMap<>();
        u.put("id", id);
        u.put("ID", id);
        u.put("username", username);
        u.put("USERNAME", username);
        u.put("name", name);
        u.put("NAME", name);
        u.put("email", email);
        u.put("EMAIL", email);
        u.put("password", password);
        u.put("role", role);
        u.put("ROLE", role);
        memoryUsers.put(username.toLowerCase(), normalizeMap(u));
        memoryUsers.put(email.toLowerCase(), normalizeMap(u));
    }

    public List<Map<String, Object>> findByUsernameOrEmail(String identifier) {
        String key = identifier.toLowerCase().trim();
        if (memoryUsers.containsKey(key)) {
            return Collections.singletonList(memoryUsers.get(key));
        }

        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT * FROM users WHERE LOWER(username)=LOWER(?) OR LOWER(email)=LOWER(?)",
                    identifier, identifier
            );
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        return Collections.emptyList();
    }

    public boolean existsByUsernameOrEmail(String username, String email) {
        if (memoryUsers.containsKey(username.toLowerCase()) || memoryUsers.containsKey(email.toLowerCase())) {
            return true;
        }
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                    "SELECT id FROM users WHERE LOWER(username)=LOWER(?) OR LOWER(email)=LOWER(?)",
                    username, email
            );
            return !list.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public void saveUser(String username, String name, String email, String password, String role) {
        int nextId = memoryUsers.size() + 20;
        addUserToMemory(nextId, username, name, email, password, role);

        try {
            jdbcTemplate.update("INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                    username, name, email, password, role);
        } catch (Exception e) {}
    }

    public void saveStudentProfile(int userId, String name, String college, int gradYear, double cgpa,
                                   String location, String resumeFileName, String leetcode, String github,
                                   String yearOfStudy, String degree, String department) {
        try {
            jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id=?", userId);
            jdbcTemplate.update("INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, resume_file_name, leetcode, github, year_of_study, degree, branch, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'React, Java, SQL, Python')",
                    userId, name, college, gradYear, cgpa, location, resumeFileName, leetcode, github, yearOfStudy, degree, department);
        } catch (Exception e) {}
    }

    public void saveCompanyProfile(int userId, String companyName, String industry, String website,
                                   String location, String description) {
        try {
            jdbcTemplate.update("DELETE FROM companies WHERE user_id=?", userId);
            jdbcTemplate.update("INSERT INTO companies (user_id, company_name, industry, website, location, description) VALUES (?, ?, ?, ?, ?, ?)",
                    userId, companyName, industry, website, location, description);
        } catch (Exception e) {}
    }

    public List<Map<String, Object>> getAllUsersWithProfiles() {
        try {
            String sql = "SELECT u.id, u.username, u.name, u.email, u.role, u.created_at, " +
                    "sp.college, sp.branch, sp.degree, sp.cgpa, sp.skills, sp.leetcode, sp.github, sp.address as city, sp.phone, " +
                    "c.company_name, c.industry, c.location as company_location, c.website " +
                    "FROM users u " +
                    "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                    "LEFT JOIN companies c ON u.id = c.user_id " +
                    "WHERE u.role != 'ADMIN' ORDER BY u.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql);
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        List<Map<String, Object>> list = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (Map<String, Object> u : memoryUsers.values()) {
            int id = Integer.parseInt(u.get("id").toString());
            if (!seen.contains(id) && !"ADMIN".equalsIgnoreCase(String.valueOf(u.get("role")))) {
                seen.add(id);
                Map<String, Object> clone = new HashMap<>(u);
                if ("STUDENT".equalsIgnoreCase(String.valueOf(u.get("role")))) {
                    clone.put("college", "Karpagam College of Engineering");
                    clone.put("branch", "Computer Science & Engineering");
                    clone.put("cgpa", 8.5);
                    clone.put("skills", "React, Java, SQL, Python");
                    clone.put("city", "Thenkasi");
                } else if ("COMPANY".equalsIgnoreCase(String.valueOf(u.get("role")))) {
                    clone.put("industry", "Semiconductors & AI");
                    clone.put("location", "Bengaluru / Remote");
                    clone.put("website", "https://nvidia.com");
                }
                list.add(normalizeMap(clone));
            }
        }
        return list;
    }

    public void deleteUserById(int userId) {
        memoryUsers.values().removeIf(m -> Integer.parseInt(m.get("id").toString()) == userId);
        try {
            jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM applications WHERE student_id = ?", userId);
            jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM companies WHERE user_id = ?", userId);
            jdbcTemplate.update("DELETE FROM internships WHERE company_id = ?", userId);
            jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);
        } catch (Exception e) {}
    }
}
