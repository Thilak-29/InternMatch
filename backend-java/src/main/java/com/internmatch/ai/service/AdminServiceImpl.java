package com.internmatch.ai.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminServiceImpl implements AdminService {

    private final JdbcTemplate jdbcTemplate;

    public AdminServiceImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Map<String, Object> getAdminStats() {
        int totalStudents = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'STUDENT'", Integer.class);
        int totalCompanies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'COMPANY'", Integer.class);
        int totalInternships = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM internships", Integer.class);
        int totalApplications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM applications", Integer.class);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_students", totalStudents);
        stats.put("total_companies", totalCompanies);
        stats.put("total_internships", totalInternships);
        stats.put("total_applications", totalApplications);
        return stats;
    }

    @Override
    public List<Map<String, Object>> getAllUsers() {
        return jdbcTemplate.queryForList("SELECT id, username, name, email, role, created_at FROM users WHERE role != 'ADMIN' ORDER BY id DESC");
    }

    @Override
    public Map<String, Object> deleteUser(int userId) {
        jdbcTemplate.update("DELETE FROM notifications WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM applications WHERE student_id = ?", userId);
        jdbcTemplate.update("DELETE FROM student_profiles WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM companies WHERE user_id = ?", userId);
        jdbcTemplate.update("DELETE FROM internships WHERE company_id = ?", userId);
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "User deleted successfully by Admin");
        return resp;
    }

    @Override
    public List<Map<String, Object>> getAllInternships() {
        return jdbcTemplate.queryForList("SELECT * FROM internships ORDER BY id DESC");
    }

    @Override
    public Map<String, Object> deleteInternship(int internshipId) {
        jdbcTemplate.update("DELETE FROM applications WHERE internship_id = ?", internshipId);
        jdbcTemplate.update("DELETE FROM screening_tests WHERE internship_id = ?", internshipId);
        jdbcTemplate.update("DELETE FROM internships WHERE id = ?", internshipId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship deleted successfully by Admin");
        return resp;
    }
}
