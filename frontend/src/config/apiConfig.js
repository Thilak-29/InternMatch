export const API_CONFIG = {
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'https://some-clouds-fetch.loca.lt',
  STUDENT_SERVICE_URL: import.meta.env.VITE_STUDENT_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'https://chatty-lines-cover.loca.lt',
  COMPANY_SERVICE_URL: import.meta.env.VITE_COMPANY_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'https://slow-ways-do.loca.lt',
  AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'https://grumpy-carpets-obey.loca.lt',

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
