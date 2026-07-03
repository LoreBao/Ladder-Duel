import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
// apps/web/vite.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Ladder-Duel/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,             
    hmr: {
      clientPort: 5173,
    },
  },
  resolve: {
    alias: {
      '@ladder-duel/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
})