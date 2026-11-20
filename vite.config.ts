import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // API calls go to the local backend (ams-backend). 127.0.0.1, not localhost: Node may resolve that to IPv6.
    proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8020' },
  },
  // Pre-bundle every runtime dependency up front. Avoids mid-session re-optimisation,
  // which can fail on Windows with EBUSY file locks and leave modules unloadable.
  optimizeDeps: {
    // Only bundle the list below (no runtime discovery → no second optimise pass).
    // Add new runtime dependencies here.
    noDiscovery: true,
    include: [
      'react',
      'react-dom/client',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'zustand',
      'zustand/middleware',
      '@tanstack/react-table',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      '@floating-ui/react',
      'lucide-react',
      'dayjs',
      'dayjs/plugin/utc',
      'dayjs/plugin/timezone',
      'clsx',
    ],
  },
});
