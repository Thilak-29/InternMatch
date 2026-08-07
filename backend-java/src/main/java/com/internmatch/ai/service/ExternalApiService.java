package com.internmatch.ai.service;

import java.util.Map;

public interface ExternalApiService {
    Map<String,Object> getLeetCodeStats(String username);
    Map<String,Object> getGitHubStats(String username);
    Map<String,Object> chatWithGroq(String userMessage);
    Map<String,Object> analyzeResumeWithGroq(String resumeText,String jobRole);
    Map<String,Object> evaluateScreeningTestWithGroq(int aptitudeCorrect, int totalAptitude, String code1, String code2, String code3);
}
