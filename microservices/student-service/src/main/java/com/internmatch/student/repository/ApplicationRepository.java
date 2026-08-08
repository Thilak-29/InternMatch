package com.internmatch.student.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class ApplicationRepository {

    private final JdbcTemplate jdbcTemplate;

    public ApplicationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByStudentId(int studentId) {
        String sql = "SELECT a.*, i.title, i.company_name, i.stipend, i.location, i.duration " +
                "FROM applications a " +
                "JOIN internships i ON a.internship_id = i.id " +
                "WHERE a.student_id = ? ORDER BY a.id DESC";
        return jdbcTemplate.queryForList(sql, studentId);
    }

    public void saveApplication(int studentId, int internshipId) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO applications (student_id, internship_id, status, test_score) VALUES (?, ?, 'APPLIED', 0)",
                    studentId, internshipId
            );
        } catch (Exception e) {}
    }

    public void updateScoreAndPassed(int applicationId, double score, String status, String currentStatus) {
        try {
            jdbcTemplate.update(
                    "UPDATE applications SET test_score = ?, status = ? WHERE id = ?",
                    score, status, applicationId
            );
        } catch (Exception e) {}
    }
}
