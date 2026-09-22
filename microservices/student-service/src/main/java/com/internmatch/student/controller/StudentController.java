package com.internmatch.student.controller;

import com.internmatch.student.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentService studentService;
    private final com.internmatch.student.service.UnstopInternshipService unstopInternshipService;
    private final com.internmatch.student.service.ExternalInternshipAggregatorService aggregatorService;

    public StudentController(StudentService studentService,
                             com.internmatch.student.service.UnstopInternshipService unstopInternshipService,
                             com.internmatch.student.service.ExternalInternshipAggregatorService aggregatorService) {
        this.studentService = studentService;
        this.unstopInternshipService = unstopInternshipService;
        this.aggregatorService = aggregatorService;
    }

    private Map<String, Object> getAuthPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Map) {
            return (Map<String, Object>) auth.getPrincipal();
        }
        return Collections.emptyMap();
    }

    private Integer getAuthenticatedUserId() {
        Map<String, Object> principal = getAuthPrincipal();
        Object idObj = principal.get("userId");
        if (idObj instanceof Number) {
            return ((Number) idObj).intValue();
        }
        return null;
    }

    private String getAuthenticatedRole() {
        Map<String, Object> principal = getAuthPrincipal();
        return (String) principal.get("role");
    }

    private boolean isAuthorizedUser(int targetStudentId) {
        Integer authUserId = getAuthenticatedUserId();
        String role = getAuthenticatedRole();
        if (authUserId == null || "ADMIN".equalsIgnoreCase(role) || "COMPANY".equalsIgnoreCase(role) || "STUDENT".equalsIgnoreCase(role)) {
            return true;
        }
        return authUserId.equals(targetStudentId);
    }

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<?> getDashboard(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied: Cannot access another user's dashboard."));
        }
        Map<String, Object> dash = studentService.getStudentDashboard(studentId);
        return ResponseEntity.ok(dash);
    }

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<?> getProfile(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        Map<String, Object> prof = studentService.getStudentProfile(studentId);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Student profile not found"));
        }
        return ResponseEntity.ok(prof);
    }

    @PutMapping("/{studentId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable int studentId, @RequestBody Map<String, Object> body) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied: Cannot update another user's profile."));
        }
        Map<String, Object> res = studentService.updateStudentProfile(studentId, body);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{studentId}/resume")
    public ResponseEntity<?> uploadResume(@PathVariable int studentId, @RequestBody Map<String, Object> body) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        String fileName = (String) body.getOrDefault("file_name", "resume.pdf");
        String parsedText = (String) body.getOrDefault("parsed_text", "");
        return ResponseEntity.ok(studentService.uploadResume(studentId, fileName, parsedText));
    }

    @PostMapping(value = "/{studentId}/resume/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResumeMultipart(@PathVariable int studentId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Uploaded resume file is empty"));
        }
        return ResponseEntity.ok(studentService.processAndParseResume(studentId, file));
    }

    @GetMapping({"/applications", "/all-applications"})
    public ResponseEntity<?> getAllApplicationsFallback() {
        Integer authUserId = getAuthenticatedUserId();
        if (authUserId != null && authUserId > 0) {
            return ResponseEntity.ok(studentService.getStudentApplications(authUserId));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{studentId}/applications")
    public ResponseEntity<?> getApplications(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        List<Map<String, Object>> apps = studentService.getStudentApplications(studentId);
        return ResponseEntity.ok(apps);
    }

    @PostMapping("/{studentId}/applications/{internshipIdStr}")
    public ResponseEntity<?> applyForInternship(@PathVariable int studentId, @PathVariable("internshipIdStr") String internshipIdStr, @RequestBody(required = false) Map<String, Object> body) {
        int internshipId;
        try {
            String cleanId = internshipIdStr;
            if (cleanId != null && cleanId.startsWith("INTERNAL_")) {
                cleanId = cleanId.substring("INTERNAL_".length());
            }
            internshipId = Integer.parseInt(cleanId);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid internship ID: " + internshipIdStr));
        }

        if (studentId <= 0 || internshipId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid ID parameters"));
        }
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        Map<String, Object> res = studentService.applyForInternship(studentId, internshipId, body != null ? body : Collections.emptyMap());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{studentId}/applications/unstop")
    public ResponseEntity<?> applyForExternalInternship(@PathVariable int studentId, @RequestBody Map<String, Object> body) {
        if (studentId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID parameter"));
        }
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        Map<String, Object> res = studentService.applyForExternalInternship(studentId, body != null ? body : Collections.emptyMap());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{studentId}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid student ID"));
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        return ResponseEntity.ok(studentService.getStudentNotifications(studentId));
    }

    @PutMapping("/{studentId}/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable int studentId, @PathVariable int notificationId) {
        if (studentId <= 0 || notificationId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid ID parameters"));
        }
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        return ResponseEntity.ok(studentService.markNotificationRead(studentId, notificationId));
    }

    @PutMapping("/applications/{appId}")
    public ResponseEntity<?> updateApplicationDetails(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        if (appId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid application ID"));
        return ResponseEntity.ok(studentService.updateApplicationDetails(appId, body));
    }

    @PutMapping("/applications/{appId}/test-score")
    public ResponseEntity<?> updateTestScore(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        if (appId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid application ID"));
        double score = 0.0;
        if (body != null && body.get("score") instanceof Number) {
            score = ((Number) body.get("score")).doubleValue();
        }
        return ResponseEntity.ok(studentService.updateTestScore(appId, score));
    }

    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable int appId, @RequestBody Map<String, Object> body) {
        if (appId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid application ID"));
        String status = body != null && body.get("status") != null ? body.get("status").toString() : "APPLIED";
        return ResponseEntity.ok(studentService.updateApplicationStatus(appId, status));
    }

    @DeleteMapping("/applications/{appId}")
    public ResponseEntity<?> deleteApplication(@PathVariable int appId) {
        if (appId <= 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", "Invalid application ID"));
        return ResponseEntity.ok(studentService.deleteApplication(appId));
    }

    @GetMapping("/internships/unstop")
    public ResponseEntity<?> getUnstopInternships(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int perPage,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String domain) {
        return ResponseEntity.ok(unstopInternshipService.fetchUnstopInternships(page, perPage, search, domain));
    }

    @GetMapping("/internships/aggregated")
    public ResponseEntity<?> getAggregatedInternships(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "20") int perPage,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String domain) {
        return ResponseEntity.ok(aggregatorService.getAggregatedInternships(page, perPage, search, source, domain));
    }

    /**
     * Check whether the authenticated student is eligible to take the proctored exam
     * for a specific application. Returns { eligible, reason, status }.
     */
    @GetMapping("/{studentId}/applications/{appId}/quiz-eligibility")
    public ResponseEntity<?> checkQuizEligibility(@PathVariable int studentId,
                                                   @PathVariable int appId) {
        if (studentId <= 0 || appId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Invalid ID parameters"));
        }
        if (!isAuthorizedUser(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "status", 403, "error", "Access Denied"));
        }
        Map<String, Object> result = studentService.checkQuizEligibility(studentId, appId);
        return ResponseEntity.ok(result);
    }

    /**
     * Record a proctoring violation (tab switch / fullscreen exit) for an application.
     * This permanently sets status = PROCTORING_FAILED and score = 0.
     * The student cannot retry after this.
     */
    @PostMapping("/applications/{appId}/proctoring-violation")
    public ResponseEntity<?> recordProctoringViolation(@PathVariable int appId,
                                                        @RequestBody(required = false) Map<String, Object> body) {
        if (appId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Invalid application ID"));
        }
        Integer authUserId = getAuthenticatedUserId();
        int studentId = authUserId != null ? authUserId : 0;
        Map<String, Object> result = studentService.recordProctoringViolation(appId, studentId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{studentId}/resume/download")
    public ResponseEntity<?> downloadStudentResume(@PathVariable int studentId) {
        if (studentId <= 0) return ResponseEntity.badRequest().build();
        Map<String,Object> rd = studentService.getStudentResumeData(studentId);
        if (rd == null || rd.get("resume_data") == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", "No resume uploaded yet"));
        }
        byte[] data = (byte[]) rd.get("resume_data");
        String fileName = rd.get("resume_file_name") != null ? rd.get("resume_file_name").toString() : "resume.pdf";
        String contentType = rd.get("resume_content_type") != null ? rd.get("resume_content_type").toString() : "application/pdf";
        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
            .header("Content-Length", String.valueOf(data.length))
            .body(data);
    }

    @GetMapping("/{studentId}/applications/{applicationId}/resume")
    public ResponseEntity<?> downloadApplicationResume(@PathVariable int studentId, @PathVariable int applicationId) {
        if (applicationId <= 0) return ResponseEntity.badRequest().build();
        Map<String,Object> rd = studentService.getApplicationResumeData(applicationId);
        if (rd == null || rd.get("resume_data") == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", "No resume attached to this application"));
        }
        byte[] data = (byte[]) rd.get("resume_data");
        String fileName = rd.get("resume_file_name") != null ? rd.get("resume_file_name").toString() : "resume.pdf";
        String contentType = rd.get("resume_content_type") != null ? rd.get("resume_content_type").toString() : "application/pdf";
        return ResponseEntity.ok()
            .header("Content-Type", contentType)
            .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
            .header("Content-Length", String.valueOf(data.length))
            .body(data);
    }
}
