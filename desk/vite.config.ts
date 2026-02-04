import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'


// https://vite.dev/config/
export default defineConfig({
  base: '/dashboard/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/src/apps': path.resolve(__dirname, '../../')
    }
  },
  server: {
    port: 5173,
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Proxy] API Request:', req.method, req.url)
          })
        }
      },
      '/method': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/method/, '/method')
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/upload_file': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api/resource': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket.io/, '/socket.io')
      },
      '/src/apps': {
        target: 'http://localhost:5173',
        bypass: (req) => {
          const match = req?.url?.match(/^\/src\/apps\/([^\/]+)\//)
          if (match) {
            const filePath = path.resolve(__dirname, `../../${req?.url?.substring(10)}`)
            return filePath
          }
          return null
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env'],
    include: ['socket.io-client']
  },
  build: {
    outDir: path.resolve(__dirname, '../../desktop/desktop/public/dashboard'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-socketio': ['socket.io-client'],
          'vendor-ui': ['tailwindcss']
        }
      }
    }
  }
})
