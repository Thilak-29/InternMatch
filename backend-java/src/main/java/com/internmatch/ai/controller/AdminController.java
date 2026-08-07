package com.internmatch.ai.controller;

import com.internmatch.ai.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable int id) {
        return ResponseEntity.ok(adminService.deleteUser(id));
    }

    @GetMapping("/internships")
    public ResponseEntity<List<Map<String, Object>>> getAllInternships() {
        return ResponseEntity.ok(adminService.getAllInternships());
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<Map<String, Object>> deleteInternship(@PathVariable int id) {
        return ResponseEntity.ok(adminService.deleteInternship(id));
    }
}
