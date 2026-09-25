import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* No `npm run dev`, responde /api/ruas-novas com a mesma função que roda na Vercel.
   As chaves vêm de .env.local (OPENAI_API_KEY=...), que não vai para o git. */
function apiDev() {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use('/api/ruas-novas', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/ruas-novas.js')
        await handler(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, import.meta.dirname, ['OPENAI_', 'SIMULADOR_', 'KV_', 'UPSTASH_']))

  return {
    plugins: [react(), tailwindcss(), apiDev()],
    build: {
      target: 'es2020',
      cssMinify: 'lightningcss',
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          apresentacao: resolve(import.meta.dirname, 'apresentacao/index.html'),
          ruasNovas: resolve(import.meta.dirname, 'ruas-novas/index.html'),
        },
      },
    },
  }
})
