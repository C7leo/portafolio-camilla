import { defineConfig } from 'vite';

import { transform } from 'lightningcss';
import { transformAsync } from '@babel/core';
import linker from '@angular/compiler-cli/linker/babel';

export default defineConfig({
  plugins: [{
    name: 'minify-angular-component-css', enforce: 'pre', apply: 'build',
    transform(code, id) {
      if (!id.endsWith('.css?inline')) return;
      return { code: transform({ filename: id.split('?')[0], code: Buffer.from(code), minify: true }).code.toString(), map: null };
    },
  }, {
    name: 'aot-production-entry', apply: 'build',
    config: () => ({ define: { ngDevMode: 'false', ngJitMode: 'false', ngI18nClosureMode: 'false' } }),
    transformIndexHtml: { order: 'pre', handler: html => html.replace('/src/main.ts', '/.local/aot/main.js') },
  }, {
    name: 'angular-library-linker', apply: 'build',
    async transform(code, id) {
      if (!id.includes('/node_modules/@angular/') || !code.includes('ɵɵngDeclare')) return;
      const result = await transformAsync(code, { filename: id, babelrc: false, configFile: false, plugins: [[linker, { linkerJitMode: false }]], compact: true });
      return { code: result.code, map: null };
    },
  }],
  base: '/',
  build: {
    target: 'es2022', minify: 'esbuild', cssMinify: 'lightningcss', cssCodeSplit: true,
    rollupOptions: { output: { manualChunks(id) {
      if (!id.includes('node_modules')) return;
      if (id.includes('/three/')) return 'three';
      if (id.includes('/@angular/') || id.includes('/rxjs/')) return 'angular';
      if (id.includes('/gsap/')) return 'motion';
    } } },
  },
  esbuild: { target: 'es2022' },
  // Audit/Playwright HTML is evidence, not an application entry point. Watching
  // these folders caused full-page reloads (and replayed the intro) during tests.
  server: { watch: { ignored: ['**/.local/**', '**/test-results/**', '**/playwright-report/**'] } },
});
