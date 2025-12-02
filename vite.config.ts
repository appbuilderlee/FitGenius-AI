import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/FitGenius-AI/', // CRITICAL: Matches your GitHub Repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});