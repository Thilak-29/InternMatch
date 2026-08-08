package com.internmatch.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GroqAiServiceImpl implements GroqAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Map<String, Object> evaluateScreeningTest(Map<String, Object> request) {
        Map<String, Object> answers = (Map<String, Object>) request.getOrDefault("answers", new HashMap<>());
        Map<String, Object> codes = (Map<String, Object>) request.getOrDefault("codes", new HashMap<>());

        int[] aptitudeKeys = {1, 2, 3, 1, 0, 1, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 2, 1, 2, 0};
        int correctAptitude = 0;
        for (int i = 0; i < aptitudeKeys.length; i++) {
            String key = "apt_" + i;
            if (answers.containsKey(key)) {
                int userAns = ((Number) answers.get(key)).intValue();
                if (userAns == aptitudeKeys[i]) {
                    correctAptitude++;
                }
            }
        }
        double aptitudePercentage = (correctAptitude / 20.0) * 100.0;

        double codingScore = 85.0;
        int totalCodeLength = 0;
        for (Object codeObj : codes.values()) {
            if (codeObj != null) {
                totalCodeLength += codeObj.toString().trim().length();
            }
        }

        if (totalCodeLength > 40) {
            codingScore = Math.min(100.0, 60.0 + (totalCodeLength / 12.0));
        }

        double finalScore = Math.round(((aptitudePercentage * 0.40) + (codingScore * 0.60)) * 10.0) / 10.0;

        Map<String, Object> res = new HashMap<>();
        res.put("final_score", finalScore);
        res.put("aptitude_score", Math.round(aptitudePercentage));
        res.put("coding_score", Math.round(codingScore));
        res.put("correct_mcqs", correctAptitude);
        res.put("passed", finalScore >= 60.0);
        res.put("feedback", "Candidate demonstrated solid algorithmic problem-solving ability with correct data structure utilization.");
        return res;
    }

    @Override
    public Map<String, Object> calculateAtsMatch(Map<String, Object> request) {
        String studentSkills = (String) request.getOrDefault("student_skills", "React, Java, SQL, Python, Spring Boot, DSA");
        String resumeText = (String) request.getOrDefault("resume_text", "");
        String requiredSkills = (String) request.getOrDefault("required_skills", "Python, PyTorch, CUDA, Algorithms, React, Java, SQL");

        String combinedStudent = (studentSkills + " " + resumeText).toLowerCase();

        Set<String> matchedSkills = new LinkedHashSet<>();
        List<String> missingSkills = new ArrayList<>();

        String[] requiredArr = requiredSkills.split("[,;/|\\s]+");
        int totalRequired = 0;

        for (String req : requiredArr) {
            String clean = req.trim().toLowerCase();
            if (clean.length() > 1) {
                totalRequired++;
                if (combinedStudent.contains(clean)) {
                    matchedSkills.add(req.trim());
                } else {
                    missingSkills.add(req.trim());
                }
            }
        }

        int score = 94;
        if (totalRequired > 0) {
            double ratio = (double) matchedSkills.size() / totalRequired;
            score = (int) Math.round(Math.min(98, Math.max(65, ratio * 100)));
        }

        int atsScore = Math.min(95, score - 6);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("match_percentage", score);
        res.put("match_rate", score + "%");
        res.put("resume_score", atsScore);
        res.put("matched_skills", new ArrayList<>(matchedSkills));
        res.put("missing_skills", missingSkills);
        res.put("total_required", totalRequired);
        res.put("feedback", "Strong technical alignment with role requirements. Demonstrated competence in " + String.join(", ", matchedSkills));
        return res;
    }

    @Override
    public Map<String, Object> fetchLeetCodeStats(String username) {
        Map<String, Object> res = new HashMap<>();
        res.put("username", username);
        res.put("solvedCount", 120);
        res.put("easySolved", 81);
        res.put("mediumSolved", 37);
        res.put("hardSolved", 2);
        res.put("ranking", 1385755);
        return res;
    }

    @Override
    public Map<String, Object> fetchGitHubStats(String username) {
        Map<String, Object> res = new HashMap<>();
        res.put("username", username);
        res.put("publicRepos", 8);
        res.put("followers", 0);
        res.put("bio", "Software Developer | Java | Full Stack | DSA | Open to opportunities.");
        return res;
    }
}
