import { defineConfig } from 'vite';

export default defineConfig({
  base: '/app/',
  publicDir: false,
  server: { port: 5173 },
  build: { outDir: 'dist/app', sourcemap: true, emptyOutDir: true },
});
