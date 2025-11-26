import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Use '.' instead of process.cwd() to avoid TS error: Property 'cwd' does not exist on type 'Process'.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // This ensures that `process.env.API_KEY` in your code is replaced with the actual value during build.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    // Using relative base path ensures assets load correctly on any hosting path
    base: './',
  };
});