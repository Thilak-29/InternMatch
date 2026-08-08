package com.internmatch.company.service;

import java.util.List;
import java.util.Map;

public interface CompanyService {
    Map<String, Object> getCompanyDashboard(int companyId);
    Map<String, Object> createInternship(Map<String, Object> body);
    List<Map<String, Object>> getCompanyApplicants(int companyId);
    Map<String, Object> updateApplicationStatus(int applicationId, String status);
    List<Map<String, Object>> getAllInternships();
}
