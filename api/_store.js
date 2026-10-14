/* Armazenamento compartilhado pelas funções de /api (o "_" no nome impede a Vercel de
   publicar este arquivo como rota).

   Usa o Redis da Upstash quando KV_REST_API_URL / KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL /
   UPSTASH_REDIS_REST_TOKEN) existem. Sem eles, guarda só na memória da função, que zera quando ela
   reinicia — não use assim em produção. */

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export const persistent = Boolean(REDIS_URL && REDIS_TOKEN)

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

export const store = persistent
  ? {
      incr: (k) => redis('INCR', k),
      decr: (k) => redis('DECR', k),
      get: async (k) => Number(await redis('GET', k)) || 0,
      lpush: (k, v) => redis('LPUSH', k, v),
      lrange: (k, start, stop) => redis('LRANGE', k, start, stop),
    }
  : {
      incr: async (k) => mem.set(k, (mem.get(k) ?? 0) + 1).get(k),
      decr: async (k) => mem.set(k, (mem.get(k) ?? 0) - 1).get(k),
      get: async (k) => mem.get(k) ?? 0,
      lpush: async (k, v) => mem.set(k, [v, ...(mem.get(k) ?? [])]).get(k).length,
      lrange: async (k, start, stop) => (mem.get(k) ?? []).slice(start, stop === -1 ? undefined : stop + 1),
    }

export function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

/* Cadastros de quem pediu uma simulação (nome e endereço), o mais recente primeiro. */
export const LEADS_KEY = 'ruas-novas:cadastros'
