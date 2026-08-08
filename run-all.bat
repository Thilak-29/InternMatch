@echo off
echo ===================================================
echo   InternMatch AI - Full Stack Platform Launcher
echo ===================================================
echo.

set MAVEN_CMD=%~dp0microservices\mvn-dist\apache-maven-3.9.6\bin\mvn.cmd

echo [1/5] Launching Auth Microservice (Port 8081)...
start "Auth Service (8081)" cmd /k "cd /d %~dp0microservices\auth-service && %MAVEN_CMD% spring-boot:run"

echo [2/5] Launching Student Microservice (Port 8082)...
start "Student Service (8082)" cmd /k "cd /d %~dp0microservices\student-service && %MAVEN_CMD% spring-boot:run"

echo [3/5] Launching Company Microservice (Port 8083)...
start "Company Service (8083)" cmd /k "cd /d %~dp0microservices\company-service && %MAVEN_CMD% spring-boot:run"

echo [4/5] Launching AI Assessment Microservice (Port 8084)...
start "AI Service (8084)" cmd /k "cd /d %~dp0microservices\ai-service && %MAVEN_CMD% spring-boot:run"

echo [5/5] Launching React Frontend (Port 3000)...
start "React Frontend (3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   InternMatch AI is Live!
echo   - Web UI:          http://localhost:3000
echo   - Auth API:        http://localhost:8081
echo   - Student API:     http://localhost:8082
echo   - Company API:     http://localhost:8083
echo   - AI Service API:  http://localhost:8084
echo ===================================================
pause
