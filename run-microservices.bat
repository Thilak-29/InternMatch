@echo off
echo ===================================================
echo   InternMatch AI - Starting All 4 Spring Boot Microservices
echo ===================================================
echo.

set MAVEN_CMD=%~dp0microservices\mvn-dist\apache-maven-3.9.6\bin\mvn.cmd

echo [1/4] Starting Auth Service on Port 8081...
start "InternMatch Auth Service (Port 8081)" cmd /k "cd /d %~dp0microservices\auth-service && %MAVEN_CMD% spring-boot:run"

echo [2/4] Starting Student Service on Port 8082...
start "InternMatch Student Service (Port 8082)" cmd /k "cd /d %~dp0microservices\student-service && %MAVEN_CMD% spring-boot:run"

echo [3/4] Starting Company Service on Port 8083...
start "InternMatch Company Service (Port 8083)" cmd /k "cd /d %~dp0microservices\company-service && %MAVEN_CMD% spring-boot:run"

echo [4/4] Starting AI Service on Port 8084...
start "InternMatch AI Service (Port 8084)" cmd /k "cd /d %~dp0microservices\ai-service && %MAVEN_CMD% spring-boot:run"

echo.
echo ===================================================
echo   All 4 Microservices are launching!
echo   - Auth Service:    http://localhost:8081
echo   - Student Service: http://localhost:8082
echo   - Company Service: http://localhost:8083
echo   - AI Service:      http://localhost:8084
echo ===================================================
pause
