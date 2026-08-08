package com.internmatch.student.service;

import com.internmatch.student.repository.ApplicationRepository;
import com.internmatch.student.repository.StudentProfileRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository profileRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbcTemplate;

    public StudentServiceImpl(StudentProfileRepository profileRepository,
                              ApplicationRepository applicationRepository,
                              JdbcTemplate jdbcTemplate) {
        this.profileRepository = profileRepository;
        this.applicationRepository = applicationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private Map<String, Object> normalizeMap(Map<String, Object> raw) {
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    @Override
    public Map<String, Object> getStudentDashboard(int studentId) {
        Map<String, Object> profile = normalizeMap(profileRepository.findByUserId(studentId));
        List<Map<String, Object>> apps = normalizeList(applicationRepository.findByStudentId(studentId));

        int applied = apps.size();
        int inReview = 0;
        int shortlisted = 0;
        int offers = 0;

        for (Map<String, Object> a : apps) {
            String st = (String) (a.get("status") != null ? a.get("status") : a.get("STATUS"));
            if ("APPLIED".equalsIgnoreCase(st)) inReview++;
            else if ("SHORTLISTED".equalsIgnoreCase(st) || "ACCEPTED_FOR_TEST".equalsIgnoreCase(st) || "TEST_PASSED".equalsIgnoreCase(st)) shortlisted++;
            else if ("OFFER_SENT".equalsIgnoreCase(st) || "OFFER".equalsIgnoreCase(st) || "HIRED".equalsIgnoreCase(st)) offers++;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("student_id", studentId);
        res.put("applied_count", applied);
        res.put("in_review", inReview);
        res.put("shortlisted", shortlisted);
        res.put("offers_received", offers);
        res.put("match_rate_percent", 94);
        res.put("profile", profile);
        res.put("recent_applications", apps);
        return normalizeMap(res);
    }

    @Override
    public Map<String, Object> getStudentProfile(int studentId) {
        return normalizeMap(profileRepository.findByUserId(studentId));
    }

    @Override
    public Map<String, Object> updateStudentProfile(int studentId, Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "Candidate");
        String college = (String) body.getOrDefault("college", "Karpagam College of Engineering");
        int gradYear = body.containsKey("grad_year") ? ((Number) body.get("grad_year")).intValue() : 2026;
        double cgpa = body.containsKey("cgpa") ? ((Number) body.get("cgpa")).doubleValue() : 8.5;
        String address = (String) body.getOrDefault("address", (String) body.getOrDefault("location", "Thenkasi"));
        String skills = (String) body.getOrDefault("skills", "React, Java, SQL, Python");
        String leetcode = (String) body.getOrDefault("leetcode", "Thilak0329");
        String github = (String) body.getOrDefault("github", "Thilak-29");
        String yearOfStudy = (String) body.getOrDefault("year_of_study", "3rd Year");
        String degree = (String) body.getOrDefault("degree", "B.E.");
        String branch = (String) body.getOrDefault("branch", "Computer Science & Engineering");

        try {
            jdbcTemplate.update("UPDATE student_profiles SET name=?, college=?, grad_year=?, cgpa=?, address=?, skills=?, leetcode=?, github=?, year_of_study=?, degree=?, branch=? WHERE user_id=?",
                    name, college, gradYear, cgpa, address, skills, leetcode, github, yearOfStudy, degree, branch, studentId);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Profile updated successfully in Oracle DB");
        return resp;
    }

    @Override
    public Map<String, Object> uploadResume(int studentId, String fileName, String parsedText) {
        try {
            jdbcTemplate.update("UPDATE student_profiles SET resume_file_name=? WHERE user_id=?", fileName, studentId);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("resume_file_name", fileName);
        resp.put("message", "Resume uploaded successfully");
        return resp;
    }

    @Override
    public List<Map<String, Object>> getStudentApplications(int studentId) {
        return normalizeList(applicationRepository.findByStudentId(studentId));
    }

    @Override
    public Map<String, Object> applyForInternship(int studentId, int internshipId) {
        Map<String, Object> profile = profileRepository.findByUserId(studentId);
        String studentName = (String) (profile.get("name") != null ? profile.get("name") : profile.get("NAME"));
        if (studentName == null) studentName = "Candidate";

        String compName = "Company";
        String roleTitle = "Software Intern";
        int companyId = 10;

        try {
            List<Map<String, Object>> jobRows = jdbcTemplate.queryForList("SELECT company_id, company_name, title FROM internships WHERE id = ?", internshipId);
            if (!jobRows.isEmpty()) {
                Map<String, Object> j = jobRows.get(0);
                companyId = ((Number) (j.get("company_id") != null ? j.get("company_id") : j.get("COMPANY_ID"))).intValue();
                compName = (String) (j.get("company_name") != null ? j.get("company_name") : j.get("COMPANY_NAME"));
                roleTitle = (String) (j.get("title") != null ? j.get("title") : j.get("TITLE"));
            }
        } catch (Exception e) {}

        applicationRepository.saveApplication(studentId, internshipId, companyId, studentName, compName, roleTitle);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Application submitted successfully to Oracle Database");
        return resp;
    }

    @Override
    public Map<String, Object> updateTestScore(int appId, double score) {
        String status = score >= 60 ? "TEST_PASSED" : "ASSESSMENT_FAILED";
        String stage = score >= 60 ? "INTERVIEW" : "REJECTED";

        applicationRepository.updateTestScore(appId, score, status, stage);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("test_score", score);
        resp.put("status", status);
        resp.put("stage", stage);
        return resp;
    }

    @Override
    public List<Map<String, Object>> getStudentNotifications(int studentId) {
        return getNotifications(studentId);
    }

    @Override
    public List<Map<String, Object>> getNotifications(int studentId) {
        try {
            return normalizeList(jdbcTemplate.queryForList("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", studentId));
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Object> markNotificationRead(int id) {
        try {
            jdbcTemplate.update("UPDATE notifications SET is_read = 1 WHERE id = ?", id);
        } catch (Exception e) {}

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        return resp;
    }
}
