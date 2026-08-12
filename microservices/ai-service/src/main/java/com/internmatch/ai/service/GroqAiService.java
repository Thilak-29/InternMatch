package com.internmatch.ai.service;

import java.util.Map;

public interface GroqAiService {
    Map<String, Object> evaluateScreeningTest(Map<String, Object> request);
    Map<String, Object> calculateAtsMatch(Map<String, Object> request);
    Map<String, Object> calculateBatchAtsMatch(Map<String, Object> request);
    Map<String, Object> fetchLeetCodeStats(String username);
    Map<String, Object> fetchGitHubStats(String username);
    Map<String, Object> generateCareerAdvisorRecommendations(Map<String, Object> request);
    Map<String, Object> parseResume(Map<String, Object> request);
}
