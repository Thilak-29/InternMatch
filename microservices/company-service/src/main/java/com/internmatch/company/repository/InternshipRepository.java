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
        addInternshipToMemory(1, 10, "NVIDIA Corporation", "AI/ML Engineering Intern", "Artificial Intelligence", "Python, PyTorch, CUDA, Algorithms", "Hybrid", 2026, "Bengaluru", "3 Months", "2026-06-01", "2026-08-31", 45000.0, 5, "2026-07-30", "ACTIVE", 1);
        addInternshipToMemory(2, 11, "Google Cloud Labs", "Full-Stack Software Engineering Intern", "Cloud & Web Systems", "React, Java, Spring Boot, SQL", "Remote", 2026, "Hyderabad", "6 Months", "2026-06-01", "2026-11-30", 40000.0, 4, "2026-08-15", "ACTIVE", 1);
        addInternshipToMemory(3, 10, "NVIDIA Corporation", "High Performance Computing Intern", "Systems Engineering", "C++, CUDA, Linux, Parallel Programming", "On-site", 2026, "Bengaluru", "4 Months", "2026-07-01", "2026-10-31", 50000.0, 3, "2026-08-20", "ACTIVE", 1);
    }

    private void addInternshipToMemory(int id, int companyId, String companyName, String title, String domain,
                                      String requiredSkills, String workMode, int gradYear, String location,
                                      String duration, String startDate, String endDate, double stipend,
                                      int openings, String deadline, String status, int isActive) {
        Map<String, Object> job = new HashMap<>();
        job.put("id", id);
        job.put("ID", id);
        job.put("company_id", companyId);
        job.put("COMPANY_ID", companyId);
        job.put("company_name", companyName);
        job.put("COMPANY_NAME", companyName);
        job.put("title", title);
        job.put("TITLE", title);
        job.put("domain", domain);
        job.put("DOMAIN", domain);
        job.put("required_skills", requiredSkills);
        job.put("REQUIRED_SKILLS", requiredSkills);
        job.put("work_mode", workMode);
        job.put("WORK_MODE", workMode);
        job.put("grad_year", gradYear);
        job.put("GRAD_YEAR", gradYear);
        job.put("location", location);
        job.put("LOCATION", location);
        job.put("duration", duration);
        job.put("DURATION", duration);
        job.put("start_date", startDate);
        job.put("START_DATE", startDate);
        job.put("end_date", endDate);
        job.put("END_DATE", endDate);
        job.put("stipend", stipend);
        job.put("STIPEND", stipend);
        job.put("openings", openings);
        job.put("OPENINGS", openings);
        job.put("application_deadline", deadline);
        job.put("APPLICATION_DEADLINE", deadline);
        job.put("status", status);
        job.put("STATUS", status);
        job.put("is_active", isActive);
        job.put("IS_ACTIVE", isActive);
        memoryInternships.add(0, normalizeMap(job));
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
        addInternshipToMemory(nextId, companyId, companyName, title, domain, requiredSkills, workMode, gradYear, location, duration, startDate, endDate, stipend, openings, deadline, "ACTIVE", 1);

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
