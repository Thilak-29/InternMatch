package com.internmatch.student.dto;

import java.util.List;

public class UnstopResponse {
    private boolean success;
    private String source = "UNSTOP";
    private List<UnstopInternshipDto> internships;
    private String message;

    public UnstopResponse() {}

    public UnstopResponse(boolean success, List<UnstopInternshipDto> internships, String message) {
        this.success = success;
        this.source = "UNSTOP";
        this.internships = internships;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public List<UnstopInternshipDto> getInternships() { return internships; }
    public void setInternships(List<UnstopInternshipDto> internships) { this.internships = internships; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
