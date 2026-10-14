/* /api/painel — lista os cadastros (nome e endereço) de quem pediu simulação.

   Login por Basic Auth, conferido aqui no servidor. Usuário e senha vêm das variáveis de
   ambiente PAINEL_USUARIO e PAINEL_SENHA (configure na Vercel). Sem elas, o painel fica fechado:
   o repositório é público, então a senha nunca vai no código.

   GET (Authorization: Basic ...) → { itens: [{ nome, endereco, em }], persistente } */

import { timingSafeEqual } from 'node:crypto'
import { LEADS_KEY, persistent, send, store } from './_store.js'

const same = (a, b) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

function authorized(req) {
  const user = process.env.PAINEL_USUARIO
  const pass = process.env.PAINEL_SENHA
  const m = /^Basic (.+)$/.exec(req.headers.authorization ?? '')
  if (!user || !pass || !m) return false
  const [u, ...rest] = Buffer.from(m[1], 'base64').toString('utf8').split(':')
  return same(u, user) && same(rest.join(':'), pass)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return send(res, 405, { error: 'Método não permitido.' })
  }
  if (!process.env.PAINEL_USUARIO || !process.env.PAINEL_SENHA) {
    return send(res, 503, { error: 'O painel ainda não foi configurado (PAINEL_USUARIO e PAINEL_SENHA).' })
  }
  if (!authorized(req)) return send(res, 401, { error: 'Usuário ou senha incorretos.' })

  try {
    const raw = await store.lrange(LEADS_KEY, 0, -1)
    const itens = raw
      .map((r) => {
        try {
          return JSON.parse(r)
        } catch {
          return null
        }
      })
      .filter(Boolean)
    return send(res, 200, { itens, persistente: persistent })
  } catch (e) {
    console.error('[painel]', e)
    return send(res, 503, { error: 'Não conseguimos carregar os cadastros agora.' })
  }
}
