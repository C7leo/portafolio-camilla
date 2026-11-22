import { defineConfig } from 'vite';

import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  esbuild: { target: 'es2022', jsx: 'automatic' },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/build/[name]-[hash].js',
        chunkFileNames: 'assets/build/[name]-[hash].js',
        assetFileNames: 'assets/build/[name]-[hash][extname]',
      },
    },
  },
  // Audit/Playwright HTML is evidence, not an application entry point. Watching
  // these folders caused full-page reloads (and replayed the intro) during tests.
  server: { watch: { ignored: ['**/.local/**', '**/test-results/**', '**/playwright-report/**'] } },
});
