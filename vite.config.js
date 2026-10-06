import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Ensures raw source code cannot be viewed in DevTools
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Strips console.log outputs
        drop_debugger: true,
      },
    },
  },
});