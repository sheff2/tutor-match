/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Allow overriding API proxy port via VITE_API_PORT in client/.env
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPort = env.VITE_API_PORT || '5000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': `http://localhost:${apiPort}`
      }
    }
  }
})
