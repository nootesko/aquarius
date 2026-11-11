/* Gera a capa de compartilhamento (og:image, 1200x630) da apresentação v2:
   "Propostas Aquarius Sem Buracos", sobre a foto real da portaria.
   Uso:  node scripts/gerar-capa-v2.mjs   (CHROME_PATH opcional, como no gerar-pdf)
   Salva em public/assets/v2/og-propostas.jpg. */
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const dataUri = (rel, mime) => `data:${mime};base64,${readFileSync(join(root, rel)).toString('base64')}`
const foto = dataUri('public/assets/v2/portaria-aquarius.webp', 'image/webp')
const logo = dataUri('public/assets/logo-800.webp', 'image/webp')
const out = join(root, 'public/assets/v2/og-propostas.jpg')

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,400..900&family=Google+Sans+Flex:wght@400..700&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative; color: #fff;
         font-family: "Google Sans Flex", sans-serif; background: #072d66; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 45%; }
  .veil { position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(5,31,71,.55) 0%, rgba(7,45,102,.82) 42%, rgba(5,31,71,.95) 100%); }
  .wrap { position: relative; height: 100%; display: flex; align-items: center; gap: 48px; padding: 0 64px 0 48px; }
  .logo { width: 430px; flex: none; filter: drop-shadow(0 20px 40px rgba(0,0,0,.4)); }
  .txt { display: flex; flex-direction: column; gap: 18px; }
  .kicker { align-self: flex-start; background: #ffcc00; color: #0a1730; border-radius: 999px;
            padding: 12px 26px 10px; font: 700 28px/1 "Google Sans Flex", sans-serif; letter-spacing: .12em; text-transform: uppercase; }
  h1 { font-family: "Archivo", sans-serif; font-weight: 900; font-stretch: 88%; text-transform: uppercase;
       font-size: 92px; line-height: .95; letter-spacing: -.02em; text-shadow: 0 6px 24px rgba(0,0,0,.35); }
  h1 span { color: #ffdd52; display: block; }
  .sub { font-size: 28px; color: rgba(255,255,255,.9); }
</style></head><body>
  <img class="bg" src="${foto}">
  <div class="veil"></div>
  <div class="wrap">
    <img class="logo" src="${logo}">
    <div class="txt">
      <div class="kicker">Propostas</div>
      <h1>Aquarius<span>Sem Buracos</span></h1>
      <p class="sub">Fabi presidente · Latrofe vice</p>
    </div>
  </div>
</body></html>`

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
await browser.close()
console.log(`Capa gerada: ${out}`)
