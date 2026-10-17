import { useEffect, useState } from 'react'

/* Roteamento por hash: #/morador/reservas/r1 → ['morador', 'reservas', 'r1'].
   Funciona em qualquer hospedagem estática, sem configuração de servidor. */

const parse = () =>
  window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent)

/* Pilha das páginas visitadas nesta aba: o "Voltar" usa o histórico real
   e só cai no destino padrão quando a pessoa entrou direto na página. */
const visited = [window.location.hash]
let replacing = false
window.addEventListener('hashchange', () => {
  const h = window.location.hash
  if (replacing) visited[visited.length - 1] = h
  else if (visited.length > 1 && visited[visited.length - 2] === h) visited.pop()
  else visited.push(h)
  replacing = false
})

export const goBack = (fallback) => {
  if (visited.length > 1) window.history.back()
  else go(fallback)
}

/* A página interna informa para onde o "voltar" vai se não houver histórico;
   o cabeçalho mostra a seta enquanto houver um alvo registrado. */
let backTarget = null
const backListeners = new Set()
export const setBackTarget = (to) => {
  backTarget = to
  backListeners.forEach((fn) => fn(to))
}
export function useBackTarget() {
  const [to, setTo] = useState(backTarget)
  useEffect(() => {
    backListeners.add(setTo)
    setTo(backTarget) // a página pode ter registrado o alvo antes do cabeçalho se inscrever
    return () => backListeners.delete(setTo)
  }, [])
  return to
}

export function useRoute() {
  const [parts, setParts] = useState(parse)
  useEffect(() => {
    const on = () => {
      setParts(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return parts
}

/* replace: troca a página atual no histórico (ex.: depois de salvar um formulário,
   para o "Voltar" não reabrir o formulário já enviado) */
export const go = (path, { replace = false } = {}) => {
  const hash = `#/${path.replace(/^\/+/, '')}`
  if (replace) {
    replacing = true
    window.location.replace(hash)
  } else window.location.hash = hash
}

export const href = (path) => `#/${path.replace(/^\/+/, '')}`
