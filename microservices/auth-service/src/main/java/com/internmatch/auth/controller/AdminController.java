package com.internmatch.auth.controller;

import com.internmatch.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public AdminController(UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private boolean isAdminUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Map) {
            Map<String, Object> principal = (Map<String, Object>) auth.getPrincipal();
            String role = (String) principal.get("role");
            if (role != null) {
                return "ADMIN".equalsIgnoreCase(role);
            }
        }
        return true;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        List<Map<String, Object>> allUsers = userRepository.getAllUsersWithProfiles();
        int students = 0;
        int companies = 0;

        for (Map<String, Object> u : allUsers) {
            String r = (String) u.getOrDefault("role", u.getOrDefault("ROLE", "STUDENT"));
            if ("COMPANY".equalsIgnoreCase(r)) {
                companies++;
            } else if (!"ADMIN".equalsIgnoreCase(r)) {
                students++;
            }
        }

        int internships = 0;
        int applications = 0;

        try {
            Integer i = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM internships", Integer.class);
            if (i != null) internships = i;
            Integer a = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM applications", Integer.class);
            if (a != null) applications = a;
        } catch (Exception e) {}

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_students", students);
        stats.put("total_companies", companies);
        stats.put("total_internships", internships);
        stats.put("total_applications", applications);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.getAllUsersWithProfiles());
    }

    @GetMapping("/recruiters")
    public ResponseEntity<?> getAllRecruiters() {
        return ResponseEntity.ok(userRepository.getAllRecruitersWithVerification());
    }

    @PutMapping("/recruiters/{id}/verify")
    public ResponseEntity<?> verifyRecruiter(@PathVariable int id, @RequestBody Map<String, Object> body) {
        String status = (String) body.getOrDefault("status", "APPROVED");
        String rejectionReason = (String) body.getOrDefault("rejection_reason", body.getOrDefault("rejectionReason", ""));

        boolean updated = userRepository.updateRecruiterVerificationStatus(id, status, rejectionReason);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", updated);
        resp.put("userId", id);
        resp.put("status", status);
        resp.put("message", updated ? "Recruiter verification status updated to " + status : "User not found or update failed");
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        boolean deleted = userRepository.deleteUserById(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", deleted);
        resp.put("message", deleted ? "User deleted successfully" : "User not found or could not be deleted");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/platform-growth")
    public ResponseEntity<?> getPlatformGrowth() {
        if (!isAdminUser()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<Map<String, Object>> result = new ArrayList<>();
        String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};

        try {
            // 1. Unique students who applied per calendar month
            Map<String, Integer> applyingByMonth = new LinkedHashMap<>();
            try {
                List<Map<String, Object>> appRows = jdbcTemplate.queryForList(
                    "SELECT YEAR(applied_at) AS yr, MONTH(applied_at) AS mo, COUNT(DISTINCT student_id) AS cnt " +
                    "FROM applications " +
                    "WHERE student_id IS NOT NULL AND student_id > 0 " +
                    "  AND status NOT IN ('WITHDRAWN','CANCELLED','DELETED') " +
                    "GROUP BY YEAR(applied_at), MONTH(applied_at) " +
                    "ORDER BY yr, mo"
                );
                for (Map<String, Object> row : appRows) {
                    int yr = ((Number) row.get("yr")).intValue();
                    int mo = ((Number) row.get("mo")).intValue();
                    int cnt = ((Number) row.get("cnt")).intValue();
                    applyingByMonth.put(yr + "-" + String.format("%02d", mo), cnt);
                }
            } catch (Exception e) {
                // applications table may not have created_at — try without date grouping
            }

            // 2. Unique companies registered per calendar month
            Map<String, Integer> companiesByMonth = new LinkedHashMap<>();
            try {
                List<Map<String, Object>> compRows = jdbcTemplate.queryForList(
                    "SELECT YEAR(created_at) AS yr, MONTH(created_at) AS mo, COUNT(DISTINCT id) AS cnt " +
                    "FROM users " +
                    "WHERE UPPER(role) = 'COMPANY' AND created_at IS NOT NULL " +
                    "GROUP BY YEAR(created_at), MONTH(created_at) " +
                    "ORDER BY yr, mo"
                );
                for (Map<String, Object> row : compRows) {
                    int yr = ((Number) row.get("yr")).intValue();
                    int mo = ((Number) row.get("mo")).intValue();
                    int cnt = ((Number) row.get("cnt")).intValue();
                    companiesByMonth.put(yr + "-" + String.format("%02d", mo), cnt);
                }
            } catch (Exception e) {
                // fall through
            }

            // 3. Union all month keys and build response
            Set<String> allKeys = new LinkedHashSet<>();
            allKeys.addAll(applyingByMonth.keySet());
            allKeys.addAll(companiesByMonth.keySet());

            for (String key : allKeys) {
                String[] parts = key.split("-");
                int yr = Integer.parseInt(parts[0]);
                int mo = Integer.parseInt(parts[1]);
                String label = monthNames[mo - 1] + " " + yr;

                Map<String, Object> point = new LinkedHashMap<>();
                point.put("month", label);
                point.put("monthKey", key);
                point.put("studentsApplying", applyingByMonth.getOrDefault(key, 0));
                point.put("registeredCompanies", companiesByMonth.getOrDefault(key, 0));
                result.add(point);
            }
        } catch (Exception e) {
            // Return empty list — frontend handles empty state gracefully
        }

        return ResponseEntity.ok(result);
    }
}
