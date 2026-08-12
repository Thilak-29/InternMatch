package com.internmatch.student.service;

import com.internmatch.student.dto.UnstopResponse;

public interface UnstopInternshipService {
    UnstopResponse fetchUnstopInternships(int page, int perPage, String search, String domain);
}
