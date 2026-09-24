import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { WhatsAppIcon } from './WhatsAppIcon.jsx'
import { whatsappLink } from '../content.js'
import { useScrolled } from '../hooks/useScrolled.js'
import { SPRING } from '../lib/motion.js'

export function FloatingWhatsApp() {
  const show = useScrolled(700)
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 24 }}
          whileHover={reduce ? undefined : { scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={SPRING.pop}
          aria-label="Falar com a chapa no WhatsApp"
          className="group fixed right-4 bottom-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold-400 text-navy-900 shadow-[0_14px_34px_-10px_rgba(255,204,0,0.75)] sm:right-6 sm:bottom-6"
        >
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gold-400"
              animate={{ scale: [1, 1.75], opacity: [0.45, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <WhatsAppIcon size={24} className="relative" />
          <span className="pointer-events-none absolute right-[70px] hidden rounded-full bg-navy-950/90 px-3.5 py-2 text-[0.75rem] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
            Fale conosco
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
