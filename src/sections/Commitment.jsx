import { commitment } from '../content.js'
import { Reveal } from '../components/Reveal.jsx'

/* Compromisso com a pavimentação: o que a chapa promete (e o que não promete).
   Fica no fim do site e da página /ruas-novas. */
export function Commitment() {
  return (
    <section id="compromisso" className="relative scroll-mt-20 overflow-hidden bg-sun-50 py-20 sm:py-28">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gold-400" />

      <div className="shell relative">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-brand-700 uppercase">{commitment.overline}</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,5.4vw,3.2rem)] text-ink-900">
              {commitment.title.replace(/\.$/, '')}
              <span aria-hidden="true" className="text-gold-500">
                .
              </span>
            </h2>
          </Reveal>

          <div className="mt-8 space-y-5 border-l-4 border-gold-400 pl-5 sm:pl-7">
            {commitment.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.06 * i}>
                <p
                  className={`leading-relaxed ${
                    i === commitment.paragraphs.length - 1
                      ? 'text-[1.08rem] font-semibold text-ink-900 sm:text-[1.2rem]'
                      : 'text-[1rem] text-ink-700 sm:text-[1.08rem]'
                  }`}
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
