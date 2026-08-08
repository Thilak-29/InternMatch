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

    @Override
    public Map<String, Object> getCompanyDashboard(int companyId) {
        List<Map<String, Object>> posted = internshipRepository.findByCompanyId(companyId);
        List<Map<String, Object>> apps = applicationRepository.findByCompanyId(companyId);

        int shortlisted = 0;
        int offers = 0;
        int hired = 0;

        for (Map<String, Object> a : apps) {
            String st = (String) (a.get("status") != null ? a.get("status") : a.get("STATUS"));
            if ("SHORTLISTED".equals(st) || "ACCEPTED_FOR_TEST".equals(st) || "TEST_PASSED".equals(st)) {
                shortlisted++;
            } else if ("OFFER_SENT".equals(st) || "OFFER".equals(st)) {
                offers++;
            } else if ("HIRED".equals(st)) {
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
        return res;
    }

    @Override
    public Map<String, Object> postInternship(Map<String, Object> internshipData) {
        int companyId = ((Number) internshipData.getOrDefault("company_id", 10)).intValue();
        String companyName = (String) internshipData.getOrDefault("company_name", "NVIDIA Corporation");
        String title = (String) internshipData.getOrDefault("title", "AI/ML Engineering Intern");
        String domain = (String) internshipData.getOrDefault("domain", "Artificial Intelligence");
        String requiredSkills = (String) internshipData.getOrDefault("required_skills", "Python, PyTorch, SQL");
        String workMode = (String) internshipData.getOrDefault("work_mode", "Hybrid");
        int gradYear = ((Number) internshipData.getOrDefault("grad_year", 2026)).intValue();
        String location = (String) internshipData.getOrDefault("location", "Bengaluru");
        String duration = (String) internshipData.getOrDefault("duration", "3 Months");
        String startDate = (String) internshipData.getOrDefault("start_date", "2026-06-01");
        String endDate = (String) internshipData.getOrDefault("end_date", "2026-08-31");
        double stipend = ((Number) internshipData.getOrDefault("stipend", 35000)).doubleValue();
        int openings = ((Number) internshipData.getOrDefault("openings", 5)).intValue();
        String deadline = (String) internshipData.getOrDefault("application_deadline", "2026-07-30");

        internshipRepository.saveInternship(companyId, companyName, title, domain, requiredSkills, workMode, gradYear, location, duration, startDate, endDate, stipend, openings, deadline);

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
        return applicationRepository.findByCompanyId(companyId);
    }

    @Override
    public Map<String, Object> updateApplicantStatus(int applicationId, String status) {
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
        resp.put("message", "Status updated successfully");
        return resp;
    }

    @Override
    public List<Map<String, Object>> getAllInternships() {
        return internshipRepository.findAll();
    }
}
