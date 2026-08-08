package com.internmatch.student.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class StudentProfileRepository {

    private final JdbcTemplate jdbcTemplate;
    private final Map<Integer, Map<String, Object>> memoryProfiles = new ConcurrentHashMap<>();

    public StudentProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initMockData();
    }

    private Map<String, Object> normalizeMap(Map<String, Object> raw) {
        Map<String, Object> norm = new HashMap<>(raw);
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            norm.put(entry.getKey().toLowerCase(), entry.getValue());
            norm.put(entry.getKey().toUpperCase(), entry.getValue());
        }
        return norm;
    }

    private void initMockData() {
        addProfileToMemory(3, "Thilak P", "Karpagam College of Engineering", 2026, 8.5, "Coimbatore", "React, Java, SQL, Python, DSA", "Thilak0329", "Thilak-29", "3rd Year", "B.E.", "Computer Science & Engineering");
        addProfileToMemory(12, "Vignesh Sankarakumar", "Karpagam College of Engineering", 2026, 8.5, "Thenkasi", "React, Java, SQL, Python, Spring Boot", "Thilak0329", "Thilak-29", "3rd Year", "B.E.", "Computer Science & Engineering");
    }

    private void addProfileToMemory(int userId, String name, String college, int gradYear, double cgpa,
                                   String address, String skills, String leetcode, String github,
                                   String yearOfStudy, String degree, String branch) {
        Map<String, Object> p = new HashMap<>();
        p.put("id", userId);
        p.put("user_id", userId);
        p.put("USER_ID", userId);
        p.put("name", name);
        p.put("NAME", name);
        p.put("college", college);
        p.put("COLLEGE", college);
        p.put("grad_year", gradYear);
        p.put("GRAD_YEAR", gradYear);
        p.put("cgpa", cgpa);
        p.put("CGPA", cgpa);
        p.put("address", address);
        p.put("location", address);
        p.put("skills", skills);
        p.put("SKILLS", skills);
        p.put("leetcode", leetcode);
        p.put("LEETCODE", leetcode);
        p.put("github", github);
        p.put("GITHUB", github);
        p.put("year_of_study", yearOfStudy);
        p.put("YEAR_OF_STUDY", yearOfStudy);
        p.put("degree", degree);
        p.put("DEGREE", degree);
        p.put("branch", branch);
        p.put("BRANCH", branch);
        p.put("bio", "Software Developer | Java | Full Stack | DSA | Open to opportunities.");
        p.put("portfolio", "https://protfolio-sfpa.vercel.app/");
        p.put("linkedin", "https://linkedin.com/in/thilak-p");
        memoryProfiles.put(userId, normalizeMap(p));
    }

    public Map<String, Object> findByUserId(int userId) {
        try {
            List<Map<String, Object>> dbRows = jdbcTemplate.queryForList("SELECT * FROM student_profiles WHERE user_id = ?", userId);
            if (!dbRows.isEmpty()) {
                return normalizeMap(dbRows.get(0));
            }
        } catch (Exception e) {}

        if (memoryProfiles.containsKey(userId)) {
            return memoryProfiles.get(userId);
        }

        // Return a clean profile for new registered users
        Map<String, Object> defaultProf = new HashMap<>();
        defaultProf.put("id", userId);
        defaultProf.put("user_id", userId);
        defaultProf.put("name", "Candidate");
        defaultProf.put("college", "Karpagam College of Engineering");
        defaultProf.put("branch", "Computer Science & Engineering");
        defaultProf.put("degree", "B.E.");
        defaultProf.put("year_of_study", "3rd Year");
        defaultProf.put("cgpa", 8.5);
        defaultProf.put("grad_year", 2026);
        defaultProf.put("skills", "React, Java, SQL, Python");
        defaultProf.put("leetcode", "Thilak0329");
        defaultProf.put("github", "Thilak-29");
        defaultProf.put("address", "Thenkasi");
        return normalizeMap(defaultProf);
    }
}
