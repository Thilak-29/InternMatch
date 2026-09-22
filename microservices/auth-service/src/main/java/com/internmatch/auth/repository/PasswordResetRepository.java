package com.internmatch.auth.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class PasswordResetRepository {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetRepository.class);
    private final JdbcTemplate jdbcTemplate;
    private final Map<Integer, Map<String, Object>> memOtps = new ConcurrentHashMap<>();
    private final AtomicInteger idCounter = new AtomicInteger(100);

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
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        int id = idCounter.incrementAndGet();
        Map<String, Object> memRec = new ConcurrentHashMap<>();
        memRec.put("id", id);
        memRec.put("email", cleanEmail);
        memRec.put("otp_hash", otpHash);
        memRec.put("expires_at", expiresAt);
        memRec.put("attempt_count", 0);
        memRec.put("used", 0);
        memRec.put("created_at", LocalDateTime.now());

        // Deactivate previous unused OTPs in memory for this email
        for (Map<String, Object> r : memOtps.values()) {
            if (cleanEmail.equalsIgnoreCase((String) r.get("email"))) {
                r.put("used", 1);
            }
        }
        memOtps.put(id, memRec);
        log.info("Saved new OTP record (ID {}) for email {}", id, cleanEmail);

        try {
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0", cleanEmail);
            jdbcTemplate.update(
                "INSERT INTO password_resets (email, otp_hash, expires_at, attempt_count, used) VALUES (?, ?, ?, 0, 0)",
                cleanEmail, otpHash, expiresAt
            );
        } catch (Exception e) {
            log.warn("Notice saving OTP record to DB: {}", e.getMessage());
        }
    }

    public Map<String, Object> findLatestUnusedOtpByEmail(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT * FROM password_resets WHERE email = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
                cleanEmail
            );
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Notice querying active OTP from DB for {}: {}", cleanEmail, e.getMessage());
        }

        // Memory fallback search
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> latest = null;
        for (Map<String, Object> r : memOtps.values()) {
            String mEmail = (String) r.get("email");
            int used = Integer.parseInt(r.get("used").toString());
            LocalDateTime exp = (LocalDateTime) r.get("expires_at");
            if (cleanEmail.equalsIgnoreCase(mEmail) && used == 0 && exp != null && exp.isAfter(now)) {
                if (latest == null || ((Integer) r.get("id")) > ((Integer) latest.get("id"))) {
                    latest = r;
                }
            }
        }
        return latest;
    }

    public Map<String, Object> findLatestOtpByEmailRecent(String email, int secondsAgo) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        try {
            List<Map<String, Object>> list = jdbcTemplate.queryForList(
                "SELECT * FROM password_resets WHERE email = ? AND created_at > (NOW() - INTERVAL ? SECOND) ORDER BY id DESC LIMIT 1",
                cleanEmail, secondsAgo
            );
            if (!list.isEmpty()) {
                return list.get(0);
            }
        } catch (Exception e) {
            log.warn("Notice checking recent OTPs from DB for {}: {}", cleanEmail, e.getMessage());
        }

        LocalDateTime limit = LocalDateTime.now().minusSeconds(secondsAgo);
        Map<String, Object> latest = null;
        for (Map<String, Object> r : memOtps.values()) {
            String mEmail = (String) r.get("email");
            LocalDateTime created = (LocalDateTime) r.get("created_at");
            if (cleanEmail.equalsIgnoreCase(mEmail) && created != null && created.isAfter(limit)) {
                if (latest == null || ((Integer) r.get("id")) > ((Integer) latest.get("id"))) {
                    latest = r;
                }
            }
        }
        return latest;
    }

    public void incrementAttemptCount(int recordId, boolean invalidate) {
        Map<String, Object> r = memOtps.get(recordId);
        if (r != null) {
            int cur = Integer.parseInt(r.get("attempt_count").toString());
            r.put("attempt_count", cur + 1);
            if (invalidate) {
                r.put("used", 1);
            }
        }

        try {
            if (invalidate) {
                jdbcTemplate.update("UPDATE password_resets SET attempt_count = attempt_count + 1, used = 1 WHERE id = ?", recordId);
            } else {
                jdbcTemplate.update("UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id = ?", recordId);
            }
        } catch (Exception e) {
            log.warn("Notice updating attempt count in DB for record {}: {}", recordId, e.getMessage());
        }
    }

    public void createResetToken(int recordId, String resetToken, LocalDateTime tokenExpiresAt) {
        Map<String, Object> r = memOtps.get(recordId);
        if (r != null) {
            r.put("reset_token", resetToken);
            r.put("reset_token_expires_at", tokenExpiresAt);
            r.put("used", 1);
        }

        try {
            jdbcTemplate.update(
                "UPDATE password_resets SET reset_token = ?, reset_token_expires_at = ?, used = 1 WHERE id = ?",
                resetToken, tokenExpiresAt, recordId
            );
            log.info("Issued password reset token for record ID {}", recordId);
        } catch (Exception e) {
            log.warn("Notice issuing reset token in DB for record {}: {}", recordId, e.getMessage());
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
            log.warn("Notice finding active reset token from DB: {}", e.getMessage());
        }

        LocalDateTime now = LocalDateTime.now();
        for (Map<String, Object> r : memOtps.values()) {
            String token = (String) r.get("reset_token");
            LocalDateTime exp = (LocalDateTime) r.get("reset_token_expires_at");
            if (resetToken.equals(token) && exp != null && exp.isAfter(now)) {
                return r;
            }
        }
        return null;
    }

    public void markResetTokenUsed(String resetToken, String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        for (Map<String, Object> r : memOtps.values()) {
            String token = (String) r.get("reset_token");
            String mEmail = (String) r.get("email");
            if (resetToken.equals(token) || cleanEmail.equalsIgnoreCase(mEmail)) {
                r.put("used", 1);
            }
        }

        try {
            jdbcTemplate.update("UPDATE password_resets SET reset_token_expires_at = NOW() WHERE reset_token = ?", resetToken);
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE email = ?", cleanEmail);
        } catch (Exception e) {
            log.warn("Notice invalidating reset token in DB: {}", e.getMessage());
        }
    }

    public void markOtpUsed(int recordId) {
        Map<String, Object> r = memOtps.get(recordId);
        if (r != null) {
            r.put("used", 1);
        }

        try {
            jdbcTemplate.update("UPDATE password_resets SET used = 1 WHERE id = ?", recordId);
        } catch (Exception e) {
            log.warn("Notice marking OTP used in DB for record {}: {}", recordId, e.getMessage());
        }
    }
}
