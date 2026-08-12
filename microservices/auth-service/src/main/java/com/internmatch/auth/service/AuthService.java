package com.internmatch.auth.service;

import java.util.Map;

public interface AuthService {
    Map<String, Object> checkUsername(String username);
    Map<String, Object> login(String identifier, String password);
    Map<String, Object> register(Map<String, Object> data);
    Map<String, Object> verifyRegistrationOtp(String email, String otp);
    Map<String, Object> forgotPassword(String email);
    Map<String, Object> verifyOtp(String email, String otp);
    Map<String, Object> resetPassword(String resetToken, String newPassword, String confirmPassword);
    Map<String, Object> requestEmailChange(int userId, String newEmail);
    Map<String, Object> verifyEmailChange(int userId, String newEmail, String otp);
}
