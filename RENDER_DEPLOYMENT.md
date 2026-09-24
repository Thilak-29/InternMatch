# InternMatch Production Deployment Guide for Render

This guide provides end-to-end instructions for deploying the **InternMatch** platform onto [Render](https://render.com).

---

## 1. System Architecture Overview

InternMatch is structured as a multi-module microservice architecture with an independent React SPA frontend:

```
                        +-----------------------------------------+
                        |  Render Static Site: Frontend (Vite)    |
                        |   https://<frontend-subdomain>.onrender.com |
                        +--------------------+--------------------+
                                             |
                               +-------------+-------------+
                               |                           |
                 (Direct HTTPS API Calls / JWT Bearer)     |
                               |                           |
      +------------------------+-------------+-------------+------------------------+
      |                        |             |                                      |
      v                        v             v                                      v
+-------------+      +-----------------+  +------------------+             +-----------------+
| Auth &      |      | Student Profile |  | Company & Jobs   |             | AI Engine &     |
| Identity    |      | & Applications  |  | Service          |             | LeetCode Sync   |
| Service     |      | Service         |  |                  |             | Service         |
| (Port 8081) |      | (Port 8082)     |  | (Port 8083)      |             | (Port 8084)     |
+------+------+      +---+---------+---+  +----+---------+---+             +---+---------+---+
       |                 |         |           |         |                     ^         ^
       |                 |         +-----------+---------+---------------------+         |
       |                 |          (Inter-Service HTTPS Sync)                           |
       |                 |                                                               |
       +-----------------+---------------------+                                         |
                         |                     |                                         |
                         v                     v                                         |
              +---------------------+  +-----------------+             +-----------------+
              |  Managed MySQL 8.0  |  | External Unstop |             | Groq Cloud &    |
              |  (Aiven / TiDB /    |  | API             |             | Alfa-LeetCode   |
              |   Clever Cloud /    |  +-----------------+             | APIs            |
              |   Railway MySQL)    |                                  +-----------------+
              +---------------------+
```

### Architectural Decisions & Audited Structure
* **Frontend**: Single-page application built with Vite and React 18 (`frontend`). Deployed as a **Render Static Site**.
* **Backend Microservices**: 4 Spring Boot 3.2.5 (Java 21) services inside `microservices/`:
  1. `auth-service`
  2. `student-service`
  3. `company-service`
  4. `ai-service`
* **API Gateway**: The audited codebase utilizes direct, decoupled client-side routing configured in `frontend/src/config/apiConfig.js` to target each service independently (with fallback support for `VITE_API_BASE_URL` if an external reverse proxy is preferred).
* **Database**: MySQL 8.0+ is used. Resumes are stored as binary BLOBs (`resume_data`) directly in MySQL along with parsed text. Render natively provides PostgreSQL and Redis, but not MySQL; hence an externally hosted MySQL database (such as Aiven MySQL, TiDB Serverless, or Railway MySQL) or a Dockerized MySQL instance is connected via `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USERNAME`/`DB_PASSWORD` or `DB_URL`.
* **Caching / Queues**: No Redis or message broker (Kafka/RabbitMQ) infrastructure dependencies are required by the services.

---

## 2. Inventory of Render Services

| Service Name | Render Service Type | Root Directory | Runtime | Build Command | Start Command | Default Internal Port | Health Check Path |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **internmatch-frontend** | Static Site | `frontend` | Static | `npm install && npm run build` | *N/A (Static Publish)* | N/A | `/` |
| **internmatch-auth-service** | Web Service | `microservices/auth-service` | Docker (or Java 21) | `mvn clean package -DskipTests` | `java -jar target/auth-service-1.0.0.jar` | 8081 / `$PORT` | `/actuator/health` |
| **internmatch-student-service** | Web Service | `microservices/student-service` | Docker (or Java 21) | `mvn clean package -DskipTests` | `java -jar target/student-service-1.0.0.jar` | 8082 / `$PORT` | `/actuator/health` |
| **internmatch-company-service** | Web Service | `microservices/company-service` | Docker (or Java 21) | `mvn clean package -DskipTests` | `java -jar target/company-service-1.0.0.jar` | 8083 / `$PORT` | `/actuator/health` |
| **internmatch-ai-service** | Web Service | `microservices/ai-service` | Docker (or Java 21) | `mvn clean package -DskipTests` | `java -jar target/ai-service-1.0.0.jar` | 8084 / `$PORT` | `/actuator/health` |

---

## 3. Database Deployment Instructions

1. **Provision a MySQL 8.0+ Database**:
   - Recommended providers offering free or low-cost MySQL:
     - [TiDB Serverless](https://tidbcloud.com/)
     - [Aiven MySQL](https://aiven.io/mysql)
     - [Railway MySQL](https://railway.app/)
     - [Clever Cloud MySQL](https://www.clever-cloud.com/)
2. **Execute Database Setup Script**:
   - Connect to the provisioned database using MySQL Workbench, DBeaver, or the MySQL CLI:
     ```bash
     mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USERNAME> -p <DB_NAME> < mysql_workbench_setup.sql
     ```
   - This script creates all required tables: `users`, `student_profiles`, `companies`, `internships`, `applications`, `notifications`, `screening_tests`, `password_resets`, and seeds the initial admin and demo recruiter data.

---

## 4. Environment Variables Specification

### A. Shared Backend Variables (Auth, Student, Company)
| Variable | Required | Example / Description |
| :--- | :--- | :--- |
| `DB_HOST` | Yes | Hostname of your MySQL instance (e.g. `gateway01.us-east-1.prod.aws.tidbcloud.com`) |
| `DB_PORT` | Yes | Port of your MySQL instance (e.g. `3306` or `4000`) |
| `DB_NAME` | Yes | Database name (e.g. `internmatch_db`) |
| `DB_USERNAME` | Yes | Database user (e.g. `admin`) |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secure 256-bit secret string (e.g. `SuperSecureInternMatchKey2026WithSufficientBitsLengthForHMACSHA256`) |
| `FRONTEND_URL` | Yes | Render Static Site URL: `https://<frontend-name>.onrender.com` |

> *Tip: You can alternatively provide `DB_URL` as a full JDBC string instead of `DB_HOST`, `DB_PORT`, and `DB_NAME`.*

---

### B. Service-Specific Variables

#### 1. `internmatch-auth-service`
* `MAIL_USERNAME`: Gmail address used for sending OTP verification emails.
* `MAIL_PASSWORD`: Google App Password (16-character password generated in Google Account Security).

#### 2. `internmatch-student-service`
* `COMPANY_SERVICE_URL`: `https://<internmatch-company-service>.onrender.com`
* `AI_SERVICE_URL`: `https://<internmatch-ai-service>.onrender.com`
* `UNSTOP_API_KEY`: *(Optional)* API key for live internship fetching from Unstop.

#### 3. `internmatch-company-service`
* `STUDENT_SERVICE_URL`: `https://<internmatch-student-service>.onrender.com`

#### 4. `internmatch-ai-service`
*(Note: Does not connect to a database)*
* `JWT_SECRET`: Same value as other services.
* `FRONTEND_URL`: `https://<frontend-name>.onrender.com`
* `GROQ_API_KEY`: Groq Cloud API Key (`gsk_...`).
* `GROQ_API_URL`: `https://api.groq.com/openai/v1/chat/completions` (default)
* `GROQ_MODEL`: `llama-3.3-70b-versatile` (default)
* `LEETCODE_API_URL`: `https://alfa-leetcode-api.onrender.com/userProfile/` (default)

#### 5. `internmatch-frontend` (Static Site)
* `VITE_AUTH_SERVICE_URL`: `https://<internmatch-auth-service>.onrender.com`
* `VITE_STUDENT_SERVICE_URL`: `https://<internmatch-student-service>.onrender.com`
* `VITE_COMPANY_SERVICE_URL`: `https://<internmatch-company-service>.onrender.com`
* `VITE_AI_SERVICE_URL`: `https://<internmatch-ai-service>.onrender.com`

---

## 5. Deployment Step-by-Step Order

Follow this exact order to avoid dependency deadlock:

### Step 1: Database Setup
1. Provision your MySQL instance on your chosen provider.
2. Execute `mysql_workbench_setup.sql` on the database.
3. Keep host, port, database name, username, and password ready.

### Step 2: Deploy Backend Services with No Inter-Service Dependencies
1. **Deploy `internmatch-ai-service`**:
   - Does not depend on any other backend service or database.
   - Configure `GROQ_API_KEY` and `JWT_SECRET`.
   - Record the resulting service URL: `https://<ai-service>.onrender.com`.
2. **Deploy `internmatch-auth-service`**:
   - Depends only on the MySQL database.
   - Configure database variables, `JWT_SECRET`, and `MAIL_USERNAME`/`MAIL_PASSWORD`.
   - Record the resulting service URL: `https://<auth-service>.onrender.com`.

### Step 3: Deploy Interconnected Services
1. **Deploy `internmatch-company-service`**:
   - Configure database variables and `JWT_SECRET`.
   - Set temporary placeholder for `STUDENT_SERVICE_URL`.
   - Record the resulting service URL: `https://<company-service>.onrender.com`.
2. **Deploy `internmatch-student-service`**:
   - Configure database variables, `JWT_SECRET`.
   - Set `COMPANY_SERVICE_URL` to `https://<company-service>.onrender.com`.
   - Set `AI_SERVICE_URL` to `https://<ai-service>.onrender.com`.
   - Record the resulting service URL: `https://<student-service>.onrender.com`.
3. **Update `internmatch-company-service`**:
   - Update `STUDENT_SERVICE_URL` to the real student service URL and trigger redeploy.

### Step 4: Deploy Frontend Static Site
1. Create a new **Static Site** on Render pointing to repository root.
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm install && npm run build`.
4. Set Publish Directory to `dist`.
5. Under **Environment Variables**, provide the 4 backend service URLs:
   - `VITE_AUTH_SERVICE_URL`: `https://<auth-service>.onrender.com`
   - `VITE_STUDENT_SERVICE_URL`: `https://<student-service>.onrender.com`
   - `VITE_COMPANY_SERVICE_URL`: `https://<company-service>.onrender.com`
   - `VITE_AI_SERVICE_URL`: `https://<ai-service>.onrender.com`
6. Deploy the Static Site and note its public URL: `https://<frontend-name>.onrender.com`.

### Step 5: Update CORS Configuration
1. In all 4 backend services, ensure `FRONTEND_URL` is set to `https://<frontend-name>.onrender.com`.
2. Trigger a manual redeploy on any services that did not automatically restart.

---

## 6. Blueprint Deployment (`render.yaml`)

A root `render.yaml` Blueprint file has been pre-configured in this repository.
If you connect your GitHub repository to Render via **Blueprints**:
1. Go to **Blueprints** on Render Dashboard.
2. Click **New Blueprint Instance** and select your `InternMatch` repository.
3. Render will parse `render.yaml` and create:
   - `internmatch-frontend` (Static Site)
   - `internmatch-auth-service` (Web Service via Docker)
   - `internmatch-student-service` (Web Service via Docker)
   - `internmatch-company-service` (Web Service via Docker)
   - `internmatch-ai-service` (Web Service via Docker)
4. Fill in the prompted secret environment variables (`DB_HOST`, `DB_PASSWORD`, `JWT_SECRET`, `GROQ_API_KEY`, etc.).
5. Click **Apply**.

---

## 7. Post-Deployment Verification & Testing Checklist

- [ ] **Health Checks**:
  - `GET https://<auth-service>.onrender.com/actuator/health` -> `{"status":"UP"}`
  - `GET https://<student-service>.onrender.com/actuator/health` -> `{"status":"UP"}`
  - `GET https://<company-service>.onrender.com/actuator/health` -> `{"status":"UP"}`
  - `GET https://<ai-service>.onrender.com/actuator/health` -> `{"status":"UP"}`
- [ ] **Admin Login**:
  - Email: `thilakvignesh@gmail.com`
  - Password: `ThilakVignesh`
  - Verify admin statistics, recruiter listings, and student listings render.
- [ ] **Company Login**:
  - Email: `recruiter@nvidia.com`
  - Password: `nvidia123`
  - Verify active internships appear on the company dashboard.
- [ ] **Student Registration & OTP Verification**:
  - Register a new student account.
  - Verify OTP email receipt and login token generation.
- [ ] **Resume Upload & Parsing**:
  - Upload a PDF/DOCX resume on student profile.
  - Verify ATS keyword extraction and parse score.
- [ ] **Application & Test Simulation**:
  - Apply for an internship, trigger the proctored quiz, and verify submission.

---

## 8. Local Development Instructions

The application continues to function seamlessly in local development:
1. Start MySQL locally on port `3306` with database `internmatch_db`.
2. Run database setup:
   ```bash
   mysql -u root -p internmatch_db < mysql_workbench_setup.sql
   ```
3. Start backend services:
   ```bash
   # From microservices/ folder:
   mvn clean spring-boot:run -pl auth-service
   mvn clean spring-boot:run -pl student-service
   mvn clean spring-boot:run -pl company-service
   mvn clean spring-boot:run -pl ai-service
   ```
4. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. All inter-service and frontend proxies default to localhost ports 8081, 8082, 8083, 8084.
