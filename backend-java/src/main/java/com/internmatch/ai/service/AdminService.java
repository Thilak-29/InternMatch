package com.internmatch.ai.service;

import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String,Object> getAdminStats();
    List<Map<String,Object>> getAllUsers();
    Map<String,Object> deleteUser(int userId);
    List<Map<String,Object>> getAllInternships();
    Map<String,Object> deleteInternship(int internshipId);
}
