package com.internmatch.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private static final String OFFICIAL_SENDER_EMAIL = "internmatch20@gmail.com";
    private static final String OFFICIAL_SENDER_NAME = "InternMatch AI";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:internmatch20@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:klbjxufsjyjdeuop}")
    private String mailPassword;

    @Override
    public void sendRegistrationOtpEmail(String recipientEmail, String otpCode) {
        String subject = "InternMatch AI - Verify Your Email";
        String content = "Hello,\n\n" +
                "Welcome to InternMatch AI.\n\n" +
                "Your email verification OTP is:\n\n" +
                otpCode + "\n\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "If you did not create an InternMatch AI account, please ignore this email.\n\n" +
                "Regards,\n" +
                "InternMatch AI Team\n" +
                OFFICIAL_SENDER_EMAIL;

        dispatchEmail(recipientEmail, subject, content, "registration verification");
    }

    @Override
    public void sendForgotPasswordOtpEmail(String recipientEmail, String otpCode) {
        String subject = "InternMatch AI - Password Reset OTP";
        String content = "Hello,\n\n" +
                "We received a request to reset your InternMatch AI password.\n\n" +
                "Your password reset OTP is:\n\n" +
                otpCode + "\n\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Regards,\n" +
                "InternMatch AI Team\n" +
                OFFICIAL_SENDER_EMAIL;

        dispatchEmail(recipientEmail, subject, content, "password reset");
    }

    @Override
    public void sendOtpEmail(String recipientEmail, String otpCode) {
        sendForgotPasswordOtpEmail(recipientEmail, otpCode);
    }

    private void dispatchEmail(String recipientEmail, String subject, String content, String flowName) {
        String cleanRecipient = recipientEmail != null ? recipientEmail.trim() : "";
        log.info("[EMAIL] Sender: {}", OFFICIAL_SENDER_EMAIL);
        log.info("[EMAIL] Recipient: {}", cleanRecipient);
        log.info("🔑 [OTP DISPATCH] Sending {} OTP to {}:\n{}", flowName, cleanRecipient, content);

        if (mailSender == null) {
            log.warn("JavaMailSender is not initialized. Please verify spring-boot-starter-mail dependency and application properties.");
            return;
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            log.warn("MAIL_PASSWORD environment variable is missing or empty. Live SMTP email cannot be authenticated with Gmail.");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");

            String senderAddress = (mailUsername != null && !mailUsername.trim().isEmpty()) ? mailUsername.trim() : OFFICIAL_SENDER_EMAIL;
            helper.setFrom(senderAddress, OFFICIAL_SENDER_NAME);
            helper.setTo(cleanRecipient);
            helper.setSubject(subject);
            helper.setText(content);

            mailSender.send(mimeMessage);
            log.info("[EMAIL] OTP email sent successfully to {}", cleanRecipient);
        } catch (Exception e) {
            log.error("Failed to dispatch {} OTP email to recipient {}: {}", flowName, cleanRecipient, e.getMessage());
        }
    }
}
