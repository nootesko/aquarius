import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Download, Award, Briefcase, GraduationCap } from 'lucide-react'
import { closing, members, proposals, streets, whatsappLink } from '../content.js'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'
import { EASE } from '../lib/motion.js'

/* Apresentação em slides. Pensada para ser lida por todos:
   - celular: cada slide ocupa a tela, letra grande, botões grandes e deslize para os lados;
   - computador: formato 16:9, como um PowerPoint;
   - PDF: um slide por página (1280×720). ?pdf na URL mostra todos em sequência, para gerar o arquivo.
   Os itens das propostas aparecem sempre abertos, com a explicação completa. */

export const PDF_URL = '/apresentacao/aquarius-sem-buracos.pdf'
const CV_ICONS = { Formação: GraduationCap, 'Pós-graduação': Award, Experiência: Briefcase }

/* ------------------------------------------------------------------ */
/* Peças comuns                                                        */
/* ------------------------------------------------------------------ */
function Kicker({ children, tone = 'dark' }) {
  return (
    <p
      className={`text-[0.95rem] font-bold tracking-[0.16em] uppercase lg:text-[1.25rem] ${
        tone === 'light' ? 'text-gold-300' : 'text-brand-700'
      }`}
    >
      {children}
    </p>
  )
}

function Logo({ className = '' }) {
  return (
    <picture>
      <source srcSet="/assets/logo-800.webp" type="image/webp" />
      <img src="/assets/logo-800.png" alt="Chapa Aquarius Sem Buracos" width="800" height="617" className={className} />
    </picture>
  )
}

/* ------------------------------------------------------------------ */
/* Slides                                                              */
/* ------------------------------------------------------------------ */
function CoverSlide() {
  return (
    <div className="slide-bg-sky flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center text-white lg:gap-8">
      <Logo className="w-[min(78vw,20rem)] drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] lg:w-[24rem]" />
      <p className="rounded-full bg-white/15 px-5 py-2 text-[1rem] font-bold tracking-[0.12em] uppercase ring-1 ring-white/30 lg:px-7 lg:text-[1.5rem]">
        Fabi presidente · Latrofe vice
      </p>
      <h1 className="display text-[clamp(2.6rem,12vw,4.2rem)] leading-[0.95] lg:text-[5.2rem]">
        Nossas <span className="text-gold-300">propostas</span>
      </h1>
      <p className="max-w-[30rem] text-[1.3rem] leading-snug text-white/90 lg:text-[1.9rem]">
        para o Residencial Aquarius
      </p>
    </div>
  )
}

function MemberSlide({ m, index }) {
  return (
    <div className="flex flex-1 flex-col bg-sky-900 text-white lg:flex-row">
      <div className={`relative h-[42vh] shrink-0 lg:h-auto lg:w-[42%] ${index % 2 ? 'lg:order-2' : ''}`}>
        <picture>
          <source srcSet={`${m.photo}.webp`} type="image/webp" />
          <img
            src={`${m.photo}.jpg`}
            alt={`${m.name}, ${m.role.toLowerCase()} da chapa`}
            className="absolute inset-0 h-full w-full object-cover object-[50%_20%]"
          />
        </picture>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8 lg:gap-8 lg:px-16">
        <div>
          <Kicker tone="light">Quem compõe a chapa</Kicker>
          <span className="mt-4 inline-block rounded-full bg-gold-400 px-4 py-1.5 text-[1rem] font-bold tracking-[0.1em] text-navy-900 uppercase lg:text-[1.3rem]">
            {m.role}
          </span>
          <h2 className="display mt-3 text-[clamp(2.6rem,11vw,4.4rem)] leading-none lg:text-[5.5rem]">{m.name}</h2>
        </div>

        <dl className="space-y-5 lg:space-y-6">
          {m.cv.map((c) => {
            const Icon = CV_ICONS[c.label] ?? Briefcase
            return (
              <div key={c.label} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/12 text-gold-300">
                  <Icon size={24} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-[0.95rem] font-bold tracking-[0.12em] text-gold-300 uppercase lg:text-[1.15rem]">{c.label}</dt>
                  <dd className="mt-1 text-[1.2rem] leading-snug lg:text-[1.6rem]">{c.text}</dd>
                </div>
              </div>
            )
          })}
        </dl>
      </div>
    </div>
  )
}

