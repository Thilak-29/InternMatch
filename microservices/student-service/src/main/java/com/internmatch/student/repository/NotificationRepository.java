package com.internmatch.student.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class NotificationRepository {

    private static final Logger log = LoggerFactory.getLogger(NotificationRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Map<String, Object> normalizeMap(Map<String, Object> raw) {
        if (raw == null) return Collections.emptyMap();
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> list) {
        if (list == null) return Collections.emptyList();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map<String, Object> m : list) {
            res.add(normalizeMap(m));
        }
        return res;
    }

    public List<Map<String, Object>> findByStudentId(int userId) {
        return findByUserId(userId);
    }

    public List<Map<String, Object>> findByUserId(int userId) {
        if (userId <= 0) return Collections.emptyList();
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList(
                    "SELECT id, user_id, message, type, is_read, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at " +
                            "FROM notifications WHERE user_id = ? ORDER BY id DESC",
                    userId
            );
            return normalizeList(dbRows);
        } catch (Exception e) {
            log.warn("Fetch notifications notice for user {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public void createNotification(int userId, String title, String message) {
        createNotification(userId, title, message, "INFO");
    }

    public void createNotification(int userId, String title, String message, String type) {
        if (userId <= 0) return;
        try {
            jdbcTemplate.update(
                    "INSERT INTO notifications (id, user_id, message, type, is_read) VALUES (SEQ_NOTIFICATIONS.NEXTVAL, ?, ?, ?, 0)",
                    userId, (title != null ? title + ": " : "") + message, type != null ? type : "INFO"
            );
        } catch (Exception e1) {
            log.warn("Notification insert skipped for user {}: {}", userId, e1.getMessage());
        }
    }

    public void markAsRead(int notificationId) {
        if (notificationId <= 0) return;
        try {
            jdbcTemplate.update("UPDATE notifications SET is_read = 1 WHERE id = ?", notificationId);
        } catch (Exception e) {
            log.warn("Error marking notification {} as read: {}", notificationId, e.getMessage());
        }
    }

    public void markAsRead(int userId, int notificationId) {
        markAsRead(notificationId);
    }
}
