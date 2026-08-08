package com.internmatch.student.controller;

import com.internmatch.student.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.emptyMap());
        return ResponseEntity.ok(studentService.getStudentDashboard(studentId));
    }

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<?> getProfile(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "INVALID_STUDENT_ID"));
        Map<String, Object> prof = studentService.getStudentProfile(studentId);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "PROFILE_NOT_FOUND", "userId", studentId));
        }
        return ResponseEntity.ok(prof);
    }

    @PutMapping("/{studentId}/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable int studentId, @RequestBody Map<String, Object> body) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Invalid student ID"));
        return ResponseEntity.ok(studentService.updateStudentProfile(studentId, body));
    }

    @PostMapping("/{studentId}/resume")
    public ResponseEntity<Map<String, Object>> uploadResume(@PathVariable int studentId, @RequestBody Map<String, Object> body) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false));
        String fileName = (String) body.getOrDefault("resume_file_name", "candidate_resume.pdf");
        String parsedText = (String) body.getOrDefault("resume_parsed_text", "");
        return ResponseEntity.ok(studentService.uploadResume(studentId, fileName, parsedText));
    }

    @GetMapping("/{studentId}/applications")
    public ResponseEntity<List<Map<String, Object>>> getApplications(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.ok(Collections.emptyList());
        return ResponseEntity.ok(studentService.getStudentApplications(studentId));
    }

    @PostMapping("/applications")
    public ResponseEntity<Map<String, Object>> applyForInternship(@RequestBody Map<String, Object> body) {
        int studentId = body.containsKey("student_id") ? ((Number) body.get("student_id")).intValue() : 0;
        int internshipId = body.containsKey("internship_id") ? ((Number) body.get("internship_id")).intValue() : 0;
        if (studentId <= 0 || internshipId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Invalid student_id or internship_id"));
        }
        return ResponseEntity.ok(studentService.applyForInternship(studentId, internshipId));
    }

    @PostMapping("/{studentId}/apply/{internshipId}")
    public ResponseEntity<Map<String, Object>> applyDirect(@PathVariable int studentId, @PathVariable int internshipId) {
        if (studentId <= 0 || internshipId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Invalid studentId or internshipId"));
        }
        return ResponseEntity.ok(studentService.applyForInternship(studentId, internshipId));
    }

    @PutMapping("/applications/{appId}/test-score")
    public ResponseEntity<Map<String, Object>> saveTestScore(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        double score = body.containsKey("score") ? ((Number) body.get("score")).doubleValue() : 0.0;
        return ResponseEntity.ok(studentService.updateTestScore(appId, score));
    }

    @GetMapping("/{studentId}/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.ok(Collections.emptyList());
        return ResponseEntity.ok(studentService.getNotifications(studentId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markRead(@PathVariable int id) {
        return ResponseEntity.ok(studentService.markNotificationRead(id));
    }
}
