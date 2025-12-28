import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lottie-react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
  },
  // Base URL for deployment
  base: './',
});