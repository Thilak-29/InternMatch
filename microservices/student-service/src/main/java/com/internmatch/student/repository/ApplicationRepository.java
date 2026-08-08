package com.internmatch.student.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ApplicationRepository {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public ApplicationRepository(JdbcTemplate jdbcTemplate) {
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

    public List<Map<String, Object>> findByStudentId(int studentId) {
        if (studentId <= 0) {
            return Collections.emptyList();
        }
        try {
            String sql = "SELECT a.id, a.student_id, a.internship_id, a.company_id, a.student_name, " +
                    "COALESCE(i.company_name, a.company_name) as company_name, " +
                    "COALESCE(i.title, a.role_title) as title, " +
                    "i.location, i.stipend, i.work_mode, i.duration, a.status, a.stage, a.test_score, a.match_score, " +
                    "TO_CHAR(a.applied_at, 'YYYY-MM-DD') as applied_at " +
                    "FROM applications a " +
                    "LEFT JOIN internships i ON a.internship_id = i.id " +
                    "WHERE a.student_id = ? ORDER BY a.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql, studentId);
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Database error fetching applications for student_id {}: {}", studentId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public void saveApplication(int studentId, int internshipId, int companyId, String studentName, String companyName, String roleTitle) {
        if (studentId <= 0 || internshipId <= 0) return;
        try {
            // Check if already applied to prevent duplicates
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM applications WHERE student_id = ? AND internship_id = ?",
                    Integer.class, studentId, internshipId
            );
            if (count != null && count > 0) {
                log.info("Student {} already applied to internship {}", studentId, internshipId);
                return;
            }

            jdbcTemplate.update(
                    "INSERT INTO applications (student_id, internship_id, company_id, student_name, company_name, role_title, status, stage, test_score, match_score, applied_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, 'APPLIED', 'ASSESSMENT', 0, 94, SYSDATE)",
                    studentId, internshipId, companyId, studentName, companyName, roleTitle
            );
            log.info("Saved application: student {} -> internship {}", studentId, internshipId);
        } catch (Exception e) {
            log.error("Error saving application for student {}: {}", studentId, e.getMessage());
            try {
                jdbcTemplate.update(
                        "INSERT INTO applications (student_id, internship_id, status, test_score) VALUES (?, ?, 'APPLIED', 0)",
                        studentId, internshipId
                );
            } catch (Exception e2) {
                log.error("Fallback error inserting application: {}", e2.getMessage());
            }
        }
    }

    public void updateTestScore(int appId, double score, String status, String stage) {
        if (appId <= 0) return;
        try {
            jdbcTemplate.update("UPDATE applications SET test_score = ?, status = ?, stage = ? WHERE id = ?", score, status, stage, appId);
            log.info("Updated test score for application {}: score={}, status={}", appId, score, status);
        } catch (Exception e) {
            log.error("Error updating test score for application {}: {}", appId, e.getMessage());
        }
    }
}
