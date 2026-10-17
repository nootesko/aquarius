import { useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  CheckCircle2, ChevronRight, Goal, Info, PartyPopper, Search, Tent, TriangleAlert, Volleyball, Waves, X,
} from 'lucide-react'
import { initials } from '../lib/format.js'
import { href, setBackTarget } from '../lib/router.js'
import { EASE, SPRING } from '../lib/motion.js'
import { useStore } from '../lib/store.jsx'

/* Componentes de interface compartilhados pelos três painéis. */

const cx = (...c) => c.filter(Boolean).join(' ')

/* ---------- Botões ---------- */

const VARIANTS = {
  gold: 'bg-gold-400 text-navy-900 hover:bg-gold-300 shadow-[0_10px_30px_-8px_rgba(255,204,0,0.55)]',
  primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-[0_10px_30px_-10px_rgba(0,87,190,0.65)]',
  brand: 'bg-brand-600 text-white hover:bg-brand-500 shadow-[0_10px_30px_-10px_rgba(0,87,190,0.65)]',
  outline: 'bg-white text-ink-700 ring-1 ring-inset ring-paper-300 hover:bg-paper-100',
  ghost: 'text-ink-700 hover:bg-paper-200',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  danger: 'bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50',
  dangerSolid: 'bg-red-600 text-white hover:bg-red-700',
}

const SIZES = {
  sm: 'gap-1.5 px-3.5 py-1.5 text-[0.7rem] tracking-[0.08em]',
  md: 'gap-2 px-5 py-2.5 text-[0.76rem] tracking-[0.1em]',
  lg: 'gap-2 px-7 py-3.5 text-[0.84rem] tracking-[0.12em]',
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, to, className, children, ...rest }) {
  const cls = cx(
    'inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap uppercase transition-colors duration-150 disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
  const inner = (
    <>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.4} aria-hidden="true" />}
      {children}
    </>
  )
  if (to)
    return (
      <motion.a href={href(to)} className={cls} whileTap={{ scale: 0.97 }} {...rest}>
        {inner}
      </motion.a>
    )
  return (
    <motion.button type="button" className={cls} whileTap={{ scale: 0.97 }} transition={SPRING.pop} {...rest}>
      {inner}
    </motion.button>
  )
}

export function IconButton({ icon: Icon, label, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('grid h-10 w-10 place-items-center rounded-full text-ink-600 transition-colors hover:bg-paper-200 hover:text-ink-900', className)}
      {...rest}
    >
      <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
    </button>
  )
}

/* ---------- Superfícies ---------- */

export function Card({ className, children, to, onClick, padded = true, ...rest }) {
  const cls = cx(
    'block rounded-2xl ring-1 ring-paper-300/80 shadow-[0_1px_2px_rgba(10,23,48,0.04)]',
    !/(^|\s)bg-/.test(className ?? '') && 'bg-white',
    padded && 'p-5',
    (to || onClick) && 'transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(10,23,48,0.35)] text-left w-full',
    className,
  )
  if (to)
    return (
      <a href={href(to)} className={cls} {...rest}>
        {children}
      </a>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls} {...rest}>
        {children}
      </button>
    )
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

export function PageHeader({ overline, title, lead, actions, back }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE.out }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0 max-w-3xl">
        {back && <BackLink to={back} />}
        {overline && <p className="mb-2 text-[0.68rem] font-bold tracking-[0.22em] text-brand-700 uppercase">{overline}</p>}
        <h1 className="display text-[clamp(1.7rem,4vw,2.5rem)] text-ink-900">{title}</h1>
        {lead && <p className="mt-3 text-[0.95rem] text-ink-600">{lead}</p>}
      </div>
      {actions && <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">{actions}</div>}
    </motion.header>
  )
}

/* Página interna: registra o destino do "voltar" (a seta fica no cabeçalho) */
export function BackLink({ to }) {
  useEffect(() => {
    setBackTarget(to)
    return () => setBackTarget(null)
  }, [to])
  return null
}

