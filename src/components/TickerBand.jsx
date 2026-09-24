import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Marquee } from './Marquee.jsx'
import { closing } from '../content.js'

/* Duas faixas cruzadas em diagonal que ainda deslizam com o scroll.
   É a "assinatura" gráfica do logo (faixa inclinada) virando elemento de página. */
export function TickerBand() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const xGold = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])
  const xNavy = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <div ref={ref} className="relative z-10 -mt-8 h-[124px] overflow-x-clip bg-navy-950 select-none sm:h-[146px]">
      <motion.div style={{ x: xNavy }} className="absolute inset-x-[-12%] top-6 rotate-[-2.5deg]">
        <div className="border-y border-white/10 bg-navy-800/80 py-3 backdrop-blur-sm">
          <Marquee
            items={closing.slogans}
            speed={46}
            reverse
            separator="●"
            itemClassName="display text-[0.95rem] tracking-[0.06em] text-white/45 sm:text-[1.15rem]"
          />
        </div>
      </motion.div>

      <motion.div style={{ x: xGold }} className="absolute inset-x-[-12%] top-[92px] rotate-[2.5deg] sm:top-[112px]">
        <div className="bg-gold-400 py-3">
          <Marquee
            items={['Aquarius Sem Buracos', 'Planejamento', 'Transparência', 'Alternativas reais', 'Decisão dos proprietários']}
            speed={38}
            separator="✦"
            itemClassName="display text-[1rem] tracking-[0.04em] text-navy-900 sm:text-[1.25rem]"
          />
        </div>
      </motion.div>
    </div>
  )
}
