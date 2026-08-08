package com.internmatch.company.service;

import com.internmatch.company.repository.ApplicationRepository;
import com.internmatch.company.repository.InternshipRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final InternshipRepository internshipRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbcTemplate;

    public CompanyServiceImpl(InternshipRepository internshipRepository,
                              ApplicationRepository applicationRepository,
                              JdbcTemplate jdbcTemplate) {
        this.internshipRepository = internshipRepository;
        this.applicationRepository = applicationRepository;
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

    @Override
    public Map<String, Object> getCompanyDashboardStats(int companyId) {
        List<Map<String, Object>> posted = normalizeList(internshipRepository.findByCompanyId(companyId));
        List<Map<String, Object>> apps = normalizeList(applicationRepository.findByCompanyId(companyId));

        int shortlisted = 0;
        int offers = 0;
        int hired = 0;

        for (Map<String, Object> a : apps) {
            String st = (String) (a.get("status") != null ? a.get("status") : a.get("STATUS"));
            if ("SHORTLISTED".equalsIgnoreCase(st) || "ACCEPTED_FOR_TEST".equalsIgnoreCase(st) || "TEST_PASSED".equalsIgnoreCase(st)) {
                shortlisted++;
            } else if ("OFFER_SENT".equalsIgnoreCase(st) || "OFFER".equalsIgnoreCase(st)) {
                offers++;
            } else if ("HIRED".equalsIgnoreCase(st)) {
                hired++;
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("total_posted", posted.size());
        res.put("total_applicants", apps.size());
        res.put("shortlisted", shortlisted);
        res.put("interviews_scheduled", shortlisted);
        res.put("offers_sent", offers);
        res.put("hires_count", hired);
        res.put("posted_internships", posted);
        return normalizeMap(res);
    }

    @Override
    public List<Map<String, Object>> getCompanyInternships(int companyId) {
        return normalizeList(internshipRepository.findByCompanyId(companyId));
    }

    @Override
    public List<Map<String, Object>> getAllActiveInternships() {
        return normalizeList(internshipRepository.findAll());
    }

    @Override
    public Map<String, Object> postInternship(int companyId, String companyName, String title, String domain,
                                             String skills, String mode, int gradYear, String loc,
                                             String duration, String startDate, String endDate,
                                             double stipend, int openings, String deadline) {
        internshipRepository.saveInternship(companyId, companyName, title, domain, skills, mode, gradYear, loc, duration, startDate, endDate, stipend, openings, deadline);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship published successfully into Oracle Database");
        return resp;
    }

    @Override
    public Map<String, Object> updateInternship(int id, Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "Internship");
        String requiredSkills = (String) body.getOrDefault("required_skills", "");
        String workMode = (String) body.getOrDefault("work_mode", "Hybrid");
        String location = (String) body.getOrDefault("location", "Bengaluru");
        double stipend = body.containsKey("stipend") ? ((Number) body.get("stipend")).doubleValue() : 35000;
        int openings = body.containsKey("openings") ? ((Number) body.get("openings")).intValue() : 5;
        String deadline = (String) body.getOrDefault("application_deadline", "");

        try {
            jdbcTemplate.update("UPDATE internships SET title=?, required_skills=?, work_mode=?, location=?, stipend=?, openings=?, application_deadline=? WHERE id=?",
                    title, requiredSkills, workMode, location, stipend, openings, deadline, id);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship updated successfully");
        return resp;
    }

    @Override
    public Map<String, Object> deleteInternship(int id) {
        try {
            jdbcTemplate.update("DELETE FROM applications WHERE internship_id=?", id);
            jdbcTemplate.update("DELETE FROM internships WHERE id=?", id);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship deleted successfully");
        return resp;
    }

    @Override
    public List<Map<String, Object>> getCompanyApplicants(int companyId) {
        return normalizeList(applicationRepository.findByCompanyId(companyId));
    }

    @Override
    public Map<String, Object> updateApplicantStatus(int applicationId, String status, String stage) {
        applicationRepository.updateStatus(applicationId, status);

        if ("OFFER_SENT".equalsIgnoreCase(status) || "HIRED".equalsIgnoreCase(status)) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT internship_id FROM applications WHERE id = ?", applicationId);
                if (!rows.isEmpty()) {
                    int internshipId = ((Number) rows.get(0).get("internship_id")).intValue();
                    List<Map<String, Object>> jobRows = jdbcTemplate.queryForList("SELECT openings FROM internships WHERE id = ?", internshipId);
                    if (!jobRows.isEmpty()) {
                        int openings = ((Number) jobRows.get(0).get("openings")).intValue();
                        int hiredCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM applications WHERE internship_id = ? AND status IN ('OFFER_SENT', 'HIRED')", Integer.class, internshipId);
                        if (hiredCount >= openings) {
                            jdbcTemplate.update("UPDATE internships SET status = 'CLOSED', is_active = 0 WHERE id = ?", internshipId);
                        }
                    }
                }
            } catch (Exception e) {}
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("status", status);
        resp.put("stage", stage);
        resp.put("message", "Status updated successfully");
        return resp;
    }

    @Override
    public Map<String, Object> createScreeningTest(int internshipId, String title, int passingScore, int duration) {
        try {
            jdbcTemplate.update("INSERT INTO screening_tests (internship_id, title, passing_score, duration_minutes, created_at) VALUES (?, ?, ?, ?, SYSDATE)",
                    internshipId, title, passingScore, duration);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("internship_id", internshipId);
        resp.put("title", title);
        resp.put("passing_score", passingScore);
        resp.put("duration_minutes", duration);
        resp.put("message", "Screening test configured successfully");
        return resp;
    }
}
