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

    public List<Map<String, Object>> findByStudentId(int studentId) {
        try {
            String sql = "SELECT a.*, i.title, i.company_name, i.stipend, i.location, i.duration " +
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

    public void saveApplication(int studentId, int internshipId, int companyId, String companyName, String jobTitle, String status) {
        int nextId = memoryApplications.size() + 100;
        Map<String, Object> app = new HashMap<>();
        app.put("id", nextId);
        app.put("ID", nextId);
        app.put("student_id", studentId);
        app.put("internship_id", internshipId);
        app.put("company_id", companyId);
        app.put("company_name", companyName);
        app.put("job_title", jobTitle);
        app.put("title", jobTitle);
        app.put("status", status);
        app.put("applied_at", "2026-08-08");
        memoryApplications.add(0, normalizeMap(app));

        try {
            jdbcTemplate.update(
                    "INSERT INTO applications (student_id, internship_id, company_id, company_name, job_title, status, test_score, applied_at) VALUES (?, ?, ?, ?, ?, ?, 0, SYSDATE)",
                    studentId, internshipId, companyId, companyName, jobTitle, status
            );
        } catch (Exception e) {
            try {
                jdbcTemplate.update(
                        "INSERT INTO applications (student_id, internship_id, status, test_score) VALUES (?, ?, ?, 0)",
                        studentId, internshipId, status
                );
            } catch (Exception e2) {}
        }
    }
}
