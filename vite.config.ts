import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Gnosythium/',
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
  preview: { host: '127.0.0.1', port: 4180, strictPort: true },
  build: { target: 'es2022' },
});
