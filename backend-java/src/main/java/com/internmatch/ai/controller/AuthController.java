package com.internmatch.ai.controller;

import com.internmatch.ai.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins="*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @GetMapping("/api/v1/health")
    public ResponseEntity<Map<String,Object>> health(){
        Map<String,Object> resp=new HashMap<>();
        resp.put("service","InternMatch AI Platform");
        resp.put("status","healthy");
        resp.put("database","College Oracle Database (orcl - 172.16.100.12)");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/v1/auth/check-username")
    public ResponseEntity<Map<String,Object>> checkUsername(@RequestParam String username){
        return ResponseEntity.ok(authService.checkUsername(username));
    }

    @PostMapping({"/api/auth/login","/api/v1/auth/login"})
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,Object> body){
        String identifier=body.containsKey("identifier")?(String)body.get("identifier"):(String)body.get("email");
        String password=(String)body.get("password");

        if(identifier==null||identifier.trim().isEmpty()||password==null||password.trim().isEmpty()){
            Map<String,Object> err=new HashMap<>();
            err.put("success",false);
            err.put("detail","Please provide a valid username/email and password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        return ResponseEntity.ok(authService.login(identifier,password));
    }

    @PostMapping({"/api/auth/register","/api/v1/auth/register"})
    public ResponseEntity<Map<String,Object>> register(@RequestBody Map<String,Object> body){
        String email=body.containsKey("email")?((String)body.get("email")).trim():"";
        String password=body.containsKey("password")?((String)body.get("password")).trim():"";

        if(email.isEmpty()||password.isEmpty()){
            Map<String,Object> err=new HashMap<>();
            err.put("success",false);
            err.put("detail","Email and password are required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        Map<String,Object> res=authService.register(body);
        if(Boolean.FALSE.equals(res.get("success"))){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        return ResponseEntity.ok(res);
    }
}
