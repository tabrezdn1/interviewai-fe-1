import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configure server for better client-side routing in development
  server: {
    host: true,
    port: 3000,
    // Enable SPA fallback for client-side routing
    historyApiFallback: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Generate .spa.html file for client-side routing in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@supabase/supabase-js', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
});