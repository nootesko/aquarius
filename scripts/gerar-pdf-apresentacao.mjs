/* Gera o PDF da apresentação a partir de /apresentacao/?pdf (ou /apresentacao-v2/?pdf).
   Uso: com o servidor rodando (npm run dev), execute  npm run pdf  (v1)  ou  npm run pdf -- v2
   Variáveis opcionais:
     SITE_URL        endereço do servidor (padrão http://localhost:5173)
     CHROME_PATH     caminho do Chrome/Chromium, se o Playwright não achar sozinho */
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const base = process.env.SITE_URL ?? 'http://localhost:5173'
const v2 = process.argv.includes('v2')
const path = v2 ? 'apresentacao-v2' : 'apresentacao'
const out = resolve(import.meta.dirname, `../public/${path}/aquarius-sem-buracos${v2 ? '-v2' : ''}.pdf`)

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
await page.goto(`${base}/${path}/?pdf`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
await mkdir(dirname(out), { recursive: true })
await page.pdf({ path: out, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true })
await browser.close()
console.log(`PDF gerado: ${out}`)
