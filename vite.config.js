import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        apresentacao: resolve(import.meta.dirname, 'apresentacao/index.html'),
      },
    },
  },
})
