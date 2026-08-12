package com.internmatch.company.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ApplicationRepository {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRepository.class);
    private final JdbcTemplate jdbcTemplate;
    private final InternshipRepository internshipRepository;

    private static final Map<Integer, Map<String, Object>> SHARED_MEM_APPLICATIONS = new ConcurrentHashMap<>();

    public ApplicationRepository(JdbcTemplate jdbcTemplate, InternshipRepository internshipRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.internshipRepository = internshipRepository;
        loadApplicationsFromDatabase();
    }

    private void loadApplicationsFromDatabase() {
        try {
            List<Map<String, Object>> aRows = jdbcTemplate.queryForList("SELECT * FROM applications");
            for (Map<String, Object> row : aRows) {
                Map<String, Object> norm = normalizeMap(row);
                Object idObj = norm.get("id") != null ? norm.get("id") : norm.get("ID");
                if (idObj instanceof Number) {
                    int appId = ((Number) idObj).intValue();
                    SHARED_MEM_APPLICATIONS.put(appId, norm);
                }
            }
            log.info("Loaded {} applications from MySQL database on startup.", SHARED_MEM_APPLICATIONS.size());
        } catch (Exception e) {
            log.warn("Could not load applications from MySQL DB on startup: {}", e.getMessage());
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

    public void registerApplication(Map<String, Object> appData) {
        if (appData == null) return;
        Map<String, Object> norm = normalizeMap(appData);
        Object idObj = norm.get("id") != null ? norm.get("id") : norm.get("ID");
        int appId = idObj instanceof Number ? ((Number) idObj).intValue() : (SHARED_MEM_APPLICATIONS.size() + 500);
        norm.put("id", appId);
        norm.put("ID", appId);
        try {
            Object sId = norm.get("student_id") != null ? norm.get("student_id") : norm.get("STUDENT_ID");
            Object iId = norm.get("internship_id") != null ? norm.get("internship_id") : norm.get("INTERNSHIP_ID");
            Object cId = norm.get("company_id") != null ? norm.get("company_id") : norm.get("COMPANY_ID");
            Object sName = norm.get("student_name") != null ? norm.get("student_name") : norm.get("candidate_name");
            Object cName = norm.get("company_name");
            Object rTitle = norm.get("role_title") != null ? norm.get("role_title") : norm.get("title");
            Object status = norm.get("status") != null ? norm.get("status") : "APPLIED";

            if (sId != null && iId != null) {
                int studentIdVal = sId instanceof Number ? ((Number) sId).intValue() : 0;
                int internshipIdVal = iId instanceof Number ? ((Number) iId).intValue() : 0;
                int companyIdVal = cId instanceof Number ? ((Number) cId).intValue() : 1;
                String studNameStr = sName != null ? sName.toString() : "Candidate";
                String compNameStr = cName != null ? cName.toString() : "Enterprise Partner";
                String roleTitleStr = rTitle != null ? rTitle.toString() : "Software Engineering Intern";

                try {
                    List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                            "SELECT id FROM applications WHERE (student_id = ? AND internship_id = ?) OR id = ?",
                            studentIdVal, internshipIdVal, appId
                    );
                    if (!existing.isEmpty()) {
                        log.info("Application for student {} and internship {} already present in DB. Skipping duplicate sync insert.", studentIdVal, internshipIdVal);
                        SHARED_MEM_APPLICATIONS.put(appId, norm);
                        return;
                    }

                    jdbcTemplate.update(
                            "INSERT INTO applications (student_id, internship_id, company_id, student_name, candidate_name, company_name, role_title, title, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            studentIdVal, internshipIdVal, companyIdVal, studNameStr, studNameStr, compNameStr, roleTitleStr, roleTitleStr, status
                    );
                } catch (Exception ex) {
                    try {
                        jdbcTemplate.update(
                                "INSERT INTO applications (student_id, internship_id, company_id, status) VALUES (?, ?, ?, ?)",
                                studentIdVal, internshipIdVal, companyIdVal, status
                        );
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync application to Oracle DB", e);
            throw new RuntimeException("Database insertion failed: " + e.getMessage());
        }

        SHARED_MEM_APPLICATIONS.put(appId, norm);
    }

    public void updateProfileSync(Map<String, Object> profileData) {
        if (profileData == null) return;
        Map<String, Object> norm = normalizeMap(profileData);
        Object uIdObj = norm.get("user_id") != null ? norm.get("user_id") : norm.get("student_id");
        if (!(uIdObj instanceof Number)) return;
        int userId = ((Number) uIdObj).intValue();

        String name = norm.get("name") != null ? norm.get("name").toString() : null;
        String college = norm.get("college") != null ? norm.get("college").toString() : null;
        String degree = norm.get("degree") != null ? norm.get("degree").toString() : null;
        String branch = norm.get("branch") != null ? norm.get("branch").toString() : null;
        String skills = norm.get("skills") != null ? norm.get("skills").toString() : null;
        String phone = norm.get("phone") != null ? norm.get("phone").toString() : null;
        Double cgpa = norm.get("cgpa") instanceof Number ? ((Number) norm.get("cgpa")).doubleValue() : null;

        for (Map<String, Object> app : SHARED_MEM_APPLICATIONS.values()) {
            Object sId = app.get("student_id") != null ? app.get("student_id") : app.get("STUDENT_ID");
            if (sId instanceof Number && ((Number) sId).intValue() == userId) {
                if (name != null) { app.put("student_name", name); app.put("candidate_name", name); app.put("name", name); }
                if (college != null) app.put("college", college);
                if (degree != null) app.put("degree", degree);
                if (branch != null) app.put("branch", branch);
                if (skills != null) app.put("skills", skills);
                if (phone != null) app.put("phone", phone);
                if (cgpa != null) app.put("cgpa", cgpa);
            }
        }

        new Thread(() -> {
            try {
                if (name != null) {
                    jdbcTemplate.update("UPDATE users SET name = ? WHERE id = ?", name, userId);
                    jdbcTemplate.update("UPDATE applications SET student_name = ? WHERE student_id = ?", name, userId);
                }
                jdbcTemplate.update(
                        "UPDATE student_profiles SET name = COALESCE(?, name), college = COALESCE(?, college), degree = COALESCE(?, degree), branch = COALESCE(?, branch), skills = COALESCE(?, skills), phone = COALESCE(?, phone), cgpa = COALESCE(?, cgpa) WHERE user_id = ?",
                        name, college, degree, branch, skills, phone, cgpa, userId
                );
            } catch (Exception ignored) {}
        }).start();
    }

    public boolean updateStatus(int applicationId, String status) {
        if (applicationId <= 0) return false;
        try {
            int updated = jdbcTemplate.update("UPDATE applications SET status = ? WHERE id = ?", status, applicationId);
            log.info("Oracle DB status for application ID {} updated to {}, rows affected: {}", applicationId, status, updated);
        } catch (Exception e) {
            log.warn("Oracle DB status update notice for application ID {}: {}", applicationId, e.getMessage());
        }

        if (SHARED_MEM_APPLICATIONS.containsKey(applicationId)) {
            Map<String, Object> app = SHARED_MEM_APPLICATIONS.get(applicationId);
            app.put("status", status);
            app.put("STATUS", status);
        }
        for (Map<String, Object> app : SHARED_MEM_APPLICATIONS.values()) {
            Object idObj = app.get("id") != null ? app.get("id") : app.get("ID");
            if (idObj instanceof Number && ((Number) idObj).intValue() == applicationId) {
                app.put("status", status);
                app.put("STATUS", status);
            }
        }

        // Reverse sync to student-service (port 8082)
        new Thread(() -> {
            try {
                java.net.URL url = new java.net.URL("http://localhost:8082/api/v1/student/applications/" + applicationId + "/status");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                String jsonPayload = String.format("{\"status\":\"%s\"}", status);
                conn.getOutputStream().write(jsonPayload.getBytes("UTF-8"));
                conn.getResponseCode();
                log.info("Synced application status {} to student-service", applicationId);
            } catch (Exception ignored) {}
        }).start();

        return true;
    }

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        List<Map<String, Object>> result = new ArrayList<>();
        Set<Integer> seenAppIds = new HashSet<>();

        try {
            List<Map<String, Object>> rawApps = Collections.emptyList();
            try {
                rawApps = jdbcTemplate.queryForList("SELECT a.*, i.title as role_title, i.company_name, i.company_id FROM applications a LEFT JOIN internships i ON a.internship_id = i.id ORDER BY a.id DESC");
            } catch (Exception ex) {
                rawApps = jdbcTemplate.queryForList("SELECT * FROM applications ORDER BY id DESC");
            }
            for (Map<String, Object> app : rawApps) {
                Map<String, Object> normApp = normalizeMap(app);
                Object idObj = normApp.get("id") != null ? normApp.get("id") : normApp.get("ID");
                int appId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;

                int studentId = 0;
                Object sIdObj = normApp.get("student_id") != null ? normApp.get("student_id") : normApp.get("STUDENT_ID");
                if (sIdObj instanceof Number) {
                    studentId = ((Number) sIdObj).intValue();
                }

                String studName = normApp.get("student_name") != null ? normApp.get("student_name").toString() : null;
                String studEmail = normApp.get("candidate_email") != null ? normApp.get("candidate_email").toString() : null;
                String college = null, branch = null, degree = null, skills = null, phone = null;
                Double cgpa = null;

                if (studentId > 0) {
                    try {
                        List<Map<String, Object>> spRows = jdbcTemplate.queryForList("SELECT * FROM student_profiles WHERE user_id = ?", studentId);
                        if (!spRows.isEmpty()) {
                            Map<String, Object> spNorm = normalizeMap(spRows.get(0));
                            if (spNorm.get("name") != null && !spNorm.get("name").toString().trim().isEmpty()) {
                                studName = spNorm.get("name").toString().trim();
                            }
                            if (spNorm.get("college") != null && !spNorm.get("college").toString().trim().isEmpty()) college = spNorm.get("college").toString().trim();
                            if (spNorm.get("branch") != null && !spNorm.get("branch").toString().trim().isEmpty()) branch = spNorm.get("branch").toString().trim();
                            if (spNorm.get("degree") != null && !spNorm.get("degree").toString().trim().isEmpty()) degree = spNorm.get("degree").toString().trim();
                            if (spNorm.get("skills") != null && !spNorm.get("skills").toString().trim().isEmpty()) skills = spNorm.get("skills").toString().trim();
                            if (spNorm.get("phone") != null && !spNorm.get("phone").toString().trim().isEmpty()) phone = spNorm.get("phone").toString().trim();
                            if (spNorm.get("cgpa") != null) {
                                try { cgpa = Double.parseDouble(spNorm.get("cgpa").toString()); } catch (Exception ignored) {}
                            }
                        }
                    } catch (Exception ignored) {}

                    try {
                        List<Map<String, Object>> uRows = jdbcTemplate.queryForList("SELECT name, email FROM users WHERE id = ?", studentId);
                        if (!uRows.isEmpty()) {
                            Map<String, Object> uMap = uRows.get(0);
                            if ((studName == null || studName.trim().isEmpty() || "Candidate".equalsIgnoreCase(studName.trim()) || "Student Candidate".equalsIgnoreCase(studName.trim())) && uMap.get("name") != null && !uMap.get("name").toString().trim().isEmpty()) {
                                studName = uMap.get("name").toString().trim();
                            }
                            if (uMap.get("email") != null && !uMap.get("email").toString().trim().isEmpty()) {
                                studEmail = uMap.get("email").toString().trim();
                            }
                        }
                    } catch (Exception ignored) {}
                }

                if (studName == null || studName.trim().isEmpty() || "Candidate".equalsIgnoreCase(studName.trim()) || "Student Candidate".equalsIgnoreCase(studName.trim())) {
                    if (studEmail != null && studEmail.contains("@")) {
                        studName = studEmail.split("@")[0];
                    } else {
                        studName = "Candidate";
                    }
                }
                if (studEmail == null || studEmail.trim().isEmpty()) studEmail = "";
                if (college == null) college = "";
                if (branch == null) branch = "";
                if (degree == null) degree = "";
                if (cgpa == null) cgpa = 0.0;
                if (skills == null) skills = "";

                normApp.put("candidate_name", studName);
                normApp.put("student_name", studName);
                normApp.put("name", studName);
                normApp.put("candidate_email", studEmail);
                normApp.put("email", studEmail);
                normApp.put("college", college);
                normApp.put("branch", branch);
                normApp.put("degree", degree);
                normApp.put("cgpa", cgpa);
                normApp.put("skills", skills);
                if (phone != null) normApp.put("phone", phone);

                result.add(normApp);
                if (appId > 0) seenAppIds.add(appId);
            }
        } catch (Exception e) {
            log.warn("Oracle DB query notice for applicants ({}), serving active memory list...", e.getMessage());
        }

        for (Map<String, Object> m : SHARED_MEM_APPLICATIONS.values()) {
            Map<String, Object> normM = normalizeMap(m);
            Object idObj = normM.get("id") != null ? normM.get("id") : normM.get("ID");
            int appId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;
            if (appId > 0 && !seenAppIds.contains(appId)) {
                result.add(normM);
            }
        }

        return result;
    }
}
