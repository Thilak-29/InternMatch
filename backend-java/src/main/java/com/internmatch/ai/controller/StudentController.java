package com.internmatch.ai.controller;

import com.internmatch.ai.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins="*")
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService){
        this.studentService=studentService;
    }

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<Map<String,Object>> getDashboard(@PathVariable int studentId){
        return ResponseEntity.ok(studentService.getStudentDashboard(studentId));
    }

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<Map<String,Object>> getProfile(@PathVariable int studentId){
        return ResponseEntity.ok(studentService.getStudentProfile(studentId));
    }

    @PutMapping("/{studentId}/profile")
    public ResponseEntity<Map<String,Object>> updateProfile(@PathVariable int studentId,@RequestBody Map<String,Object> body){
        return ResponseEntity.ok(studentService.updateStudentProfile(studentId,body));
    }

    @PostMapping("/{studentId}/resume")
    public ResponseEntity<Map<String,Object>> uploadResume(@PathVariable int studentId,@RequestBody Map<String,Object> body){
        String fileName=(String)body.getOrDefault("resume_file_name","alex_johnson_resume.pdf");
        String parsedText=(String)body.getOrDefault("resume_parsed_text","Verified ATS Skills: React, Python, Java, SQL, FastAPI");
        return ResponseEntity.ok(studentService.uploadResume(studentId,fileName,parsedText));
    }

    @GetMapping("/{studentId}/applications")
    public ResponseEntity<List<Map<String,Object>>> getApplications(@PathVariable int studentId){
        return ResponseEntity.ok(studentService.getStudentApplications(studentId));
    }

    @PostMapping("/applications")
    public ResponseEntity<Map<String,Object>> applyForInternship(@RequestBody Map<String,Object> body){
        int studentId = body.containsKey("student_id") ? ((Number)body.get("student_id")).intValue() : 1;
        int internshipId = body.containsKey("internship_id") ? ((Number)body.get("internship_id")).intValue() : 1;
        return ResponseEntity.ok(studentService.applyForInternship(studentId, internshipId));
    }

    @PutMapping("/applications/{appId}/test-score")
    public ResponseEntity<Map<String,Object>> saveTestScore(@PathVariable int appId, @RequestBody Map<String,Object> body){
        double score = body.containsKey("score") ? ((Number)body.get("score")).doubleValue() : 90.0;
        return ResponseEntity.ok(studentService.updateTestScore(appId, score));
    }

    @GetMapping("/{studentId}/notifications")
    public ResponseEntity<List<Map<String,Object>>> getNotifications(@PathVariable int studentId){
        return ResponseEntity.ok(studentService.getStudentNotifications(studentId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String,Object>> markNotificationRead(@PathVariable int id){
        return ResponseEntity.ok(studentService.markNotificationRead(id));
    }
}
