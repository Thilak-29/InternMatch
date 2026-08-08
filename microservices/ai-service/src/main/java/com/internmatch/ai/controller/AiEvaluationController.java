package com.internmatch.ai.controller;

import com.internmatch.ai.service.GroqAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AiEvaluationController {

    private final GroqAiService groqAiService;

    public AiEvaluationController(GroqAiService groqAiService) {
        this.groqAiService = groqAiService;
    }

    @PostMapping("/ai/evaluate-test")
    public ResponseEntity<?> evaluateTest(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(groqAiService.evaluateScreeningTest(request));
    }

    @PostMapping("/ai/ats-match")
    public ResponseEntity<?> calculateAtsMatch(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(groqAiService.calculateAtsMatch(request));
    }

    @GetMapping("/external/leetcode/{username}")
    public ResponseEntity<?> getLeetCodeStats(@PathVariable String username) {
        return ResponseEntity.ok(groqAiService.fetchLeetCodeStats(username));
    }

    @GetMapping("/external/github/{username}")
    public ResponseEntity<?> getGitHubStats(@PathVariable String username) {
        return ResponseEntity.ok(groqAiService.fetchGitHubStats(username));
    }
}
