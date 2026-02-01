import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import RekaResolver from 'reka-ui/resolver'
import Components from 'unplugin-vue-components/vite'


// https://vite.dev/config/
export default defineConfig({
  base: '/dashboard/',
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      dts: true,
      resolvers: [
        RekaResolver()
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/src/apps': path.resolve(__dirname, '../../')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/method': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true
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
    exclude: ['@vite/client', '@vite/env']
  },
  build: {
    outDir: path.resolve(__dirname, '../../desktop/desktop/public/dashboard'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    }
  }
})
