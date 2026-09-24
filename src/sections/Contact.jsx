import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'
import { contact, whatsappLink } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'
import { SectionHeading } from '../components/SectionHeading.jsx'
import { ContactForm } from '../components/ContactForm.jsx'
import { SPRING } from '../lib/motion.js'

/* Faixa fina com a chamada para o WhatsApp, logo abaixo do formulário. */
function WhatsAppCall() {
  const reduce = useReducedMotion()
  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={SPRING.soft}
      className="group flex items-center gap-4 rounded-2xl bg-[#25d366] p-4 text-navy-950 shadow-[0_20px_40px_-24px_rgba(5,31,71,0.8)] sm:p-5"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-950 text-[#25d366]">
        <WhatsAppIcon size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[1.02rem] font-bold">Prefere conversar?</span>
        <span className="block text-[0.9rem] text-navy-950/75">Chame a chapa no WhatsApp.</span>
      </span>
      <span className="hidden shrink-0 items-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-[0.75rem] font-bold tracking-[0.12em] text-white uppercase sm:inline-flex">
        Abrir WhatsApp
        <ArrowUpRight
          size={16}
          strokeWidth={2.6}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
      <ArrowUpRight size={20} strokeWidth={2.6} aria-hidden="true" className="shrink-0 sm:hidden" />
    </motion.a>
  )
}

export function Contact() {
  return (
    <section id="contato" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-sky-600 to-sky-800 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,rgba(255,255,255,0.14),transparent_60%)]"
      />

      <div className="shell relative">
        <SectionHeading overline={contact.overline} title={contact.title} lead={contact.lead} align="center" />

        <div className="mx-auto mt-14 max-w-2xl space-y-5">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.08}>
            <WhatsAppCall />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