function StreetsSlide() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 bg-sun-50 px-6 py-8 lg:px-16">
      <div>
        <Kicker>Prioridade</Kicker>
        <h2 className="display mt-2 text-[clamp(2rem,8vw,3.2rem)] leading-[0.95] text-ink-900 lg:text-[4rem]">
          As {streets.length} ruas do Aquarius
        </h2>
      </div>
      <ol className="grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-1">
        {streets.map((st) => (
          <li
            key={st.name}
            className="flex items-center gap-3 border-b border-gold-400/40 py-2.5 text-[1.2rem] font-semibold text-ink-900 lg:py-3 lg:text-[1.5rem]"
          >
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-gold-400" />
            {st.name}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ThemeSlide({ p, index }) {
  const featured = Boolean(p.badge)
  const dense = p.items.length > 6

  return (
    <div className={`flex flex-1 flex-col justify-center gap-6 px-6 py-8 lg:px-16 ${dense ? 'lg:gap-6' : 'lg:gap-8'} ${featured ? 'bg-gold-400' : 'bg-white'}`}>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-[0.95rem] font-bold tracking-[0.16em] uppercase lg:text-[1rem] ${
              featured ? 'text-navy-900/75 lg:text-[1.25rem]' : 'text-brand-700 lg:text-[1.25rem]'
            }`}
          >
            Tema {String(index + 1).padStart(2, '0')}
          </span>
          {p.badge && (
            <span className="rounded-full bg-navy-900 px-3.5 py-1 text-[0.9rem] font-bold tracking-[0.12em] text-gold-400 uppercase lg:px-4 lg:text-[1.15rem]">
              {p.badge}
            </span>
          )}
        </div>
        <h2
          className={`display mt-3 text-[clamp(2rem,8vw,3.2rem)] leading-[0.95] text-navy-900 ${dense ? 'lg:text-[3.2rem]' : 'lg:text-[3.8rem]'}`}
        >
          {p.title}
        </h2>
      </div>

      <ul className={`grid gap-x-10 gap-y-5 sm:grid-cols-2 ${dense ? 'lg:grid-cols-3 lg:gap-y-5' : 'lg:gap-y-9'}`}>
        {p.items.map((item) => (
          <li key={item.title} className={`border-l-4 pl-4 ${featured ? 'border-navy-900' : 'border-gold-400'}`}>
            <p className={`font-bold text-navy-900 ${dense ? 'text-[1.25rem] lg:text-[1.45rem]' : 'text-[1.3rem] lg:text-[1.85rem]'}`}>
              {item.title}
            </p>
            <p
              className={`mt-1 leading-snug ${featured ? 'text-navy-900/85' : 'text-ink-700'} ${
                dense ? 'text-[1.15rem] lg:text-[1.2rem]' : 'text-[1.15rem] lg:text-[1.5rem]'
              }`}
            >
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ClosingSlide() {
  return (
    <div className="slide-bg-sky flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center text-white lg:gap-7">
      <h2 className="display text-[clamp(2.2rem,9vw,4rem)] leading-[0.95] lg:text-[4.6rem]">Faça parte dessa mudança.</h2>
      <ul className="space-y-1">
        {closing.slogans.map((s) => (
          <li key={s} className="display text-[clamp(1.2rem,4.6vw,1.8rem)] text-white/90 lg:text-[2.2rem]">
            {s.replace(/\.$/, '')}
            <span className="text-gold-300">.</span>
          </li>
        ))}
      </ul>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-3 rounded-full bg-gold-400 px-7 py-4 text-[1.1rem] font-bold tracking-[0.08em] text-navy-900 uppercase lg:px-9 lg:py-5 lg:text-[1.4rem]"
      >
        <WhatsAppIcon size={24} />
        Fale com a chapa
      </a>
      <p className="text-[1.2rem] text-white/90 lg:text-[1.6rem]">{closing.cta}</p>
    </div>
  )
}

const SLIDES = [
  { id: 'capa', label: 'Capa', render: () => <CoverSlide /> },
  ...members.map((m, i) => ({ id: m.id, label: m.name, render: () => <MemberSlide m={m} index={i} /> })),
  { id: 'ruas', label: 'As ruas', render: () => <StreetsSlide /> },
  ...proposals.map((p, i) => ({ id: p.id, label: p.tab, render: () => <ThemeSlide p={p} index={i} /> })),
  { id: 'fim', label: 'Encerramento', render: () => <ClosingSlide /> },
]

/* ------------------------------------------------------------------ */
/* Modo PDF: todos os slides em sequência, 1280×720 cada               */
/* ------------------------------------------------------------------ */
function PrintDeck() {
  return (
    <div className="print-deck">
      {SLIDES.map((s) => (
        <section key={s.id} className="print-slide flex">
          {s.render()}
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Computador: o slide é montado em 1280×720 (igual ao PDF) e escalado  */
/* para caber na tela. No celular (abaixo de 1024px) não há escala.     */
/* ------------------------------------------------------------------ */
const STAGE_W = 1280
const STAGE_H = 720

function useStageScale(ref) {
  const [scale, setScale] = useState(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => {
      if (!mq.matches) return setScale(null)
      const cs = getComputedStyle(el)
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      setScale(Math.max(0.3, Math.min(w / STAGE_W, h / STAGE_H)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    mq.addEventListener('change', update)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [ref])
  return scale
}

/* ------------------------------------------------------------------ */
/* Apresentação navegável                                              */
/* ------------------------------------------------------------------ */
const readHash = () => {
  const n = Number.parseInt(window.location.hash.replace('#', ''), 10)
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), SLIDES.length - 1) : 0
}

export function Presentation() {
  const isPdf = new URLSearchParams(window.location.search).has('pdf')
  if (isPdf) return <PrintDeck />
  return <Deck />
}

function Deck() {
  const reduce = useReducedMotion()
  const [[index, dir], setState] = useState(() => [readHash(), 0])
  const touch = useRef(null)
  const frameRef = useRef(null)
  const scale = useStageScale(frameRef)

  const go = useCallback((next) => {
    setState(([cur]) => {
      const n = Math.min(Math.max(next, 0), SLIDES.length - 1)
      return n === cur ? [cur, 0] : [n, n > cur ? 1 : -1]
    })
  }, [])

  useEffect(() => {
    history.replaceState(null, '', `#${index + 1}`)
    window.scrollTo({ top: 0 })
  }, [index])

  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        go(index + 1)
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        go(index - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(SLIDES.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1))
  }

  const slide = SLIDES[index]
  const first = index === 0
  const last = index === SLIDES.length - 1

  return (
    <div className="flex min-h-[100svh] flex-col bg-sky-950 lg:h-[100svh]">
      {/* barra de cima */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-sky-950 px-4 py-2.5 text-white lg:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Voltar ao site">
          <Logo className="h-11 w-auto" />
          <span className="hidden text-[1rem] font-semibold sm:inline">Voltar ao site</span>
        </a>
        <a
          href={PDF_URL}
          download="Aquarius-Sem-Buracos-Propostas.pdf"
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-3 text-[1rem] font-bold text-navy-900 lg:px-6"
        >
          <Download size={20} strokeWidth={2.6} aria-hidden="true" />
          Baixar PDF
        </a>
      </header>

      {/* slide */}
      <main
        ref={frameRef}
        className="relative flex flex-1 lg:items-center lg:justify-center lg:overflow-hidden lg:p-6"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="apresentação"
      >
        <div className="flex w-full lg:w-auto" style={scale ? { width: STAGE_W * scale, height: STAGE_H * scale } : undefined}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.section
            key={slide.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.3, ease: EASE.out }}
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${SLIDES.length}: ${slide.label}`}
            style={scale ? { width: STAGE_W, height: STAGE_H, scale, transformOrigin: 'top left' } : undefined}
            className="flex w-full overflow-hidden lg:shrink-0 lg:rounded-2xl lg:shadow-2xl"
          >
            {slide.render()}
          </motion.section>
        </AnimatePresence>
        </div>
      </main>

      {/* navegação: botões grandes */}
      <nav
        aria-label="Navegar pelos slides"
        className="sticky bottom-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-sky-950 px-4 py-3 text-white lg:px-8"
      >
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={first}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white/12 px-4 text-[1.1rem] font-bold ring-1 ring-white/25 disabled:opacity-35 sm:justify-self-start sm:px-7"
        >
          <ChevronLeft size={26} strokeWidth={2.8} aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
          <span className="sr-only sm:hidden">Slide anterior</span>
        </button>

        <p className="text-center text-[1.15rem] font-bold tabular-nums" aria-live="polite">
          {index + 1} <span className="text-white/60">de {SLIDES.length}</span>
        </p>

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={last}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gold-400 px-4 text-[1.1rem] font-bold text-navy-900 disabled:opacity-35 sm:justify-self-end sm:px-7"
        >
          <span>Próximo</span>
          <ChevronRight size={26} strokeWidth={2.8} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
