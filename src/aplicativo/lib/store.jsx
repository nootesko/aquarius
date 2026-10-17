import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createSeed, ACCOUNTS } from './seed.js'
import { uid } from './format.js'

/* Estado da demonstração: tudo em memória, com cópia no localStorage para sobreviver
   ao recarregar. Não existe banco; "Restaurar demonstração" volta aos dados fictícios. */

const DATA_KEY = 'aquarius-demo-v14'
const SESSION_KEY = 'aquarius-session-v1'

const load = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const save = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sem storage: a demonstração vale até recarregar */
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  /* Dados salvos de uma versão anterior ganham as coleções que surgiram depois */
  const [db, setDb] = useState(() => {
    const saved = load(DATA_KEY)
    return saved ? { ...createSeed(), ...saved } : createSeed()
  })
  const [session, setSession] = useState(() => load(SESSION_KEY))
  const [toasts, setToasts] = useState([])

  useEffect(() => save(DATA_KEY, db), [db])
  useEffect(() => save(SESSION_KEY, session), [session])

  const toast = useCallback((text, tone = 'success') => {
    const id = uid('t')
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const user = useMemo(() => {
    if (!session) return null
    const account = ACCOUNTS.find((a) => a.login === session.login)
    if (!account) return null
    const person = db.persons.find((p) => p.id === account.personId)
    const unitIds = db.ownership.filter((o) => o.personId === person.id).map((o) => o.unitId)
    if (person.unitId && !unitIds.includes(person.unitId)) unitIds.unshift(person.unitId)
    return { ...account, ...person, unitIds, unitId: session.unitId ?? unitIds[0] ?? null }
  }, [session, db.persons, db.ownership])

  /* Toda alteração passa por aqui: recebe uma cópia do estado para mutar à vontade.
     Se `log` vier, registra no histórico de ações. */
  const mutate = useCallback(
    (fn, log) => {
      setDb((prev) => {
        const draft = structuredClone(prev)
        fn(draft)
        if (log && user) draft.audit.unshift({ id: uid('lg'), em: new Date().toISOString(), quem: user.nome, acao: log.acao, alvo: log.alvo ?? '' })
        return draft
      })
    },
    [user],
  )

  const login = (loginName, senha) => {
    const account = ACCOUNTS.find((a) => a.login === loginName.trim().toLowerCase() && a.senha === senha)
    if (!account) return false
    setSession({ login: account.login })
    return account
  }

  const logout = () => setSession(null)
  const selectUnit = (unitId) => setSession((s) => ({ ...s, unitId }))
  const reset = () => setDb(createSeed())

  const value = { db, mutate, user, login, logout, selectUnit, reset, toast, toasts }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)

/* ---- Helpers de leitura, usados por todos os painéis ---- */

export const unitLabel = (u) => (u ? `${u.rua.replace('Rua ', '')}, ${u.numero}` : '—')
export const unitById = (db, id) => db.units.find((u) => u.id === id)
export const personById = (db, id) => db.persons.find((p) => p.id === id)
export const areaById = (db, id) => db.areas.find((a) => a.id === id)

/* Notificação para um destino: id de pessoa ('p1'), 'admin' ou 'portaria' */
export const pushNotification = (draft, para, titulo, texto, link) =>
  draft.notifications.unshift({ id: uid('nt'), para, titulo, texto, em: new Date().toISOString(), lida: false, link })

/* Avisa todas as pessoas ativas de uma unidade */
export const notifyUnit = (draft, unitId, titulo, texto, link) =>
  draft.persons
    .filter((p) => p.unitId === unitId && p.status === 'ativo' && p.tipo === 'permanente')
    .concat(draft.ownership.filter((o) => o.unitId === unitId).map((o) => draft.persons.find((p) => p.id === o.personId)))
    .filter((p, i, arr) => p && arr.findIndex((x) => x.id === p.id) === i)
    .forEach((p) => pushNotification(draft, p.id, titulo, texto, link))

export const nextProtocol = (db) => {
  const n = Math.max(...db.requests.map((r) => Number(r.protocolo.split('-').pop()))) + 1
  return `SOL-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}

/* Votação: resultado por opção, respeitando o sigilo quando secreta */
export function tally(vote) {
  const total = vote.votos.length
  return vote.opcoes.map((o) => {
    const n = vote.votos.filter((v) => v.opcaoId === o.id).length
    return { ...o, n, pct: total ? Math.round((n / total) * 100) : 0 }
  })
}
