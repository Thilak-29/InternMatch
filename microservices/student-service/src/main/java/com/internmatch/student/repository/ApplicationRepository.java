package com.internmatch.student.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class ApplicationRepository {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRepository.class);
    private final JdbcTemplate jdbcTemplate;

    private static final Map<Integer, Map<String, Object>> SHARED_MEM_APPLICATIONS = new ConcurrentHashMap<>();
    private static final AtomicInteger MEM_ID_COUNTER = new AtomicInteger(500);

    public ApplicationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
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

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        if (list == null) return Collections.emptyList();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    public List<Map<String, Object>> findByStudentId(int studentId) {
        if (studentId <= 0) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        Set<Integer> seenAppIds = new HashSet<>();

        try {
            List<Map<String, Object>> dbRows = Collections.emptyList();
            try {
                String sql = "SELECT a.*, i.title as role_title, i.company_name, i.location, i.stipend, i.work_mode, i.duration FROM applications a LEFT JOIN internships i ON a.internship_id = i.id WHERE a.student_id = ? ORDER BY a.id DESC";
                dbRows = jdbcTemplate.queryForList(sql, studentId);
            } catch (Exception ex) {
                dbRows = jdbcTemplate.queryForList("SELECT * FROM applications WHERE student_id = ? ORDER BY id DESC", studentId);
            }

            for (Map<String, Object> m : dbRows) {
                Map<String, Object> norm = normalizeMap(m);
                Object idObj = norm.get("id") != null ? norm.get("id") : norm.get("ID");
                int appId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;

                // Merge with in-memory details if present
                if (appId > 0 && SHARED_MEM_APPLICATIONS.containsKey(appId)) {
                    Map<String, Object> memApp = SHARED_MEM_APPLICATIONS.get(appId);
                    norm.putAll(memApp);
                }
                resultList.add(norm);
                if (appId > 0) seenAppIds.add(appId);
            }
        } catch (Exception e) {
            log.warn("DB query in findByStudentId notice ({}), combining memory applications...", e.getMessage());
        }

        for (Map<String, Object> memApp : SHARED_MEM_APPLICATIONS.values()) {
            Map<String, Object> normMem = normalizeMap(memApp);
            Object sIdObj = normMem.get("student_id") != null ? normMem.get("student_id") : normMem.get("STUDENT_ID");
            if (sIdObj instanceof Number && ((Number) sIdObj).intValue() == studentId) {
                Object idObj = normMem.get("id") != null ? normMem.get("id") : normMem.get("ID");
                int appId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;
                if (!seenAppIds.contains(appId)) {
                    resultList.add(normMem);
                }
            }
        }

        return normalizeList(resultList);
    }

    public int saveApplication(int studentId, int internshipId) {
        return saveApplication(studentId, internshipId, 0, null, null, null, null, null, null, null);
    }

    public int saveApplication(int studentId, int internshipId, int companyId, String studentName, String companyName, String roleTitle) {
        return saveApplication(studentId, internshipId, companyId, studentName, companyName, roleTitle, null, null, null, null);
    }

    public int saveApplication(int studentId, int internshipId, int companyId, String studentName, String companyName,
                               String roleTitle, String location, Object stipend, String workMode, String duration) {
        if (studentId <= 0 || internshipId <= 0) return -1;

        // Check duplicates
        try {
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                    "SELECT id FROM applications WHERE student_id = ? AND internship_id = ?",
                    studentId, internshipId
            );
            if (!existing.isEmpty()) {
                log.info("Student {} already applied to internship {}. Rejecting duplicate application.", studentId, internshipId);
                return -2;
            }
        } catch (Exception ignored) {}

        for (Map<String, Object> memApp : SHARED_MEM_APPLICATIONS.values()) {
            Object sId = memApp.get("student_id") != null ? memApp.get("student_id") : memApp.get("STUDENT_ID");
            Object iId = memApp.get("internship_id") != null ? memApp.get("internship_id") : memApp.get("INTERNSHIP_ID");
            if (sId instanceof Number && iId instanceof Number &&
                    ((Number) sId).intValue() == studentId && ((Number) iId).intValue() == internshipId) {
                log.info("Student {} already applied to internship {} (in-memory). Rejecting duplicate application.", studentId, internshipId);
                return -2;
            }
        }

        if (studentName == null || studentName.trim().isEmpty()) {
            try {
                List<Map<String, Object>> uRows = jdbcTemplate.queryForList("SELECT name FROM users WHERE id = ?", studentId);
                if (!uRows.isEmpty() && uRows.get(0).get("name") != null) {
                    studentName = uRows.get(0).get("name").toString();
                }
            } catch (Exception ignored) {}
        }

        if (companyId <= 0 || companyName == null || roleTitle == null) {
            try {
                List<Map<String, Object>> iRows = jdbcTemplate.queryForList("SELECT company_id, company_name, title, location, stipend, work_mode, duration FROM internships WHERE id = ?", internshipId);
                if (!iRows.isEmpty()) {
                    Map<String, Object> iMap = iRows.get(0);
                    if (companyId <= 0 && iMap.get("company_id") != null) {
                        companyId = Integer.parseInt(iMap.get("company_id").toString());
                    }
                    if (companyName == null && iMap.get("company_name") != null) {
                        companyName = iMap.get("company_name").toString();
                    }
                    if (roleTitle == null && iMap.get("title") != null) {
                        roleTitle = iMap.get("title").toString();
                    }
                    if (location == null && iMap.get("location") != null) {
                        location = iMap.get("location").toString();
                    }
                    if (stipend == null && iMap.get("stipend") != null) {
                        stipend = iMap.get("stipend");
                    }
                    if (workMode == null && iMap.get("work_mode") != null) {
                        workMode = iMap.get("work_mode").toString();
                    }
                    if (duration == null && iMap.get("duration") != null) {
                        duration = iMap.get("duration").toString();
                    }
                }
            } catch (Exception ignored) {}
        }

        final int finalCompId = companyId > 0 ? companyId : 1;
        final String finalStudName = (studentName != null && !studentName.trim().isEmpty()) ? studentName : "Candidate";
        final String finalCompName = (companyName != null && !companyName.trim().isEmpty()) ? companyName : "Enterprise Partner";
        final String finalRoleTitle = (roleTitle != null && !roleTitle.trim().isEmpty()) ? roleTitle : "Software Engineering Intern";
        final String finalLocation = (location != null && !location.trim().isEmpty()) ? location : "Coimbatore";
        final Object finalStipend = stipend != null ? stipend : 10000;
        final String finalWorkMode = (workMode != null && !workMode.trim().isEmpty()) ? workMode : "Hybrid";
        final String finalDuration = (duration != null && !duration.trim().isEmpty()) ? duration : "3 Months";

        int generatedAppId = MEM_ID_COUNTER.incrementAndGet();
        
        try {
            try {
                jdbcTemplate.update(
                        "INSERT INTO applications (student_id, internship_id, company_id, student_name, candidate_name, company_name, role_title, title, location, stipend, work_mode, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED')",
                        studentId, internshipId, finalCompId, finalStudName, finalStudName, finalCompName, finalRoleTitle, finalRoleTitle, finalLocation, finalStipend, finalWorkMode, finalDuration
                );
            } catch (Exception ex) {
                jdbcTemplate.update(
                        "INSERT INTO applications (student_id, internship_id, company_id, status) VALUES (?, ?, ?, 'APPLIED')",
                        studentId, internshipId, finalCompId
                );
            }
            log.info("DB persistence completed for application {}", generatedAppId);
        } catch (Exception e1) {
            log.warn("Database notice for application {}: {}", generatedAppId, e1.getMessage());
        }

        Map<String, Object> memRecord = new HashMap<>();
        memRecord.put("id", generatedAppId);
        memRecord.put("ID", generatedAppId);
        memRecord.put("student_id", studentId);
        memRecord.put("STUDENT_ID", studentId);
        memRecord.put("internship_id", internshipId);
        memRecord.put("INTERNSHIP_ID", internshipId);
        memRecord.put("company_id", finalCompId);
        memRecord.put("COMPANY_ID", finalCompId);
        memRecord.put("student_name", finalStudName);
        memRecord.put("candidate_name", finalStudName);
        memRecord.put("company_name", finalCompName);
        memRecord.put("role_title", finalRoleTitle);
        memRecord.put("title", finalRoleTitle);
        memRecord.put("location", finalLocation);
        memRecord.put("stipend", finalStipend);
        memRecord.put("work_mode", finalWorkMode);
        memRecord.put("duration", finalDuration);
        memRecord.put("status", "APPLIED");
        memRecord.put("STATUS", "APPLIED");
        memRecord.put("test_score", 0);
        memRecord.put("match_score", 90);
        SHARED_MEM_APPLICATIONS.put(generatedAppId, memRecord);

        // Sync to company-service
        new Thread(() -> {
            try {
                java.net.URL url = new java.net.URL("http://localhost:8083/api/v1/company/applications/sync");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                String jsonPayload = String.format("{\"id\":%d, \"student_id\":%d, \"internship_id\":%d, \"company_id\":%d, \"student_name\":\"%s\", \"company_name\":\"%s\", \"role_title\":\"%s\", \"status\":\"APPLIED\"}",
                        generatedAppId, studentId, internshipId, finalCompId, finalStudName, finalCompName, finalRoleTitle);
                conn.getOutputStream().write(jsonPayload.getBytes("UTF-8"));
                conn.getResponseCode();
                log.info("Synced application {} to company-service", generatedAppId);
            } catch (Exception ignored) {}
        }).start();

        return generatedAppId;
    }

    public int saveExternalApplication(int studentId, String externalId, String companyName, String roleTitle,
                                        String location, Object stipend, String workMode, String duration, String applicationUrl) {
        if (studentId <= 0 || externalId == null || externalId.trim().isEmpty()) return -1;

        String cleanExternalId = externalId.trim();

        // Check duplicate external application
        try {
            List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                    "SELECT id FROM applications WHERE student_id = ? AND source = 'UNSTOP' AND external_id = ?",
                    studentId, cleanExternalId
            );
            if (!existing.isEmpty()) {
                log.info("Student {} already tracked Unstop application for external_id {}. Rejecting duplicate application.", studentId, cleanExternalId);
                return -2;
            }
        } catch (Exception ignored) {}

        for (Map<String, Object> memApp : SHARED_MEM_APPLICATIONS.values()) {
            Object sId = memApp.get("student_id") != null ? memApp.get("student_id") : memApp.get("STUDENT_ID");
            Object src = memApp.get("source") != null ? memApp.get("source") : memApp.get("SOURCE");
            Object extId = memApp.get("external_id") != null ? memApp.get("external_id") : memApp.get("EXTERNAL_ID");
            if (sId instanceof Number && ((Number) sId).intValue() == studentId &&
                "UNSTOP".equalsIgnoreCase(String.valueOf(src)) && cleanExternalId.equals(extId)) {
                log.info("Student {} already tracked Unstop application {} (in-memory). Rejecting duplicate application.", studentId, cleanExternalId);
                return -2;
            }
        }

        String studentName = "Candidate";
        try {
            List<Map<String, Object>> uRows = jdbcTemplate.queryForList("SELECT name FROM users WHERE id = ?", studentId);
            if (!uRows.isEmpty() && uRows.get(0).get("name") != null) {
                studentName = uRows.get(0).get("name").toString();
            }
        } catch (Exception ignored) {}

        final String finalStudName = studentName;
        final String finalCompName = (companyName != null && !companyName.trim().isEmpty()) ? companyName : "Unstop Partner";
        final String finalRoleTitle = (roleTitle != null && !roleTitle.trim().isEmpty()) ? roleTitle : "Unstop Internship";
        final String finalLocation = (location != null && !location.trim().isEmpty()) ? location : "Remote / India";
        final Object finalStipend = stipend != null ? stipend : "Disclosed on Unstop";
        final String finalWorkMode = (workMode != null && !workMode.trim().isEmpty()) ? workMode : "Remote";
        final String finalDuration = (duration != null && !duration.trim().isEmpty()) ? duration : "Flexible";
        final String finalUrl = (applicationUrl != null && !applicationUrl.trim().isEmpty()) ? applicationUrl : "https://unstop.com";

        int generatedAppId = MEM_ID_COUNTER.incrementAndGet();

        try {
            jdbcTemplate.update(
                    "INSERT INTO applications (student_id, internship_id, company_id, student_name, candidate_name, company_name, role_title, title, location, stipend, work_mode, duration, status, source, external_id, application_url) VALUES (?, 0, 0, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'APPLIED_EXTERNALLY', 'UNSTOP', ?, ?)",
                    studentId, finalStudName, finalStudName, finalCompName, finalRoleTitle, finalRoleTitle, finalLocation, finalWorkMode, finalDuration, cleanExternalId, finalUrl
            );
            log.info("DB persistence completed for Unstop application {}", generatedAppId);
        } catch (Exception e1) {
            log.warn("Database notice for Unstop application {}: {}", generatedAppId, e1.getMessage());
        }

        Map<String, Object> memRecord = new HashMap<>();
        memRecord.put("id", generatedAppId);
        memRecord.put("ID", generatedAppId);
        memRecord.put("student_id", studentId);
        memRecord.put("STUDENT_ID", studentId);
        memRecord.put("internship_id", 0);
        memRecord.put("INTERNSHIP_ID", 0);
        memRecord.put("company_id", 0);
        memRecord.put("COMPANY_ID", 0);
        memRecord.put("student_name", finalStudName);
        memRecord.put("candidate_name", finalStudName);
        memRecord.put("company_name", finalCompName);
        memRecord.put("role_title", finalRoleTitle);
        memRecord.put("title", finalRoleTitle);
        memRecord.put("location", finalLocation);
        memRecord.put("stipend", finalStipend);
        memRecord.put("work_mode", finalWorkMode);
        memRecord.put("duration", finalDuration);
        memRecord.put("status", "APPLIED_EXTERNALLY");
        memRecord.put("STATUS", "APPLIED_EXTERNALLY");
        memRecord.put("source", "UNSTOP");
        memRecord.put("SOURCE", "UNSTOP");
        memRecord.put("external_id", cleanExternalId);
        memRecord.put("EXTERNAL_ID", cleanExternalId);
        memRecord.put("application_url", finalUrl);
        memRecord.put("APPLICATION_URL", finalUrl);
        SHARED_MEM_APPLICATIONS.put(generatedAppId, memRecord);

        return generatedAppId;
    }

    public void updateApplicationDetails(int appId, String studentName, String roleTitle, String companyName) {
        if (appId <= 0) return;
        if (SHARED_MEM_APPLICATIONS.containsKey(appId)) {
            Map<String, Object> m = SHARED_MEM_APPLICATIONS.get(appId);
            if (studentName != null) m.put("student_name", studentName);
            if (roleTitle != null) { m.put("role_title", roleTitle); m.put("title", roleTitle); }
            if (companyName != null) m.put("company_name", companyName);
        }
        try {
            jdbcTemplate.update(
                    "UPDATE applications SET student_name = COALESCE(?, student_name), role_title = COALESCE(?, role_title), company_name = COALESCE(?, company_name) WHERE id = ?",
                    studentName, roleTitle, companyName, appId
            );
        } catch (Exception ignored) {}
    }

    public void updateTestScore(int appId, double score) {
        if (appId <= 0) return;
        String status = score >= 60.0 ? "TEST_PASSED" : "TEST_FAILED";
        if (SHARED_MEM_APPLICATIONS.containsKey(appId)) {
            Map<String, Object> m = SHARED_MEM_APPLICATIONS.get(appId);
            m.put("test_score", score);
            m.put("status", status);
            m.put("STATUS", status);
        }
        try {
            jdbcTemplate.update("UPDATE applications SET test_score = ?, status = ? WHERE id = ?", score, status, appId);
        } catch (Exception ignored) {}
    }

    public boolean deleteApplication(int appId) {
        if (appId <= 0) return false;
        SHARED_MEM_APPLICATIONS.remove(appId);
        try {
            jdbcTemplate.update("DELETE FROM applications WHERE id = ?", appId);
            log.info("Application ID {} deleted cleanly from Oracle database.", appId);
        } catch (Exception e) {
            log.warn("DB deletion notice for application {}: {}", appId, e.getMessage());
        }
        return true;
    }

    /**
     * Updates the status of an application in both the in-memory cache and the database.
     * Used by QuizEligibilityService to persist PROCTORING_FAILED and other lifecycle states.
     */
    public void updateStatus(int appId, String status) {
        if (appId <= 0 || status == null) return;
        if (SHARED_MEM_APPLICATIONS.containsKey(appId)) {
            Map<String, Object> m = SHARED_MEM_APPLICATIONS.get(appId);
            m.put("status", status);
            m.put("STATUS", status);
        }
        try {
            jdbcTemplate.update("UPDATE applications SET status = ? WHERE id = ?", status, appId);
            log.info("Application ID {} status updated to {} in database.", appId, status);
        } catch (Exception e) {
            log.warn("DB status update notice for application {}: {}", appId, e.getMessage());
        }
    }
}
