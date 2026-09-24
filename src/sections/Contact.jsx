import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'
import { contact, whatsappLink } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { ContactForm } from '../components/ContactForm.jsx'
import { SPRING } from '../lib/motion.js'

/* Chamada direta para o WhatsApp da chapa. */
function WhatsAppCall() {
  const reduce = useReducedMotion()
  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduce ? undefined : { y: -5 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={SPRING.soft}
      className="group relative flex h-full flex-col justify-center overflow-hidden rounded-3xl bg-[#25d366] p-7 text-navy-950 shadow-[0_30px_60px_-30px_rgba(37,211,102,0.6)] sm:p-9"
    >
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-navy-950 text-[#25d366]">
        <WhatsAppIcon size={26} />
      </span>

      <span className="relative mt-8 block">
        <span className="display block text-[clamp(1.6rem,3.6vw,2.2rem)] leading-tight">Prefere conversar?</span>
        <span className="mt-2 block text-[1rem] font-medium text-navy-950/75">Chame a chapa no WhatsApp.</span>
        <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy-950 px-6 py-3.5 text-[0.8rem] font-bold tracking-[0.12em] text-white uppercase">
          Abrir WhatsApp
          <ArrowUpRight
            size={17}
            strokeWidth={2.6}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </span>
    </motion.a>
  )
}

export function Contact() {
  return (
    <section id="contato" className="relative scroll-mt-20 overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,rgba(0,87,190,0.22),transparent_60%)]"
      />

      <div className="shell relative">
        <SectionHeading overline={contact.overline} title={contact.title} lead={contact.lead} align="center" />

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
          <Reveal>
            <WhatsAppCall />
          </Reveal>
          <Reveal delay={0.08}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
