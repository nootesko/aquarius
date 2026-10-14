/* /api/ruas-novas — recebe a foto da rua e devolve a simulação com bloquete.
   Roda como função da Vercel (e no `npm run dev`, pelo plugin em vite.config.js).

   Variáveis de ambiente:
     OPENAI_API_KEY        chave da OpenAI (obrigatória)
     OPENAI_IMAGE_MODEL    modelo de imagem (padrão gpt-image-2)
     OPENAI_IMAGE_QUALITY  low | medium | high (padrão medium)
     SIMULADOR_MAX         teto de gerações no total (padrão 700)
     SIMULADOR_POR_IP      gerações por conexão/IP (padrão 3)
     KV_REST_API_URL / KV_REST_API_TOKEN   Redis da Upstash (veja api/_store.js)

   Limites, do mais fácil ao mais difícil de burlar:
     1. cookie: uma geração por aparelho/navegador;
     2. IP: poucas gerações por conexão (vizinhos podem dividir o IP da operadora);
     3. teto geral: nunca passa de SIMULADOR_MAX, aconteça o que acontecer.
   Geração que falha devolve a vaga.

   GET  → { used, soldOut }
   POST { image: "data:image/jpeg;base64,...", ratio: largura/altura, nome, endereco } → { image } ou { error, code }
   Nome e endereço ficam guardados para a chapa (veja /api/painel). */

import { createHash } from 'node:crypto'
import { LEADS_KEY, send, store } from './_store.js'

const PROMPT =
  'Substitua a rua de terra por uma rua de bloquete sextavado, com guia (meio-fio) de concreto nas duas laterais. Não faça calçadas: depois da guia tem que ser grama, uma grama bem cortada e cuidada.'

const MAX_BYTES = 3.5 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_TOTAL = Number(process.env.SIMULADOR_MAX) || 700
const PER_IP = Number(process.env.SIMULADOR_POR_IP) || 3
const COOKIE = 'rn_usado'
const TOTAL_KEY = 'ruas-novas:total'

/* O IP não é guardado: vira um hash curto. */
const ipKey = (ip) => `ruas-novas:ip:${createHash('sha256').update(`aquarius:${ip}`).digest('hex').slice(0, 24)}`

/* ---------------- utilitários HTTP ---------------- */
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

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)

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

  const nome = clean(body.nome)
  const endereco = clean(body.endereco)
  if (nome.length < 2 || endereco.length < 3) {
    return send(res, 400, { error: 'Preencha seu nome e endereço para fazer a simulação.', code: 'lead' })
  }

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

  /* Guarda o cadastro antes de gerar: se a geração falhar, a chapa ainda tem o contato. */
  await store
    .lpush(LEADS_KEY, JSON.stringify({ nome, endereco, em: new Date().toISOString() }))
    .catch((e) => console.error('[ruas-novas] cadastro', e))

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
