package com.internmatch.company.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ApplicationRepository {

    private final JdbcTemplate jdbcTemplate;
    private final List<Map<String, Object>> memoryApplicants = Collections.synchronizedList(new ArrayList<>());

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
        addApplicantToMemory(101, 12, 1, 10, "Vignesh Sankarakumar", "demo1@gmail.com", "741085293", "Karpagam College of Engineering", "Computer Science & Engineering", 8.5, "React, Java, SQL, Python, Spring Boot", "Thilak0329", "Thilak-29", "AI/ML Engineering Intern", 92.0, "OFFER_SENT");
        addApplicantToMemory(102, 3, 1, 10, "Thilak P", "thilak@gmail.com", "741085293", "Karpagam College of Engineering", "Computer Science & Engineering", 8.5, "React, Java, SQL, Python, Algorithms", "Thilak0329", "Thilak-29", "AI/ML Engineering Intern", 88.0, "SHORTLISTED");
    }

    private void addApplicantToMemory(int id, int studentId, int internshipId, int companyId,
                                      String candidateName, String email, String phone,
                                      String college, String branch, double cgpa, String skills,
                                      String leetcode, String github, String roleTitle,
                                      double testScore, String status) {
        Map<String, Object> app = new HashMap<>();
        app.put("id", id);
        app.put("ID", id);
        app.put("student_id", studentId);
        app.put("internship_id", internshipId);
        app.put("company_id", companyId);
        app.put("candidate_name", candidateName);
        app.put("student_name", candidateName);
        app.put("name", candidateName);
        app.put("email", email);
        app.put("candidate_email", email);
        app.put("phone", phone);
        app.put("college", college);
        app.put("branch", branch);
        app.put("cgpa", cgpa);
        app.put("skills", skills);
        app.put("leetcode", leetcode);
        app.put("github", github);
        app.put("role_title", roleTitle);
        app.put("title", roleTitle);
        app.put("test_score", testScore);
        app.put("status", status);
        app.put("STATUS", status);
        app.put("applied_at", "2026-08-05");
        memoryApplicants.add(0, normalizeMap(app));
    }

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        try {
            String sql = "SELECT a.id, a.student_id, a.internship_id, a.status, a.test_score, " +
                    "TO_CHAR(a.applied_at, 'YYYY-MM-DD') as applied_at, " +
                    "COALESCE(u.name, a.student_name) as candidate_name, " +
                    "COALESCE(u.email, 'candidate@gmail.com') as candidate_email, " +
                    "sp.college, sp.branch, sp.cgpa, sp.skills, sp.leetcode, sp.github, sp.phone, " +
                    "COALESCE(i.title, a.role_title) as role_title, i.stipend " +
                    "FROM applications a " +
                    "LEFT JOIN internships i ON a.internship_id = i.id " +
                    "LEFT JOIN users u ON a.student_id = u.id " +
                    "LEFT JOIN student_profiles sp ON a.student_id = sp.user_id " +
                    "WHERE i.company_id = ? OR a.company_id = ? ORDER BY a.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql, companyId, companyId);
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> m : memoryApplicants) {
            Object cid = m.get("company_id");
            if (cid != null && Integer.parseInt(cid.toString()) == companyId) {
                filtered.add(m);
            }
        }
        return filtered;
    }

    public void updateStatus(int applicationId, String status) {
        for (Map<String, Object> m : memoryApplicants) {
            Object aid = m.get("id");
            if (aid != null && Integer.parseInt(aid.toString()) == applicationId) {
                m.put("status", status);
                m.put("STATUS", status);
            }
        }

        try {
            jdbcTemplate.update("UPDATE applications SET status = ? WHERE id = ?", status, applicationId);
        } catch (Exception e) {}
    }
}
