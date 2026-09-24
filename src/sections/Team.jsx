import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Award, Briefcase, GraduationCap } from 'lucide-react'
import { members, team } from '../content.js'
import { RevealGroup } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { EASE, riseIn, riseInFast } from '../lib/motion.js'

const CV_ICONS = { Formação: GraduationCap, 'Pós-graduação': Award, Experiência: Briefcase }

/* Retrato com parallax leve. */
function Portrait({ m }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <div
      ref={ref}
      className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-sky-950 shadow-[0_40px_80px_-40px_rgba(5,31,71,0.9)] ring-1 ring-white/10"
    >
      <motion.picture style={reduce ? undefined : { y: imgY, scale: 1.1 }} className="absolute inset-0 block">
        <source srcSet={`${m.photo}.webp`} type="image/webp" />
        <img
          src={`${m.photo}.jpg`}
          alt={`${m.name}, ${m.role.toLowerCase()} da chapa`}
          width="960"
          height="1200"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_18%]"
        />
      </motion.picture>
    </div>
  )
}

/* Foto e currículo lado a lado; a ordem alterna a cada integrante (foto > conteúdo, conteúdo < foto). */
function MemberRow({ m, flip }) {
  const reduce = useReducedMotion()
  return (
    <article className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, x: flip ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE.out }}
        className={flip ? 'md:order-2' : ''}
      >
        <Portrait m={m} />
      </motion.div>

      <RevealGroup className={flip ? 'md:order-1' : ''} staggerChildren={0.08}>
        <motion.span
          variants={riseInFast}
          className="inline-block rounded-full bg-gold-400 px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
        >
          {m.role}
        </motion.span>
        <motion.h3 variants={riseIn} className="display mt-4 text-[clamp(2.4rem,6vw,3.6rem)] leading-none text-white">
          {m.name}
        </motion.h3>

        <dl className="mt-8 space-y-6">
          {m.cv.map((c) => {
            const Icon = CV_ICONS[c.label] ?? Briefcase
            return (
              <motion.div key={c.label} variants={riseIn} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-inset ring-white/15">
                  <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-[0.66rem] font-bold tracking-[0.2em] text-gold-300 uppercase">{c.label}</dt>
                  <dd className="mt-1 text-[1.02rem] leading-relaxed text-white">{c.text}</dd>
                </div>
              </motion.div>
            )
          })}
        </dl>
      </RevealGroup>
    </article>
  )
}

export function Team() {
  return (
    <section id="chapa" className="relative scroll-mt-20 overflow-hidden bg-sky-900 py-24 sm:py-32">
      <div aria-hidden="true" className="paver-grid-light absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(43,143,232,0.45)_0%,transparent_70%)]"
      />

      <div className="shell relative">
        <SectionHeading overline={team.overline} title={team.title} align="center" />

        <div className="mx-auto mt-14 max-w-5xl space-y-20 sm:mt-20 sm:space-y-28">
          {members.map((m, i) => (
            <MemberRow key={m.id} m={m} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
