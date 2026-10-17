import { today } from '../lib/format.js'

/* Situação efetiva de uma autorização hoje: uma 'ativa' com validade vencida já é expirada */
export function authState(a, t = today()) {
  if (a.status !== 'ativa') return a.status
  if (a.validoAte < t) return 'expirada'
  if (a.validoDe > t) return 'futura'
  return 'ativa'
}

export const validToday = (a, t = today()) => authState(a, t) === 'ativa'

export const isToday = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString()

/* Quem está dentro agora para uma autorização (entrada sem saída) */
export const openEntry = (db, authId) => db.accessLog.find((l) => l.autorizacaoId === authId && !l.saida)

export const residentsOf = (db, unitId) =>
  db.persons.filter((p) => p.unitId === unitId && p.status === 'ativo' && p.tipo === 'permanente')

export const normalize = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
