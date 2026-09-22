package com.internmatch.student.service;

import com.internmatch.student.dto.UnifiedInternshipDto;
import java.util.List;
import java.util.Map;

public interface ExternalInternshipAggregatorService {
    Map<String, Object> getAggregatedInternships(int page, int perPage, String search, String source, String domain);
}
