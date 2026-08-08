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

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        try {
            String sql = "SELECT a.id, a.student_id, a.internship_id, a.status, a.test_score, a.applied_at, " +
                    "u.name as candidate_name, u.email as candidate_email, " +
                    "sp.college, sp.cgpa, sp.skills, sp.leetcode, sp.github, " +
                    "i.title as job_title, i.stipend " +
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
