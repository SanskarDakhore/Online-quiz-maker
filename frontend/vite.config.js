import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    reportCompressedSize: false,
    target: 'esnext',
    cssMinify: 'esbuild',
    minify: 'esbuild',
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
  optimizeDeps: {
    holdUntilCrawlEnd: false,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'chart.js',
      'react-chartjs-2',
      'uuid'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
    fs: {
      cachedChecks: true
    }
  },
  // Base URL for deployment
  base: '/',
});
