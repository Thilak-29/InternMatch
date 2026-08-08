package com.internmatch.student.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ApplicationRepository {

    private final JdbcTemplate jdbcTemplate;
    private final List<Map<String, Object>> memoryApplications = Collections.synchronizedList(new ArrayList<>());

    public ApplicationRepository(JdbcTemplate jdbcTemplate) {
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
        addApplicationToMemory(101, 3, 1, 10, "Thilak P", "NVIDIA Corporation", "AI/ML Engineering Intern", "Bengaluru", 45000, "Hybrid", "3 Months", "OFFER_SENT", "INTERVIEW", 92.0, 94);
        addApplicationToMemory(102, 3, 2, 11, "Thilak P", "Google Cloud Labs", "Full-Stack Software Engineering Intern", "Hyderabad", 40000, "Remote", "6 Months", "SHORTLISTED", "ASSESSMENT", 88.0, 91);
        addApplicationToMemory(103, 12, 1, 10, "Vignesh Sankarakumar", "NVIDIA Corporation", "AI/ML Engineering Intern", "Bengaluru", 45000, "Hybrid", "3 Months", "OFFER_SENT", "INTERVIEW", 92.0, 94);
    }

    private void addApplicationToMemory(int id, int studentId, int internshipId, int companyId,
                                       String studentName, String companyName, String roleTitle,
                                       String location, double stipend, String workMode, String duration,
                                       String status, String stage, double testScore, int matchScore) {
        Map<String, Object> app = new HashMap<>();
        app.put("id", id);
        app.put("ID", id);
        app.put("application_id", id);
        app.put("APPLICATION_ID", id);
        app.put("student_id", studentId);
        app.put("STUDENT_ID", studentId);
        app.put("internship_id", internshipId);
        app.put("INTERNSHIP_ID", internshipId);
        app.put("company_id", companyId);
        app.put("COMPANY_ID", companyId);
        app.put("student_name", studentName);
        app.put("STUDENT_NAME", studentName);
        app.put("candidate_name", studentName);
        app.put("CANDIDATE_NAME", studentName);
        app.put("company_name", companyName);
        app.put("COMPANY_NAME", companyName);
        app.put("title", roleTitle);
        app.put("TITLE", roleTitle);
        app.put("job_title", roleTitle);
        app.put("JOB_TITLE", roleTitle);
        app.put("role_title", roleTitle);
        app.put("ROLE_TITLE", roleTitle);
        app.put("location", location);
        app.put("LOCATION", location);
        app.put("stipend", stipend);
        app.put("STIPEND", stipend);
        app.put("work_mode", workMode);
        app.put("WORK_MODE", workMode);
        app.put("duration", duration);
        app.put("DURATION", duration);
        app.put("status", status);
        app.put("STATUS", status);
        app.put("stage", stage);
        app.put("STAGE", stage);
        app.put("test_score", testScore);
        app.put("TEST_SCORE", testScore);
        app.put("match_score", matchScore);
        app.put("MATCH_SCORE", matchScore);
        app.put("applied_at", "2026-08-05");
        app.put("APPLIED_AT", "2026-08-05");
        memoryApplications.add(0, normalizeMap(app));
    }

    public List<Map<String, Object>> findByStudentId(int studentId) {
        try {
            String sql = "SELECT a.id, a.student_id, a.internship_id, a.company_id, a.student_name, " +
                    "COALESCE(a.company_name, i.company_name) as company_name, " +
                    "COALESCE(a.role_title, i.title) as title, " +
                    "i.location, i.stipend, i.work_mode, i.duration, a.status, a.stage, a.test_score, " +
                    "TO_CHAR(a.applied_at, 'YYYY-MM-DD') as applied_at " +
                    "FROM applications a " +
                    "LEFT JOIN internships i ON a.internship_id = i.id " +
                    "WHERE a.student_id = ? ORDER BY a.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql, studentId);
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> m : memoryApplications) {
            Object sid = m.get("student_id");
            if (sid != null && Integer.parseInt(sid.toString()) == studentId) {
                filtered.add(m);
            }
        }
        return filtered;
    }

    public void saveApplication(int studentId, int internshipId, int companyId, String studentName, String companyName, String roleTitle) {
        int nextId = memoryApplications.size() + 100;
        addApplicationToMemory(nextId, studentId, internshipId, companyId, studentName, companyName, roleTitle, "Bengaluru", 45000, "Hybrid", "3 Months", "APPLIED", "ASSESSMENT", 0, 94);

        try {
            jdbcTemplate.update(
                    "INSERT INTO applications (student_id, internship_id, company_id, student_name, company_name, role_title, status, stage, test_score, applied_at) VALUES (?, ?, ?, ?, ?, ?, 'APPLIED', 'ASSESSMENT', 0, SYSDATE)",
                    studentId, internshipId, companyId, studentName, companyName, roleTitle
            );
        } catch (Exception e) {
            try {
                jdbcTemplate.update(
                        "INSERT INTO applications (student_id, internship_id, status, test_score) VALUES (?, ?, 'APPLIED', 0)",
                        studentId, internshipId
                );
            } catch (Exception e2) {}
        }
    }

    public void updateTestScore(int appId, double score, String status, String stage) {
        for (Map<String, Object> m : memoryApplications) {
            Object aid = m.get("id");
            if (aid != null && Integer.parseInt(aid.toString()) == appId) {
                m.put("test_score", score);
                m.put("status", status);
                m.put("stage", stage);
            }
        }

        try {
            jdbcTemplate.update("UPDATE applications SET test_score=?, status=?, stage=? WHERE id=?", score, status, stage, appId);
        } catch (Exception e) {}
    }
}
