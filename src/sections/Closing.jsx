import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'
import { closing, nav, whatsappLink } from '../content.js'
import { Reveal, RevealGroup } from '../components/Reveal.jsx'
import { MagneticButton } from '../components/MagneticButton.jsx'
import { EASE, riseIn } from '../lib/motion.js'

export function Closing() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const logoY = useTransform(scrollYProgress, [0, 1], [50, 0])
  const logoScale = useTransform(scrollYProgress, [0, 1], [0.88, 1])

  const goTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goTo = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
  }

  return (
    <footer ref={ref} className="relative overflow-hidden bg-leaf-800">
      <div aria-hidden="true" className="paver-grid-light absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_100%,rgba(54,178,93,0.45),transparent_65%)]"
      />

      <div className="shell relative py-24 sm:py-28">
        <motion.div
          style={reduce ? undefined : { y: logoY, scale: logoScale }}
          className="mx-auto max-w-[15rem] sm:max-w-[19rem]"
        >
          <picture>
            <source srcSet="/assets/logo-480.webp" type="image/webp" />
            <img
              src="/assets/logo-800.png"
              alt="Chapa Aquarius Sem Buracos"
              width="480"
              height="370"
              loading="lazy"
              decoding="async"
              className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
            />
          </picture>
        </motion.div>

        <RevealGroup
          className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-2 text-center"
          staggerChildren={0.1}
        >
          {closing.slogans.map((s) => (
            <motion.p
              key={s}
              variants={riseIn}
              className="display text-[clamp(1.15rem,4.4vw,2.4rem)] text-white/88"
            >
              {s.replace(/\.$/, '')}
              <span aria-hidden="true" className="text-gold-400">
                .
              </span>
            </motion.p>
          ))}
        </RevealGroup>

        <Reveal className="mt-12 flex flex-col items-center gap-5" delay={0.15}>
          <p className="max-w-xl text-center text-[1rem] leading-relaxed text-white/85 sm:text-[1.1rem]">
            {closing.cta}
          </p>

          <MagneticButton
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            variant="gold"
            size="lg"
            icon={<WhatsAppIcon size={18} />}
          >
            Fale conosco
          </MagneticButton>
        </Reveal>

        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => goTo(e, item.id)}
                    className="relative text-[0.85rem] text-white/75 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <motion.a
              href="#topo"
              onClick={goTop}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[0.75rem] font-bold tracking-[0.14em] text-white/70 uppercase transition-colors hover:border-gold-400/50 hover:text-white"
            >
              <ArrowUp size={15} strokeWidth={2.6} aria-hidden="true" />
              Voltar ao topo
            </motion.a>
          </div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE.out }}
            className="mt-8 text-center text-[0.76rem] leading-relaxed text-white/60"
          >
            Material de campanha da chapa Aquarius Sem Buracos — candidata à administração do Residencial Aquarius.
            <br className="hidden sm:block" /> Conteúdo de responsabilidade da própria chapa.
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
