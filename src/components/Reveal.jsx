import { Fragment } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { VIEWPORT, riseIn, stagger } from '../lib/motion.js'

/* Wrapper de entrada por scroll. Com prefers-reduced-motion o conteúdo
   simplesmente aparece — sem deslocamento, sem blur. */
export function Reveal({
  children,
  as = 'div',
  variants = riseIn,
  delay = 0,
  className = '',
  viewport = VIEWPORT,
  ...rest
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as] ?? motion.div

  if (reduce) {
    const Plain = as
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

/* Container que escalona a entrada dos filhos que usarem `variants`. */
export function RevealGroup({
  children,
  as = 'div',
  className = '',
  delayChildren = 0,
  staggerChildren = 0.08,
  viewport = VIEWPORT,
  ...rest
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as] ?? motion.div

  if (reduce) {
    const Plain = as
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  return (
    <Comp
      className={className}
      variants={stagger(delayChildren, staggerChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      {...rest}
    >
      {children}
    </Comp>
  )
}

/* Título display animado palavra a palavra. */
export function RevealWords({ text, className = '', wordClassName = '', delay = 0, as = 'span' }) {
  const reduce = useReducedMotion()
  const words = String(text).split(' ')
  const Comp = motion[as] ?? motion.span

  if (reduce) {
    const Plain = as
    return <Plain className={className}>{text}</Plain>
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={stagger(delay, 0.055)}
      aria-label={text}
    >
      {/* espaço de verdade entre as palavras, para o texto copiar e ser lido direito */}
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          {i > 0 && ' '}
          <span className="-mt-[0.24em] inline-block overflow-hidden pt-[0.24em] pb-[0.12em] align-bottom" aria-hidden="true">
            <motion.span
              className={`inline-block ${wordClassName}`}
              variants={{
                hidden: { y: '110%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {w}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Comp>
  )
}
