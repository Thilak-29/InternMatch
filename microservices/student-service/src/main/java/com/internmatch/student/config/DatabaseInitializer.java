package com.internmatch.student.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Seed student profile if not exists
            int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_profiles WHERE user_id = 3", Integer.class);
            if (count == 0) {
                jdbcTemplate.update("INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, skills, leetcode, github, year_of_study, degree, branch) VALUES " +
                        "(3, 'Thilak P', 'Karpagam College of Engineering', 2026, 8.5, 'Coimbatore', 'React, Java, SQL, Python', 'Thilak0329', 'Thilak-29', '3rd Year', 'B.E.', 'Computer Science & Engineering')");
            }
        } catch (Exception e) {}

        try {
            int count12 = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student_profiles WHERE user_id = 12", Integer.class);
            if (count12 == 0) {
                jdbcTemplate.update("INSERT INTO student_profiles (user_id, name, college, grad_year, cgpa, address, skills, leetcode, github, year_of_study, degree, branch) VALUES " +
                        "(12, 'Vignesh Sankarakumar', 'Karpagam College of Engineering', 2026, 8.5, 'Thenkasi', 'React, Java, SQL, Python', 'Thilak0329', 'Thilak-29', '3rd Year', 'B.E.', 'Computer Science & Engineering')");
            }
        } catch (Exception e) {}
    }
}
