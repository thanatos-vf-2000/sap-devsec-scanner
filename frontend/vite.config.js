import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { execSync } from 'node:child_process';

import appPkg from '../backend/package.json';
import uiPkg from './package.json';
import humans from '../humans.json';


const buildTime = new Date().toISOString();

function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD')
      .toString()
      .trim();
  } catch (e) {
    return 'unknown';
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(),
    ...(process.env.ENABLE_DEVTOOLS === 'true'
      ? [vueDevTools()]
      : []),
  ],
  define: {
    __APP_VERSION__    : JSON.stringify(appPkg.version),
    __UI_VERSION__     : JSON.stringify(uiPkg.version),
    __BUILD_TIME__     : JSON.stringify(buildTime),
    __GIT_HASH__       : JSON.stringify(process.env.GIT_COMMIT || getGitHash()),
    __NODE_ENV__       : JSON.stringify(process.env.NODE_ENV),
    __BUILD_NUMBER__   : JSON.stringify(process.env.BUILD_NUMBER || 'local'),
    __HUMANS_AUTHORS__ : humans.authors,
    __HUMANS_MAINT__   : humans.maintainers,
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
          } else if (parts.length === 3) {
            return `/${parts[0]}_${parts[1]}_${parts[2]}`;
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
