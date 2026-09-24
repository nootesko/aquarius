import { motion, useReducedMotion } from 'motion/react'

/* Fundo vivo do hero: céu azul de chácara, sol, malha de calçamento em perspectiva
   que desce até o azul escuro. Tudo é decorativo — some para leitores de tela. */
export function HeroBackdrop({ gridY, glowY, opacity }) {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#6cc0ff_0%,#2b8fe8_38%,#0b5fc6_78%)]" />

      {/* malha de paver em perspectiva, deslizando com o scroll */}
      <motion.div
        style={{ y: gridY, opacity }}
        className="absolute inset-x-[-30%] bottom-[-18%] h-[70%] [transform:perspective(760px)_rotateX(62deg)] origin-bottom"
      >
        <div className="paver-grid-light h-full w-full opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900 via-sky-900/30 to-transparent" />
      </motion.div>

      {/* brilhos */}
      <motion.div
        style={{ y: glowY }}
        animate={reduce ? undefined : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-[8%] h-[26rem] w-[26rem] rounded-full bg-white/25 blur-[110px]"
      />
      <motion.div
        style={{ y: glowY }}
        animate={reduce ? undefined : { opacity: [0.28, 0.5, 0.28], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        className="absolute top-[18%] right-[4%] h-[22rem] w-[22rem] rounded-full bg-gold-300/40 blur-[120px]"
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
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sky-900 to-transparent" />
    </div>
  )
}
