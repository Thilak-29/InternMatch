package com.internmatch.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            ensureAdmin("thilakvignesh@gmail.com", "Thilak Vignesh (Admin)", "ThilakVignesh");
            log.info("AuthService Database Initializer completed cleanly.");
        } catch (Exception e) {
            log.warn("DatabaseInitializer notice: {}", e.getMessage());
        }
    }

    private void ensureAdmin(String email, String name, String rawPassword) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)",
                    Integer.class,
                    email.toLowerCase()
            );

            if (count == null || count == 0) {
                String encoded = passwordEncoder.encode(rawPassword);
                String username = email.split("@")[0];
                try {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 'ADMIN', 1)",
                            username, name, email, encoded
                    );
                } catch (Exception e1) {
                    try {
                        jdbcTemplate.update(
                                "INSERT INTO users (username, name, email, password, role, email_verified) VALUES (?, ?, ?, ?, 'ADMIN', 1)",
                                username, name, email, encoded
                        );
                    } catch (Exception e2) {
                        jdbcTemplate.update(
                                "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, 'ADMIN', 1)",
                                name, email, encoded
                        );
                    }
                }
                log.info("Ensured single admin account: {}", email);
            } else {
                try {
                    jdbcTemplate.update(
                            "UPDATE users SET email_verified = 1, role = 'ADMIN' WHERE LOWER(email) = LOWER(?)",
                            email.toLowerCase()
                    );
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            log.warn("Could not ensure admin user {}: {}", email, e.getMessage());
        }
    }
}
