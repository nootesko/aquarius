import { useEffect, useState } from 'react'
import { Download, LogOut, RefreshCw, TriangleAlert } from 'lucide-react'

/* Painel interno: login simples e a lista de quem pediu simulação em /ruas-novas.
   A senha é conferida no servidor (/api/painel); aqui só guardamos o login na aba aberta. */

const AUTH_KEY = 'painel-auth'

const readAuth = () => {
  try {
    return sessionStorage.getItem(AUTH_KEY)
  } catch {
    return null
  }
}

const writeAuth = (v) => {
  try {
    if (v) sessionStorage.setItem(AUTH_KEY, v)
    else sessionStorage.removeItem(AUTH_KEY)
  } catch {
    /* sem sessionStorage: o login vale só até recarregar */
  }
}

const fmt = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

/* Números são guardados só com dígitos; sem o 55 na frente, é do Brasil. */
const waNumber = (d) => (d.length <= 11 ? `55${d}` : d)

function phone(d) {
  const n = d.length > 11 && d.startsWith('55') ? d.slice(2) : d
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return d
}

function toCsv(itens) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [['Data', 'Nome', 'WhatsApp'], ...itens.map((i) => [fmt(i.em), i.nome, i.whatsapp ? phone(i.whatsapp) : (i.endereco ?? '')])]
  return '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')
}

async function fetchLeads(auth) {
  const r = await fetch('/api/painel', { headers: { Authorization: `Basic ${auth}` } })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(data.error || 'Não conseguimos carregar agora.'), { status: r.status })
  return data
}

const input =
  'w-full rounded-xl border border-paper-300 bg-white px-4 py-3 text-[0.95rem] text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20'

function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const auth = btoa(unescape(encodeURIComponent(`${user.trim()}:${pass}`)))
    try {
      onLogin(auth, await fetchLeads(auth))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-700 to-sky-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-[0_40px_90px_-40px_rgba(5,13,30,0.8)]">
        <img src="/assets/logo-480.webp" alt="Chapa Aquarius Sem Buracos" className="mx-auto w-40" />
        <h1 className="display mt-4 text-center text-[1.5rem] text-ink-900">Painel</h1>
        <label className="mt-6 block text-[0.8rem] font-semibold text-ink-700">
          Usuário
          <input className={`${input} mt-1.5`} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label className="mt-4 block text-[0.8rem] font-semibold text-ink-700">
          Senha
          <input
            className={`${input} mt-1.5`}
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[0.85rem] text-red-800">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-navy-900 px-6 py-3.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}

function Lista({ auth, data, onData, onLogout }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const itens = data.itens

  const refresh = async () => {
    setBusy(true)
    setError('')
    try {
      onData(await fetchLeads(auth))
    } catch (err) {
      if (err.status === 401) return onLogout()
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(itens)], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `cadastros-simulador-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const btn =
    'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.8rem] font-bold transition-colors disabled:opacity-60'

  return (
    <main className="min-h-screen bg-paper-100">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-480.webp" alt="" className="h-10 w-auto" />
            <span className="display text-[1.15rem]">Painel do simulador</span>
          </div>
          <button type="button" onClick={onLogout} className={`${btn} bg-white/10 hover:bg-white/20`}>
            <LogOut size={15} aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {!data.persistente && (
          <p role="alert" className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-[0.9rem] text-red-800 ring-1 ring-red-200 ring-inset">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            Os cadastros não estão sendo salvos de forma permanente (falta o Redis na Vercel). Eles somem quando o servidor reinicia.
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.75rem] font-bold tracking-[0.18em] text-ink-500 uppercase">Cadastros</p>
            <p className="display text-[2.4rem] leading-none text-ink-900">{itens.length}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={refresh} disabled={busy} className={`${btn} bg-white text-ink-700 ring-1 ring-paper-300 ring-inset hover:bg-paper-200`}>
              <RefreshCw size={15} className={busy ? 'animate-spin' : ''} aria-hidden="true" />
              Atualizar
            </button>
            <button type="button" onClick={download} disabled={!itens.length} className={`${btn} bg-gold-400 text-navy-900 hover:bg-gold-300`}>
              <Download size={15} aria-hidden="true" />
              Baixar planilha
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-[0.9rem] text-red-700">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-paper-300">
          <table className="w-full text-left text-[0.9rem]">
            <thead className="bg-paper-100 text-[0.72rem] tracking-[0.12em] text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-bold">Data</th>
                <th className="px-4 py-3 font-bold">Nome</th>
                <th className="px-4 py-3 font-bold">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i, n) => (
                <tr key={`${i.em}-${n}`} className="border-t border-paper-200">
                  <td className="px-4 py-3 whitespace-nowrap text-ink-500">{fmt(i.em)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{i.nome}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                    {i.whatsapp ? (
                      <a href={`https://wa.me/${waNumber(i.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-700 hover:underline">
                        {phone(i.whatsapp)}
                      </a>
                    ) : (
                      <span className="text-ink-500">{i.endereco ?? '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {!itens.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-ink-500">
                    Ninguém fez simulação ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export function Painel() {
  const [auth, setAuth] = useState(readAuth)
  const [data, setData] = useState(null)

  /* Login guardado na aba: carrega direto, ou volta para a tela de login. */
  useEffect(() => {
    if (!auth || data) return
    fetchLeads(auth)
      .then(setData)
      .catch(() => logout())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = (a, d) => {
    writeAuth(a)
    setAuth(a)
    setData(d)
  }
  const logout = () => {
    writeAuth(null)
    setAuth(null)
    setData(null)
  }

  if (!auth) return <Login onLogin={login} />
  if (!data) return <main className="grid min-h-screen place-items-center bg-paper-100 text-ink-500">Carregando…</main>
  return <Lista auth={auth} data={data} onData={setData} onLogout={logout} />
}
