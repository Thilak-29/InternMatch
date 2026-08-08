// Centralized Microservices & Unified Gateway Configuration
export const API_CONFIG = {
  // Unified Gateway / Standalone Backend (Default Port 8000)
  GATEWAY_URL: 'http://localhost:8000',

  // Dedicated Microservices (Independently Runnable Ports)
  AUTH_SERVICE_URL: 'http://localhost:8081',
  STUDENT_SERVICE_URL: 'http://localhost:8082',
  COMPANY_SERVICE_URL: 'http://localhost:8083',
  AI_SERVICE_URL: 'http://localhost:8084',

  // Dynamic API Resolver: Uses microservice URL if running on custom port, else routes through Gateway
  getUrl(service) {
    return this.GATEWAY_URL;
  }
};

export default API_CONFIG;
