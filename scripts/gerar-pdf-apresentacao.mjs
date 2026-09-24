/* Gera public/apresentacao/aquarius-sem-buracos.pdf a partir de /apresentacao/?pdf.
   Uso: com o servidor rodando (npm run dev), execute  npm run pdf
   Variáveis opcionais:
     SITE_URL        endereço do servidor (padrão http://localhost:5173)
     CHROME_PATH     caminho do Chrome/Chromium, se o Playwright não achar sozinho */
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const base = process.env.SITE_URL ?? 'http://localhost:5173'
const out = resolve(import.meta.dirname, '../public/apresentacao/aquarius-sem-buracos.pdf')

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto(`${base}/apresentacao/?pdf`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
await mkdir(dirname(out), { recursive: true })
await page.pdf({ path: out, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true })
await browser.close()
console.log(`PDF gerado: ${out}`)
