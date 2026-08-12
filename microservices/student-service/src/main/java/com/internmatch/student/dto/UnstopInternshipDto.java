package com.internmatch.student.dto;

import java.util.List;

public class UnstopInternshipDto {
    private String externalId;
    private String title;
    private String companyName;
    private String location;
    private String workMode;
    private String stipend;
    private String duration;
    private String applicationDeadline;
    private List<String> requiredSkills;
    private String description;
    private String eligibility;
    private String applicationUrl;
    private String domain;
    private String source = "UNSTOP";

    public UnstopInternshipDto() {}

    public UnstopInternshipDto(String externalId, String title, String companyName, String location,
                               String workMode, String stipend, String duration, String applicationDeadline,
                               List<String> requiredSkills, String description, String eligibility,
                               String applicationUrl, String domain) {
        this.externalId = externalId;
        this.title = title;
        this.companyName = companyName;
        this.location = location;
        this.workMode = workMode;
        this.stipend = stipend;
        this.duration = duration;
        this.applicationDeadline = applicationDeadline;
        this.requiredSkills = requiredSkills;
        this.description = description;
        this.eligibility = eligibility;
        this.applicationUrl = applicationUrl;
        this.domain = domain;
        this.source = "UNSTOP";
    }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public List<String> getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }

    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
