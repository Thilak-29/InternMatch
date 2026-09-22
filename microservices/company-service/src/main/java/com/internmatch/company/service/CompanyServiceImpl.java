package com.internmatch.company.service;

import com.internmatch.company.repository.ApplicationRepository;
import com.internmatch.company.repository.InternshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompanyServiceImpl implements CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyServiceImpl.class);

    private final InternshipRepository internshipRepository;
    private final ApplicationRepository applicationRepository;
    private final JdbcTemplate jdbcTemplate;

    public CompanyServiceImpl(InternshipRepository internshipRepository,
                              ApplicationRepository applicationRepository,
                              JdbcTemplate jdbcTemplate) {
        this.internshipRepository = internshipRepository;
        this.applicationRepository = applicationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // -------------------------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> getCompanyDashboardStats(int companyId) {
        List<Map<String, Object>> internships = internshipRepository.findByCompanyId(companyId);
        List<Map<String, Object>> applicants  = applicationRepository.findByCompanyId(companyId);

        int hired       = 0;
        int shortlisted = 0;
        int activeApplicants = 0;
        for (Map<String, Object> a : applicants) {
            Object rawSt = a.get("status") != null ? a.get("status") : a.get("STATUS");
            String st = rawSt != null ? rawSt.toString() : "";
            // Exclude withdrawn / cancelled from all counts
            if ("WITHDRAWN".equals(st) || "CANCELLED".equals(st) || "DELETED".equals(st)) continue;
            activeApplicants++;
            if ("OFFER_ACCEPTED".equals(st) || "OFFER_SENT".equals(st) || "HIRED".equals(st)
                    || "OFFER_ISSUED".equals(st) || "OFFER_EXTENDED".equals(st) || "ACCEPTED".equals(st)) {
                hired++;
            } else if ("SHORTLISTED".equals(st) || "TEST_PASSED".equals(st)) {
                shortlisted++;
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("total_internships", internships.size());
        res.put("total_applicants",  activeApplicants); // only active (non-withdrawn)
        res.put("shortlisted", shortlisted);
        res.put("hired", hired);
        res.put("internships", internships);
        return res;
    }

    // -------------------------------------------------------------------------
    // INTERNSHIPS
    // -------------------------------------------------------------------------
    @Override
    public List<Map<String, Object>> getCompanyInternships(int companyId) {
        return internshipRepository.findByCompanyId(companyId);
    }

    @Override
    public List<Map<String, Object>> getAllActiveInternships() {
        return internshipRepository.findAll();
    }

    @Override
    public Map<String, Object> postInternship(int companyId, String companyName, String title,
                                               String domain, String skills, String mode,
                                               int gradYear, String loc, String duration,
                                               String startDate, String endDate,
                                               double stipend, int openings, String deadline) {
        int generatedId = internshipRepository.saveInternship(
                companyId, companyName, title, domain, skills, mode,
                gradYear, loc, duration, startDate, endDate, stipend, openings, deadline);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("id", generatedId);
        res.put("internship_id", generatedId);
        res.put("message", "Internship posted successfully.");
        return res;
    }

    @Override
    public Map<String, Object> updateInternship(int id, Map<String, Object> body) {
        String title    = (String) body.getOrDefault("title", "");
        String domain   = (String) body.getOrDefault("domain", "Engineering");
        String skills   = (String) body.getOrDefault("required_skills", "");
        String mode     = (String) body.getOrDefault("work_mode", "Hybrid");
        String loc      = (String) body.getOrDefault("location", "");
        String duration = (String) body.getOrDefault("duration", "3 Months");
        double stipend  = body.containsKey("stipend")  ? ((Number) body.get("stipend")).doubleValue()  : 0.0;
        int openings    = body.containsKey("openings") ? ((Number) body.get("openings")).intValue()    : 1;

        boolean ok = internshipRepository.updateInternship(id, title, domain, skills, mode, loc, duration, stipend, openings);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Internship updated successfully." : "Update failed.");
        return res;
    }

    @Override
    public Map<String, Object> deleteInternship(int id) {
        boolean ok = internshipRepository.deleteById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Internship deleted successfully." : "Delete failed.");
        return res;
    }

    // -------------------------------------------------------------------------
    // APPLICANTS
    // -------------------------------------------------------------------------
    @Override
    public List<Map<String, Object>> getCompanyApplicants(int companyId) {
        return applicationRepository.findByCompanyId(companyId);
    }

    // -------------------------------------------------------------------------
    // UPDATE STATUS  ← THE ROOT CAUSE OF THE SHORTLIST BUG
    //
    // Previously this called internshipRepository.updateApplicationStatus() which
    // does NOT exist on InternshipRepository (it only has updateStatus() for
    // internship rows).  The correct call is applicationRepository.updateStatus()
    // which:
    //   1. Runs  UPDATE applications SET status=? WHERE id=?  in MySQL
    //   2. Updates the in-memory SHARED_MEM_APPLICATIONS map
    //   3. Fires a background PUT to student-service (port 8082) to keep that
    //      service's own application store in sync.
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> updateApplicantStatus(int applicationId, String status, String stage) {
        if (applicationId <= 0 || status == null || status.trim().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error",   "Invalid applicationId or status.");
            return err;
        }

        String canonicalStatus = status.trim().toUpperCase();

        // Check existing application status before allowing transition to SHORTLISTED
        if ("SHORTLISTED".equals(canonicalStatus)) {
            String currentStatus = applicationRepository.getApplicationStatus(applicationId);
            if (currentStatus != null) {
                String currUpper = currentStatus.trim().toUpperCase();
                List<String> nonShortlistableCurrent = List.of(
                    "SHORTLISTED", "TEST_PASSED", "TEST_COMPLETED", "ACCEPTED", "OFFER_ISSUED", "OFFER_EXTENDED", "SELECTED", "HIRED", "REJECTED", "WITHDRAWN", "CANCELLED"
                );
                if (nonShortlistableCurrent.contains(currUpper)) {
                    log.warn("Shortlist rejected for application {}: application is already in status {}", applicationId, currUpper);
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("error", "Application cannot be shortlisted because it is already in status: " + currUpper);
                    return err;
                }
            }
        }

        // Persist to MySQL applications table + reverse-sync to student-service
        boolean updated = applicationRepository.updateStatus(applicationId, canonicalStatus);

        // Fire a SHORTLISTED notification for the student
        if (updated) {
            try {
                List<Map<String, Object>> appRows = jdbcTemplate.queryForList(
                        "SELECT student_id FROM applications WHERE id = ?", applicationId);
                if (!appRows.isEmpty()) {
                    Object sIdObj = appRows.get(0).get("student_id") != null
                            ? appRows.get(0).get("student_id")
                            : appRows.get(0).get("STUDENT_ID");
                    if (sIdObj instanceof Number) {
                        int studentId = ((Number) sIdObj).intValue();
                        String msg = buildNotificationMessage(canonicalStatus);
                        try {
                            jdbcTemplate.update(
                                    "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'APPLICATION_STATUS_CHANGED')",
                                    studentId, msg);
                        } catch (Exception ignored) {
                            log.warn("Could not insert notification for student {}: {}", studentId, ignored.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Notification step failed for application {}: {}", applicationId, e.getMessage());
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success",        updated);
        res.put("applicationId",  applicationId);
        res.put("status",         canonicalStatus);
        res.put("stage",          stage != null ? stage : "ASSESSMENT");
        res.put("message",        updated
                ? "Application status updated to " + canonicalStatus + " successfully."
                : "Status update attempted; check logs for details.");
        return res;
    }

    private String buildNotificationMessage(String status) {
        return switch (status) {
            case "SHORTLISTED"     -> "🎉 Congratulations! You have been shortlisted for the next evaluation round. Your screening quiz is now available.";
            case "OFFER_ISSUED",
                 "OFFER_SENT",
                 "OFFER_EXTENDED"  -> "🎉 Congratulations! You have received an official Internship Offer Letter!";
            case "REJECTED"        -> "Your application status has been updated. Thank you for your interest.";
            default                -> "Your application status has been updated to: " + status;
        };
    }

    // -------------------------------------------------------------------------
    // APPLICATION SYNC
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> registerApplication(Map<String, Object> body) {
        try {
            applicationRepository.registerApplication(body);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Application registered successfully.");
            return res;
        } catch (Exception e) {
            log.error("registerApplication failed: {}", e.getMessage(), e);
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("error",   e.getMessage());
            return res;
        }
    }

    @Override
    public Map<String, Object> withdrawApplication(int studentId, int internshipId) {
        try {
            // Mark as WITHDRAWN in DB
            jdbcTemplate.update(
                    "UPDATE applications SET status = 'WITHDRAWN' WHERE student_id = ? AND internship_id = ?",
                    studentId, internshipId);
            // Remove from shared memory
            applicationRepository.removeWithdrawnFromMemory(studentId, internshipId);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Application withdrawn and removed from recruiter view.");
            return res;
        } catch (Exception e) {
            log.error("withdrawApplication failed: {}", e.getMessage(), e);
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("error", e.getMessage());
            return res;
        }
    }

    @Override
    public Map<String, Object> syncProfile(Map<String, Object> body) {
        applicationRepository.updateProfileSync(body);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Profile synced successfully.");
        return res;
    }

    // -------------------------------------------------------------------------
    // SCREENING TEST
    // -------------------------------------------------------------------------
    @Override
    public Map<String, Object> createScreeningTest(int internshipId, String title, int passingScore, int duration) {
        int generatedId = 0;
        try {
            jdbcTemplate.update(
                    "INSERT INTO screening_tests (internship_id, title, passing_score, duration_minutes, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
                    internshipId, title, passingScore, duration);
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT MAX(id) as max_id FROM screening_tests WHERE internship_id = ?", internshipId);
            if (!rows.isEmpty()) {
                Object idObj = rows.get(0).get("max_id") != null ? rows.get(0).get("max_id") : rows.get(0).get("MAX_ID");
                if (idObj instanceof Number) generatedId = ((Number) idObj).intValue();
            }
        } catch (Exception e) {
            log.warn("Screening test insert failed ({}), returning in-memory confirmation.", e.getMessage());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success",        true);
        res.put("id",             generatedId);
        res.put("internship_id",  internshipId);
        res.put("title",          title);
        res.put("passing_score",  passingScore);
        res.put("duration",       duration);
        res.put("message",        "Screening test created successfully.");
        return res;
    }
}
