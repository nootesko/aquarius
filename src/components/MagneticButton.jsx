import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion, useTransform } from 'motion/react'
import { SPRING } from '../lib/motion.js'

/* Botão com atração magnética ao cursor (desktop) + brilho que segue o ponteiro.
   Em toque ou com prefers-reduced-motion, vira um botão comum com feedback de tap. */
export function MagneticButton({
  as = 'a',
  children,
  className = '',
  strength = 0.28,
  variant = 'gold',
  size = 'md',
  icon = null,
  ...rest
}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)

  const x = useSpring(mx, SPRING.soft)
  const y = useSpring(my, SPRING.soft)
  const glowX = useTransform(gx, (v) => `${v}%`)
  const glowY = useTransform(gy, (v) => `${v}%`)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const relX = e.clientX - r.left
    const relY = e.clientY - r.top
    gx.set((relX / r.width) * 100)
    gy.set((relY / r.height) * 100)
    if (reduce) return
    mx.set((relX - r.width / 2) * strength)
    my.set((relY - r.height / 2) * strength * 0.6)
  }

  const handleLeave = () => {
    mx.set(0)
    my.set(0)
    gx.set(50)
    gy.set(50)
  }

  const variants = {
    gold:
      'bg-gold-400 text-navy-900 shadow-[0_10px_30px_-8px_rgba(255,204,0,0.55)] hover:bg-gold-300',
    blue:
      'bg-brand-600 text-white shadow-[0_10px_30px_-8px_rgba(0,87,190,0.65)] hover:bg-brand-500',
    outline:
      'bg-white/5 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm hover:bg-white/10 hover:ring-white/45',
    navy: 'bg-navy-900 text-white shadow-[0_10px_28px_-10px_rgba(10,23,48,0.8)] hover:bg-navy-800',
    outlineDark:
      'bg-navy-900/5 text-navy-900 ring-1 ring-inset ring-navy-900/25 hover:bg-navy-900/10 hover:ring-navy-900/45',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-[0.8rem] tracking-[0.12em]',
    md: 'px-7 py-3.5 text-[0.86rem] tracking-[0.13em]',
    lg: 'px-9 py-4.5 text-[0.95rem] tracking-[0.13em]',
  }

  const Comp = as === 'button' ? motion.button : motion.a

  return (
    <Comp
      ref={ref}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      transition={SPRING.snappy}
      className={`group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold uppercase select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {/* brilho que segue o ponteiro */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at var(--gx) var(--gy), rgba(255,255,255,0.45), transparent 65%)`,
          '--gx': glowX,
          '--gy': glowY,
        }}
      />
      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        {icon}
      </span>
    </Comp>
  )
}
