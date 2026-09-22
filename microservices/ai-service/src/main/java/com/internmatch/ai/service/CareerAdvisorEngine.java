package com.internmatch.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

public class CareerAdvisorEngine {

    private static final Logger log = LoggerFactory.getLogger(CareerAdvisorEngine.class);

    private static final Map<String, List<String>> SYNONYMS = new HashMap<>();

    static {
        SYNONYMS.put("js", List.of("javascript", "js", "ecmascript"));
        SYNONYMS.put("javascript", List.of("javascript", "js"));
        SYNONYMS.put("ts", List.of("typescript", "ts"));
        SYNONYMS.put("typescript", List.of("typescript", "ts"));
        SYNONYMS.put("react", List.of("react", "reactjs", "react.js"));
        SYNONYMS.put("spring", List.of("spring", "spring boot", "springboot", "java spring"));
        SYNONYMS.put("springboot", List.of("spring", "spring boot", "springboot"));
        SYNONYMS.put("node", List.of("node", "nodejs", "node.js"));
        SYNONYMS.put("python", List.of("python", "py", "django", "flask", "fastapi", "pandas", "numpy"));
        SYNONYMS.put("sql", List.of("sql", "mysql", "postgresql", "oracle", "oracle db", "rdbms"));
        SYNONYMS.put("java", List.of("java", "j2ee", "spring", "spring boot"));
        SYNONYMS.put("ml", List.of("machine learning", "ml", "deep learning", "tensorflow", "pytorch"));
        SYNONYMS.put("aws", List.of("aws", "amazon web services", "s3", "ec2", "lambda"));
    }

