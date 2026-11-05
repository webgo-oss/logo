import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, API requests and logo image files (/assets) are forwarded to Express.
// The images live in server/public/logos/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/assets': 'http://localhost:5000',
    },
  },
});
