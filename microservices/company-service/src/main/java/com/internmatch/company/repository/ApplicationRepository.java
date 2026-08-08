package com.internmatch.company.repository;

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

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        if (companyId <= 0) {
            return Collections.emptyList();
        }
        try {
            String sql = "SELECT a.id, a.student_id, a.internship_id, a.status, a.test_score, a.match_score, " +
                    "TO_CHAR(a.applied_at, 'YYYY-MM-DD') as applied_at, " +
                    "COALESCE(u.name, sp.name, a.student_name) as candidate_name, " +
                    "COALESCE(u.email, 'candidate@gmail.com') as candidate_email, " +
                    "sp.college, sp.branch, sp.cgpa, sp.skills, sp.leetcode, sp.github, sp.gender, sp.linkedin, sp.portfolio, " +
                    "COALESCE(i.title, a.role_title) as role_title, i.stipend " +
                    "FROM applications a " +
                    "INNER JOIN internships i ON a.internship_id = i.id " +
                    "LEFT JOIN users u ON a.student_id = u.id " +
                    "LEFT JOIN student_profiles sp ON a.student_id = sp.user_id " +
                    "WHERE i.company_id = ? OR a.company_id = ? ORDER BY a.id DESC";
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(sql, companyId, companyId);
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Database error fetching applicants for company {}: {}", companyId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public void updateStatus(int applicationId, String status) {
        if (applicationId <= 0 || status == null) return;
        try {
            jdbcTemplate.update("UPDATE applications SET status = ? WHERE id = ?", status.trim(), applicationId);
            log.info("Updated status for application {} to {}", applicationId, status);
        } catch (Exception e) {
            log.error("Error updating status for application {}: {}", applicationId, e.getMessage());
        }
    }
}
