package com.internmatch.student.service;

import java.util.Map;

/**
 * Governs quiz access: a student may only take the proctored exam when
 * a recruiter has explicitly shortlisted them (status = SHORTLISTED or
 * ACCEPTED_FOR_TEST). Violations (tab-switch, fullscreen-exit) are
 * persisted as PROCTORING_FAILED so the student cannot retry.
 */
public interface QuizEligibilityService {

    /**
     * Returns eligibility status for a specific application.
     *
     * @param studentId the authenticated student
     * @param appId     the application whose quiz is being requested
     * @return map with keys: eligible (boolean), reason (String), status (String)
     */
    Map<String, Object> checkEligibility(int studentId, int appId);

    /**
     * Records a proctoring violation for the given application.
     * Sets score to 0 and status to PROCTORING_FAILED so the student
     * cannot attempt the exam again.
     *
     * @param appId     the application that was violated
     * @param studentId the student who triggered the violation
     * @return result map with success flag
     */
    Map<String, Object> recordProctoringViolation(int appId, int studentId);
}
