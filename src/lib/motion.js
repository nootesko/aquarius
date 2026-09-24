/* Sistema de movimento compartilhado — durações, curvas e variantes.
   Tudo aqui é usado pelas seções para que o site tenha uma assinatura de
   movimento consistente em vez de animações soltas. */

export const EASE = {
  out: [0.16, 1, 0.3, 1],        // expo-out: entradas
  inOut: [0.65, 0, 0.35, 1],     // trocas de estado
  back: [0.34, 1.56, 0.64, 1],   // acentos com overshoot
}

export const SPRING = {
  soft: { type: 'spring', stiffness: 140, damping: 20, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 },
  pop: { type: 'spring', stiffness: 520, damping: 18, mass: 0.6 },
  drift: { type: 'spring', stiffness: 60, damping: 18, mass: 1.2 },
}

export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -12% 0px' }
export const VIEWPORT_SOFT = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' }

/* Container que escalona os filhos */
export const stagger = (delayChildren = 0, staggerChildren = 0.07) => ({
  hidden: {},
  show: {
    transition: { delayChildren, staggerChildren },
  },
})

/* Entrada padrão: sobe 24px + fade + leve blur */
export const riseIn = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EASE.out },
  },
}

export const riseInFast = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.out } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE.out } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE.out } },
}

export const fromLeft = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE.out } },
}

export const fromRight = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE.out } },
}

/* Palavra a palavra — usado nos títulos display */
export const wordUp = {
  hidden: { opacity: 0, y: '110%', rotate: 3 },
  show: { opacity: 1, y: '0%', rotate: 0, transition: { duration: 0.75, ease: EASE.out } },
}
