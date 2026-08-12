package com.internmatch.student.service;

import java.util.List;
import java.util.Map;

public interface StudentService {
    Map<String, Object> getStudentDashboard(int studentId);
    Map<String, Object> getStudentProfile(int studentId);
    Map<String, Object> updateStudentProfile(int studentId, Map<String, Object> body);
    Map<String, Object> uploadResume(int studentId, String fileName, String parsedText);
    Map<String, Object> processAndParseResume(int studentId, org.springframework.web.multipart.MultipartFile file);
    List<Map<String, Object>> getStudentApplications(int studentId);
    Map<String, Object> applyForInternship(int studentId, int internshipId);
    Map<String, Object> applyForInternship(int studentId, int internshipId, Map<String, Object> body);
    Map<String, Object> applyForExternalInternship(int studentId, Map<String, Object> body);
    Map<String, Object> updateApplicationDetails(int appId, Map<String, Object> body);
    Map<String, Object> updateTestScore(int appId, double score);
    Map<String, Object> updateApplicationStatus(int appId, String status);
    Map<String, Object> deleteApplication(int appId);
    List<Map<String, Object>> getStudentNotifications(int studentId);
    Map<String, Object> markNotificationRead(int studentId, int notificationId);

    /** Check if a student is eligible to take the proctored quiz for a given application. */
    Map<String, Object> checkQuizEligibility(int studentId, int appId);

    /** Persist a proctoring violation (tab switch / fullscreen exit) — auto-fails the exam. */
    Map<String, Object> recordProctoringViolation(int appId, int studentId);
}
