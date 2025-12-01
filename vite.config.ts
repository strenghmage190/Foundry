import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import prefixer from 'postcss-prefix-selector';
import copy from 'rollup-plugin-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: '.beyonders-wrapper',
            transform(prefix, selector, prefixedSelector) {
              if (selector === 'body' || selector === 'html') {
                return prefix;
              }
              return prefixedSelector;
            }
          })
        ]
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
      lib: {
        entry: path.resolve(__dirname, 'index.tsx'),
        name: 'BeyondersBundle',
        fileName: (format) => `beyonders.bundle.${format}.js`,
        formats: ['es', 'iife']
      },
      rollupOptions: {
        // Avoid manualChunks to be compatible with iife build (inlineDynamicImports)
        output: {},
        plugins: [
          copy({
            targets: [
              { src: 'scripts/main.js', dest: 'dist/module/scripts' },
              { src: 'templates/**', dest: 'dist/module/templates' },
              { src: 'foundry/module.json', dest: 'dist/module' },
              { src: 'styles/main.css', dest: 'dist/module/styles', rename: 'beyonders.css' },

              { src: 'system.json', dest: 'dist/system' },
              { src: 'beyonders-system.mjs', dest: 'dist/system' },
              { src: 'module/**', dest: 'dist/system/module' },
              { src: 'lang/**', dest: 'dist/system/lang' },
              { src: 'styles/main.css', dest: 'dist/system/styles', rename: 'beyonders.css' }
            ],
            hook: 'writeBundle',
            verbose: true,
            copyOnce: true
          })
        ]
      }
    }
  };
});
