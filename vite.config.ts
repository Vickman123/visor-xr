import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const enableSsl = process.env.VITE_HTTPS === 'true' || isDev;

  return {
    // Relative base path ensures deployment works on GitHub Pages (e.g. https://user.github.io/repo/)
    base: process.env.VITE_BASE_PATH || './',
    plugins: [
      react(),
      tailwindcss(),
      ...(enableSsl ? [basicSsl()] : []),
    ],
    server: {
      host: true, // Listen on all local IPs so Meta Quest 3S can connect via LAN
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
