package com.internmatch.student.service;

import com.internmatch.student.repository.ApplicationRepository;
import com.internmatch.student.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentServiceImpl implements StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentServiceImpl.class);
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
        if (raw == null) return Collections.emptyMap();
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        if (list == null) return Collections.emptyList();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    @Override
    public Map<String, Object> getStudentDashboard(int studentId) {
        Map<String, Object> profile = profileRepository.findByUserId(studentId);
        List<Map<String, Object>> apps = applicationRepository.findByStudentId(studentId);

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
        res.put("profile", profile != null ? normalizeMap(profile) : Collections.emptyMap());
        res.put("recent_applications", normalizeList(apps));
        return normalizeMap(res);
    }

    @Override
    public Map<String, Object> getStudentProfile(int studentId) {
        Map<String, Object> prof = profileRepository.findByUserId(studentId);
        return prof != null ? normalizeMap(prof) : null;
    }

    @Override
    public Map<String, Object> updateStudentProfile(int studentId, Map<String, Object> body) {
        if (studentId <= 0 || body == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid student ID or request payload.");
            return err;
        }

        String name = (String) body.getOrDefault("name", "");
        String college = (String) body.getOrDefault("college", "Karpagam College of Engineering");
        int gradYear = body.containsKey("grad_year") ? Integer.parseInt(body.get("grad_year").toString()) : 2026;
        double cgpa = body.containsKey("cgpa") ? Double.parseDouble(body.get("cgpa").toString()) : 8.0;
        String location = (String) body.getOrDefault("address", body.getOrDefault("location", ""));
        String leetcode = (String) body.getOrDefault("leetcode", "");
        String github = (String) body.getOrDefault("github", "");
        String yearOfStudy = (String) body.getOrDefault("year_of_study", "3rd Year");
        String degree = (String) body.getOrDefault("degree", "B.E.");
        String branch = (String) body.getOrDefault("branch", body.getOrDefault("department", "Computer Science & Engineering"));
        String gender = (String) body.getOrDefault("gender", "Prefer not to say");
        String linkedin = (String) body.getOrDefault("linkedin", "");
        String portfolio = (String) body.getOrDefault("portfolio", "");
        String bio = (String) body.getOrDefault("bio", "");
        String skills = (String) body.getOrDefault("skills", "");

        profileRepository.updateProfile(studentId, name, college, gradYear, cgpa, location, leetcode, github, yearOfStudy, degree, branch, gender, linkedin, portfolio, bio, skills);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Profile updated successfully in database");
        return resp;
    }

    @Override
    public Map<String, Object> uploadResume(int studentId, String fileName, String parsedText) {
        if (studentId <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            return err;
        }
        try {
            jdbcTemplate.update("UPDATE student_profiles SET resume_file_name = ? WHERE user_id = ?", fileName, studentId);
        } catch (Exception e) {
            log.error("Error saving resume for student {}: {}", studentId, e.getMessage());
        }

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
        if (studentId <= 0 || internshipId <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid student ID or internship ID");
            return err;
        }

        Map<String, Object> profile = profileRepository.findByUserId(studentId);
        String studentName = profile != null && profile.get("name") != null ? profile.get("name").toString() : "Candidate";

        String compName = "Company";
        String roleTitle = "Software Engineering Intern";
        int companyId = 0;

        try {
            List<Map<String, Object>> jobRows = jdbcTemplate.queryForList("SELECT company_id, company_name, title FROM internships WHERE id = ?", internshipId);
            if (!jobRows.isEmpty()) {
                Map<String, Object> j = jobRows.get(0);
                companyId = ((Number) (j.get("company_id") != null ? j.get("company_id") : j.get("COMPANY_ID"))).intValue();
                compName = (String) (j.get("company_name") != null ? j.get("company_name") : j.get("COMPANY_NAME"));
                roleTitle = (String) (j.get("title") != null ? j.get("title") : j.get("TITLE"));
            }
        } catch (Exception e) {
            log.error("Error fetching internship details for {}: {}", internshipId, e.getMessage());
        }

        applicationRepository.saveApplication(studentId, internshipId, companyId, studentName, compName, roleTitle);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Application submitted successfully to database");
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
        if (studentId <= 0) return Collections.emptyList();
        try {
            return normalizeList(jdbcTemplate.queryForList("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC", studentId));
        } catch (Exception e) {
            log.error("Error fetching notifications for student {}: {}", studentId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Object> markNotificationRead(int id) {
        try {
            jdbcTemplate.update("UPDATE notifications SET is_read = 1 WHERE id = ?", id);
        } catch (Exception e) {
            log.error("Error marking notification read {}: {}", id, e.getMessage());
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        return resp;
    }
}
