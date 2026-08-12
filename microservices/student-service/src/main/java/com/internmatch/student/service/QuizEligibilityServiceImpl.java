package com.internmatch.student.service;

import com.internmatch.student.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of QuizEligibilityService.
 *
 * Eligible statuses (quiz can be started):
 *   SHORTLISTED, ACCEPTED_FOR_TEST
 *
 * Disqualifying statuses (quiz permanently blocked):
 *   PROCTORING_FAILED, TEST_FAILED, TEST_PASSED, OFFER_ISSUED,
 *   OFFER_EXTENDED, REJECTED
 *
 * All other statuses (e.g. APPLIED) produce "not yet shortlisted" message.
 */
@Service
public class QuizEligibilityServiceImpl implements QuizEligibilityService {

    private static final Logger log = LoggerFactory.getLogger(QuizEligibilityServiceImpl.class);

    private final ApplicationRepository applicationRepository;

    public QuizEligibilityServiceImpl(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Override
    public Map<String, Object> checkEligibility(int studentId, int appId) {
        if (studentId <= 0 || appId <= 0) {
            return buildResult(false, "Invalid application or student ID.", "UNKNOWN");
        }

        // Fetch the application row for this student
        List<Map<String, Object>> apps = applicationRepository.findByStudentId(studentId);
        Map<String, Object> targetApp = null;
        for (Map<String, Object> app : apps) {
            Object idObj = app.get("id") != null ? app.get("id") : app.get("ID");
            if (idObj instanceof Number && ((Number) idObj).intValue() == appId) {
                targetApp = app;
                break;
            }
        }

        if (targetApp == null) {
            return buildResult(false,
                    "Application not found or does not belong to you.", "NOT_FOUND");
        }

        String status = getStatus(targetApp);

        // ── Permanently blocked statuses ──────────────────────────────────────
        if ("PROCTORING_FAILED".equalsIgnoreCase(status)) {
            return buildResult(false,
                    "Your proctored exam was automatically failed due to a detected proctoring violation "
                    + "(tab switch or fullscreen exit). This attempt cannot be retried.",
                    status);
        }
        if ("TEST_FAILED".equalsIgnoreCase(status)) {
            return buildResult(false,
                    "Your test score did not meet the passing threshold. "
                    + "Please check with the recruiter for next steps.",
                    status);
        }
        if ("TEST_PASSED".equalsIgnoreCase(status)
                || "OFFER_ISSUED".equalsIgnoreCase(status)
                || "OFFER_EXTENDED".equalsIgnoreCase(status)
                || "ACCEPTED".equalsIgnoreCase(status)) {
            return buildResult(false,
                    "You have already completed the screening for this application.",
                    status);
        }
        if ("REJECTED".equalsIgnoreCase(status)) {
            return buildResult(false,
                    "Your application has been rejected by the recruiter.",
                    status);
        }

        // ── Unstop / external applications are not quiz-eligible ─────────────
        String source = getField(targetApp, "source", "SOURCE");
        if ("UNSTOP".equalsIgnoreCase(source)) {
            return buildResult(false,
                    "External (Unstop) applications do not have an InternMatch proctored quiz. "
                    + "Complete the application directly on Unstop.",
                    "APPLIED_EXTERNALLY");
        }

        // ── Already answered (score > 0) ──────────────────────────────────────
        Object scoreObj = targetApp.get("test_score") != null
                ? targetApp.get("test_score") : targetApp.get("TEST_SCORE");
        if (scoreObj instanceof Number && ((Number) scoreObj).doubleValue() > 0) {
            return buildResult(false,
                    "You have already submitted a test for this application.",
                    status);
        }

        // ── Eligible statuses ─────────────────────────────────────────────────
        if ("SHORTLISTED".equalsIgnoreCase(status)
                || "ACCEPTED_FOR_TEST".equalsIgnoreCase(status)) {
            return buildResult(true,
                    "You are shortlisted and eligible to take the proctored exam.",
                    status);
        }

        // ── Any other status (APPLIED, IN_REVIEW, etc.) ───────────────────────
        return buildResult(false,
                "You are not yet shortlisted for this internship. "
                + "The quiz button will be activated once the recruiter shortlists you.",
                status);
    }

    @Override
    public Map<String, Object> recordProctoringViolation(int appId, int studentId) {
        if (appId <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid application ID.");
            return Collections.unmodifiableMap(err);
        }

        log.warn("PROCTORING VIOLATION: appId={} studentId={} — auto-failing exam.", appId, studentId);

        // Persist score = 0 and status = PROCTORING_FAILED
        applicationRepository.updateTestScore(appId, 0.0);
        applicationRepository.updateStatus(appId, "PROCTORING_FAILED");

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("status", "PROCTORING_FAILED");
        resp.put("message",
                "Proctoring violation recorded. Exam auto-failed and locked.");
        return Collections.unmodifiableMap(resp);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> buildResult(boolean eligible, String reason, String status) {
        Map<String, Object> m = new HashMap<>();
        m.put("eligible", eligible);
        m.put("reason", reason);
        m.put("status", status);
        return Collections.unmodifiableMap(m);
    }

    private String getStatus(Map<String, Object> app) {
        Object s = app.get("status") != null ? app.get("status") : app.get("STATUS");
        return s != null ? s.toString().toUpperCase() : "APPLIED";
    }

    private String getField(Map<String, Object> app, String lower, String upper) {
        Object v = app.get(lower) != null ? app.get(lower) : app.get(upper);
        return v != null ? v.toString() : "";
    }
}
