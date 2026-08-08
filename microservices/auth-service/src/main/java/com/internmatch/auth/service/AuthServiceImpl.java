package com.internmatch.auth.service;

import com.internmatch.auth.config.JwtUtil;
import com.internmatch.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Map<String, Object> checkUsername(String username) {
        boolean available = !userRepository.existsByUsernameOrEmail(username, username);
        Map<String, Object> resp = new HashMap<>();
        resp.put("username", username);
        resp.put("available", available);
        resp.put("message", available ? "Username available" : "Username already taken");
        return resp;
    }

    @Override
    public Map<String, Object> login(String identifier, String password) {
        String cleanUser = identifier.trim();

        // Strict Admin Account Check
        if (cleanUser.equalsIgnoreCase("thilakvignesh@gmail.com")) {
            if (password.equals("ThilakVignesh")) {
                if (!userRepository.existsByUsernameOrEmail("thilakvignesh", "thilakvignesh@gmail.com")) {
                    userRepository.saveUser("thilakvignesh", "Thilak Vignesh (Admin)", "thilakvignesh@gmail.com", "ThilakVignesh", "ADMIN");
                }
                List<Map<String, Object>> adminRows = userRepository.findByUsernameOrEmail("thilakvignesh@gmail.com");
                Map<String, Object> adminUser = adminRows.get(0);
                Object userId = adminUser.get("id") != null ? adminUser.get("id") : adminUser.get("ID");
                String token = "Bearer " + jwtUtil.generateToken("thilakvignesh", "ADMIN");

                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("token", token);
                resp.put("userId", userId);
                resp.put("user_id", userId);
                resp.put("username", "thilakvignesh");
                resp.put("name", "Thilak Vignesh (Admin)");
                resp.put("email", "thilakvignesh@gmail.com");
                resp.put("role", "ADMIN");
                return resp;
            } else {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("detail", "Invalid admin password. Admin portal is strictly restricted to authorized credentials.");
                return err;
            }
        }

        List<Map<String, Object>> rows = userRepository.findByUsernameOrEmail(cleanUser);

        if (rows.isEmpty()) {
            String defaultRole = cleanUser.toLowerCase().contains("google") || cleanUser.toLowerCase().contains("nvidia") || cleanUser.toLowerCase().contains("company") ? "COMPANY" : "STUDENT";
            String defaultEmail = cleanUser.contains("@") ? cleanUser : cleanUser + "@example.com";
            userRepository.saveUser(cleanUser, cleanUser, defaultEmail, password, defaultRole);
            rows = userRepository.findByUsernameOrEmail(cleanUser);
        }

        Map<String, Object> user = rows.get(0);
        String role = (String) (user.get("role") != null ? user.get("role") : (user.get("ROLE") != null ? user.get("ROLE") : "STUDENT"));

        // Non-admin credentials cannot access ADMIN role
        if ("ADMIN".equalsIgnoreCase(role) && (!cleanUser.equalsIgnoreCase("thilakvignesh@gmail.com") || !password.equals("ThilakVignesh"))) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("detail", "Access Denied: Admin portal is restricted to authorized credentials (thilakvignesh@gmail.com / ThilakVignesh).");
            return err;
        }

        Object userId = user.get("id") != null ? user.get("id") : user.get("ID");
        String username = (String) (user.get("username") != null ? user.get("username") : user.get("USERNAME"));
        String name = (String) (user.get("name") != null ? user.get("name") : user.get("NAME"));
        String email = (String) (user.get("email") != null ? user.get("email") : user.get("EMAIL"));

        if (username == null || username.isEmpty()) {
            username = email != null && email.contains("@") ? email.split("@")[0] : "user";
        }
        if (name == null || name.isEmpty()) {
            name = username;
        }

        String token = "Bearer " + jwtUtil.generateToken(username, role);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("token", token);
        resp.put("userId", userId);
        resp.put("user_id", userId);
        resp.put("username", username);
        resp.put("name", name);
        resp.put("email", email);
        resp.put("role", role);
        return resp;
    }

    @Override
    public Map<String, Object> register(Map<String, Object> data) {
        String accountType = data.containsKey("account_type") ? ((String) data.get("account_type")).toUpperCase() : (data.containsKey("role") ? ((String) data.get("role")).toUpperCase() : "STUDENT");
        String email = data.containsKey("email") ? ((String) data.get("email")).trim() : "";
        String username = data.containsKey("username") ? ((String) data.get("username")).trim() : (email.contains("@") ? email.split("@")[0] : "user");
        String password = data.containsKey("password") ? ((String) data.get("password")).trim() : "";

        if (userRepository.existsByUsernameOrEmail(username, email)) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("detail", "Username or email already exists in database.");
            return err;
        }

        if ("COMPANY".equals(accountType)) {
            String companyName = data.containsKey("company_name") ? ((String) data.get("company_name")).trim() : (data.containsKey("name") ? ((String) data.get("name")).trim() : username);
            String industry = (String) data.getOrDefault("industry", "Software & IT Solutions");
            String website = (String) data.getOrDefault("website", "https://company.example.com");
            String location = (String) data.getOrDefault("location", "Bengaluru, India");
            String description = (String) data.getOrDefault("description", "Leading enterprise technology & hiring partner.");

            userRepository.saveUser(username, companyName, email, password, "COMPANY");
            List<Map<String, Object>> rows = userRepository.findByUsernameOrEmail(username);
            Map<String, Object> user = rows.get(0);
            int userId = ((Number) (user.get("id") != null ? user.get("id") : user.get("ID"))).intValue();

            userRepository.saveCompanyProfile(userId, companyName, industry, website, location, description);

            String token = "Bearer " + jwtUtil.generateToken(username, "COMPANY");

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("token", token);
            resp.put("userId", userId);
            resp.put("user_id", userId);
            resp.put("username", username);
            resp.put("name", companyName);
            resp.put("email", email);
            resp.put("role", "COMPANY");
            return resp;
        } else {
            String name = data.containsKey("name") ? ((String) data.get("name")).trim() : username;
            String college = (String) data.getOrDefault("college", "Karpagam College of Engineering");
            int gradYear = data.containsKey("grad_year") ? Integer.parseInt(data.get("grad_year").toString()) : 2026;
            double cgpa = data.containsKey("cgpa") ? Double.parseDouble(data.get("cgpa").toString()) : 8.5;
            String location = (String) data.getOrDefault("location", "Thenkasi");
            String resumeFileName = (String) data.getOrDefault("resume_file_name", "resume.pdf");
            String leetcode = (String) data.getOrDefault("leetcode", "Thilak0329");
            String github = (String) data.getOrDefault("github", "Thilak-29");
            String yearOfStudy = (String) data.getOrDefault("year_of_study", "3rd Year");
            String degree = (String) data.getOrDefault("degree", "B.E.");
            String department = (String) data.getOrDefault("department", data.getOrDefault("branch", "Computer Science & Engineering"));
            String gender = (String) data.getOrDefault("gender", "Male");
            String linkedin = (String) data.getOrDefault("linkedin", "https://linkedin.com/in/thilak-p");
            String portfolio = (String) data.getOrDefault("portfolio", "https://protfolio-sfpa.vercel.app/");
            String skills = (String) data.getOrDefault("skills", "React, Java, SQL, Python, Spring Boot");

            userRepository.saveUser(username, name, email, password, "STUDENT");
            List<Map<String, Object>> rows = userRepository.findByUsernameOrEmail(username);
            Map<String, Object> user = rows.get(0);
            int userId = ((Number) (user.get("id") != null ? user.get("id") : user.get("ID"))).intValue();

            userRepository.saveStudentProfile(userId, name, college, gradYear, cgpa, location, resumeFileName, leetcode, github, yearOfStudy, degree, department, gender, linkedin, portfolio, skills);

            String token = "Bearer " + jwtUtil.generateToken(username, "STUDENT");

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("token", token);
            resp.put("userId", userId);
            resp.put("user_id", userId);
            resp.put("username", username);
            resp.put("name", name);
            resp.put("email", email);
            resp.put("role", "STUDENT");
            resp.put("college", college);
            resp.put("grad_year", gradYear);
            resp.put("cgpa", cgpa);
            resp.put("leetcode", leetcode);
            resp.put("github", github);
            resp.put("gender", gender);
            resp.put("department", department);
            resp.put("branch", department);
            resp.put("location", location);
            resp.put("linkedin", linkedin);
            resp.put("portfolio", portfolio);
            return resp;
        }
    }
}
