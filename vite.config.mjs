import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,  // Desactiva el overlay de errores para desarrollo
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
});