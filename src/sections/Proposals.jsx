import { useEffect, useId, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import { ChevronUp, List, Plus } from 'lucide-react'
import { proposals } from '../content.js'
import { Reveal, RevealGroup } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { EASE, SPRING, riseInFast } from '../lib/motion.js'

const IDS = proposals.map((p) => `proposta-${p.id}`)

/* Item da proposta: o título abre a explicação em sanfona. */
function ItemAccordion({ item, featured }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const panelId = useId()

  return (
    <motion.li variants={riseInFast} className={`border-t ${featured ? 'border-navy-900/20' : 'border-paper-300'}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span
          className={`text-[1.02rem] font-semibold transition-colors ${
            featured ? 'text-navy-900' : 'text-ink-900 group-hover:text-brand-700'
          }`}
        >
          {item.title}
        </span>
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-300 ${
            open
              ? featured
                ? 'rotate-45 bg-navy-900 text-gold-400'
                : 'rotate-45 bg-gold-400 text-navy-900'
              : featured
                ? 'bg-navy-900/10 text-navy-900 group-hover:bg-navy-900/20'
                : 'bg-paper-200 text-ink-600 group-hover:bg-paper-300'
          }`}
        >
          <Plus size={15} strokeWidth={2.6} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.out }}
            className="overflow-hidden"
          >
            <p className={`pr-11 pb-5 text-[0.95rem] leading-relaxed ${featured ? 'text-navy-900/80' : 'text-ink-600'}`}>
              {item.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

/* O tema prioritário (com `badge`) ganha uma caixa amarela em volta. */
function ProposalBlock({ p, index }) {
  const featured = Boolean(p.badge)

  return (
    <article
      id={`proposta-${p.id}`}
      className={`scroll-mt-28 border-t border-paper-300 py-12 first:border-t-0 first:pt-0 sm:py-14 ${
        featured ? '[&+article]:border-t-0 [&+article]:pt-2' : ''
      }`}
    >
      <div
        className={
          featured
            ? 'rounded-[2rem] bg-gold-400 p-6 sm:p-10'
            : ''
        }
      >
        <Reveal className="flex flex-wrap items-center gap-3">
          <span
            className={`font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase tabular-nums ${
              featured ? 'text-navy-900/70' : 'text-gold-ink'
            }`}
          >
            Tema {String(index + 1).padStart(2, '0')}
          </span>
          {p.badge && (
            <span className="rounded-full bg-navy-900 px-3 py-1 text-[0.62rem] font-bold tracking-[0.16em] text-gold-400 uppercase">
              {p.badge}
            </span>
          )}
        </Reveal>

        <Reveal delay={0.05}>
          <h3
            className={`display mt-5 max-w-[20ch] text-[clamp(1.65rem,4.2vw,2.6rem)] ${
              featured ? 'text-navy-900' : 'text-ink-900'
            }`}
          >
            {p.title}
          </h3>
        </Reveal>

        <RevealGroup as="ol" className="mt-8 grid items-start" staggerChildren={0.05}>
          {p.items.map((item) => (
            <ItemAccordion key={item.title} item={item} featured={featured} />
          ))}
        </RevealGroup>
      </div>
    </article>
  )
}

/* Mobile: botão fixo que só aparece dentro da seção e abre a lista de temas. */
function MobileIndex({ visible, active, onGo }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const idx = Math.max(0, IDS.indexOf(active))
  const current = proposals[idx]

  useEffect(() => {
    if (!visible) setOpen(false)
  }, [visible])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => {
    setOpen(false)
    onGo(id)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mobile-index"
          initial={reduce ? false : { y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
          transition={SPRING.snappy}
          className="fixed bottom-4 left-4 z-40 lg:hidden"
        >
          {open && (
            <button
              type="button"
              aria-label="Fechar índice"
              onClick={() => setOpen(false)}
              className="fixed inset-0 -z-10 cursor-default bg-navy-950/40 backdrop-blur-[2px]"
            />
          )}

          <AnimatePresence>
            {open && (
              <motion.nav
                id="indice-mobile"
                aria-label="Índice das propostas"
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: EASE.out }}
                className="absolute bottom-full left-0 mb-3 w-[min(19rem,calc(100vw-2rem))] origin-bottom-left overflow-hidden rounded-2xl border border-paper-300 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(10,23,48,0.55)]"
              >
                <p className="px-3 pt-2 pb-1.5 text-[0.62rem] font-bold tracking-[0.22em] text-ink-500 uppercase">Temas</p>
                <ul>
                  {proposals.map((p, i) => {
                    const id = `proposta-${p.id}`
                    const isActive = active === id
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => go(id)}
                          aria-current={isActive ? 'true' : undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.92rem] font-semibold transition-colors ${
                            isActive ? 'bg-paper-200 text-ink-900' : 'text-ink-600 active:bg-paper-100'
                          }`}
                        >
                          <span className="font-mono text-[0.7rem] font-bold text-gold-ink tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {p.tab}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="indice-mobile"
            className="flex h-14 max-w-[calc(100vw-6.5rem)] items-center gap-2.5 rounded-full bg-navy-900 pr-4 pl-4 text-white shadow-[0_14px_34px_-10px_rgba(10,23,48,0.75)] ring-1 ring-white/10"
          >
            <List size={18} strokeWidth={2.4} aria-hidden="true" className="shrink-0 text-gold-400" />
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="font-mono text-[0.6rem] font-bold tracking-[0.16em] text-gold-400 tabular-nums">
                TEMA {String(idx + 1).padStart(2, '0')}/{String(proposals.length).padStart(2, '0')}
              </span>
              <span className="truncate text-[0.86rem] font-semibold">{current?.tab}</span>
            </span>
            <ChevronUp
              size={16}
              strokeWidth={2.6}
              aria-hidden="true"
              className={`shrink-0 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Proposals() {
  const ref = useRef(null)
  const active = useActiveSection(IDS, '-30% 0px -55% 0px')
  const inSection = useInView(ref, { margin: '-40% 0px -45% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.6', 'end 0.85'] })
  const railScale = useSpring(scrollYProgress, { stiffness: 110, damping: 26, restDelta: 0.001 })

  const goTo = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' })
  }

  return (
    <section id="propostas" className="relative scroll-mt-20 overflow-clip bg-paper-50 py-24 sm:py-32">

      <div className="shell relative">
        <SectionHeading overline="O que vamos fazer" title="O Aquarius vai ser muito melhor" align="center" tone="light" />

        <div ref={ref} className="mt-16 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          {/* índice fixo (desktop) */}
          <nav aria-label="Índice das propostas" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-5 text-[0.64rem] font-bold tracking-[0.24em] text-ink-500 uppercase">Índice</p>

              <div className="relative flex gap-4">
                <div aria-hidden="true" className="relative w-[3px] shrink-0 rounded-full bg-paper-300">
                  <motion.div
                    style={{ scaleY: railScale }}
                    className="absolute inset-0 origin-top rounded-full bg-gold-400"
                  />
                </div>

                <ul className="flex-1 space-y-1">
                  {proposals.map((p) => {
                    const id = `proposta-${p.id}`
                    const isActive = active === id
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => goTo(id)}
                          className={`relative block w-full rounded-lg px-3 py-2 text-left text-[0.88rem] font-semibold transition-colors duration-200 ${
                            isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="rail-active"
                              className="absolute inset-0 -z-10 rounded-lg bg-paper-200"
                              transition={SPRING.snappy}
                            />
                          )}
                          {p.tab}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </nav>

          <div>
            {proposals.map((p, i) => (
              <ProposalBlock key={p.id} p={p} index={i} />
            ))}
          </div>
        </div>
      </div>

      <MobileIndex visible={inSection} active={active} onGo={goTo} />
    </section>
  )
}
