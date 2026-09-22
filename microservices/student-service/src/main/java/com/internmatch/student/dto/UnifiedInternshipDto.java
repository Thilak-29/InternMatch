package com.internmatch.student.dto;

import java.util.ArrayList;
import java.util.List;

public class UnifiedInternshipDto {
    private String id;
    private String externalId;
    private String source; // "INTERNAL", "UNSTOP", "ADZUNA", "PUBLIC_FEED"
    private String title;
    private String company;
    private String description;
    private String location;
    private String stipend;
    private String duration;
    private List<String> skills = new ArrayList<>();
    private String eligibility;
    private String applicationUrl;
    private String deadline;
    private String postedDate;
    private boolean isExternal;
    private String status;
    private double matchScore;
    private boolean hasTest;

    public UnifiedInternshipDto() {}

    public UnifiedInternshipDto(String id, String externalId, String source, String title, String company,
                                String description, String location, String stipend, String duration,
                                List<String> skills, String eligibility, String applicationUrl,
                                String deadline, String postedDate, boolean isExternal, String status, double matchScore) {
        this.id = id;
        this.externalId = externalId;
        this.source = source;
        this.title = title;
        this.company = company;
        this.description = description;
        this.location = location;
        this.stipend = stipend;
        this.duration = duration;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.eligibility = eligibility;
        this.applicationUrl = applicationUrl;
        this.deadline = deadline;
        this.postedDate = postedDate;
        this.isExternal = isExternal;
        this.status = status;
        this.matchScore = matchScore;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }

    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getPostedDate() { return postedDate; }
    public void setPostedDate(String postedDate) { this.postedDate = postedDate; }

    public boolean isExternal() { return isExternal; }
    public void setExternal(boolean external) { isExternal = external; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public boolean isHasTest() { return hasTest; }
    public boolean getHasTest() { return hasTest; }
    public void setHasTest(boolean hasTest) { this.hasTest = hasTest; }
}
