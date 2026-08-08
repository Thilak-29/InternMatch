package com.internmatch.student.service;

import java.util.List;
import java.util.Map;

public interface StudentService {
    Map<String, Object> getStudentDashboard(int studentId);
    Map<String, Object> getStudentProfile(int studentId);
    Map<String, Object> updateStudentProfile(int studentId, Map<String, Object> body);
    Map<String, Object> uploadResume(int studentId, String fileName, String parsedText);
    List<Map<String, Object>> getStudentApplications(int studentId);
    Map<String, Object> applyForInternship(int studentId, int internshipId);
    Map<String, Object> updateTestScore(int appId, double score);
    List<Map<String, Object>> getStudentNotifications(int studentId);
    List<Map<String, Object>> getNotifications(int studentId);
    Map<String, Object> markNotificationRead(int id);
}
