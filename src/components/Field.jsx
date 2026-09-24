import { motion } from 'motion/react'
import { EASE } from '../lib/motion.js'

export function Field({ id, label, error, hint, children, optional = false }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 flex items-baseline gap-2 text-[0.8rem] font-semibold tracking-wide text-white/90">
        {label}
        {optional && <span className="text-[0.7rem] font-normal text-white/60">opcional</span>}
      </label>

      {children}

      {hint && !error && <p className="mt-1.5 text-[0.75rem] text-white/65">{hint}</p>}

      <motion.p
        initial={false}
        animate={error ? { opacity: 1, height: 'auto', marginTop: 6 } : { opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.25, ease: EASE.out }}
        className="overflow-hidden text-[0.78rem] font-medium text-gold-300"
        role={error ? 'alert' : undefined}
      >
        {error}
      </motion.p>
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-white/25 bg-sky-800/55 px-4 py-3.5 text-[0.98rem] text-white placeholder:text-white/55 outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-gold-300 focus:bg-sky-800 focus:shadow-[0_0_0_4px_rgba(255,221,82,0.22)]'
