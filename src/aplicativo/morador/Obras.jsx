import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, ChevronDown, FileText, HardHat, Info, TrendingDown } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { href } from '../lib/router.js'
import { EASE } from '../lib/motion.js'
import { BackLink, Badge, Card, Empty, PageHeader, cx } from '../ui/kit.jsx'

/* Andamento de obras: lista das obras e detalhe no formato da página /calcamento do site da chapa. */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const STEP_STATUS = {
  concluida: { label: 'Concluída', pill: 'bg-brand-50 text-brand-700 ring-brand-100' },
  andamento: { label: 'Em andamento', pill: 'bg-gold-300/40 text-gold-ink ring-gold-400/60' },
  aguardando: { label: 'Aguardando', pill: 'bg-paper-100 text-ink-600 ring-paper-300' },
}

const QUOTE_STATUS = {
  escolhido: { label: 'Escolhido', badge: 'bg-gold-400 text-navy-900' },
  analise: { label: 'Em análise', badge: 'bg-brand-600/10 text-brand-700' },
  descartado: { label: 'Não escolhido', badge: 'bg-paper-200 text-ink-500' },
}

export const obraProgress = (o) => {
  const done = o.etapas.filter((e) => e.status === 'concluida').length
  const current = o.etapas.find((e) => e.status === 'andamento') ?? o.etapas.find((e) => e.status === 'aguardando')
  return { done, total: o.etapas.length, pct: Math.round((done / o.etapas.length) * 100), current }
}

export function Obras({ parts }) {
  if (parts[0]) return <ObraDetail id={parts[0]} />
  return <ObrasList />
}

/* ------------------------------------------------------------------ */
/* Lista                                                               */
/* ------------------------------------------------------------------ */

