import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    watch: {
      ignored: ['**/server/data/**', '**/server/*.log']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@clerk')) return 'clerk'
          if (id.includes('node_modules/@remotion') || id.includes('node_modules/remotion')) return 'remotion'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    }
  }
})
