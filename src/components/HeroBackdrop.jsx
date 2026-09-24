import { motion, useReducedMotion } from 'motion/react'

/* Fundo vivo do hero: malha de calçamento em perspectiva, brilhos que respiram
   e "buracos" de luz. Tudo é decorativo — some para leitores de tela. */
export function HeroBackdrop({ gridY, glowY, opacity }) {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#153163_0%,#0a1730_45%,#050d1e_100%)]" />

      {/* malha de paver em perspectiva, deslizando com o scroll */}
      <motion.div
        style={{ y: gridY, opacity }}
        className="absolute inset-x-[-30%] bottom-[-18%] h-[70%] [transform:perspective(760px)_rotateX(62deg)] origin-bottom"
      >
        <div className="paver-grid h-full w-full opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
      </motion.div>

      {/* brilhos */}
      <motion.div
        style={{ y: glowY }}
        animate={reduce ? undefined : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-[8%] h-[26rem] w-[26rem] rounded-full bg-brand-500/25 blur-[110px]"
      />
      <motion.div
        style={{ y: glowY }}
        animate={reduce ? undefined : { opacity: [0.28, 0.5, 0.28], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        className="absolute top-[18%] right-[4%] h-[22rem] w-[22rem] rounded-full bg-gold-400/16 blur-[120px]"
      />

      {/* granulado sutil para tirar o aspecto "chapado" dos degradês */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* vinheta inferior para o texto respirar */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-navy-950 to-transparent" />
    </div>
  )
}
