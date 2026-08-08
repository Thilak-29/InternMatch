package com.internmatch.student.controller;

import com.internmatch.student.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable int id) {
        return ResponseEntity.ok(studentService.getStudentDashboard(id));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getProfile(@PathVariable int id) {
        return ResponseEntity.ok(studentService.getStudentProfile(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable int id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(studentService.updateStudentProfile(id, body));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<?> uploadResume(@PathVariable int id, @RequestBody Map<String, Object> body) {
        String fileName = (String) body.getOrDefault("file_name", "resume.pdf");
        String parsedText = (String) body.getOrDefault("parsed_text", "Skills: React, Java, SQL, Python");
        return ResponseEntity.ok(studentService.uploadResume(id, fileName, parsedText));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getApplications(@PathVariable int id) {
        return ResponseEntity.ok(studentService.getStudentApplications(id));
    }

    @PostMapping("/{studentId}/apply/{internshipId}")
    public ResponseEntity<?> apply(@PathVariable int studentId, @PathVariable int internshipId) {
        return ResponseEntity.ok(studentService.applyForInternship(studentId, internshipId));
    }

    @PutMapping("/applications/{appId}/test-score")
    public ResponseEntity<?> updateTestScore(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        double score = body.containsKey("score") ? ((Number) body.get("score")).doubleValue() : 85.0;
        return ResponseEntity.ok(studentService.updateTestScore(appId, score));
    }

    @GetMapping("/{id}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable int id) {
        return ResponseEntity.ok(studentService.getStudentNotifications(id));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable int id) {
        return ResponseEntity.ok(studentService.markNotificationRead(id));
    }
}
