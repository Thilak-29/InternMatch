package com.internmatch.auth.controller;

import com.internmatch.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(authService.checkUsername(username));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.getOrDefault("identifier", body.getOrDefault("email", body.getOrDefault("username", "")));
        String password = body.getOrDefault("password", "");
        Map<String, Object> result = authService.login(identifier, password);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 401;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(authService.register(body));
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String otp = body.getOrDefault("otp", body.getOrDefault("code", ""));
        Map<String, Object> result = authService.verifyRegistrationOtp(email, otp);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", body.getOrDefault("identifier", ""));
        Map<String, Object> result = authService.forgotPassword(email);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String otp = body.getOrDefault("otp", body.getOrDefault("code", ""));
        Map<String, Object> result = authService.verifyOtp(email, otp);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String resetToken = body.getOrDefault("resetToken", body.getOrDefault("token", ""));
        String newPassword = body.getOrDefault("newPassword", body.getOrDefault("password", ""));
        String confirmPassword = body.getOrDefault("confirmPassword", body.getOrDefault("confirm_password", ""));
        Map<String, Object> result = authService.resetPassword(resetToken, newPassword, confirmPassword);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody Map<String, Object> body) {
        int userId = body.containsKey("userId") ? Integer.parseInt(body.get("userId").toString()) : (body.containsKey("user_id") ? Integer.parseInt(body.get("user_id").toString()) : 0);
        String newEmail = body.getOrDefault("newEmail", body.getOrDefault("email", "")).toString();
        Map<String, Object> result = authService.requestEmailChange(userId, newEmail);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-email-change")
    public ResponseEntity<?> verifyEmailChange(@RequestBody Map<String, Object> body) {
        int userId = body.containsKey("userId") ? Integer.parseInt(body.get("userId").toString()) : (body.containsKey("user_id") ? Integer.parseInt(body.get("user_id").toString()) : 0);
        String newEmail = body.getOrDefault("newEmail", body.getOrDefault("email", "")).toString();
        String otp = body.getOrDefault("otp", body.getOrDefault("code", "")).toString();
        Map<String, Object> result = authService.verifyEmailChange(userId, newEmail, otp);
        if (Boolean.FALSE.equals(result.get("success"))) {
            int status = result.containsKey("status") ? (int) result.get("status") : 400;
            return ResponseEntity.status(status).body(result);
        }
        return ResponseEntity.ok(result);
    }
}
