import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { target: 'es2022' },
  // Audit/Playwright HTML is evidence, not an application entry point. Watching
  // these folders caused full-page reloads (and replayed the intro) during tests.
  server: { watch: { ignored: ['**/.local/**', '**/test-results/**', '**/playwright-report/**'] } },
});
