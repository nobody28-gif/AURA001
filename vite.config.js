import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/node_modules/**', 'C:/Windows/**'],
    },
  },
});