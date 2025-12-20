import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Usamos base en build (deploy bajo /dimensions/) pero evitamos prefijo en dev para no romper los refresh.
  base: command === 'build' ? '/dimensions/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/graphql': {
        target: 'https://backoffice.rooftop.dev',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
}))
