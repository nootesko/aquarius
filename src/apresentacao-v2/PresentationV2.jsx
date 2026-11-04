import {
  ArrowRight, BookOpen, Building2, Car, Cctv, ChartColumn, Check, Dices, FileCheck2, FileText, Handshake, IdCard, Leaf, Mail, MessagesSquare, Music,
  PawPrint, Route, ShieldCheck, Smartphone, Sparkles, Trees, TriangleAlert, Trophy, Users, Volleyball, Waves,
} from 'lucide-react'
import { members, v2 } from '../content.js'
import {
  ClosingSlide, CommitmentSlide, CoverSlide, Kicker, MemberSlide, PortariaSlide, Presentation, SimulateSlide, StreetsCompareSlide,
} from '../apresentacao/Presentation.jsx'

/* Apresentação v2 (/apresentacao-v2): mesmo esquema da v1 (capa, chapa, antes e depois,
   compromisso, simulador, propostas, encerramento), com as propostas de gestão reescritas
   a partir das artes da chapa e um slide por proposta. Os textos ficam em content.js (v2). */

export const PDF_URL_V2 = '/apresentacao-v2/aquarius-sem-buracos-v2.pdf'

const ICONS = {
  road: Route, shield: ShieldCheck, people: Users, building: Building2, leaf: Leaf, doc: FileText, paw: PawPrint, mail: Mail,
  handshake: Handshake, badge: IdCard, car: Car, camera: Cctv, chart: ChartColumn, chat: MessagesSquare, check: FileCheck2, tree: Trees,
  waves: Waves, ball: Volleyball, dice: Dices, trophy: Trophy, book: BookOpen, music: Music,
}
const VALUE_ICONS = { Natureza: Leaf, 'Qualidade de vida': Users, Transparência: Handshake, Participação: Users }

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

/* Círculo azul-marinho com aro dourado, como nas artes. */
function IconBadge({ icon, size = 'md' }) {
  const Icon = ICONS[icon] ?? Sparkles
  const box = size === 'lg' ? 'h-16 w-16 lg:h-[4.5rem] lg:w-[4.5rem]' : size === 'sm' ? 'h-11 w-11' : 'h-13 w-13 lg:h-14 lg:w-14'
  const px = size === 'lg' ? 32 : size === 'sm' ? 20 : 26
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-navy-900 text-gold-400 ring-[3px] ring-gold-400 ring-offset-2 ring-offset-white/0 ${box}`}>
      <Icon size={px} strokeWidth={2.1} aria-hidden="true" />
    </span>
  )
}

/* Foto com fundo de reserva: se a imagem ainda não existir, fica um degradê. */
function Photo({ src, alt, className = '', position = 'center' }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-700 to-navy-900 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

function ThemeHeader({ n, title, subtitle, tone = 'dark', size = 'md' }) {
  const big = size === 'lg' ? 'lg:text-[4.4rem]' : size === 'sm' ? 'lg:text-[2.9rem]' : 'lg:text-[3.6rem]'
  return (
    <div>
      {n && <Kicker tone={tone}>Proposta {String(n).padStart(2, '0')}</Kicker>}
      <h2 className={`display mt-2 text-[clamp(2.1rem,8.5vw,3.2rem)] leading-[0.95] ${tone === 'light' ? 'text-white' : 'text-navy-900'} ${big}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 text-[1.3rem] font-bold italic lg:text-[1.75rem] ${tone === 'light' ? 'text-gold-300' : 'text-gold-ink'}`}>{subtitle}</p>
      )}
    </div>
  )
}

/* Faixa com os quatro valores da chapa (rodapé das artes). */
function ValuesBar({ tone = 'dark' }) {
  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.85rem] font-bold tracking-[0.14em] uppercase lg:gap-x-9 lg:text-[0.95rem] ${
        tone === 'light' ? 'text-white/85' : 'text-navy-900'
      }`}
    >
      {v2.values.map((v) => {
        const Icon = VALUE_ICONS[v]
        return (
          <li key={v} className="flex items-center gap-2">
            <Icon size={18} strokeWidth={2.4} className={tone === 'light' ? 'text-gold-300' : 'text-gold-500'} aria-hidden="true" />
            {v}
          </li>
        )
      })}
    </ul>
  )
}

