import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^core-js\/.*/,
        replacement: path.resolve(__dirname, 'src/utils/empty.js'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
