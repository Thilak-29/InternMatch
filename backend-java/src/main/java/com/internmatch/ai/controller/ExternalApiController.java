package com.internmatch.ai.controller;

import com.internmatch.ai.service.ExternalApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/api/v1")
public class ExternalApiController {

    private final ExternalApiService externalApiService;

    public ExternalApiController(ExternalApiService externalApiService){
        this.externalApiService=externalApiService;
    }

    @GetMapping("/external/leetcode/{username}")
    public ResponseEntity<Map<String,Object>> getLeetCodeStats(@PathVariable String username){
        return ResponseEntity.ok(externalApiService.getLeetCodeStats(username));
    }

    @GetMapping("/external/github/{username}")
    public ResponseEntity<Map<String,Object>> getGitHubStats(@PathVariable String username){
        return ResponseEntity.ok(externalApiService.getGitHubStats(username));
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<Map<String,Object>> chatWithGroq(@RequestBody Map<String,Object> body){
        String message=(String)body.getOrDefault("message","How to improve resume for software engineering?");
        return ResponseEntity.ok(externalApiService.chatWithGroq(message));
    }

    @PostMapping("/ai/analyze-resume")
    public ResponseEntity<Map<String,Object>> analyzeResume(@RequestBody Map<String,Object> body){
        String text=(String)body.getOrDefault("resume_text","React, Java, Spring Boot, SQL, Python");
        String role=(String)body.getOrDefault("job_role","Software Development Intern");
        return ResponseEntity.ok(externalApiService.analyzeResumeWithGroq(text,role));
    }

    @PostMapping("/ai/evaluate-test")
    public ResponseEntity<Map<String,Object>> evaluateTest(@RequestBody Map<String,Object> body){
        int aptitudeCorrect = body.containsKey("aptitude_correct") ? ((Number)body.get("aptitude_correct")).intValue() : 18;
        int totalAptitude = body.containsKey("total_aptitude") ? ((Number)body.get("total_aptitude")).intValue() : 20;
        String code1 = (String)body.getOrDefault("code_1", "");
        String code2 = (String)body.getOrDefault("code_2", "");
        String code3 = (String)body.getOrDefault("code_3", "");
        return ResponseEntity.ok(externalApiService.evaluateScreeningTestWithGroq(aptitudeCorrect, totalAptitude, code1, code2, code3));
    }
}
