package com.internmatch.auth.service;

public interface EmailService {
    void sendRegistrationOtpEmail(String recipientEmail, String otpCode);
    void sendForgotPasswordOtpEmail(String recipientEmail, String otpCode);
    void sendOtpEmail(String recipientEmail, String otpCode);
}
