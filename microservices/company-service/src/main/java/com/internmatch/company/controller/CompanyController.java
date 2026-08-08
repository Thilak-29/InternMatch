package com.internmatch.company.controller;

import com.internmatch.company.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/company")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable int id) {
        return ResponseEntity.ok(companyService.getCompanyDashboard(id));
    }

    @PostMapping("/internships")
    public ResponseEntity<?> createInternship(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(companyService.createInternship(body));
    }

    @GetMapping("/{id}/applicants")
    public ResponseEntity<?> getApplicants(@PathVariable int id) {
        return ResponseEntity.ok(companyService.getCompanyApplicants(id));
    }

    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        String status = (String) body.getOrDefault("status", "SHORTLISTED");
        return ResponseEntity.ok(companyService.updateApplicationStatus(appId, status));
    }

    @GetMapping("/all-internships")
    public ResponseEntity<?> getAllInternships() {
        return ResponseEntity.ok(companyService.getAllInternships());
    }
}
