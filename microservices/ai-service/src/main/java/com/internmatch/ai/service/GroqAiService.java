package com.internmatch.ai.service;

import java.util.Map;

public interface GroqAiService {
    Map<String, Object> evaluateScreeningTest(Map<String, Object> request);
    Map<String, Object> calculateAtsMatch(Map<String, Object> request);
    Map<String, Object> fetchLeetCodeStats(String username);
    Map<String, Object> fetchGitHubStats(String username);
}
