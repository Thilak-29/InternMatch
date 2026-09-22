package com.internmatch.company.controller;

import com.internmatch.company.service.CompanyService;
import com.internmatch.company.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/company")
public class CompanyController {

    private static final Logger log = LoggerFactory.getLogger(CompanyController.class);

    private final CompanyService companyService;
    private final ApplicationRepository applicationRepository;

    public CompanyController(CompanyService companyService, ApplicationRepository applicationRepository) {
        this.companyService = companyService;
        this.applicationRepository = applicationRepository;
    }

    private Map<String, Object> getAuthPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Map) {
            return (Map<String, Object>) auth.getPrincipal();
        }
        return Collections.emptyMap();
    }

    private Integer getAuthenticatedUserId() {
        Map<String, Object> principal = getAuthPrincipal();
        Object idObj = principal.get("userId");
        if (idObj instanceof Number) {
            return ((Number) idObj).intValue();
        }
        return null;
    }

    private String getAuthenticatedRole() {
        Map<String, Object> principal = getAuthPrincipal();
        return (String) principal.get("role");
    }

    private boolean isAuthorizedCompany(int targetCompanyId) {
        Integer authUserId = getAuthenticatedUserId();
        String role = getAuthenticatedRole();
        if (authUserId == null || "ADMIN".equalsIgnoreCase(role) || "COMPANY".equalsIgnoreCase(role) || targetCompanyId <= 0) {
            return true;
        }
        return authUserId.equals(targetCompanyId);
    }

    @GetMapping("/{companyId}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable int companyId) {
        if (!isAuthorizedCompany(companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied: Cannot access another company's dashboard."));
        }
        return ResponseEntity.ok(companyService.getCompanyDashboardStats(companyId));
    }

    @GetMapping("/{companyId}/internships")
    public ResponseEntity<?> getInternships(@PathVariable int companyId) {
        if (!isAuthorizedCompany(companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied: Cannot access another company's internships."));
        }
        return ResponseEntity.ok(companyService.getCompanyInternships(companyId));
    }

    @GetMapping("/internships")
    public ResponseEntity<List<Map<String, Object>>> getAllInternships() {
        return ResponseEntity.ok(companyService.getAllActiveInternships());
    }

    @PostMapping("/internships")
    public ResponseEntity<?> postInternship(@RequestBody Map<String, Object> body) {
        try {
            Integer authUserId = getAuthenticatedUserId();
            int companyId = body.containsKey("company_id") ? ((Number) body.get("company_id")).intValue() : (authUserId != null ? authUserId : 0);
            int targetCompanyId = authUserId != null && authUserId > 0 ? authUserId : companyId;

            if (targetCompanyId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "status", 400, "error", "Invalid company_id"));
            }

            Map<String, Object> principal = getAuthPrincipal();
            String vStatus = (String) principal.getOrDefault("verification_status", principal.getOrDefault("verificationStatus", ""));
            if ("REJECTED".equalsIgnoreCase(vStatus) || "SUSPENDED".equalsIgnoreCase(vStatus)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "status", 403,
                    "error", "Recruiter account is " + vStatus + ". Internship creation is restricted."
                ));
            }

            String companyName = (String) body.getOrDefault("company_name", "");
            String title = (String) body.getOrDefault("title", "");
            String domain = (String) body.getOrDefault("domain", "Engineering");
            String skills = (String) body.getOrDefault("required_skills", "");
            String mode = (String) body.getOrDefault("work_mode", "Hybrid");
            int gradYear = body.containsKey("grad_year") ? ((Number) body.get("grad_year")).intValue() : 2026;
            String loc = (String) body.getOrDefault("location", "");
            String duration = (String) body.getOrDefault("duration", "3 Months");
            String startDate = (String) body.getOrDefault("start_date", "");
            String endDate = (String) body.getOrDefault("end_date", "");
            double stipend = body.containsKey("stipend") ? ((Number) body.get("stipend")).doubleValue() : 0.0;
            int openings = body.containsKey("openings") ? ((Number) body.get("openings")).intValue() : 1;
            String deadline = (String) body.getOrDefault("application_deadline", "");

            if (title.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "status", 400, "error", "Internship title is required."));
            }

            Map<String, Object> res = companyService.postInternship(targetCompanyId, companyName, title, domain, skills, mode, gradYear, loc, duration, startDate, endDate, stipend, openings, deadline);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            log.error("Error in postInternship: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "status", 500, "error", "Database error: " + e.getMessage()));
        }
    }

    @PutMapping("/internships/{id}")
    public ResponseEntity<?> updateInternship(@PathVariable int id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(companyService.updateInternship(id, body));
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable int id) {
        return ResponseEntity.ok(companyService.deleteInternship(id));
    }

    @GetMapping({"/{companyId}/applicants", "/applicants", "/all-applicants"})
    public ResponseEntity<?> getApplicants(@PathVariable(required = false) Integer companyId) {
        int targetId = companyId != null ? companyId : 1;
        return ResponseEntity.ok(companyService.getCompanyApplicants(targetId));
    }

    @PutMapping({"/applicants/{id}/status", "/applications/{id}/status"})
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        String stage = (String) body.getOrDefault("stage", "ASSESSMENT");
        if (body != null && body.containsKey("test_score") && body.get("test_score") instanceof Number) {
            double score = ((Number) body.get("test_score")).doubleValue();
            applicationRepository.updateTestScore(id, score);
        }
        return ResponseEntity.ok(companyService.updateApplicantStatus(id, status, stage));
    }

    @PostMapping({"/applications/sync", "/applicants/sync"})
    public ResponseEntity<?> registerApplication(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(companyService.registerApplication(body));
    }

    @PostMapping("/applications/withdraw")
    public ResponseEntity<?> withdrawApplication(@RequestBody Map<String, Object> body) {
        int studentId = body.containsKey("student_id") ? ((Number) body.get("student_id")).intValue() : 0;
        int internshipId = body.containsKey("internship_id") ? ((Number) body.get("internship_id")).intValue() : 0;
        if (studentId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student_id"));
        }
        return ResponseEntity.ok(companyService.withdrawApplication(studentId, internshipId));
    }

    @PostMapping({"/profile/sync", "/profiles/sync"})
    public ResponseEntity<?> syncProfile(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(companyService.syncProfile(body));
    }

    @PostMapping("/generate-test")
    public ResponseEntity<?> generateTest(@RequestBody Map<String, Object> body) {
        int internshipId = body.containsKey("internship_id") ? ((Number) body.get("internship_id")).intValue() : 0;
        if (internshipId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "status", 400, "error", "Invalid internship_id"));
        }
        String title = (String) body.getOrDefault("test_title", "Technical Screening Test");
        int score = body.containsKey("passing_score") ? ((Number) body.get("passing_score")).intValue() : 60;
        int duration = body.containsKey("duration_minutes") ? ((Number) body.get("duration_minutes")).intValue() : 45;

        return ResponseEntity.ok(companyService.createScreeningTest(internshipId, title, score, duration));
    }
}
