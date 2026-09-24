import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowDown, Sparkles } from 'lucide-react'
import { hero } from '../content.js'
import { EASE, SPRING } from '../lib/motion.js'
import { HeroBackdrop } from '../components/HeroBackdrop.jsx'
import { MagneticButton } from '../components/MagneticButton.jsx'

const ROTATE_MS = 2600

export function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '26%'])
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.25])
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -110])
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.86])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  /* inclinação 3D do emblema seguindo o ponteiro (desktop) */
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), SPRING.soft)
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), SPRING.soft)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((v) => (v + 1) % hero.rotating.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [reduce])

  const onPointerMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  const scrollTo = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
  }

  const fullPromise = `${hero.rotatingPrefix} ${hero.rotating.join(' ')}`

  return (
    <section
      id="topo"
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-24 pb-36 sm:pt-28 sm:pb-56"
    >
      <HeroBackdrop gridY={gridY} glowY={glowY} opacity={bgOpacity} />

      <motion.div style={{ opacity: contentOpacity }} className="shell relative z-10 flex flex-col items-center">
        {/* ------- emblema ------- */}
        <motion.div
          style={{ y: logoY, scale: logoScale, perspective: 1000 }}
          className="relative mb-5 w-full max-w-[13rem] sm:max-w-[19rem] lg:max-w-[23rem]"
        >
          {/* halo pulsante atrás do emblema */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-[12%] rounded-full bg-brand-500/30 blur-3xl"
            animate={reduce ? undefined : { scale: [1, 1.14, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
            initial={reduce ? false : { opacity: 0, scale: 0.72, rotate: -9, y: 26 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 15, mass: 1.1, delay: 0.1 }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <picture>
                <source srcSet="/assets/logo-800.webp" type="image/webp" />
                <img
                  src="/assets/logo-800.png"
                  alt="Chapa Aquarius Sem Buracos"
                  width="800"
                  height="617"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full drop-shadow-[0_28px_60px_rgba(0,0,0,0.6)]"
                />
              </picture>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ------- kicker ------- */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE.out, delay: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.22em] text-white uppercase ring-1 ring-inset ring-white/25 backdrop-blur-sm sm:text-[0.72rem]"
        >
          <Sparkles size={13} strokeWidth={2.6} aria-hidden="true" className="text-gold-400" />
          {hero.kicker}
        </motion.p>

        {/* ------- promessa rotativa (H1) ------- */}
        <h1 className="text-center">
          <span className="sr-only">
            Aquarius Sem Buracos. {fullPromise}
          </span>
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE.out, delay: 0.6 }}
            className="display block text-[clamp(2rem,8vw,4.4rem)] text-white"
          >
            <span className="block">Sem buracos</span>
            <span className="relative mt-1 flex h-[1.06em] items-start justify-center overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={i}
                  initial={reduce ? false : { y: '105%', opacity: 0, filter: 'blur(8px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  exit={reduce ? { opacity: 0 } : { y: '-105%', opacity: 0, filter: 'blur(8px)' }}
                  transition={{ duration: 0.55, ease: EASE.out }}
                  className="inline-block bg-gradient-to-b from-gold-300 to-gold-500 bg-clip-text pr-[0.06em] text-transparent"
                >
                  {hero.rotating[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.span>
        </h1>

        {/* ------- CTAs ------- */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE.out, delay: 0.9 }}
          className="mt-9 flex w-full justify-center sm:w-auto"
        >
          <MagneticButton
            href="#propostas"
            onClick={(e) => scrollTo(e, 'propostas')}
            variant="gold"
            size="lg"
            className="w-full sm:w-auto"
            icon={<ArrowDown size={17} strokeWidth={2.8} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5" />}
          >
            {hero.primaryCta}
          </MagneticButton>

        </motion.div>
      </motion.div>

    </section>
  )
}
