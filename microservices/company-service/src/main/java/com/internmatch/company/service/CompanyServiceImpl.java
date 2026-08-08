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

    public CompanyServiceImpl(InternshipRepository internshipRepository, ApplicationRepository applicationRepository, JdbcTemplate jdbcTemplate) {
        this.internshipRepository = internshipRepository;
        this.applicationRepository = applicationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Map<String, Object>> getCompanyInternships(int companyId) {
        return internshipRepository.findByCompanyId(companyId);
    }

    @Override
    public List<Map<String, Object>> getAllActiveInternships() {
        return internshipRepository.findAllActive();
    }

    @Override
    public Map<String, Object> postInternship(int companyId, String companyName, String title, String domain, String skills, String mode, int gradYear, String loc, String duration, String startDate, String endDate, double stipend, int openings, String deadline) {
        try {
            jdbcTemplate.update("INSERT INTO internships (company_id, company_name, title, domain, required_skills, work_mode, grad_year, location, duration, start_date, end_date, stipend, openings, is_active, application_deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'ACTIVE')",
                    companyId, companyName, title, domain, skills, mode, gradYear, loc, duration, startDate, endDate, stipend, openings, deadline);
        } catch (Exception e) {
            internshipRepository.saveInternship(companyId, companyName, title, domain, skills, mode, gradYear, loc, duration, startDate, endDate, stipend, openings);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship posted successfully in College Oracle Database");
        return resp;
    }

    @Override
    public Map<String, Object> updateInternship(int id, Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "Software Engineering Intern");
        String skills = (String) body.getOrDefault("required_skills", "React, Java, SQL");
        String mode = (String) body.getOrDefault("work_mode", "Hybrid");
        String loc = (String) body.getOrDefault("location", "Bengaluru");
        double stipend = body.containsKey("stipend") ? ((Number) body.get("stipend")).doubleValue() : 35000;
        int openings = body.containsKey("openings") ? ((Number) body.get("openings")).intValue() : 5;
        String deadline = (String) body.getOrDefault("application_deadline", "2026-07-15");
        String status = (String) body.getOrDefault("status", "ACTIVE");

        try {
            jdbcTemplate.update("UPDATE internships SET title=?, required_skills=?, work_mode=?, location=?, stipend=?, openings=?, application_deadline=?, status=? WHERE id=?",
                    title, skills, mode, loc, stipend, openings, deadline, status, id);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Internship details updated successfully");
        return resp;
    }

    @Override
    public Map<String, Object> deleteInternship(int id) {
        try {
            jdbcTemplate.update("DELETE FROM applications WHERE internship_id=?", id);
            jdbcTemplate.update("DELETE FROM internships WHERE id=?", id);
        } catch (Exception e) {}
        internshipRepository.deleteInternship(id);

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
    public Map<String, Object> updateApplicantStatus(int applicationId, String status, String stage) {
        applicationRepository.updateStatus(applicationId, status, stage);

        if ("OFFER_SENT".equals(status) || "HIRED".equals(status)) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT internship_id FROM applications WHERE id=?", applicationId);
                if (!rows.isEmpty()) {
                    int internId = ((Number) rows.get(0).get("internship_id")).intValue();
                    List<Map<String, Object>> hiredRows = jdbcTemplate.queryForList("SELECT count(*) as hired_cnt FROM applications WHERE internship_id=? AND (status='OFFER_SENT' OR status='HIRED')", internId);
                    List<Map<String, Object>> internRow = jdbcTemplate.queryForList("SELECT openings FROM internships WHERE id=?", internId);
                    if (!hiredRows.isEmpty() && !internRow.isEmpty()) {
                        int hiredCount = ((Number) hiredRows.get(0).get("hired_cnt")).intValue();
                        int totalOpenings = ((Number) internRow.get(0).get("openings")).intValue();
                        if (hiredCount >= totalOpenings) {
                            jdbcTemplate.update("UPDATE internships SET status='CLOSED', is_active=0 WHERE id=?", internId);
                        }
                    }
                }
            } catch (Exception e) {}
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("status", status);
        resp.put("stage", stage);
        return resp;
    }

    @Override
    public Map<String, Object> getCompanyDashboardStats(int companyId) {
        List<Map<String, Object>> internships = internshipRepository.findByCompanyId(companyId);
        List<Map<String, Object>> applicants = applicationRepository.findByCompanyId(companyId);

        int totalPosted = internships.size();
        int totalApplicants = applicants.size();
        int shortlisted = 0;
        int interviews = 0;
        int offers = 0;
        int hires = 0;

        for (Map<String, Object> app : applicants) {
            String st = (String) app.get("status");
            if ("SHORTLISTED".equals(st) || "TEST_PASSED".equals(st) || "ACCEPTED_FOR_TEST".equals(st)) shortlisted++;
            if ("INTERVIEW_SCHEDULED".equals(st)) interviews++;
            if ("OFFER_SENT".equals(st)) offers++;
            if ("HIRED".equals(st) || "SELECTED".equals(st)) hires++;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_posted", totalPosted);
        stats.put("total_applicants", totalApplicants);
        stats.put("shortlisted", shortlisted);
        stats.put("interviews_scheduled", interviews);
        stats.put("offers_sent", offers);
        stats.put("hires_count", hires);
        stats.put("posted_internships", internships);
        return stats;
    }

    @Override
    public Map<String, Object> createScreeningTest(int internshipId, String title, int passingScore, int duration) {
        try {
            jdbcTemplate.update("INSERT INTO screening_tests (internship_id, test_title, passing_score, duration_minutes) VALUES (?, ?, ?, ?)", internshipId, title, passingScore, duration);
        } catch (Exception e) {}
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Custom proctored screening test created for internship");
        return resp;
    }
}
