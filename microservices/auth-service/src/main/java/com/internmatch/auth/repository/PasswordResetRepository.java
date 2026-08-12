package com.internmatch.auth.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class PasswordResetRepository {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public PasswordResetRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initTable();
    }

    private void initTable() {
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS password_resets (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "email VARCHAR(255) NOT NULL, " +
                "otp_hash VARCHAR(255) NOT NULL, " +
                "reset_token VARCHAR(255) DEFAULT NULL, " +
                "expires_at DATETIME NOT NULL, " +
                "reset_token_expires_at DATETIME DEFAULT NULL, " +
                "attempt_count INT DEFAULT 0, " +
                "used TINYINT(1) DEFAULT 0, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "INDEX idx_email (email), " +
                "INDEX idx_reset_token (reset_token))"
            );
            log.info("Initialized password_resets table in MySQL database.");
        } catch (Exception e) {
            log.warn("Notice initializing password_resets table: {}", e.getMessage());
        }
    }

    public void createOtpRecord(String email, String otpHash, LocalDateTime expiresAt) {
        try {
            // Deactivate any previous unused OTPs for this email
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0", email);
            jdbcTemplate.update(
                "INSERT INTO password_resets (email, otp_hash, expires_at, attempt_count, used) VALUES (?, ?, ?, 0, 0)",
                email, otpHash, expiresAt
            );
            log.info("Saved new OTP record for email {}", email);
        } catch (Exception e) {
            log.error("Error creating OTP record for {}: {}", email, e.getMessage());
        }
    }

    public Map<String, Object> findLatestUnusedOtpByEmail(String email) {
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT * FROM password_resets WHERE email = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
                email
            );
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Error finding active OTP for {}: {}", email, e.getMessage());
        }
        return null;
    }

    public Map<String, Object> findLatestOtpByEmailRecent(String email, int secondsAgo) {
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT * FROM password_resets WHERE email = ? AND created_at > (NOW() - INTERVAL ? SECOND) ORDER BY id DESC LIMIT 1",
                email, secondsAgo
            );
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Error checking recent OTPs for {}: {}", email, e.getMessage());
        }
        return null;
    }

    public void incrementAttemptCount(int recordId, boolean invalidate) {
        try {
            if (invalidate) {
                jdbcTemplate.update("UPDATE password_resets SET attempt_count = attempt_count + 1, used = 1 WHERE id = ?", recordId);
            } else {
                jdbcTemplate.update("UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id = ?", recordId);
            }
        } catch (Exception e) {
            log.error("Error updating attempt count for record {}: {}", recordId, e.getMessage());
        }
    }

    public void createResetToken(int recordId, String resetToken, LocalDateTime tokenExpiresAt) {
        try {
            jdbcTemplate.update(
                "UPDATE password_resets SET reset_token = ?, reset_token_expires_at = ?, used = 1 WHERE id = ?",
                resetToken, tokenExpiresAt, recordId
            );
            log.info("Issued password reset token for record ID {}", recordId);
        } catch (Exception e) {
            log.error("Error issuing reset token for record {}: {}", recordId, e.getMessage());
        }
    }

    public Map<String, Object> findActiveResetToken(String resetToken) {
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT * FROM password_resets WHERE reset_token = ? AND reset_token_expires_at > NOW() ORDER BY id DESC LIMIT 1",
                resetToken
            );
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Error finding active reset token: {}", e.getMessage());
        }
        return null;
    }

    public void markResetTokenUsed(String resetToken, String email) {
        try {
            jdbcTemplate.update("UPDATE password_resets SET reset_token_expires_at = NOW() WHERE reset_token = ?", resetToken);
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE email = ?", email);
        } catch (Exception e) {
            log.error("Error invalidating reset token: {}", e.getMessage());
        }
    }

    public void markOtpUsed(int recordId) {
        try {
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE id = ?", recordId);
        } catch (Exception e) {
            log.error("Error marking OTP used for record {}: {}", recordId, e.getMessage());
        }
    }
}
