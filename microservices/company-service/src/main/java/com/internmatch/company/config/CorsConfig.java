package com.internmatch.company.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${frontend.origin:http://localhost:5173}")
    private String frontendOrigin;

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = new ArrayList<>(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8083",
                "http://localhost:8084"
        ));

        addConfiguredOrigins(origins, frontendOrigin);
        addConfiguredOrigins(origins, frontendUrl);

        config.setAllowedOrigins(origins);
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://*.onrender.com",
                "https://*.vercel.app",
                "https://*.railway.app",
                "https://*.up.railway.app"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "X-Total-Count"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    private void addConfiguredOrigins(List<String> origins, String raw) {
        if (raw != null && !raw.trim().isEmpty()) {
            for (String part : raw.split(",")) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }
    }
}
