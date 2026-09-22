package com.internmatch.student.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internmatch.student.dto.UnstopInternshipDto;
import com.internmatch.student.dto.UnstopResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class UnstopInternshipServiceImpl implements UnstopInternshipService {

    private static final Logger log = LoggerFactory.getLogger(UnstopInternshipServiceImpl.class);

    @Value("${unstop.api.key:}")
    private String apiKey;

    @Value("${unstop.api.url:https://unstop.com/api/public/opportunity/search-result}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public UnstopInternshipServiceImpl() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public UnstopResponse fetchUnstopInternships(int page, int perPage, String search, String domain) {
        log.info("Fetching internships from Unstop API (page={}, perPage={})", page, perPage);

        try {
            StringBuilder urlBuilder = new StringBuilder(apiUrl);
            if (!apiUrl.contains("?")) {
                urlBuilder.append("?");
            } else {
                urlBuilder.append("&");
            }
            urlBuilder.append("opportunity=internships")
                      .append("&page=").append(Math.max(1, page))
                      .append("&per_page=").append(Math.min(50, Math.max(5, perPage)));

            if (search != null && !search.trim().isEmpty()) {
                urlBuilder.append("&searchTerm=").append(java.net.URLEncoder.encode(search.trim(), java.nio.charset.StandardCharsets.UTF_8));
            }

            String targetUrl = urlBuilder.toString();
            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .timeout(Duration.ofSeconds(8))
                    .header("Accept", "application/json")
                    .header("User-Agent", "InternMatch-AI/2.0 (Student Microservice)");

            if (apiKey != null && !apiKey.trim().isEmpty()) {
                reqBuilder.header("Authorization", "Bearer " + apiKey.trim());
                reqBuilder.header("x-api-key", apiKey.trim());
                log.info("Applying secure Authorization headers for Unstop API request.");
            }

            HttpResponse<String> response = httpClient.send(reqBuilder.GET().build(), HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Unstop API request returned non-200 status code: {}", response.statusCode());
                return new UnstopResponse(false, new ArrayList<>(), "Unstop API returned status " + response.statusCode());
            }

            String jsonBody = response.body();
            if (jsonBody == null || jsonBody.trim().isEmpty()) {
                return new UnstopResponse(true, new ArrayList<>(), "Unstop API returned empty body.");
            }

            JsonNode root = objectMapper.readTree(jsonBody);
            List<UnstopInternshipDto> mappedList = parseUnstopOpportunities(root);

            log.info("Successfully fetched and normalized {} internships from Unstop API.", mappedList.size());
            return new UnstopResponse(true, mappedList, "Fetched " + mappedList.size() + " opportunities from Unstop.");

        } catch (Exception e) {
            log.error("Error communicating with Unstop API: {}", e.getMessage());
            return new UnstopResponse(false, new ArrayList<>(), "Unable to fetch external internships: " + e.getMessage());
        }
    }

    private List<UnstopInternshipDto> parseUnstopOpportunities(JsonNode root) {
        List<UnstopInternshipDto> list = new ArrayList<>();
        if (root == null) return list;

        JsonNode oppArray = null;
        if (root.has("data") && root.get("data").has("data")) {
            oppArray = root.get("data").get("data");
        } else if (root.has("data") && root.get("data").has("opportunities")) {
            oppArray = root.get("data").get("opportunities");
        } else if (root.has("opportunities")) {
            oppArray = root.get("opportunities");
        } else if (root.has("data") && root.get("data").isArray()) {
            oppArray = root.get("data");
        } else if (root.isArray()) {
            oppArray = root;
        }

        if (oppArray == null || !oppArray.isArray()) {
            return list;
        }

        for (JsonNode node : oppArray) {
            try {
                String extId = node.has("id") ? node.get("id").asText() : (node.has("opportunity_id") ? node.get("opportunity_id").asText() : String.valueOf(node.hashCode()));
                String title = node.has("title") ? node.get("title").asText() : "Internship Opportunity";
                
                String company = "Unstop Corporate Partner";
                if (node.has("organisation") && node.get("organisation").has("name")) {
                    company = node.get("organisation").get("name").asText();
                } else if (node.has("company_name")) {
                    company = node.get("company_name").asText();
                } else if (node.has("company")) {
                    company = node.get("company").asText();
                }

                String location = "Remote / India";
                if (node.has("job_detail") && node.get("job_detail").has("locations") && node.get("job_detail").get("locations").isArray() && node.get("job_detail").get("locations").size() > 0) {
                    location = node.get("job_detail").get("locations").get(0).asText();
                } else if (node.has("location") && !node.get("location").asText().trim().isEmpty()) {
                    location = node.get("location").asText();
                } else if (node.has("city") && !node.get("city").asText().trim().isEmpty()) {
                    location = node.get("city").asText();
                }

                String rawType = "";
                if (node.has("job_detail") && node.get("job_detail").has("work_location_type")) {
                    rawType = node.get("job_detail").get("work_location_type").asText();
                } else if (node.has("work_mode")) {
                    rawType = node.get("work_mode").asText();
                } else if (node.has("mode")) {
                    rawType = node.get("mode").asText();
                }

                // AI / Smart Heuristic Mode & Location assignment
                String workMode = "Hybrid";
                String locLower = location.toLowerCase();
                String typeLower = rawType.toLowerCase();

                if (locLower.contains("remote") || locLower.contains("online") || locLower.contains("home") || typeLower.contains("remote") || typeLower.contains("online")) {
                    workMode = "Remote";
                } else if (locLower.contains("hybrid") || typeLower.contains("hybrid")) {
                    workMode = "Hybrid";
                } else if (locLower.contains("site") || locLower.contains("office") || typeLower.contains("site") || typeLower.contains("office")) {
                    workMode = "On-Site";
                } else {
                    workMode = "Hybrid";
                }

                String stipend = "Disclosed on Unstop";
                if (node.has("job_detail") && node.get("job_detail").has("salary") && node.get("job_detail").get("salary").has("salary_text")) {
                    stipend = node.get("job_detail").get("salary").get("salary_text").asText();
                } else if (node.has("stipend")) {
                    stipend = node.get("stipend").asText();
                }

                String duration = "3 - 6 Months";
                if (node.has("job_detail") && node.get("job_detail").has("duration")) {
                    duration = node.get("job_detail").get("duration").asText();
                } else if (node.has("duration")) {
                    duration = node.get("duration").asText();
                }

                String deadline = "";
                if (node.has("regnRequirements") && node.get("regnRequirements").has("end_regn_dt")) {
                    deadline = node.get("regnRequirements").get("end_regn_dt").asText();
                } else if (node.has("end_date")) {
                    deadline = node.get("end_date").asText();
                } else if (node.has("deadline")) {
                    deadline = node.get("deadline").asText();
                }

                List<String> skills = new ArrayList<>();
                if (node.has("filters") && node.get("filters").isArray()) {
                    for (JsonNode f : node.get("filters")) {
                        if (f.has("name")) skills.add(f.get("name").asText());
                    }
                } else if (node.has("skills") && node.get("skills").isArray()) {
                    for (JsonNode s : node.get("skills")) {
                        skills.add(s.asText());
                    }
                }
                if (skills.isEmpty()) {
                    skills.add("Java");
                    skills.add("React");
                    skills.add("Problem Solving");
                }

                String appUrl = "https://unstop.com/internships";
                if (node.has("seo_url")) {
                    String rawSeo = node.get("seo_url").asText();
                    appUrl = rawSeo.startsWith("http") ? rawSeo : "https://unstop.com/" + rawSeo.replaceAll("^/+", "");
                } else if (node.has("seo_details") && node.get("seo_details").has("slug")) {
                    appUrl = "https://unstop.com/o/" + node.get("seo_details").get("slug").asText();
                } else if (node.has("url")) {
                    String u = node.get("url").asText();
                    appUrl = u.startsWith("http") ? u : "https://unstop.com/" + u.replaceAll("^/+", "");
                } else if (extId != null && !extId.isEmpty()) {
                    appUrl = "https://unstop.com/o/" + extId;
                }

                String desc = node.has("description") ? node.get("description").asText() : "Real corporate internship listed on Unstop.";
                String elig = node.has("eligibility") ? node.get("eligibility").asText() : "Open to All Undergraduate & Engineering Students";
                String dom = title.toLowerCase().contains("ai") || title.toLowerCase().contains("learning") ? "AI / ML" :
                            (title.toLowerCase().contains("back") || title.toLowerCase().contains("java") || title.toLowerCase().contains("python") ? "Backend" :
                            (title.toLowerCase().contains("front") || title.toLowerCase().contains("react") || title.toLowerCase().contains("web") ? "Frontend" :
                            (title.toLowerCase().contains("data") ? "Data Science" : "Engineering")));

                list.add(new UnstopInternshipDto(
                        extId, title, company, location, workMode, stipend, duration,
                        deadline, skills, desc, elig, appUrl, dom
                ));
            } catch (Exception e) {
                log.warn("Skipping unparseable Unstop opportunity item: {}", e.getMessage());
            }
        }

        return list;
    }
}