export function SectionTitle({ children, action, className }) {
  return (
    <div className={cx('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="text-[0.72rem] font-bold tracking-[0.18em] text-ink-500 uppercase">{children}</h2>
      {action}
    </div>
  )
}

/* ---------- Selos ---------- */

const TONES = {
  blue: 'bg-brand-50 text-brand-700 ring-brand-100',
  gold: 'bg-gold-100 text-gold-ink ring-gold-300/60',
  green: 'bg-brand-50 text-brand-700 ring-brand-100',
  red: 'bg-gold-100 text-gold-ink ring-gold-300/60',
  gray: 'bg-paper-100 text-ink-600 ring-paper-300',
  navy: 'bg-brand-700 text-white ring-brand-700',
  solid: 'bg-brand-600 text-white ring-brand-600',
  orange: 'bg-gold-100 text-gold-ink ring-gold-300/60',
}

export function Badge({ tone = 'gray', children, className, dot }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold whitespace-nowrap ring-1 ring-inset', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}

const STATUS = {
  confirmada: ['green', 'Confirmada'],
  pendente: ['gold', 'Aguardando aprovação'],
  cancelada: ['gray', 'Cancelada'],
  concluída: ['gray', 'Concluída'],
  recusada: ['gray', 'Recusada'],
  ativa: ['green', 'Válida'],
  revogada: ['gray', 'Revogada'],
  expirada: ['gray', 'Expirada'],
  usada: ['blue', 'Utilizada'],
  recebida: ['blue', 'Recebida'],
  'em andamento': ['gold', 'Em andamento'],
  resolvida: ['green', 'Resolvida'],
  encerrada: ['gray', 'Encerrada'],
  aberta: ['green', 'Aberta'],
  futura: ['blue', 'Em breve'],
  publicado: ['green', 'Publicado'],
  agendado: ['blue', 'Agendado'],
  rascunho: ['gray', 'Rascunho'],
  ativo: ['green', 'Ativo'],
  inativo: ['gray', 'Inativo'],
  encaminhada: ['blue', 'Encaminhada'],
  agendada: ['blue', 'Agendada'],
  recolhida: ['green', 'Recolhida'],
  verificado: ['green', 'Verificado'],
  novo: ['gold', 'Novo'],
  planejada: ['gray', 'Planejada'],
}

export function StatusBadge({ status, label }) {
  const [tone, text] = STATUS[status] ?? ['gray', status]
  return (
    <Badge tone={tone} dot>
      {label ?? text}
    </Badge>
  )
}

/* ---------- Pessoas ---------- */

const AVATAR_BG = ['bg-brand-100 text-brand-700']

export function Avatar({ name = '', size = 40, className, photo }) {
  const n = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  if (photo)
    return <img src={photo} alt="" className={cx('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} />
  return (
    <span
      aria-hidden="true"
      className={cx('grid shrink-0 place-items-center rounded-full font-bold', AVATAR_BG[n % AVATAR_BG.length], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name) || '?'}
    </span>
  )
}

/* ---------- Formulários ---------- */

export const inputCls =
  'w-full rounded-xl border border-paper-300 bg-white px-3.5 py-2.5 text-[0.92rem] text-ink-900 outline-none transition-[border-color,box-shadow] placeholder:text-ink-500/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'

export function Field({ label, hint, children, optional, className }) {
  const id = useId()
  return (
    <label htmlFor={typeof children === 'function' ? id : undefined} className={cx('block', className)}>
      <span className="mb-1.5 flex items-baseline gap-2 text-[0.8rem] font-semibold text-ink-700">
        {label}
        {optional && <span className="text-[0.7rem] font-normal text-ink-500">opcional</span>}
      </span>
      {typeof children === 'function' ? children(id) : children}
      {hint && <span className="mt-1 block text-[0.75rem] text-ink-500">{hint}</span>}
    </label>
  )
}

export const Input = (props) => <input className={inputCls} {...props} />
export const Textarea = (props) => <textarea rows={4} className={cx(inputCls, 'resize-y')} {...props} />
export function Select({ options, ...props }) {
  return (
    <select className={cx(inputCls, 'appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%234b5a6e%22 stroke-width=%223%22><path d=%22m6 9 6 6 6-6%22/></svg>")] bg-[position:right_14px_center] bg-no-repeat pr-9')} {...props}>
      {options.map((o) => {
        const [v, l] = typeof o === 'string' ? [o, o] : [o.value, o.label]
        return (
          <option key={v} value={v}>
            {l}
          </option>
        )
      })}
    </select>
  )
}

export function Check({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[0.88rem] text-ink-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-brand-600" />
      <span>{children}</span>
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-paper-300')}
    >
      <motion.span
        layout
        transition={SPRING.snappy}
        className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')}
      />
    </button>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…', className, autoFocus }) {
  return (
    <div className={cx('relative', className)}>
      <Search size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-500" aria-hidden="true" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(inputCls, 'pl-10')}
      />
    </div>
  )
}

/* ---------- Abas ---------- */

/* Abas sublinhadas: só texto, para não serem confundidas com botões (pílulas) */
export function Tabs({ tabs, value, onChange, className }) {
  const group = useId()
  return (
    <div role="tablist" className={cx('scroll-track mb-5 flex gap-6 border-b border-paper-300', className)}>
      {tabs.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(t.id)}
            className={cx('relative shrink-0 pt-1 pb-3 text-[0.88rem] font-semibold whitespace-nowrap transition-colors', active ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900')}
          >
            <span className="flex items-center gap-1.5">
              {t.label}
              {t.count != null && <span className={cx('text-[0.75rem] font-semibold', active ? 'text-brand-600' : 'text-ink-500/80')}>{t.count}</span>}
            </span>
            {active && <motion.span layoutId={`tab-${group}`} className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-gold-400" transition={SPRING.snappy} />}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Estados ---------- */

export function Empty({ icon: Icon = Info, title, text, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-paper-300 px-6 py-12 text-center">
      <Icon size={30} className="mx-auto text-ink-500" aria-hidden="true" />
      <p className="mt-3 font-semibold text-ink-900">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-[0.88rem] text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Notice({ tone = 'blue', icon: Icon = Info, children, className }) {
  const t = {
    blue: 'bg-brand-50 text-brand-700 ring-brand-100',
    gold: 'bg-gold-100 text-gold-ink ring-gold-300/60',
    red: 'bg-red-50 text-red-800 ring-red-200',
    green: 'bg-brand-50 text-brand-700 ring-brand-100',
  }[tone]
  return (
    <div className={cx('flex items-start gap-3 rounded-xl px-4 py-3 text-[0.86rem] ring-1 ring-inset', t, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export function Stat({ label, value, icon: Icon, hint, tone = 'blue', to }) {
  const ring = { blue: 'bg-brand-50 text-brand-700', gold: 'bg-gold-100 text-gold-ink', green: 'bg-brand-50 text-brand-700', red: 'bg-gold-100 text-gold-ink', navy: 'bg-brand-600 text-gold-400' }[tone]
  return (
    <Card to={to} className="flex items-start gap-4">
      {Icon && (
        <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', ring)}>
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[0.75rem] font-semibold text-ink-500">{label}</p>
        <p className="display mt-1 text-[1.9rem] text-ink-900">{value}</p>
        {hint && <p className="mt-1 text-[0.75rem] text-ink-500">{hint}</p>}
      </div>
    </Card>
  )
}

export function Progress({ value, tone = 'brand', className }) {
  const bar = { brand: 'bg-brand-500', gold: 'bg-gold-400', green: 'bg-brand-500', navy: 'bg-brand-600' }[tone]
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-paper-200', className)}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: EASE.out }} className={cx('h-full rounded-full', bar)} />
    </div>
  )
}

/* Linha de lista clicável: ícone/avatar à esquerda, conteúdo, seta */
export function Row({ to, onClick, leading, title, subtitle, trailing, className }) {
  const inner = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink-900">{title}</p>
        {subtitle && <p className="truncate text-[0.82rem] text-ink-500">{subtitle}</p>}
      </div>
      {trailing}
      {(to || onClick) && <ChevronRight size={18} className="shrink-0 text-ink-500" aria-hidden="true" />}
    </>
  )
  const cls = cx('flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors', (to || onClick) && 'hover:bg-paper-100', className)
  if (to)
    return (
      <a href={href(to)} className={cls}>
        {inner}
      </a>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  return <div className={cls}>{inner}</div>
}

export function List({ children, className }) {
  return <Card padded={false} className={cx('divide-y divide-paper-200 overflow-hidden', className)}>{children}</Card>
}

export function Table({ head, children, className }) {
  return (
    <Card padded={false} className={cx('overflow-x-auto', className)}>
      <table className="w-full text-left text-[0.88rem]">
        <thead className="bg-paper-100 text-[0.7rem] tracking-[0.12em] text-ink-500 uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-200">{children}</tbody>
      </table>
    </Card>
  )
}

export const Td = ({ children, className, ...rest }) => (
  <td className={cx('px-4 py-3 align-middle', className)} {...rest}>
    {children}
  </td>
)

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 touch-none bg-navy-950/55 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE.out }}
            className={cx('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}
          >
            <div className="flex items-center justify-between gap-4 border-b border-paper-200 px-6 py-4">
              <h2 className="display text-[1.25rem] text-ink-900">{title}</h2>
              <IconButton icon={X} label="Fechar" onClick={onClose} className="-mr-2" />
            </div>
            <div className="overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-paper-200 bg-paper-100/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Toasts ---------- */

export function Toaster() {
  const { toasts } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={SPRING.snappy}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-brand-600 py-2.5 pr-5 pl-3 text-[0.86rem] font-semibold text-white shadow-xl"
          >
            {t.tone === 'error' ? <TriangleAlert size={18} className="text-gold-400" /> : <CheckCircle2 size={18} className="text-gold-400" />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Foto da área comum (ou ilustração, quando não há foto) ---------- */

const AREA_ICONS = { tent: Tent, goal: Goal, volleyball: Volleyball, party: PartyPopper, waves: Waves }

export function AreaArt({ area, className, size = 46 }) {
  const Icon = AREA_ICONS[area.icon] ?? Tent
  if (area.foto)
    return (
      <div className={cx('relative overflow-hidden bg-sky-800', className)}>
        <img src={area.foto} alt={area.nome} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    )
  return (
    <div className={cx('relative grid place-items-center overflow-hidden bg-gradient-to-br from-sky-600 to-sky-900 text-white', className)}>
      <div className="paver-grid-light absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute -right-6 -bottom-8 h-28 w-28 rounded-full bg-white/10" aria-hidden="true" />
      <Icon size={size} strokeWidth={1.6} className="relative drop-shadow" aria-hidden="true" />
    </div>
  )
}

export { cx }
