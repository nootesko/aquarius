import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SPRING } from '../lib/motion.js'

const TONES = {
  dark: {
    btn: 'border-white/20 bg-white/8 text-white hover:bg-white/16 disabled:opacity-25',
    rail: 'bg-white/12',
    bar: 'bg-gold-400',
    hint: 'text-white/40',
  },
  light: {
    btn: 'border-paper-300 bg-paper-50 text-ink-900 hover:bg-paper-200 disabled:opacity-30',
    rail: 'bg-paper-300',
    bar: 'bg-brand-600',
    hint: 'text-ink-500',
  },
}

/* Carrossel com rolagem nativa (funciona com dedo, trackpad e teclado) e
   botões para quem usa mouse. A barra embaixo mostra o quanto ainda falta. */
export function Carousel({ label, tone = 'dark', itemClass = '', gapClass = 'gap-5', children, className = '' }) {
  const trackRef = useRef(null)
  const reduce = useReducedMotion()
  const [state, setState] = useState({ start: true, end: false, progress: 0 })
  const t = TONES[tone] ?? TONES.dark

  const measure = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setState({
      start: el.scrollLeft <= 4,
      end: max <= 4 || el.scrollLeft >= max - 4,
      progress: max > 0 ? el.scrollLeft / max : 1,
    })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  const step = (dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('[data-carousel-item]')
    const amount = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.85
    el.scrollBy({ left: dir * amount, behavior: reduce ? 'auto' : 'smooth' })
  }

  const items = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`scroll-track -mx-5 flex snap-x px-5 pb-2 sm:-mx-10 sm:px-10 ${gapClass}`}
      >
        {items.map((child, i) => (
          <div key={i} data-carousel-item className={`shrink-0 snap-start ${itemClass}`}>
            {child}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => step(-1)}
            disabled={state.start}
            aria-label="Ver anteriores"
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={SPRING.pop}
            className={`grid h-11 w-11 place-items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed ${t.btn}`}
          >
            <ChevronLeft size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => step(1)}
            disabled={state.end}
            aria-label="Ver próximos"
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={SPRING.pop}
            className={`grid h-11 w-11 place-items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed ${t.btn}`}
          >
            <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
          </motion.button>
        </div>

        <div className={`relative h-[3px] flex-1 overflow-hidden rounded-full ${t.rail}`} aria-hidden="true">
          <motion.div
            className={`absolute inset-y-0 left-0 w-1/3 rounded-full ${t.bar}`}
            animate={{ x: `${state.progress * 200}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }}
          />
        </div>

        <span className={`hidden text-[0.72rem] tracking-wide sm:block ${t.hint}`}>Arraste para o lado</span>
      </div>
    </div>
  )
}
