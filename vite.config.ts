import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
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
        rollupOptions: {
          output: {
            manualChunks: {
              'particles-objetos': ['./data/particles/objetos.ts'],
              'particles-funcoes': ['./data/particles/funcoes.ts'],
              'particles-caracteristicas': ['./data/particles/caracteristicas.ts'],
              'particles-complementos': ['./data/particles/complementos.ts'],
              'particles-criadores': ['./data/particles/criadores.ts'],
              'particles-pathways': ['./data/particles/pathways.ts'],
            }
          }
        }
      }
    };
});
