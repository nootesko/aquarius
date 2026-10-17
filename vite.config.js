import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* No `npm run dev`, responde /api/ruas-novas e /api/painel com as mesmas funções que rodam na Vercel.
   As chaves vêm de .env.local (OPENAI_API_KEY=...), que não vai para o git. */
function apiDev() {
  return {
    name: 'api-dev',
    configureServer(server) {
      for (const name of ['ruas-novas', 'painel']) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          const { default: handler } = await server.ssrLoadModule(`/api/${name}.js`)
          await handler(req, res)
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, import.meta.dirname, ['OPENAI_', 'SIMULADOR_', 'KV_', 'UPSTASH_', 'PAINEL_']))

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
          calcamento: resolve(import.meta.dirname, 'calcamento/index.html'),
          banner: resolve(import.meta.dirname, 'banner/index.html'),
          painel: resolve(import.meta.dirname, 'painel/index.html'),
          aplicativo: resolve(import.meta.dirname, 'aplicativo/index.html'),
        },
      },
    },
  }
})
