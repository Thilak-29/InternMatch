package com.internmatch.ai.controller;

import com.internmatch.ai.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/api/v1/company")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService){
        this.companyService=companyService;
    }

    @GetMapping("/{companyId}/dashboard")
    public ResponseEntity<Map<String,Object>> getDashboard(@PathVariable int companyId){
        return ResponseEntity.ok(companyService.getCompanyDashboardStats(companyId));
    }

    @GetMapping("/{companyId}/internships")
    public ResponseEntity<List<Map<String,Object>>> getInternships(@PathVariable int companyId){
        return ResponseEntity.ok(companyService.getCompanyInternships(companyId));
    }

    @GetMapping("/internships")
    public ResponseEntity<List<Map<String,Object>>> getAllInternships(){
        return ResponseEntity.ok(companyService.getAllActiveInternships());
    }

    @PostMapping("/internships")
    public ResponseEntity<Map<String,Object>> postInternship(@RequestBody Map<String,Object> body){
        int companyId=body.containsKey("company_id")?((Number)body.get("company_id")).intValue():1;
        String companyName=(String)body.getOrDefault("company_name","Google");
        String title=(String)body.getOrDefault("title","Software Development Intern");
        String domain=(String)body.getOrDefault("domain","Software Engineering");
        String skills=(String)body.getOrDefault("required_skills","React, Java, SQL");
        String mode=(String)body.getOrDefault("work_mode","Hybrid");
        int gradYear=body.containsKey("grad_year")?((Number)body.get("grad_year")).intValue():2026;
        String loc=(String)body.getOrDefault("location","Bengaluru");
        String duration=(String)body.getOrDefault("duration","3 Months");
        String startDate=(String)body.getOrDefault("start_date","2026-06-01");
        String endDate=(String)body.getOrDefault("end_date","2026-08-31");
        double stipend=body.containsKey("stipend")?((Number)body.get("stipend")).doubleValue():35000;
        int openings=body.containsKey("openings")?((Number)body.get("openings")).intValue():5;

        return ResponseEntity.ok(companyService.postInternship(companyId,companyName,title,domain,skills,mode,gradYear,loc,duration,startDate,endDate,stipend,openings));
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<Map<String,Object>> deleteInternship(@PathVariable int id){
        return ResponseEntity.ok(companyService.deleteInternship(id));
    }

    @GetMapping("/{companyId}/applicants")
    public ResponseEntity<List<Map<String,Object>>> getApplicants(@PathVariable int companyId){
        return ResponseEntity.ok(companyService.getCompanyApplicants(companyId));
    }

    @PutMapping("/applicants/{id}/status")
    public ResponseEntity<Map<String,Object>> updateStatus(@PathVariable int id,@RequestBody Map<String,Object> body){
        String status=(String)body.get("status");
        String stage=(String)body.getOrDefault("stage","ASSESSMENT");
        return ResponseEntity.ok(companyService.updateApplicantStatus(id,status,stage));
    }

    @PostMapping("/generate-test")
    public ResponseEntity<Map<String,Object>> generateTest(@RequestBody Map<String,Object> body){
        int internshipId=body.containsKey("internship_id")?((Number)body.get("internship_id")).intValue():1;
        String title=(String)body.getOrDefault("test_title","Technical Screening Test");
        int score=body.containsKey("passing_score")?((Number)body.get("passing_score")).intValue():60;
        int duration=body.containsKey("duration_minutes")?((Number)body.get("duration_minutes")).intValue():45;

        return ResponseEntity.ok(companyService.createScreeningTest(internshipId,title,score,duration));
    }
}
