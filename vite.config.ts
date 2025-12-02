import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL: Use relative path for Vercel/GitHub Pages compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});