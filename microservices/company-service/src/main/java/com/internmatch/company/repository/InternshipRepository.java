package com.internmatch.company.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class InternshipRepository {

    private final JdbcTemplate jdbcTemplate;
    private final List<Map<String, Object>> memoryInternships = Collections.synchronizedList(new ArrayList<>());

    public InternshipRepository(JdbcTemplate jdbcTemplate) {
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

    public List<Map<String, Object>> findAll() {
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList("SELECT * FROM internships ORDER BY id DESC");
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        return new ArrayList<>(memoryInternships);
    }

    public List<Map<String, Object>> findByCompanyId(int companyId) {
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList("SELECT * FROM internships WHERE company_id = ? ORDER BY id DESC", companyId);
            if (!dbRows.isEmpty()) {
                return normalizeList(dbRows);
            }
        } catch (Exception e) {}

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> m : memoryInternships) {
            Object cid = m.get("company_id");
            if (cid != null && Integer.parseInt(cid.toString()) == companyId) {
                filtered.add(m);
            }
        }
        return filtered;
    }

    public void saveInternship(int companyId, String companyName, String title, String domain,
                               String requiredSkills, String workMode, int gradYear, String location,
                               String duration, String startDate, String endDate, double stipend,
                               int openings, String deadline) {
        int nextId = memoryInternships.size() + 10;
        Map<String, Object> job = new HashMap<>();
        job.put("id", nextId);
        job.put("ID", nextId);
        job.put("company_id", companyId);
        job.put("company_name", companyName);
        job.put("title", title);
        job.put("domain", domain);
        job.put("required_skills", requiredSkills);
        job.put("work_mode", workMode);
        job.put("grad_year", gradYear);
        job.put("location", location);
        job.put("duration", duration);
        job.put("start_date", startDate);
        job.put("end_date", endDate);
        job.put("stipend", stipend);
        job.put("openings", openings);
        job.put("application_deadline", deadline);
        job.put("status", "ACTIVE");
        job.put("is_active", 1);
        memoryInternships.add(0, normalizeMap(job));

        try {
            jdbcTemplate.update(
                    "INSERT INTO internships (company_id, company_name, title, domain, required_skills, work_mode, grad_year, location, duration, start_date, end_date, stipend, openings, application_deadline, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1)",
                    companyId, companyName, title, domain, requiredSkills, workMode, gradYear, location, duration, startDate, endDate, stipend, openings, deadline
            );
        } catch (Exception e) {
            try {
                jdbcTemplate.update(
                        "INSERT INTO internships (company_id, title, stipend, location, duration, skills_required, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                        companyId, title, String.valueOf(stipend), location, duration, requiredSkills
                );
            } catch (Exception e2) {}
        }
    }
}
