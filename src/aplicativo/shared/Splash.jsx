import { motion } from 'motion/react'
import { EASE } from '../lib/motion.js'

/* Tela de carregamento: logo da chapa sobre o céu azul, com barra de progresso amarela. */
export function Splash() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE.out } }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-to-b from-sky-700 via-sky-800 to-sky-975"
      role="status"
      aria-label="Carregando"
    >
      <div className="paver-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col items-center px-6">
        <motion.img
          src="/assets/logo-800.webp"
          alt="Chapa Aquarius Sem Buracos"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, mass: 0.9 }}
          className="h-auto w-[min(72vw,320px)] object-contain drop-shadow-[0_24px_40px_rgba(5,13,30,0.45)]"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE.out }}
          className="mt-6 text-[0.7rem] font-bold tracking-[0.24em] text-gold-300 uppercase"
        >
          Residencial Aquarius
        </motion.p>
        <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.2, duration: 1.2, ease: EASE.inOut }}
            className="h-full rounded-full bg-gold-400"
          />
        </div>
      </div>
    </motion.div>
  )
}
