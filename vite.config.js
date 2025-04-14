import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/pontos': 'http://localhost:3000',
      '/funcionarios': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
});
