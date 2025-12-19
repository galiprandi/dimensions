import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/graphql': {
        target: 'https://backoffice.rooftop.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
