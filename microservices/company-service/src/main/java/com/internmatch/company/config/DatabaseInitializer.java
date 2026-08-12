package com.internmatch.company.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM internships", Integer.class);
            log.info("CompanyService Database Initializer connected cleanly. Total active internships in Oracle DB: {}", count != null ? count : 0);
        } catch (Exception e) {
            log.warn("CompanyService DatabaseInitializer connection check notice: {}", e.getMessage());
        }
    }
}
