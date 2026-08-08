import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/student': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/company': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/ai': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
