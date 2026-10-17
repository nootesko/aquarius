import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, LogOut, RotateCcw, UserRound, X } from 'lucide-react'
import { unitById, unitLabel, useStore } from '../lib/store.jsx'
import { go, goBack, href, useBackTarget } from '../lib/router.js'
import { timeAgo } from '../lib/format.js'
import { EASE, SPRING } from '../lib/motion.js'
import { Avatar, cx } from './kit.jsx'

/* Moldura comum dos painéis: barra lateral azul-marinho (desktop), gaveta e barra
   inferior (celular), cabeçalho com unidade, notificações e menu da conta. */

export function Logo({ size = 'md' }) {
  const cls = { sm: 'h-10', md: 'h-[92px]', lg: 'h-36' }[size]
  return <img src="/assets/logo-480.webp" alt="Chapa Aquarius Sem Buracos" className={cx('w-auto max-w-none shrink-0 self-start object-contain drop-shadow-[0_8px_18px_rgba(5,13,30,0.35)]', cls)} />
}

const PANEL_LABEL = { morador: 'Área do morador', admin: 'Administração', portaria: 'Portaria' }

function NavList({ panel, groups, active, onNavigate }) {
  return (
    <nav aria-label="Menu do painel" className="space-y-6">
      {groups.map((g) => (
        <div key={g.label ?? 'main'}>
          {g.label && <p className="mb-2 px-3 text-[0.62rem] font-bold tracking-[0.22em] text-gold-300/90 uppercase">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const on = active === it.id
              return (
                <li key={it.id}>
                  <a
                    href={href(`${panel}/${it.id}`)}
                    onClick={onNavigate}
                    aria-current={on ? 'page' : undefined}
                    className={cx(
                      'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.86rem] font-semibold transition-colors',
                      on ? 'text-navy-900' : 'text-white/85 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {on && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-gold-400" transition={SPRING.snappy} />}
                    <it.icon size={18} strokeWidth={2.2} className="relative shrink-0" aria-hidden="true" />
                    <span className="relative flex-1 truncate">{it.label}</span>
                    {it.badge > 0 && (
                      <span className={cx('relative rounded-full px-1.5 text-[0.68rem] font-bold', on ? 'bg-brand-600 text-white' : 'bg-gold-400 text-navy-900')}>
                        {it.badge}
                      </span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function useOutside(ref, onOut) {
  useEffect(() => {
    const on = (e) => ref.current && !ref.current.contains(e.target) && onOut()
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [ref, onOut])
}

function Notifications() {
  const { db, user, mutate } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))
  const dest = user.role === 'morador' ? user.id : user.role
  const items = db.notifications.filter((n) => n.para === dest)
  const unread = items.filter((n) => !n.lida).length

  const openItem = (n) => {
    mutate((d) => {
      const x = d.notifications.find((y) => y.id === n.id)
      if (x) x.lida = true
    })
    setOpen(false)
    if (n.link) go(n.link)
  }

  const readAll = () =>
    mutate((d) => d.notifications.forEach((n) => n.para === dest && (n.lida = true)))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações${unread ? `, ${unread} novas` : ''}`}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-paper-200"
      >
        <Bell size={19} strokeWidth={2.2} aria-hidden="true" />
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gold-400 px-1 text-[0.62rem] font-bold text-navy-900">
            {unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE.out }}
            className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-paper-300"
          >
            <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
              <p className="font-bold text-ink-900">Notificações</p>
              {unread > 0 && (
                <button type="button" onClick={readAll} className="text-[0.78rem] font-semibold text-brand-700 hover:underline">
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <ul className="max-h-[60vh] divide-y divide-paper-200 overflow-y-auto">
              {items.length === 0 && <li className="px-4 py-8 text-center text-[0.86rem] text-ink-500">Nada por aqui.</li>}
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => openItem(n)} className={cx('flex w-full gap-3 px-4 py-3 text-left hover:bg-paper-100', !n.lida && 'bg-brand-50/60')}>
                    <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.lida ? 'bg-transparent' : 'bg-brand-500')} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[0.86rem] font-semibold text-ink-900">{n.titulo}</span>
                      <span className="block text-[0.8rem] text-ink-600">{n.texto}</span>
                      <span className="mt-0.5 block text-[0.72rem] text-ink-500">{timeAgo(n.em)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UnitSwitcher() {
  const { db, user, selectUnit, toast } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))
  if (user.role !== 'morador' || user.unitIds.length < 2) {
    const u = unitById(db, user.unitId)
    return u ? <span className="hidden truncate text-[0.82rem] font-semibold text-ink-600 sm:block">{unitLabel(u)}</span> : null
  }
  const current = unitById(db, user.unitId)
  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex max-w-full items-center gap-2 rounded-full bg-paper-100 py-1.5 pr-3 pl-3.5 text-[0.82rem] font-semibold text-ink-900 ring-1 ring-paper-300 ring-inset hover:bg-paper-200"
      >
        <span className="truncate">{unitLabel(current)}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-paper-300"
          >
            <li className="px-3 pt-2 pb-1 text-[0.66rem] font-bold tracking-[0.16em] text-ink-500 uppercase">Selecionar unidade</li>
            {user.unitIds.map((id) => {
              const u = unitById(db, id)
              const papel = db.ownership.find((o) => o.unitId === id && o.personId === user.id)?.papel ?? user.vinculo
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      selectUnit(id)
                      setOpen(false)
                      toast(`Unidade ${unitLabel(u)} selecionada`)
                    }}
                    className={cx('w-full rounded-xl px-3 py-2.5 text-left hover:bg-paper-100', id === user.unitId && 'bg-brand-50')}
                  >
                    <span className="block text-[0.86rem] font-semibold text-ink-900">{unitLabel(u)}</span>
                    <span className="block text-[0.74rem] text-ink-500">
                      Casa · Quadra {u.quadra} · {papel}
                      {u.status === 'alugada' ? ' · alugada' : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function AccountMenu() {
  const { user, logout, reset, toast } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))
  const item = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.86rem] font-semibold text-ink-700 hover:bg-paper-100'
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Minha conta" className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-paper-300">
        <Avatar name={user.nome} size={36} photo={user.foto} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-paper-300"
          >
            <div className="px-3 py-2.5">
              <p className="font-bold text-ink-900">{user.nome}</p>
              <p className="text-[0.76rem] text-ink-500">{user.vinculo}</p>
            </div>
            <a href={href(`${user.role}/perfil`)} onClick={() => setOpen(false)} className={item}>
              <UserRound size={16} aria-hidden="true" /> Meu perfil
            </a>
            <button
              type="button"
              className={item}
              onClick={() => {
                reset()
                setOpen(false)
                toast('Dados da demonstração restaurados')
              }}
            >
              <RotateCcw size={16} aria-hidden="true" /> Restaurar demonstração
            </button>
            <button
              type="button"
              className={item}
              onClick={() => {
                logout()
                go('')
              }}
            >
              <LogOut size={16} aria-hidden="true" /> Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Shell({ panel, groups, active, mobileTabs, children }) {
  const [sheet, setSheet] = useState(false)
  const backTo = useBackTarget()
  const flat = groups.flatMap((g) => g.items)
  const tabs = mobileTabs ?? []
  const otherGroups = groups.map((g) => ({ ...g, items: g.items.filter((it) => !tabs.includes(it.id)) })).filter((g) => g.items.length)
  const otherActive = !tabs.includes(active)
  const otherBadge = otherGroups.some((g) => g.items.some((it) => it.badge > 0))

  useEffect(() => setSheet(false), [active])

  /* Com o "Outros" aberto, só a lista rola: a página de trás fica travada */
  useEffect(() => {
    if (!sheet) return
    const html = document.documentElement
    const prev = [html.style.overflow, document.body.style.overflow]
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prev[0]
      document.body.style.overflow = prev[1]
    }
  }, [sheet])

  return (
    <div className="min-h-screen lg:pl-[264px]">
      {/* Barra lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col overflow-hidden bg-gradient-to-b from-sky-700 via-sky-800 to-sky-950 lg:flex">
        <div className="paver-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col items-center px-5 pt-5 pb-4">
          <a href={href(panel)} aria-label="Início">
            <Logo />
          </a>
          <p className="mt-4 inline-flex rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-bold tracking-[0.14em] text-white/80 uppercase ring-1 ring-white/10 ring-inset">
            {PANEL_LABEL[panel]}
          </p>
        </div>
        <div className="relative flex-1 overflow-y-auto px-3 pb-6 [scrollbar-width:thin]">
          <NavList panel={panel} groups={groups} active={active} />
        </div>
      </aside>

      {/* "Outros" (celular): folha que sobe com os itens que não estão na barra inferior */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 touch-none bg-navy-950/50" onClick={() => setSheet(false)} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Outros"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: EASE.out }}
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="display text-[1.3rem] text-ink-900">Outros</span>
                <button type="button" onClick={() => setSheet(false)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full text-ink-600 hover:bg-paper-200">
                  <X size={19} />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain px-4 pb-6">
                {otherGroups.map((g) => (
                  <section key={g.label ?? 'main'} className="mt-3">
                    {g.label && <p className="mb-1.5 px-1 text-[0.66rem] font-bold tracking-[0.2em] text-brand-700 uppercase">{g.label}</p>}
                    <ul className="overflow-hidden rounded-2xl bg-paper-100">
                      {g.items.map((it) => (
                        <li key={it.id} className="border-b border-white last:border-0">
                          <a
                            href={href(`${panel}/${it.id}`)}
                            onClick={() => setSheet(false)}
                            className={cx('flex items-center gap-3 px-4 py-3 text-[0.92rem] font-semibold', active === it.id ? 'text-brand-700' : 'text-ink-900')}
                          >
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-600">
                              <it.icon size={18} aria-hidden="true" />
                            </span>
                            <span className="flex-1">{it.label}</span>
                            {it.badge > 0 && <span className="rounded-full bg-gold-400 px-1.5 text-[0.7rem] font-bold text-navy-900">{it.badge}</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-paper-300/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {backTo ? (
            <button
              type="button"
              onClick={() => goBack(backTo)}
              aria-label="Voltar"
              className="-ml-1.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand-700 transition-colors hover:bg-paper-200"
            >
              <ArrowLeft size={22} strokeWidth={2.4} />
            </button>
          ) : (
            <a href={href(panel)} className="shrink-0 lg:hidden" aria-label="Início">
              <Logo size="sm" />
            </a>
          )}
          <div className="min-w-0 flex-1">
            <UnitSwitcher />
          </div>
          <Notifications />
          <AccountMenu />
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE.out }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barra inferior (celular) */}
      {mobileTabs && (
        <nav aria-label="Atalhos" className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-300 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <ul className="mx-auto flex max-w-lg">
            {mobileTabs.map((id) => {
              const it = flat.find((x) => x.id === id)
              const on = active === id
              return (
                <li key={id} className="flex-1">
                  <a href={href(`${panel}/${id}`)} className={cx('relative flex flex-col items-center gap-1 py-2.5 text-[0.66rem] font-semibold', on ? 'text-brand-700' : 'text-ink-500')}>
                    {on && <motion.span layoutId="bottom-pill" className="absolute top-0 h-[3px] w-10 rounded-full bg-gold-400" transition={SPRING.snappy} />}
                    <it.icon size={21} strokeWidth={on ? 2.5 : 2} aria-hidden="true" />
                    <span className="truncate">{it.short ?? it.label}</span>
                    {it.badge > 0 && <span className="absolute top-1.5 right-[calc(50%-18px)] h-2 w-2 rounded-full bg-gold-500" />}
                  </a>
                </li>
              )
            })}
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setSheet(true)}
                aria-expanded={sheet}
                className={cx('relative flex w-full flex-col items-center gap-1 py-2.5 text-[0.66rem] font-semibold', otherActive ? 'text-brand-700' : 'text-ink-500')}
              >
                {otherActive && <motion.span layoutId="bottom-pill" className="absolute top-0 h-[3px] w-10 rounded-full bg-gold-400" transition={SPRING.snappy} />}
                <LayoutGrid size={21} strokeWidth={otherActive ? 2.5 : 2} aria-hidden="true" />
                <span>Outros</span>
                {otherBadge && <span className="absolute top-1.5 right-[calc(50%-18px)] h-2 w-2 rounded-full bg-gold-500" />}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
