import { useCallback, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { MoveHorizontal } from 'lucide-react'
import { solution, streets } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { RoadAfter, RoadBefore } from '../components/RoadScene.jsx'
import { EASE, SPRING } from '../lib/motion.js'

const clamp = (v, min = 4, max = 96) => Math.min(max, Math.max(min, v))

/* ------------------------------------------------------------------ *
 * Comparador arrastável: a mesma rua nos dois estados.
 * Sem foto cadastrada, cai na ilustração vetorial.
 * ------------------------------------------------------------------ */
function StreetLayer({ src, alt, Fallback }) {
  return src ? (
    <img src={src} alt={alt} decoding="async" draggable={false} className="h-full w-full object-cover" />
  ) : (
    <Fallback />
  )
}

function RoadCompare({ street }) {
  const wrapRef = useRef(null)
  const reduce = useReducedMotion()
  const [pct, setPct] = useState(52)
  const [dragging, setDragging] = useState(false)

  const raw = useMotionValue(52)
  const smooth = useSpring(raw, reduce ? { duration: 0 } : { stiffness: 320, damping: 34, mass: 0.6 })
  const inverse = useTransform(smooth, (v) => 100 - v)
  const clip = useMotionTemplate`inset(0 ${inverse}% 0 0)`
  const left = useMotionTemplate`${smooth}%`

  const update = useCallback(
    (clientX) => {
      const r = wrapRef.current?.getBoundingClientRect()
      if (!r) return
      const v = clamp(((clientX - r.left) / r.width) * 100)
      raw.set(v)
      setPct(Math.round(v))
    },
    [raw],
  )

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    update(e.clientX)
  }
  const onPointerMove = (e) => dragging && update(e.clientX)
  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setDragging(false)
  }

  const onKeyDown = (e) => {
    const stepSize = e.shiftKey ? 10 : 4
    let next = null
    if (e.key === 'ArrowLeft') next = clamp(pct - stepSize)
    if (e.key === 'ArrowRight') next = clamp(pct + stepSize)
    if (e.key === 'Home') next = 4
    if (e.key === 'End') next = 96
    if (next === null) return
    e.preventDefault()
    raw.set(next)
    setPct(Math.round(next))
  }

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative aspect-[16/10] w-full touch-pan-y overflow-hidden rounded-3xl border border-paper-300 shadow-[0_36px_70px_-40px_rgba(10,23,48,0.55)] select-none sm:aspect-[16/10] ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={street.name}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE.out }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <StreetLayer src={street.after} alt={`${street.name}, depois`} Fallback={RoadAfter} />
          </div>
          <motion.div style={{ clipPath: clip }} className="absolute inset-0">
            <StreetLayer src={street.before} alt={`${street.name}, antes`} Fallback={RoadBefore} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-navy-950/80 px-3.5 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-white/85 uppercase backdrop-blur-sm">
        {solution.before}
      </span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-gold-400 px-3.5 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-navy-900 uppercase">
        {solution.after}
      </span>

      <motion.div
        style={{ left }}
        className="pointer-events-none absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-[0_0_22px_rgba(255,255,255,0.6)]"
      >
        <motion.div
          role="slider"
          tabIndex={0}
          aria-label={`Comparar antes e depois: ${street.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${pct}% da imagem mostra o antes`}
          onKeyDown={onKeyDown}
          animate={reduce ? undefined : { scale: dragging ? 1.12 : 1 }}
          transition={SPRING.pop}
          className="pointer-events-auto absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-white text-navy-900 shadow-[0_10px_30px_rgba(0,0,0,0.4)] outline-none focus-visible:ring-4 focus-visible:ring-brand-500 active:cursor-grabbing"
        >
          <MoveHorizontal size={22} strokeWidth={2.6} aria-hidden="true" />
          {!reduce && !dragging && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full ring-2 ring-white/80"
              animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lista das ruas: fileira rolável no celular, coluna no desktop. */
function StreetPicker({ active, onPick }) {
  return (
    <nav aria-label="Escolha a rua">
      <p className="mb-3 hidden text-[0.64rem] font-bold tracking-[0.24em] text-ink-500 uppercase lg:block">
        {streets.length} ruas
      </p>
      <ol className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 sm:-mx-10 sm:scroll-px-10 sm:px-10 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {streets.map((st, i) => {
          const isActive = i === active
          return (
            <li key={st.name} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative isolate flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[0.86rem] font-semibold whitespace-nowrap transition-colors duration-200 lg:rounded-lg lg:px-3 lg:py-2 ${
                  isActive
                    ? 'text-navy-900'
                    : 'bg-paper-50 text-ink-600 ring-1 ring-paper-300 ring-inset hover:text-ink-900 lg:bg-transparent lg:ring-0'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="street-active"
                    className="absolute inset-0 -z-10 rounded-full bg-gold-400 lg:rounded-lg"
                    transition={SPRING.snappy}
                  />
                )}
                <span className={`font-mono text-[0.68rem] tabular-nums ${isActive ? 'text-navy-900/70' : 'text-ink-500'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {st.name.replace(/^Rua /, '')}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function Solution() {
  const [active, setActive] = useState(0)
  const street = streets[active]

  return (
    <section id="ruas" className="relative scroll-mt-20 overflow-hidden bg-paper-100 py-24 sm:py-32">
      <div aria-hidden="true" className="paver-grid-ink absolute inset-0 opacity-[0.32]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(43,143,232,0.14),transparent_60%)]"
      />

      <div className="shell relative">
        <SectionHeading
          overline={solution.overline}
          title={solution.title}
          lead={solution.lead}
          align="center"
          tone="light"
        />

        <Reveal className="mt-14 grid grid-cols-1 gap-6 [&>*]:min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10" delay={0.05}>
          <StreetPicker active={active} onPick={setActive} />
          <div>
            <RoadCompare street={street} />
            <p className="mt-4 flex items-baseline justify-between gap-4 text-ink-900">
              <span className="display text-[clamp(1.05rem,2.4vw,1.35rem)]">{street.name}</span>
              <span className="font-mono text-[0.72rem] font-bold text-gold-ink tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(streets.length).padStart(2, '0')}
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
