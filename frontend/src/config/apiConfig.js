// Centralized Microservices API Configuration
export const API_CONFIG = {
  AUTH_SERVICE_URL: 'http://localhost:8081',
  STUDENT_SERVICE_URL: 'http://localhost:8082',
  COMPANY_SERVICE_URL: 'http://localhost:8083',
  AI_SERVICE_URL: 'http://localhost:8084',
  GATEWAY_URL: 'http://localhost:8081',

  getUrl(service) {
    switch (service) {
      case 'AUTH':
        return this.AUTH_SERVICE_URL;
      case 'STUDENT':
        return this.STUDENT_SERVICE_URL;
      case 'COMPANY':
        return this.COMPANY_SERVICE_URL;
      case 'AI':
        return this.AI_SERVICE_URL;
      default:
        return this.AUTH_SERVICE_URL;
    }
  }
};

export default API_CONFIG;
