package com.internmatch.company.service;

import com.internmatch.company.repository.InternshipRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final InternshipRepository internshipRepository;
    private final JdbcTemplate jdbcTemplate;

    public CompanyServiceImpl(InternshipRepository internshipRepository, JdbcTemplate jdbcTemplate) {
        this.internshipRepository = internshipRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Map<String, Object> getCompanyDashboard(int companyId) {
        List<Map<String, Object>> internships = internshipRepository.findByCompanyId(companyId);
        List<Map<String, Object>> applicants = internshipRepository.findApplicantsByCompanyId(companyId);

        int hired = 0;
        int shortlisted = 0;
        for (Map<String, Object> a : applicants) {
            String st = (String) (a.get("status") != null ? a.get("status") : a.get("STATUS"));
            if ("OFFER_ACCEPTED".equals(st) || "OFFER_SENT".equals(st) || "HIRED".equals(st)) {
                hired++;
            } else if ("SHORTLISTED".equals(st) || "TEST_PASSED".equals(st)) {
                shortlisted++;
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("total_internships", internships.size());
        res.put("total_applicants", applicants.size());
        res.put("shortlisted", shortlisted);
        res.put("hired", hired);
        res.put("internships", internships);
        return res;
    }

    @Override
    public Map<String, Object> createInternship(Map<String, Object> body) {
        int companyId = body.containsKey("company_id") ? ((Number) body.get("company_id")).intValue() : 1;
        String title = (String) body.getOrDefault("title", "Software Engineering Intern");
        String companyName = (String) body.getOrDefault("company_name", "Enterprise Partner");
        String stipend = (String) body.getOrDefault("stipend", "₹35,000 / month");
        String location = (String) body.getOrDefault("location", "Bengaluru (Hybrid)");
        String duration = (String) body.getOrDefault("duration", "6 Months");
        String skillsRequired = (String) body.getOrDefault("skills_required", "React, Java, SQL");
        String description = (String) body.getOrDefault("description", "High impact internship building production systems.");

        internshipRepository.saveInternship(companyId, title, companyName, stipend, location, duration, skillsRequired, description);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Internship posted successfully in Oracle DB.");
        return res;
    }

    @Override
    public List<Map<String, Object>> getCompanyApplicants(int companyId) {
        return internshipRepository.findApplicantsByCompanyId(companyId);
    }

    @Override
    public Map<String, Object> updateApplicationStatus(int applicationId, String status) {
        internshipRepository.updateApplicationStatus(applicationId, status);

        List<Map<String, Object>> appRows = jdbcTemplate.queryForList("SELECT student_id FROM applications WHERE id = ?", applicationId);
        if (!appRows.isEmpty()) {
            int studentId = ((Number) (appRows.get(0).get("student_id") != null ? appRows.get(0).get("student_id") : appRows.get(0).get("STUDENT_ID"))).intValue();
            String msg = "OFFER_SENT".equals(status) ? "🎉 Congratulations! You received an official Internship Offer Letter!" : "Status updated to: " + status;
            try {
                jdbcTemplate.update("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'APPLICATION_STATUS_CHANGED')", studentId, msg);
            } catch (Exception e) {}
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("status", status);
        return res;
    }

    @Override
    public List<Map<String, Object>> getAllInternships() {
        return internshipRepository.findAll();
    }
}
