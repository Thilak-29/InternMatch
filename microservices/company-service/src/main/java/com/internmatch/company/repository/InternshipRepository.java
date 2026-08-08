package com.internmatch.company.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class InternshipRepository {

    private final JdbcTemplate jdbcTemplate;

    public InternshipRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findAll() {
        return jdbcTemplate.queryForList("SELECT * FROM internships ORDER BY id DESC");
    }

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        return jdbcTemplate.queryForList("SELECT * FROM internships WHERE company_id = ? ORDER BY id DESC", companyId);
    }

    public List<Map<String, Object>> findApplicantsByCompanyId(int companyId) {
        String sql = "SELECT a.id as application_id, a.status, a.test_score, a.applied_at, " +
                "u.id as student_id, u.name as student_name, u.email as student_email, " +
                "sp.college, sp.cgpa, sp.skills, sp.leetcode, sp.github, sp.resume_score, " +
                "i.id as internship_id, i.title as internship_title, i.stipend " +
                "FROM applications a " +
                "JOIN internships i ON a.internship_id = i.id " +
                "JOIN users u ON a.student_id = u.id " +
                "LEFT JOIN student_profiles sp ON u.id = sp.user_id " +
                "WHERE i.company_id = ? ORDER BY a.id DESC";
        return jdbcTemplate.queryForList(sql, companyId);
    }

    public void saveInternship(int companyId, String title, String companyName, String stipend,
                               String location, String duration, String skillsRequired, String description) {
        try {
            jdbcTemplate.update(
                    "INSERT INTO internships (company_id, title, company_name, stipend, location, duration, skills_required, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')",
                    companyId, title, companyName, stipend, location, duration, skillsRequired, description
            );
        } catch (Exception e) {}
    }

    public void updateApplicationStatus(int applicationId, String status) {
        try {
            jdbcTemplate.update("UPDATE applications SET status = ? WHERE id = ?", status, applicationId);
        } catch (Exception e) {}
    }
}
