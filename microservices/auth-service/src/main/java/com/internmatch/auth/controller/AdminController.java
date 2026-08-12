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

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        boolean deleted = userRepository.deleteUserById(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", deleted);
        resp.put("message", deleted ? "User deleted successfully" : "User not found or could not be deleted");
        return ResponseEntity.ok(resp);
    }
}
