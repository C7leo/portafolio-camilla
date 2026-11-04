import { defineConfig } from 'vite';

// The supplied JSX uses React's automatic runtime and needs no default import.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // This Vite app runs entirely in the browser. Preserve the original
        // Next-compatible directive without reporting it as a bundling warning.
        const originalCardSwap = warning.id?.replaceAll('\\', '/').endsWith('/CardSwap/CardSwap.jsx');
        if (originalCardSwap && warning.loc?.line === 1 && (
          (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) ||
          warning.code === 'SOURCEMAP_ERROR'
        )) return;
        warn(warning);
      }
    }
  }
});
