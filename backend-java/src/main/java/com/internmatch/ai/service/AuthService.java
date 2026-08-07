package com.internmatch.ai.service;

import java.util.Map;

public interface AuthService {
    Map<String,Object> checkUsername(String username);
    Map<String,Object> login(String identifier,String password);
    Map<String,Object> register(Map<String,Object> registrationData);
}
