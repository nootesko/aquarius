import { Users } from 'lucide-react'
import { changeCta, config } from '../content.js'
import { Reveal, RevealWords } from '../components/Reveal.jsx'
import { MagneticButton } from '../components/MagneticButton.jsx'

/* Faixa amarela com uma única chamada. */
export function ChangeCta() {
  return (
    <section id="participe" className="relative scroll-mt-20 overflow-hidden bg-gold-400 py-16 sm:py-20">
      <div aria-hidden="true" className="paver-grid-ink absolute inset-0 opacity-[0.28]" />

      <div className="shell relative flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
        <h2 className="display text-[clamp(1.9rem,5vw,3.2rem)] text-navy-900">
          <RevealWords text={changeCta.title} />
        </h2>

        <Reveal delay={0.1} className="w-full shrink-0 sm:w-auto">
          <MagneticButton
            href={config.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="navy"
            size="lg"
            className="w-full sm:w-auto"
            icon={<Users size={18} strokeWidth={2.4} aria-hidden="true" />}
          >
            {changeCta.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