    public static Map<String, Object> generateRecommendations(String skillsInput, String existingCertsInput, String degree, String branch, String bio) {
        log.info("Generating personalized Career Advisor recommendations for skills='{}', certs='{}', branch='{}'", skillsInput, existingCertsInput, branch);

        // 1. Normalize student skills
        Set<String> studentSkillSet = parseAndNormalizeSkills(skillsInput);
        Set<String> existingCertSet = parseAndNormalizeCerts(existingCertsInput);

        String contextLower = (skillsInput + " " + degree + " " + branch + " " + bio).toLowerCase();

        // 2. Score and Rank Courses
        List<Map<String, Object>> scoredCourses = new ArrayList<>();
        for (CareerCatalog.Course c : CareerCatalog.ALL_COURSES) {
            int overlapCount = countSkillOverlap(c.skills, studentSkillSet);
            int gapBonus = computeGapBonus(c.skills, studentSkillSet, contextLower);
            int domainBonus = isDomainAligned(c.domain, contextLower) ? 15 : 0;

            int rawScore = (overlapCount * 25) + (gapBonus * 20) + domainBonus;
            int relevancePercentage = Math.min(98, Math.max(62, rawScore > 0 ? 65 + rawScore % 33 : 60));

            // Personalized "Why Recommended" reason
            String personalizedReason = buildPersonalizedCourseReason(c, studentSkillSet, contextLower);

            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", c.id);
            courseMap.put("title", c.title);
            courseMap.put("provider", c.provider);
            courseMap.put("duration", c.duration);
            courseMap.put("level", c.level);
            courseMap.put("reason", personalizedReason);
            courseMap.put("badge", c.badge);
            courseMap.put("skills", c.skills);
            courseMap.put("url", c.url);
            courseMap.put("relevanceScore", relevancePercentage);
            courseMap.put("score", rawScore);

            scoredCourses.add(courseMap);
        }

        scoredCourses.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));
        List<Map<String, Object>> top3Courses = scoredCourses.stream().limit(3).collect(Collectors.toList());

        // 3. Score and Rank Certifications (EXCLUDING already held certs)
        List<Map<String, Object>> scoredCerts = new ArrayList<>();
        for (CareerCatalog.Certification cert : CareerCatalog.ALL_CERTIFICATIONS) {
            // Exclude check: skip if student already holds this certification!
            if (isCertAlreadyHeld(cert, existingCertSet)) {
                log.info("Excluding already completed certification: {}", cert.name);
                continue;
            }

            int overlapCount = countSkillOverlap(cert.skills, studentSkillSet);
            int domainBonus = isDomainAligned(cert.domain, contextLower) ? 20 : 0;

            int rawScore = (overlapCount * 30) + domainBonus;
            int relevancePercentage = Math.min(99, Math.max(65, rawScore > 0 ? 70 + rawScore % 28 : 65));

            String personalizedReason = buildPersonalizedCertReason(cert, studentSkillSet, contextLower);

            Map<String, Object> certMap = new HashMap<>();
            certMap.put("id", cert.id);
            certMap.put("name", cert.name);
            certMap.put("issuer", cert.issuer);
            certMap.put("description", personalizedReason);
            certMap.put("skills", cert.skills);
            certMap.put("url", cert.url);
            certMap.put("color", cert.color);
            certMap.put("relevanceScore", relevancePercentage);
            certMap.put("score", rawScore);

            scoredCerts.add(certMap);
        }

        scoredCerts.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));
        List<Map<String, Object>> top3Certs = scoredCerts.stream().limit(3).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("source", "Catalog Dynamic Personalization Engine");
        result.put("hasSkills", !studentSkillSet.isEmpty());
        result.put("courses", top3Courses);
        result.put("certifications", top3Certs);

        return result;
    }

    private static Set<String> parseAndNormalizeSkills(String raw) {
        Set<String> set = new LinkedHashSet<>();
        if (raw == null || raw.trim().isEmpty()) return set;
        String[] parts = raw.split("[,;/|\\n]+");
        for (String p : parts) {
            String trimmed = p.trim().toLowerCase();
            if (trimmed.length() > 1) {
                set.add(trimmed);
            }
        }
        return set;
    }

    private static Set<String> parseAndNormalizeCerts(String raw) {
        Set<String> set = new LinkedHashSet<>();
        if (raw == null || raw.trim().isEmpty()) return set;
        String[] parts = raw.split("[,;/|\\n]+");
        for (String p : parts) {
            String trimmed = p.trim().toLowerCase();
            if (trimmed.length() > 1) {
                set.add(trimmed);
            }
        }
        return set;
    }

    private static boolean isCertAlreadyHeld(CareerCatalog.Certification cert, Set<String> heldSet) {
        if (heldSet.isEmpty()) return false;
        String certNameLower = cert.name.toLowerCase();
        String certIdLower = cert.id.toLowerCase();
        for (String held : heldSet) {
            if (certNameLower.contains(held) || held.contains(certNameLower) || held.equalsIgnoreCase(certIdLower)) {
                return true;
            }
        }
        return false;
    }

    private static int countSkillOverlap(List<String> itemSkills, Set<String> studentSkills) {
        if (itemSkills == null || studentSkills.isEmpty()) return 0;
        int count = 0;
        for (String s : itemSkills) {
            String sLower = s.toLowerCase();
            if (studentSkills.contains(sLower)) {
                count++;
            } else {
                for (String studSkill : studentSkills) {
                    List<String> synList = SYNONYMS.get(studSkill);
                    if (synList != null && synList.contains(sLower)) {
                        count++;
                        break;
                    }
                }
            }
        }
        return count;
    }

    private static int computeGapBonus(List<String> itemSkills, Set<String> studentSkills, String context) {
        if (itemSkills == null) return 0;
        int gapBonus = 0;
        for (String s : itemSkills) {
            String sLower = s.toLowerCase();
            if (!studentSkills.contains(sLower) && context.contains(sLower)) {
                gapBonus++;
            }
        }
        return gapBonus;
    }

    private static boolean isDomainAligned(String domain, String context) {
        if (domain == null) return false;
        switch (domain) {
            case "JAVA": return context.contains("java") || context.contains("spring") || context.contains("backend");
            case "ML": return context.contains("machine learning") || context.contains("python") || context.contains("ai") || context.contains("deep learning");
            case "WEB": return context.contains("react") || context.contains("web") || context.contains("frontend") || context.contains("javascript") || context.contains("node");
            case "DATA": return context.contains("data") || context.contains("analytics") || context.contains("sql") || context.contains("power bi");
            case "DEVOPS": return context.contains("devops") || context.contains("docker") || context.contains("kubernetes") || context.contains("aws");
            case "CYBER": return context.contains("cyber") || context.contains("security") || context.contains("hacking");
            case "MOBILE": return context.contains("android") || context.contains("kotlin") || context.contains("flutter") || context.contains("mobile");
            case "ECE": return context.contains("embedded") || context.contains("iot") || context.contains("ece") || context.contains("electronics");
            case "MECH": return context.contains("solidworks") || context.contains("cad") || context.contains("mechanical") || context.contains("ansys");
            case "FINANCE": return context.contains("finance") || context.contains("fintech") || context.contains("trading") || context.contains("banking");
            default: return true;
        }
    }

    private static String buildPersonalizedCourseReason(CareerCatalog.Course c, Set<String> studentSkills, String context) {
        List<String> matched = new ArrayList<>();
        for (String s : c.skills) {
            if (studentSkills.contains(s.toLowerCase())) {
                matched.add(s);
            }
        }
        if (!matched.isEmpty()) {
            return "Strengthens your existing " + String.join(" & ", matched.subList(0, Math.min(matched.size(), 2))) + " profile with production-grade skills.";
        }
        return "Bridges a key skill gap to expand your " + c.skills.get(0) + " capabilities for career growth.";
    }

    private static String buildPersonalizedCertReason(CareerCatalog.Certification cert, Set<String> studentSkills, String context) {
        List<String> matched = new ArrayList<>();
        for (String s : cert.skills) {
            if (studentSkills.contains(s.toLowerCase())) {
                matched.add(s);
            }
        }
        if (!matched.isEmpty()) {
            return "Official credential validating your " + String.join(" & ", matched.subList(0, Math.min(matched.size(), 2))) + " expertise.";
        }
        return cert.description;
    }
}
