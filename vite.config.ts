import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const workerTarget = env.VITE_API_URL || 'https://interviews.galiprandi.workers.dev'

  return {
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
          target: workerTarget,
          changeOrigin: true,
        },
        '/api/profile-summary': {
          target: workerTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
