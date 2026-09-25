/* /api/ruas-novas — recebe a foto da rua e devolve a simulação com bloquete.
   Roda como função da Vercel (e no `npm run dev`, pelo plugin em vite.config.js).

   Variáveis de ambiente:
     OPENAI_API_KEY        chave da OpenAI (obrigatória)
     OPENAI_IMAGE_MODEL    modelo de imagem (padrão gpt-image-2)
     OPENAI_IMAGE_QUALITY  low | medium | high (padrão medium)
     SIMULADOR_MAX         teto de gerações no total (padrão 700)
     SIMULADOR_POR_IP      gerações por conexão/IP (padrão 3)
     KV_REST_API_URL / KV_REST_API_TOKEN   Redis da Upstash (a integração da Vercel cria sozinha;
       também aceita UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Sem Redis, os contadores
       ficam só na memória da função e zeram quando ela reinicia — não use assim em produção.

   Limites, do mais fácil ao mais difícil de burlar:
     1. cookie: uma geração por aparelho/navegador;
     2. IP: poucas gerações por conexão (vizinhos podem dividir o IP da operadora);
     3. teto geral: nunca passa de SIMULADOR_MAX, aconteça o que acontecer.
   Geração que falha devolve a vaga.

   GET  → { used, soldOut }
   POST { image: "data:image/jpeg;base64,...", ratio: largura/altura } → { image } ou { error, code } */

import { createHash } from 'node:crypto'

const PROMPT =
  'Substitua a rua de terra por uma rua de bloquete sextavado. Não faça calçadas, tem que ser grama, mas porém uma grama bem cortada e cuidada.'

const MAX_BYTES = 3.5 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_TOTAL = Number(process.env.SIMULADOR_MAX) || 700
const PER_IP = Number(process.env.SIMULADOR_POR_IP) || 3
const COOKIE = 'rn_usado'
const TOTAL_KEY = 'ruas-novas:total'

/* ---------------- contadores: Redis (Upstash REST) ou memória ---------------- */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

async function redis(...cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(cmd),
  })
  const data = await r.json()
  if (!r.ok || data.error) throw new Error(`redis: ${data.error ?? r.status}`)
  return data.result
}

const mem = new Map()
const store =
  REDIS_URL && REDIS_TOKEN
    ? {
        incr: (k) => redis('INCR', k),
        decr: (k) => redis('DECR', k),
        get: async (k) => Number(await redis('GET', k)) || 0,
      }
    : {
        incr: async (k) => mem.set(k, (mem.get(k) ?? 0) + 1).get(k),
        decr: async (k) => mem.set(k, (mem.get(k) ?? 0) - 1).get(k),
        get: async (k) => mem.get(k) ?? 0,
      }

/* O IP não é guardado: vira um hash curto. */
const ipKey = (ip) => `ruas-novas:ip:${createHash('sha256').update(`aquarius:${ip}`).digest('hex').slice(0, 24)}`

/* ---------------- utilitários HTTP ---------------- */
function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

const hasCookie = (req) => new RegExp(`(?:^|;\\s*)${COOKIE}=`).test(req.headers.cookie ?? '')

function usedCookie(req) {
  const secure = (req.headers['x-forwarded-proto'] ?? '').includes('https') ? '; Secure' : ''
  return `${COOKIE}=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BYTES * 1.4) throw new Error('too-large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

/* Mesmo formato da foto enviada; no "auto", uma foto quadrada pode voltar em pé. */
function sizeFor(ratio) {
  if (!(ratio > 0)) return 'auto'
  if (ratio >= 1.2) return '1536x1024'
  if (ratio <= 1 / 1.2) return '1024x1536'
  return '1024x1024'
}

const FAIL = 'Não conseguimos gerar a simulação agora. Tente novamente em instantes.'
const USED = 'Você já fez a sua simulação. Cada morador pode gerar uma imagem.'
const SOLD_OUT = 'As simulações disponíveis já foram todas usadas. Obrigado pelo interesse!'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const total = await store.get(TOTAL_KEY).catch(() => 0)
    return send(res, 200, { used: hasCookie(req), soldOut: total >= MAX_TOTAL })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return send(res, 405, { error: 'Método não permitido.' })
  }

  const key = process.env.OPENAI_API_KEY
  if (!key) return send(res, 503, { error: 'O simulador ainda não foi ativado. Tente mais tarde.', code: 'off' })
  if (hasCookie(req)) return send(res, 409, { error: USED, code: 'used' })

  let body
  try {
    body = await readJson(req)
  } catch {
    return send(res, 413, { error: 'A foto ficou grande demais. Tente outra.' })
  }
  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(body?.image ?? '')
  if (!match || !TYPES.includes(match[1])) return send(res, 400, { error: 'Envie uma foto em JPG, PNG ou WebP.' })
  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length > MAX_BYTES) return send(res, 413, { error: 'A foto ficou grande demais. Tente outra.' })

  /* Reserva a vaga antes de chamar a OpenAI (INCR é atômico: dois pedidos ao mesmo tempo
     não furam o teto). Se der errado lá na frente, devolve. */
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? '').split(',')[0].trim()
  const ipK = ipKey(ip)
  const reserved = []
  const release = () => Promise.all(reserved.map((k) => store.decr(k).catch(() => {})))

  try {
    const total = await store.incr(TOTAL_KEY)
    reserved.push(TOTAL_KEY)
    if (total > MAX_TOTAL) {
      await release()
      return send(res, 403, { error: SOLD_OUT, code: 'sold-out' })
    }
    const perIp = await store.incr(ipK)
    reserved.push(ipK)
    if (perIp > PER_IP) {
      await release()
      return send(res, 409, { error: USED, code: 'used' })
    }
  } catch (e) {
    console.error('[ruas-novas] contador', e)
    await release()
    return send(res, 503, { error: FAIL })
  }

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
  const form = new FormData()
  form.append('model', model)
  form.append('image', new Blob([bytes], { type: match[1] }), `rua.${match[1].split('/')[1]}`)
  form.append('prompt', PROMPT)
  form.append('size', sizeFor(Number(body.ratio)))
  form.append('quality', process.env.OPENAI_IMAGE_QUALITY || 'medium')
  if (model.startsWith('gpt-image-1')) form.append('input_fidelity', 'high') // só a família 1 aceita
  form.append('output_format', 'jpeg')
  form.append('output_compression', '85')
  form.append('n', '1')

  try {
    const r = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    const data = await r.json().catch(() => ({}))
    const b64 = data?.data?.[0]?.b64_json

    if (!r.ok || !b64) {
      console.error('[ruas-novas] OpenAI', r.status, data?.error?.code, data?.error?.message)
      await release()
      if (data?.error?.code === 'moderation_blocked') {
        return send(res, 422, { error: 'Não foi possível usar esta foto. Tente uma foto só da rua, sem pessoas.' })
      }
      return send(res, 502, { error: FAIL })
    }

    return send(res, 200, { image: `data:image/jpeg;base64,${b64}` }, { 'Set-Cookie': usedCookie(req) })
  } catch (e) {
    console.error('[ruas-novas]', e)
    await release()
    return send(res, 502, { error: FAIL })
  }
}
