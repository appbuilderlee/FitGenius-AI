import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL: This ensures assets load correctly on GitHub Pages (relative paths)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});