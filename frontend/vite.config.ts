import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';


export default defineConfig(() => {
  const apiTarget = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
