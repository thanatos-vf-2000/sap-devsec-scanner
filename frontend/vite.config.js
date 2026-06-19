import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const rewrites = {
  '/scan/upload': '/scan_upload',
  '/scan/history': '/scan_history',
  'scan/4e144b6e-2419-476f-a062-cf0e5a8332d7': 'scan_4e144b6e-2419-476f-a062-cf0e5a8332d7',
};
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(require('../backend/package.json').version),
    __UI_VERSION__: JSON.stringify(require('./package.json').version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => {
          const p = path.replace(/^\/api\//, '');

          const parts = p.split('/');

          if (parts.length === 2) {
            return `/${parts[0]}_${parts[1]}`;
          }

          return `/${p}`;
        },
      },
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  },
})