function Banner({ lines, className = '' }) {
  return (
    <p className={`rounded-2xl bg-navy-900 px-6 py-4 text-center text-[1.25rem] font-bold leading-snug text-white lg:text-[1.5rem] ${className}`}>
      {lines[0]} <em className="text-gold-300">{lines[1]}</em>
    </p>
  )
}

function Points({ items, tone = 'dark' }) {
  return (
    <ul className="space-y-2.5 lg:space-y-3">
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-3 text-[1.1rem] leading-snug lg:text-[1.3rem] ${tone === 'light' ? 'text-white/90' : 'text-ink-700'}`}>
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900 lg:h-7 lg:w-7">
            <Check size={16} strokeWidth={3} aria-hidden="true" />
          </span>
          {t}
        </li>
      ))}
    </ul>
  )
}

/* Painel com o ícone da proposta em destaque, no lugar de uma foto. */
function IconPanel({ icon, n, className = '' }) {
  const Icon = ICONS[icon] ?? Sparkles
  return (
    <div aria-hidden="true" className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-sky-600 via-sky-900 to-navy-950 ${className}`}>
      <div className="paver-grid-light absolute inset-0 opacity-70" />
      {n && (
        <span className="display absolute -bottom-6 left-4 text-[9rem] leading-none text-white/10 lg:-bottom-10 lg:text-[16rem]">
          {String(n).padStart(2, '0')}
        </span>
      )}
      <span className="relative grid h-32 w-32 place-items-center rounded-full bg-navy-900 text-gold-400 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-[6px] ring-gold-400 lg:h-60 lg:w-60 lg:ring-8">
        <Icon className="h-16 w-16 lg:h-28 lg:w-28" strokeWidth={1.8} />
      </span>
    </div>
  )
}

