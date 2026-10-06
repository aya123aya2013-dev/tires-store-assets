import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Isolated component harness: deliberately excludes the Twilight API/SSR plugin.
export default defineConfig({
  root: fileURLToPath(new URL('./fixture', import.meta.url)),
  plugins: [react()],
  resolve: { alias: {
    '@salla.sa/twilight-theme-engine/common': fileURLToPath(new URL('./fixture/common.tsx', import.meta.url)),
    '@tanstack/react-router': fileURLToPath(new URL('./fixture/router.tsx', import.meta.url)),
  } },
  server: { host: '127.0.0.1', port: 4178, strictPort: true },
});
