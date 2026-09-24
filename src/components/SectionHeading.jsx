import { motion, useReducedMotion } from 'motion/react'
import { Reveal, RevealWords } from './Reveal.jsx'
import { EASE, VIEWPORT } from '../lib/motion.js'

/* tone: 'dark' (fundo colorido: céu ou gramado) | 'light' (fundo claro) | 'gold' (fundo amarelo) */
const TONES = {
  dark: { title: 'text-white', lead: 'text-white/85', overline: 'text-gold-300', rule: 'bg-gold-400' },
  light: { title: 'text-ink-900', lead: 'text-ink-600', overline: 'text-brand-700', rule: 'bg-gold-500' },
  gold: { title: 'text-navy-900', lead: 'text-navy-900/72', overline: 'text-navy-900/70', rule: 'bg-navy-900' },
}

export function SectionHeading({ overline, title, lead, align = 'left', tone = 'dark', className = '' }) {
  const reduce = useReducedMotion()
  const center = align === 'center'
  const t = TONES[tone] ?? TONES.dark

  return (
    <header className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {overline && (
        <Reveal className={`mb-5 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
          <motion.span
            aria-hidden="true"
            className={`block h-[2px] w-8 origin-left rounded-full ${t.rule}`}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE.out }}
          />
          <span className={`text-[0.68rem] font-bold tracking-[0.24em] uppercase ${t.overline}`}>{overline}</span>
        </Reveal>
      )}

      <RevealWords as="h2" text={title} className={`display block text-[clamp(1.9rem,5.4vw,3.6rem)] ${t.title}`} />

      {lead && (
        <Reveal delay={0.12}>
          <p className={`mt-6 text-[1.02rem] leading-relaxed sm:text-[1.1rem] ${t.lead}`}>{lead}</p>
        </Reveal>
      )}
    </header>
  )
}