function ObrasList() {
  const { db } = useStore()

  return (
    <>
      <PageHeader overline="Transparência" title="Andamento de obras" lead="Cada obra do residencial, etapa por etapa, com três orçamentos abertos para consulta." />

      <div className="grid gap-4 md:grid-cols-2">
        {db.obras.map((o, i) => {
          const p = obraProgress(o)
          return (
            <motion.div key={o.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: EASE.out }}>
              <a href={href(`morador/obras/${o.id}`)} className="group relative block h-full overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-950 p-6 text-white transition-transform hover:-translate-y-0.5">
                <div className="paver-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.66rem] font-bold tracking-[0.2em] text-gold-300 uppercase">{o.area}</span>
                    {o.prioridade && <span className="rounded-full bg-gold-400 px-2.5 py-0.5 text-[0.62rem] font-bold tracking-[0.12em] text-navy-900 uppercase">Prioridade nº 1</span>}
                  </div>
                  <h2 className="display mt-3 text-[clamp(1.4rem,3vw,1.8rem)] leading-[1.1]">{o.titulo}</h2>
                  <p className="mt-2 text-[0.88rem] text-white/80">{o.resumo}</p>

                  <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between gap-3 text-[0.8rem]">
                      <span className="text-white/75">
                        Etapa atual: <b className="text-white">{p.current?.title ?? 'Obra concluída'}</b>
                      </span>
                      <span className="display text-[1.4rem] text-gold-400">{p.pct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(p.pct, 2)}%` }} transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: EASE.out }} className="h-full rounded-full bg-gold-400" />
                    </div>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-[0.74rem] font-bold tracking-[0.12em] text-gold-300 uppercase">
                      Ver etapas e orçamentos <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </div>
              </a>
            </motion.div>
          )
        })}
      </div>

    </>
  )
}

/* ------------------------------------------------------------------ */
/* Detalhe (mesma estrutura da /calcamento)                            */
/* ------------------------------------------------------------------ */

function Summary({ obra }) {
  const p = obraProgress(obra)
  const quotes = obra.etapas.reduce((n, e) => n + e.orcamentos.length, 0)
  const label = 'text-[0.62rem] font-bold tracking-[0.16em] text-gold-300 uppercase sm:text-[0.66rem]'
  /* celular: um bloco por linha (rótulo em cima, valor embaixo); telas maiores: três colunas */
  const cell = 'bg-sky-900/60 px-4 py-3 sm:p-4'
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/15 sm:grid-cols-3">
      <div className={cell}>
        <p className={label}>Concluídas</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da obra">
            <div className="h-full rounded-full bg-gold-400" style={{ width: `${Math.max(p.pct, 2)}%` }} />
          </div>
          <p className="display shrink-0 text-[1.2rem] text-white sm:text-[1.4rem]">
            {p.done}
            <span className="font-sans text-[0.78rem] font-semibold normal-case text-white/60"> de {p.total}</span>
          </p>
        </div>
      </div>
      <div className={cell}>
        <p className={label}>Etapa atual</p>
        <p className="mt-1.5 text-[0.9rem] leading-snug font-semibold text-white sm:text-[0.95rem]">{p.current?.title ?? 'Obra concluída'}</p>
      </div>
      <div className={cell}>
        <p className={label}>Orçamentos</p>
        <p className="mt-1 text-[0.9rem] text-white">
          <span className="display text-[1.2rem] sm:text-[1.4rem]">{quotes}</span>
          <span className="ml-1.5 text-[0.78rem] text-white/65">3 por etapa, abertos para consulta</span>
        </p>
      </div>
    </div>
  )
}

function Quotes({ etapa }) {
  const { toast } = useStore()
  if (etapa.orcamentos.length === 0)
    return (
      <div className="border-t border-paper-200 bg-paper-100/70 px-4 py-5 text-[0.88rem] text-ink-600 sm:px-6">
        Esta etapa não tem orçamento: é uma decisão dos proprietários.{' '}
        <a href={href('morador/votacoes')} className="font-semibold text-brand-700 underline">
          Ver votações
        </a>
      </div>
    )
  const values = etapa.orcamentos.map((o) => o.valor)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return (
    <div className="border-t border-paper-200 bg-paper-100/70 px-3 pt-3 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
      <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {etapa.orcamentos.map((o) => {
          const st = QUOTE_STATUS[o.status] ?? QUOTE_STATUS.analise
          const chosen = o.status === 'escolhido'
          return (
            <li key={o.id} className={cx('relative flex flex-col rounded-xl bg-white p-3.5 ring-1 ring-inset sm:p-4', chosen ? 'ring-2 ring-gold-400' : 'ring-paper-300', o.status === 'descartado' && 'opacity-75')}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.62rem] font-bold tracking-[0.14em] text-ink-500 uppercase">Orçamento {o.id}</p>
                <span className={cx('rounded-full px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.08em] uppercase', st.badge)}>
                  {chosen && <Check size={11} strokeWidth={3.4} className="-mt-0.5 mr-1 inline" aria-hidden="true" />}
                  {st.label}
                </span>
              </div>
              <p className="mt-2 text-[0.85rem] font-semibold text-ink-900">{o.fornecedor}</p>
              <p className="display mt-0.5 text-[1.25rem] text-navy-900 tabular-nums">{brl.format(o.valor)}</p>
              <p className="mt-0.5 text-[0.76rem] text-ink-600">Prazo: {o.prazo}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {o.valor === min && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-bold text-brand-700 ring-1 ring-brand-100 ring-inset">
                    <TrendingDown size={12} strokeWidth={2.8} aria-hidden="true" />
                    Menor valor
                  </span>
                )}
                <button type="button" onClick={() => toast(`Orçamento de ${o.fornecedor} (demonstração)`)} className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-brand-700 underline-offset-2 hover:underline">
                  <FileText size={14} strokeWidth={2.4} aria-hidden="true" />
                  Ver orçamento
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[0.76rem] text-ink-600">
        Diferença entre o maior e o menor orçamento: <strong className="font-semibold text-ink-900">{brl.format(max - min)}</strong>
      </p>
    </div>
  )
}

function Step({ etapa, number, open, onToggle }) {
  const reduce = useReducedMotion()
  const st = STEP_STATUS[etapa.status]
  const panelId = `orcamentos-${etapa.id}`
  return (
    <li className="overflow-hidden rounded-2xl bg-white ring-1 ring-paper-300 ring-inset">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="flex w-full items-start gap-3 px-3.5 py-3.5 text-left sm:items-center sm:gap-4 sm:px-5 sm:py-4">
        <span className={cx('relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.8rem] font-bold sm:h-9 sm:w-9', etapa.status === 'concluida' ? 'bg-brand-600 text-white' : etapa.status === 'andamento' ? 'bg-gold-400 text-navy-900' : 'bg-paper-200 text-ink-600')}>
          {etapa.status === 'concluida' ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : number}
          {etapa.status === 'andamento' && !reduce && (
            <motion.span aria-hidden="true" className="absolute inset-0 rounded-full ring-2 ring-gold-400" animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[0.92rem] leading-snug font-bold text-ink-900 sm:text-[1rem]">{etapa.title}</span>
            <span className={cx('rounded-full px-2 py-0.5 text-[0.58rem] font-bold tracking-[0.06em] uppercase ring-1 ring-inset', st.pill)}>{st.label}</span>
          </span>
          <span className="mt-1 block text-[0.8rem] leading-snug text-ink-600 sm:text-[0.85rem]">{etapa.text}</span>
        </span>
        <span className="hidden shrink-0 text-[0.75rem] font-semibold text-brand-700 md:inline">{open ? 'Fechar' : etapa.orcamentos.length ? `${etapa.orcamentos.length} orçamentos` : 'Detalhes'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE.out }} className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper-100 text-ink-700 sm:mt-0">
          <ChevronDown size={16} strokeWidth={2.6} aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
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

const PRIO = { Alta: 'gold', Média: 'blue', Baixa: 'gray' }

function Ruas({ ruas, etapas }) {
  return (
    <section className="mt-8">
      <header className="mb-3">
        <p className="text-[0.62rem] font-bold tracking-[0.22em] text-brand-700 uppercase">Rua por rua</p>
        <h2 className="display mt-1 text-[clamp(1.25rem,3vw,1.6rem)] text-ink-900">Situação de cada rua</h2>
      </header>
      <div className="grid gap-2 md:grid-cols-2 md:gap-3">
        {ruas.map((r) => (
          <Card key={r.rua}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-ink-900">{r.rua}</p>
                <p className="text-[0.8rem] text-ink-500">
                  {r.problema} · {r.extensao} m
                </p>
              </div>
              <Badge tone={PRIO[r.prioridade]}>Prioridade {r.prioridade.toLowerCase()}</Badge>
            </div>
            <div className="mt-4 flex gap-1">
              {etapas.map((e, j) => (
                <span key={e} title={e} className={cx('h-2 flex-1 rounded-full', j < r.etapa ? 'bg-brand-500' : j === r.etapa ? 'bg-gold-400' : 'bg-paper-200')} />
              ))}
            </div>
            <p className="mt-2 text-[0.78rem] font-semibold text-ink-700">
              Etapa atual: <span className="text-brand-700">{etapas[r.etapa]}</span>
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ObraDetail({ id }) {
  const { db } = useStore()
  const obra = db.obras.find((o) => o.id === id)
  const [open, setOpen] = useState(null)
  if (!obra) return <Empty icon={HardHat} title="Obra não encontrada" />
  let n = 0

  return (
    <>
      <BackLink to="morador/obras" />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE.out }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-950 p-5 sm:p-7"
      >
        <div aria-hidden="true" className="paver-grid-light absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="max-w-2xl">
            <p className="text-[0.64rem] font-bold tracking-[0.22em] text-gold-300 uppercase">{obra.area}</p>
            <h1 className="display mt-2 text-[clamp(1.5rem,4vw,2.3rem)] leading-[1.05] text-white">
              {obra.titulo}
              <span className="text-gold-400">.</span>
            </h1>
            <p className="mt-2 text-[0.88rem] text-white/80 sm:text-[0.95rem]">{obra.resumo}</p>
          </div>
          <div className="mt-5">
            <Summary obra={obra} />
          </div>
        </div>
      </motion.section>

      <p role="note" className="mt-4 flex items-start gap-2.5 rounded-xl bg-gold-300/30 px-3.5 py-2.5 text-[0.8rem] text-ink-900 ring-1 ring-gold-400/60 ring-inset">
        <Info size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-gold-ink" aria-hidden="true" />
        <span>
          <strong className="font-bold">Dados de exemplo.</strong> Toque numa etapa para ver os orçamentos.
        </span>
      </p>

      <div className="mt-7 space-y-8">
        {obra.fases.map((fase, fi) => {
          const list = obra.etapas.filter((e) => e.fase === fase.id)
          return (
            <section key={fase.id} aria-labelledby={`fase-${fase.id}`}>
              <header className="mb-3">
                <p className="text-[0.62rem] font-bold tracking-[0.22em] text-brand-700 uppercase">Fase {fi + 1}</p>
                <h2 id={`fase-${fase.id}`} className="display mt-1 text-[clamp(1.25rem,3vw,1.6rem)] text-ink-900">
                  {fase.title}
                </h2>
                <p className="mt-1 text-[0.82rem] text-ink-600">{fase.text}</p>
              </header>
              <ol className="space-y-2">
                {list.map((etapa) => {
                  n += 1
                  return <Step key={etapa.id} etapa={etapa} number={n} open={open === etapa.id} onToggle={() => setOpen(open === etapa.id ? null : etapa.id)} />
                })}
              </ol>
            </section>
          )
        })}
      </div>

      {obra.id === 'calcamento' && <Ruas ruas={db.works.ruas} etapas={db.works.etapas} />}
    </>
  )
}
