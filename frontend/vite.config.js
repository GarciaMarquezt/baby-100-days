import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // target: 'http://localhost:8080', // 本地后端地址
        target: 'http://8.138.140.178:8080', // 后端地址
        changeOrigin: true,
        rewrite: (path) => path // 保持路径不变
      }
    }
  }
})

