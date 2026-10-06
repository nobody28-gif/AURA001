import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Keeps source code hidden in DevTools
    minify: 'esbuild', // Uses Vite's native high-speed minifier (no extra install needed)
  },
  esbuild: {
    drop: ['console', 'debugger'], // Strips console.log & debuggers automatically
  },
});