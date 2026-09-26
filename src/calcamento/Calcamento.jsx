import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronDown, FileText, Info, TrendingDown } from 'lucide-react'
import { etapas, exemplo, fases } from './etapas.js'
import { Commitment } from '../sections/Commitment.jsx'
import { SubpageFooter, SubpageHeader } from '../components/Subpage.jsx'
import { EASE } from '../lib/motion.js'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const STEP_STATUS = {
  concluida: { label: 'Concluída', pill: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  andamento: { label: 'Em andamento', pill: 'bg-gold-300/40 text-gold-ink ring-gold-400/60' },
  aguardando: { label: 'Aguardando', pill: 'bg-paper-100 text-ink-600 ring-paper-300' },
}

const QUOTE_STATUS = {
  escolhido: { label: 'Escolhido', badge: 'bg-gold-400 text-navy-900' },
  analise: { label: 'Em análise', badge: 'bg-brand-600/10 text-brand-700' },
  descartado: { label: 'Não escolhido', badge: 'bg-paper-200 text-ink-500' },
}

/* ------------------------------------------------------------------ */
/* Resumo: quantas etapas já foram, em que fase está                   */
/* ------------------------------------------------------------------ */
function Summary() {
  const done = etapas.filter((e) => e.status === 'concluida').length
  const current = etapas.find((e) => e.status === 'andamento') ?? etapas.find((e) => e.status === 'aguardando')
  const quotes = etapas.reduce((n, e) => n + e.orcamentos.length, 0)
  const pct = Math.round((done / etapas.length) * 100)

  return (
    <div className="grid gap-px overflow-hidden rounded-3xl bg-white/15 ring-1 ring-white/15 sm:grid-cols-3">
      <div className="bg-sky-900/60 p-5 sm:p-6">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-300 uppercase">Etapas concluídas</p>
        <p className="display mt-2 text-[2rem] text-white">
          {done} <span className="font-sans text-[1.1rem] font-semibold normal-case text-white/60">de {etapas.length}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da obra">
          <div className="h-full rounded-full bg-gold-400" style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>
      <div className="bg-sky-900/60 p-5 sm:p-6">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-300 uppercase">Etapa atual</p>
        <p className="mt-2 text-[1.15rem] leading-snug font-semibold text-white">{current?.title ?? 'Obra concluída'}</p>
        <p className="mt-1 text-[0.85rem] text-white/65">{fases.find((f) => f.id === current?.fase)?.title}</p>
      </div>
      <div className="bg-sky-900/60 p-5 sm:p-6">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-300 uppercase">Orçamentos</p>
        <p className="display mt-2 text-[2rem] text-white">{quotes}</p>
        <p className="mt-1 text-[0.85rem] text-white/65">3 por etapa, todos abertos para consulta</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Orçamentos de uma etapa                                             */
/* ------------------------------------------------------------------ */
function Quotes({ etapa }) {
  const values = etapa.orcamentos.map((o) => o.valor)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return (
    <div className="border-t border-paper-200 bg-paper-100/70 px-4 pt-5 pb-6 sm:px-6">
      <ul className="grid gap-3 sm:grid-cols-3">
        {etapa.orcamentos.map((o) => {
          const st = QUOTE_STATUS[o.status] ?? QUOTE_STATUS.analise
          const chosen = o.status === 'escolhido'
          return (
            <li
              key={o.id}
              className={`relative flex flex-col rounded-2xl bg-white p-4 ring-1 ring-inset sm:p-5 ${
                chosen ? 'ring-2 ring-gold-400' : 'ring-paper-300'
              } ${o.status === 'descartado' ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.72rem] font-bold tracking-[0.14em] text-ink-500 uppercase">Orçamento {o.id}</p>
                <span className={`rounded-full px-2.5 py-1 text-[0.66rem] font-bold tracking-[0.08em] uppercase ${st.badge}`}>
                  {chosen && <Check size={11} strokeWidth={3.4} className="-mt-0.5 mr-1 inline" aria-hidden="true" />}
                  {st.label}
                </span>
              </div>
              <p className="mt-3 text-[0.95rem] font-semibold text-ink-900">{o.fornecedor}</p>
              <p className="display mt-1 text-[1.6rem] text-navy-900 tabular-nums">{brl.format(o.valor)}</p>
              <p className="mt-1 text-[0.82rem] text-ink-600">Prazo: {o.prazo}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                {o.valor === min && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-800 ring-1 ring-emerald-200 ring-inset">
                    <TrendingDown size={12} strokeWidth={2.8} aria-hidden="true" />
                    Menor valor
                  </span>
                )}
                {o.arquivo ? (
                  <a
                    href={o.arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    <FileText size={14} strokeWidth={2.4} aria-hidden="true" />
                    Ver orçamento
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[0.78rem] text-ink-500">
                    <FileText size={14} strokeWidth={2.2} aria-hidden="true" />
                    PDF em breve
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-[0.82rem] text-ink-600">
        Diferença entre o maior e o menor orçamento: <strong className="font-semibold text-ink-900">{brl.format(max - min)}</strong>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Uma etapa: linha clicável que abre os orçamentos                    */
/* ------------------------------------------------------------------ */
function Step({ etapa, number, open, onToggle }) {
  const reduce = useReducedMotion()
  const st = STEP_STATUS[etapa.status]
  const panelId = `orcamentos-${etapa.id}`

  return (
    <li id={etapa.id} className="scroll-mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-paper-300 ring-inset">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 px-4 py-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-inset sm:items-center sm:px-6 sm:py-5"
      >
        <span
          className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[0.95rem] font-bold ${
            etapa.status === 'concluida'
              ? 'bg-emerald-600 text-white'
              : etapa.status === 'andamento'
                ? 'bg-gold-400 text-navy-900'
                : 'bg-paper-200 text-ink-600'
          }`}
        >
          {etapa.status === 'concluida' ? <Check size={19} strokeWidth={3} aria-hidden="true" /> : number}
          {etapa.status === 'andamento' && !reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full ring-2 ring-gold-400"
              animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[1.05rem] font-bold text-ink-900 sm:text-[1.15rem]">{etapa.title}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] uppercase ring-1 ring-inset ${st.pill}`}>
              {st.label}
            </span>
          </span>
          <span className="mt-1 block text-[0.9rem] leading-relaxed text-ink-600">{etapa.text}</span>
        </span>

        <span className="hidden shrink-0 items-center gap-2 text-[0.8rem] font-semibold text-brand-700 sm:inline-flex">
          {open ? 'Fechar' : '3 orçamentos'}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE.out }}
          className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper-100 text-ink-700 sm:mt-0"
        >
          <ChevronDown size={18} strokeWidth={2.6} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE.out }}
          >
            <Quotes etapa={etapa} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export function Calcamento() {
  /* Abre direto a etapa do link (#topografia, #drenagem...). */
  const [open, setOpen] = useState(() => {
    const id = window.location.hash.slice(1)
    return etapas.some((e) => e.id === id) ? id : null
  })

  useEffect(() => {
    if (open) document.getElementById(open)?.scrollIntoView({ block: 'start' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => {
    const next = open === id ? null : id
    setOpen(next)
    history.replaceState(null, '', next ? `#${next}` : window.location.pathname)
  }

  let n = 0

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-700 via-sky-800 to-sky-950">
        <div aria-hidden="true" className="paver-grid-light absolute inset-0 opacity-60" />
        <SubpageHeader />

        <div className="shell relative pt-6 pb-14 sm:pt-10 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-gold-300 uppercase">Transparência</p>
            <h1 className="display mt-4 text-[clamp(2.1rem,6.4vw,4rem)] text-white">
              Acompanhe o calçamento<span className="text-gold-400">.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-white/85 sm:text-[1.1rem]">
              Cada etapa da obra do bloquete sextavado, do projeto ao último bloquete, com três orçamentos para cada uma. Toque numa etapa para ver os orçamentos.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <Summary />
          </div>
        </div>
      </div>

      <main id="conteudo" className="bg-paper-100 pt-10 pb-20 sm:pt-14 sm:pb-28">
        <div className="shell mx-auto max-w-5xl">
          {exemplo && (
            <p role="note" className="mb-10 flex items-start gap-3 rounded-2xl bg-gold-300/30 px-4 py-3.5 text-[0.9rem] leading-relaxed text-ink-900 ring-1 ring-gold-400/60 ring-inset">
              <Info size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-gold-ink" aria-hidden="true" />
              <span>
                <strong className="font-bold">Página de exemplo.</strong> Etapas, fornecedores, valores e prazos são fictícios e mostram como a obra vai ser
                acompanhada. Os orçamentos reais entram aqui assim que forem recebidos.
              </span>
            </p>
          )}

          <div className="space-y-12 sm:space-y-14">
            {fases.map((fase, fi) => {
              const list = etapas.filter((e) => e.fase === fase.id)
              return (
                <section key={fase.id} aria-labelledby={`fase-${fase.id}`}>
                  <header className="mb-5">
                    <p className="text-[0.68rem] font-bold tracking-[0.24em] text-brand-700 uppercase">Fase {fi + 1}</p>
                    <h2 id={`fase-${fase.id}`} className="display mt-2 text-[clamp(1.6rem,4vw,2.3rem)] text-ink-900">
                      {fase.title}
                    </h2>
                    <p className="mt-1.5 text-[0.95rem] text-ink-600">{fase.text}</p>
                  </header>
                  <ol className="space-y-3">
                    {list.map((etapa) => {
                      n += 1
                      return <Step key={etapa.id} etapa={etapa} number={n} open={open === etapa.id} onToggle={() => toggle(etapa.id)} />
                    })}
                  </ol>
                </section>
              )
            })}
          </div>
        </div>
      </main>

      <Commitment />
      <SubpageFooter />
    </>
  )
}
