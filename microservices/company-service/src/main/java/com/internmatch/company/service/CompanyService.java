package com.internmatch.company.service;

import java.util.List;
import java.util.Map;

public interface CompanyService {
    Map<String, Object> getCompanyDashboardStats(int companyId);
    List<Map<String, Object>> getCompanyInternships(int companyId);
    List<Map<String, Object>> getAllActiveInternships();
    Map<String, Object> postInternship(int companyId, String companyName, String title, String domain, String skills, String mode, int gradYear, String loc, String duration, String startDate, String endDate, double stipend, int openings, String deadline);
    Map<String, Object> updateInternship(int id, Map<String, Object> body);
    Map<String, Object> deleteInternship(int id);
    List<Map<String, Object>> getCompanyApplicants(int companyId);
    Map<String, Object> updateApplicantStatus(int applicationId, String status, String stage);
    Map<String, Object> createScreeningTest(int internshipId, String title, int passingScore, int duration);
}
