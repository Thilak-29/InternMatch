package com.internmatch.company.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class InternshipRepository {

    private static final Logger log = LoggerFactory.getLogger(InternshipRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public InternshipRepository(JdbcTemplate jdbcTemplate) {
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

    public List<Map<String, Object>> findAll() {
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList("SELECT * FROM internships WHERE is_active = 1 ORDER BY id DESC");
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Database error in findAll internships: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        if (companyId <= 0) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT * FROM internships WHERE company_id = ? ORDER BY id DESC",
                    companyId
            );
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.error("Database error in findByCompanyId for company {}: {}", companyId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public void saveInternship(int companyId, String companyName, String title, String domain,
                               String requiredSkills, String workMode, int gradYear, String location,
                               String duration, String startDate, String endDate, double stipend,
                               int openings, String deadline) {
        if (companyId <= 0 || title == null || title.trim().isEmpty()) return;
        try {
            jdbcTemplate.update(
                    "INSERT INTO internships (company_id, company_name, title, domain, required_skills, work_mode, grad_year, location, duration, start_date, end_date, stipend, openings, application_deadline, status, is_active) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1)",
                    companyId, companyName, title.trim(), domain, requiredSkills, workMode, gradYear, location, duration, startDate, endDate, stipend, openings, deadline
            );
            log.info("Saved internship '{}' for company {}", title, companyId);
        } catch (Exception e) {
            log.error("Error saving internship: {}", e.getMessage());
            try {
                jdbcTemplate.update(
                        "INSERT INTO internships (company_id, title, stipend, location, duration, skills_required, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                        companyId, title, String.valueOf(stipend), location, duration, requiredSkills
                );
            } catch (Exception e2) {
                log.error("Fallback error saving internship: {}", e2.getMessage());
            }
        }
    }

    public boolean deleteById(int internshipId) {
        if (internshipId <= 0) return false;
        try {
            jdbcTemplate.update("DELETE FROM applications WHERE internship_id = ?", internshipId);
            int rows = jdbcTemplate.update("DELETE FROM internships WHERE id = ?", internshipId);
            return rows > 0;
        } catch (Exception e) {
            log.error("Error deleting internship {}: {}", internshipId, e.getMessage());
            return false;
        }
    }
}
