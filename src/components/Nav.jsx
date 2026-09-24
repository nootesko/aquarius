import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon.jsx'
import { nav, whatsappLink } from '../content.js'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrolled } from '../hooks/useScrolled.js'
import { EASE, SPRING } from '../lib/motion.js'

const IDS = nav.map((n) => n.id)

export function Nav() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(60)
  const active = useActiveSection(IDS)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  /* trava o scroll do fundo quando o menu mobile está aberto */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 76
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-navy-900"
      >
        Pular para o conteúdo
      </a>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: EASE.out, delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          animate={{
            backgroundColor: scrolled ? 'rgba(5,13,30,0.82)' : 'rgba(5,13,30,0)',
            backdropFilter: scrolled ? 'blur(14px)' : 'blur(0px)',
            borderColor: scrolled ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0)',
          }}
          transition={{ duration: 0.4, ease: EASE.inOut }}
          className="border-b"
        >
          <nav className="shell flex h-[68px] items-center justify-between gap-4 md:justify-start md:gap-8" aria-label="Navegação principal">
            <ul className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => go(e, item.id)}
                    className="relative block rounded-full px-4 py-2 text-[0.82rem] font-semibold tracking-wide text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    {active === item.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/10 ring-1 ring-inset ring-white/15"
                        transition={SPRING.snappy}
                      />
                    )}
                    <span className={active === item.id ? 'text-white' : undefined}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 md:ml-auto">
              <motion.a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING.pop}
                className="hidden items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-[0.78rem] font-bold tracking-[0.1em] text-navy-900 uppercase sm:inline-flex"
              >
                <WhatsAppIcon size={16} />
                Fale conosco
              </motion.a>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu-mobile"
                aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white/8 ring-1 ring-inset ring-white/15 text-white md:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={20} strokeWidth={2.6} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={20} strokeWidth={2.6} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </motion.div>

        {/* barra de progresso de leitura */}
        <motion.div
          style={{ scaleX: progress }}
          className="h-[3px] origin-left bg-gradient-to-r from-gold-400 via-gold-300 to-brand-400"
          aria-hidden="true"
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-navy-950/97 backdrop-blur-xl md:hidden"
          >
            <motion.ul
              className="flex h-full flex-col justify-center gap-2 px-8"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } }, hidden: {} }}
            >
              {nav.map((item) => (
                <motion.li
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, x: -28 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE.out } },
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => go(e, item.id)}
                    className="display block border-b border-white/10 py-4 text-4xl text-white/90 active:text-gold-400"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                className="pt-8"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.out } },
                }}
              >
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-4 text-sm font-bold tracking-[0.12em] text-navy-900 uppercase"
                >
                  <WhatsAppIcon size={18} />
                  Fale conosco
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
