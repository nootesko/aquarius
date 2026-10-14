import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'
import { contact, whatsappLink } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { SPRING } from '../lib/motion.js'

/* Botão para entrar no grupo do WhatsApp. */
function WhatsAppCall() {
  const reduce = useReducedMotion()
  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={SPRING.soft}
      className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[1rem] font-bold tracking-[0.08em] text-green-700 uppercase shadow-[0_18px_40px_-18px_rgba(5,46,22,0.8)] sm:px-10 sm:py-5 sm:text-[1.1rem]"
    >
      <WhatsAppIcon size={24} />
      Se juntar ao grupo
      <ArrowUpRight
        size={20}
        strokeWidth={2.6}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </motion.a>
  )
}

export function Contact() {
  return (
    <section id="contato" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-green-600 to-green-800 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,rgba(255,255,255,0.14),transparent_60%)]"
      />

      <div className="shell relative">
        <SectionHeading overline={contact.overline} title={contact.title} lead={contact.lead} align="center" />

        <div className="mt-12 flex justify-center">
          <Reveal>
            <WhatsAppCall />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