/* Meia tela de foto (ou ícone) + meia de conteúdo. No celular, a imagem fica em cima. */
function MediaSplit({ img, alt, icon, n, position, side = 'left', children, bg = 'bg-white' }) {
  const media = `shrink-0 lg:h-auto lg:w-[38%] ${side === 'right' ? 'lg:order-2' : ''}`
  return (
    <div className={`flex flex-1 flex-col lg:flex-row ${bg}`}>
      {img ? (
        <Photo src={img} alt={alt} position={position} className={`h-[34vh] ${media}`} />
      ) : (
        <IconPanel icon={icon} n={n} className={`h-[24vh] ${media}`} />
      )}
      <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8 lg:gap-7 lg:px-14">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Slides das propostas                                                */
/* ------------------------------------------------------------------ */

function OverviewSlide() {
  const o = v2.overview
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 bg-sun-50 px-6 py-8 lg:gap-6 lg:px-12">
      <div className="text-center">
        <Kicker>{o.overline}</Kicker>
        <h2 className="display mx-auto mt-2 max-w-[20ch] text-[clamp(2rem,8vw,3rem)] leading-[0.95] text-navy-900 lg:max-w-none lg:text-[2.85rem]">
          {o.title}
        </h2>
        <p className="mt-2 text-[1.15rem] font-semibold italic text-gold-ink lg:text-[1.4rem]">{o.lead}</p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {v2.proposals.map((p) => (
          <li key={p.n} className="flex gap-3.5 rounded-2xl bg-white p-4 shadow-[0_10px_30px_-18px_rgba(10,23,48,0.45)] ring-1 ring-paper-200 lg:flex-col lg:gap-3">
            <IconBadge icon={p.icon} size="sm" />
            <div>
              <p className="text-[1.1rem] font-bold leading-tight text-navy-900 lg:text-[1.15rem]">
                <span className="text-gold-500">{p.n}.</span> {p.title}
              </p>
              <p className="mt-1 text-[1rem] leading-snug text-ink-600 lg:text-[0.98rem]">{p.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <ValuesBar />
    </div>
  )
}

function PavingSlide() {
  const p = v2.paving
  return (
    <MediaSplit img="/assets/ruas/jose-de-oliveira-leite-1-antes.webp" alt="Rua José de Oliveira Leite, de terra, hoje">
      <ThemeHeader n={1} title={p.title} subtitle={p.subtitle} size="lg" />
      <ol className="space-y-3 lg:space-y-3.5">
        {p.steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-4 rounded-2xl bg-paper-100 p-3.5 ring-1 ring-paper-200 lg:p-4">
            <span className="display grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-400 text-[1.4rem] text-navy-900">{i + 1}</span>
            <div>
              <p className="text-[1.2rem] font-bold text-navy-900 lg:text-[1.35rem]">{s.title}</p>
              <p className="text-[1.05rem] leading-snug text-ink-700 lg:text-[1.1rem]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Banner lines={p.banner} />
    </MediaSplit>
  )
}

function SecuritySlide() {
  const s = v2.security
  return (
    <MediaSplit icon="shield" n={2} side="right">
      <div>
        <ThemeHeader n={2} title={s.title} subtitle={s.subtitle} size="lg" />
        <p className="mt-1 text-[1.1rem] text-ink-700 lg:text-[1.25rem]">{s.lead}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:gap-4">
        {s.items.map((it) => (
          <li key={it.title} className="flex gap-3.5 rounded-2xl bg-paper-100 p-4 ring-1 ring-paper-200">
            <IconBadge icon={it.icon} size="sm" />
            <div>
              <p className="text-[1.1rem] font-bold leading-tight text-navy-900 lg:text-[1.2rem]">{it.title}</p>
              <p className="mt-1 text-[1rem] leading-snug text-ink-700 lg:text-[1.02rem]">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-l-4 border-gold-400 pl-4 text-[1.15rem] font-bold italic text-navy-900 lg:text-[1.3rem]">{s.footer}</p>
    </MediaSplit>
  )
}

function TransparencySlide() {
  const t = v2.transparency
  return (
    <div className="slide-bg-sky flex flex-1 flex-col gap-8 px-6 py-8 text-white lg:flex-row lg:items-center lg:gap-12 lg:px-14">
      <div className="flex flex-1 flex-col gap-6">
        <ThemeHeader n={3} title={t.title} subtitle={t.subtitle} tone="light" size="sm" />
        <ul className="space-y-3">
          {t.items.map((it) => (
            <li key={it.title} className="flex items-center gap-4 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/20">
              <IconBadge icon={it.icon} size="sm" />
              <div>
                <p className="text-[1.15rem] font-bold lg:text-[1.3rem]">{it.title}</p>
                <p className="text-[1rem] leading-snug text-white/85 lg:text-[1.08rem]">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl bg-gold-400 px-6 py-3.5 text-center text-[1.2rem] font-bold text-navy-900 lg:text-[1.45rem]">
          {t.banner[0]} <em>{t.banner[1]}</em>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-4 lg:w-[19rem]">
        <div className="w-[15rem] rounded-[2.2rem] bg-navy-950 p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/20 lg:w-[16rem]">
          <Photo src="/assets/v2/app-transparencia.jpg" alt="Tela de transparência do aplicativo de demonstração" position="top" className="aspect-[9/17] rounded-[1.7rem]" />
        </div>
        <a
          href={t.appUrl}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[1rem] font-bold text-navy-900 lg:text-[1.05rem]"
        >
          <Smartphone size={19} strokeWidth={2.5} aria-hidden="true" />
          Veja o aplicativo
          <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
        </a>
        <p className="text-center text-[0.9rem] text-white/75">{t.appLabel} · demonstração</p>
      </div>
    </div>
  )
}

function HallSlide() {
  const h = v2.hall
  return (
    <MediaSplit icon="building" n={4}>
      <ThemeHeader n={4} title={h.title} subtitle={h.subtitle} size="lg" />
      <p className="text-[1.2rem] leading-snug text-ink-700 lg:text-[1.45rem]">{h.text}</p>
      <Points items={h.points} />
    </MediaSplit>
  )
}

function PruningProblemSlide() {
  const p = v2.pruning
  const [before, after] = p.title.split('R$ 350')
  return (
    <div className="flex flex-1 flex-col justify-center gap-5 bg-sun-50 px-6 py-8 lg:gap-6 lg:px-12">
      <div>
        <Kicker>Proposta 05 · Destinação das podas</Kicker>
        <h2 className="display mt-2 text-[clamp(2rem,8vw,3rem)] leading-[0.95] text-navy-900 lg:text-[3.6rem]">
          {before}
          <span className="rounded-xl bg-gold-400 px-2.5">R$&nbsp;350</span>
          {after}
        </h2>
        <p className="mt-3 text-[1.15rem] font-semibold text-ink-700 lg:text-[1.5rem]">{p.goal}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_15rem] lg:gap-5">
        <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-paper-200">
          <div className="p-5 lg:p-6">
            <p className="flex items-center gap-2 text-[1.1rem] font-bold tracking-[0.08em] text-red-700 uppercase lg:text-[1.2rem]">
              <TriangleAlert size={20} strokeWidth={2.5} aria-hidden="true" /> O problema hoje
            </p>
            <ul className="mt-3 space-y-3 text-[1.05rem] leading-snug text-ink-700 lg:text-[1.22rem]">
              {p.problem.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl bg-white ring-1 ring-paper-200">
          <div className="p-5 lg:p-6">
            <p className="flex items-center gap-2 text-[1.1rem] font-bold tracking-[0.08em] text-green-700 uppercase lg:text-[1.2rem]">
              <Leaf size={20} strokeWidth={2.5} aria-hidden="true" /> A nossa proposta
            </p>
            <ul className="mt-3 space-y-3 text-[1.05rem] leading-snug text-ink-700 lg:text-[1.22rem]">
              {p.proposal.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </article>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-navy-900 p-6 text-center text-white">
          <p className="text-[1rem] font-bold tracking-[0.14em] text-gold-300 uppercase">Redução estimada</p>
          <p className="display mt-2 text-[3rem] leading-none whitespace-nowrap text-gold-400 lg:text-[2.9rem]">80 a 90%</p>
          <p className="mt-3 text-[1.05rem] leading-snug text-white/85 lg:text-[1.15rem]">no custo da retirada para o morador</p>
        </div>
      </div>
    </div>
  )
}

function PruningFlowSlide() {
  const p = v2.pruning
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 bg-white px-6 py-8 lg:gap-7 lg:px-12">
      <div>
        <Kicker>Proposta 05 · Destinação das podas</Kicker>
        <h2 className="display mt-2 text-[clamp(2rem,8vw,3rem)] leading-[0.95] text-navy-900 lg:text-[3.2rem]">Como funciona a compostagem</h2>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {p.flow.map((f, i) => (
          <li key={f.title} className="relative flex gap-3 rounded-2xl bg-sun-50 p-4 ring-1 ring-sun-100 lg:mx-3 lg:flex-col lg:items-center lg:text-center">
            <span className="display grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-400 text-[1.5rem] text-navy-900">{i + 1}</span>
            <div>
              <p className="text-[1.2rem] font-bold text-navy-900 lg:text-[1.3rem]">{f.title}</p>
              <p className="mt-1 text-[1rem] leading-snug text-ink-700 lg:text-[1.05rem]">{f.text}</p>
            </div>
            {i < p.flow.length - 1 && (
              <ArrowRight
                size={26}
                strokeWidth={2.8}
                className="absolute top-1/2 -right-[1.45rem] hidden -translate-y-1/2 text-gold-500 lg:block"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:gap-6">
        <div className="rounded-2xl bg-paper-100 p-5 ring-1 ring-paper-200">
          <p className="mb-3 text-[1rem] font-bold tracking-[0.12em] text-brand-700 uppercase">O que o Aquarius ganha</p>
          <ul className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
            {p.gains.map((g) => (
              <li key={g} className="flex items-start gap-2 text-[1.02rem] leading-snug text-ink-700 lg:text-[1.05rem]">
                <Check size={19} strokeWidth={3} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-navy-900 px-6 py-5 text-white">
          <p className="display text-[1.5rem] leading-tight lg:text-[1.75rem]">{p.banner[0]}</p>
          <p className="display mt-1 text-[1.5rem] leading-tight text-gold-400 lg:text-[1.75rem]">{p.banner[1]}</p>
        </div>
      </div>
    </div>
  )
}

function BylawsSlide() {
  const b = v2.bylaws
  return (
    <MediaSplit icon="doc" n={6} side="right">
      <ThemeHeader n={6} title={b.title} subtitle={b.subtitle} size="md" />
      <p className="text-[1.2rem] leading-snug text-ink-700 lg:text-[1.35rem]">{b.text}</p>
      <ul className="space-y-3">
        {b.points.map((pt) => (
          <li key={pt.title} className="border-l-4 border-gold-400 pl-4">
            <p className="text-[1.15rem] font-bold text-navy-900 lg:text-[1.3rem]">{pt.title}</p>
            <p className="text-[1.02rem] leading-snug text-ink-700 lg:text-[1.12rem]">{pt.text}</p>
          </li>
        ))}
      </ul>
    </MediaSplit>
  )
}

function SimpleProposalSlide({ n, data, icon, side }) {
  return (
    <MediaSplit icon={icon} n={n} side={side} bg="bg-sun-50">
      <ThemeHeader n={n} title={data.title} subtitle={data.subtitle} size="md" />
      <p className="text-[1.2rem] leading-snug text-ink-700 lg:text-[1.45rem]">{data.text}</p>
      <Points items={data.points} />
    </MediaSplit>
  )
}

function ClubIcon({ icon, color }) {
  const Icon = ICONS[icon] ?? Sparkles
  return (
    <div aria-hidden="true" className={`grid h-24 place-items-center lg:h-36 ${color}`}>
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 ring-[3px] ring-white/80 lg:h-20 lg:w-20">
        <Icon className="h-8 w-8 text-white lg:h-10 lg:w-10" strokeWidth={2} />
      </span>
    </div>
  )
}

function ClubSlide() {
  const c = v2.club
  return (
    <div className="slide-bg-sky flex flex-1 flex-col justify-center gap-5 px-6 py-8 text-white lg:gap-6 lg:px-10">
      <div className="text-center">
        <Kicker tone="light">{c.overline}</Kicker>
        <h2 className="display mt-2 text-[clamp(2rem,8vw,3rem)] leading-[0.95] lg:text-[3.3rem]">{c.title}</h2>
        <p className="mt-2 text-[1.2rem] font-bold italic text-gold-300 lg:text-[1.45rem]">{c.subtitle}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3.5">
        {c.items.map((it) => (
          <li key={it.title} className="overflow-hidden rounded-2xl bg-white text-ink-900 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]">
            <ClubIcon icon={it.icon} color={it.color} />
            <div className="p-3 lg:p-3.5">
              <p className="text-[1.02rem] font-bold leading-tight text-navy-900 lg:text-[1.05rem]">{it.title}</p>
              <p className="mt-1 text-[0.92rem] leading-snug text-ink-600 lg:text-[0.9rem]">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap justify-center gap-2.5">
        {c.extras.map((e) => (
          <li key={e} className="rounded-full bg-white/12 px-4 py-1.5 text-[0.95rem] font-semibold ring-1 ring-white/25 lg:text-[1.02rem]">
            + {e}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NatureSlide() {
  const n = v2.nature
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-green-100 via-sun-50 to-white" />
      <Trees aria-hidden="true" strokeWidth={1.2} className="absolute -top-10 -right-10 h-80 w-80 text-green-700/10" />
      <Leaf aria-hidden="true" strokeWidth={1.2} className="absolute -bottom-12 -left-10 h-72 w-72 text-green-700/10" />
      <div className="relative flex flex-1 flex-col justify-center gap-5 px-6 py-8 lg:gap-8 lg:px-12">
        <div className="text-center">
          <h2 className="display text-[clamp(2rem,8vw,3rem)] leading-[0.95] text-navy-900 lg:text-[4rem]">{n.title}</h2>
          <p className="mt-2 text-[1.2rem] font-bold italic text-gold-ink lg:text-[1.7rem]">{n.subtitle}</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {n.items.map((it) => (
            <li key={it.title} className="flex gap-3.5 rounded-2xl bg-white/95 p-4 shadow-[0_10px_30px_-18px_rgba(10,23,48,0.5)] ring-1 ring-paper-200 lg:flex-col lg:items-center lg:gap-4 lg:p-6 lg:text-center">
              <IconBadge icon={it.icon} />
              <div>
                <p className="text-[1.1rem] font-bold leading-tight text-navy-900 lg:text-[1.3rem]">{it.title}</p>
                <p className="mt-1 text-[1rem] leading-snug text-ink-600 lg:mt-2 lg:text-[1.12rem]">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-center text-[1.15rem] font-bold italic text-navy-900 lg:text-[1.5rem]">{n.footer}</p>
        <ValuesBar />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ordem dos slides                                                    */
/* ------------------------------------------------------------------ */
const SLIDES_V2 = [
  { id: 'capa', label: 'Capa', render: () => <CoverSlide /> },
  ...members.map((m, i) => ({ id: m.id, label: m.name, render: () => <MemberSlide m={m} index={i} /> })),
  { id: 'propostas', label: 'Propostas de gestão', render: () => <OverviewSlide /> },
  { id: 'pavimentacao', label: '1. Pavimentação', render: () => <PavingSlide /> },
  { id: 'portaria', label: 'Antes e depois: portaria', render: () => <PortariaSlide /> },
  { id: 'antes-depois', label: 'Antes e depois: outras ruas', render: () => <StreetsCompareSlide /> },
  { id: 'compromisso', label: 'Nosso compromisso', render: () => <CommitmentSlide /> },
  { id: 'simule', label: 'Simule a sua rua', render: () => <SimulateSlide /> },
  { id: 'seguranca', label: '2. Segurança', render: () => <SecuritySlide /> },
  { id: 'transparencia', label: '3. Transparência', render: () => <TransparencySlide /> },
  { id: 'salao', label: '4. Salão do Clube', render: () => <HallSlide /> },
  { id: 'podas', label: '5. Podas: o problema', render: () => <PruningProblemSlide /> },
  { id: 'compostagem', label: '5. Podas: como funciona', render: () => <PruningFlowSlide /> },
  { id: 'estatuto', label: '6. Estatuto e Regimento', render: () => <BylawsSlide /> },
  {
    id: 'pets',
    label: '7. Pets',
    render: () => <SimpleProposalSlide n={7} data={v2.pets} icon="paw" />,
  },
  {
    id: 'correspondencias',
    label: '8. Correspondências',
    render: () => <SimpleProposalSlide n={8} data={v2.mail} icon="mail" side="right" />,
  },
  { id: 'clube', label: 'Clube: atividades', render: () => <ClubSlide /> },
  { id: 'natureza', label: 'Natureza e qualidade de vida', render: () => <NatureSlide /> },
  { id: 'fim', label: 'Encerramento', render: () => <ClosingSlide /> },
]

export function PresentationV2() {
  return <Presentation slides={SLIDES_V2} pdfUrl={PDF_URL_V2} pdfName="Aquarius-Sem-Buracos-Propostas-v2.pdf" />
}
