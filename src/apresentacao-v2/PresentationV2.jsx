import {
  ArrowRight, BookOpen, Building2, Car, Cctv, ChartColumn, Check, Dices, FileCheck2, FileText, Handshake, IdCard, Leaf, Mail, MessagesSquare, Music,
  PawPrint, Route, ShieldCheck, Smartphone, Sparkles, Trees, Trophy, Users, Volleyball, Waves,
} from 'lucide-react'
import { members, v2 } from '../content.js'
import {
  BUTTON, ClosingSlide, CommitmentSlide, CoverSlide, Kicker, MemberSlide, PortariaSlide, Presentation, SimulateSlide, StreetsCompareSlide,
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
/* ------------------------------------------------------------------ */
/* Sistema visual enxuto: poucos estilos, repetidos em todos os slides. */
/*   título (Archivo) · subtítulo · texto · título e texto de card      */
/*   uma cor de destaque só: o azul dos ícones (brand-500).            */
/* ------------------------------------------------------------------ */
const T = {
  title: 'display text-[clamp(2.1rem,8.5vw,3.2rem)] leading-[0.95] lg:text-[3.4rem]',
  sub: 'text-[1.2rem] font-semibold leading-snug lg:text-[1.45rem]',
  body: 'text-[1.1rem] leading-snug lg:text-[1.25rem]',
  cardTitle: 'text-[1.1rem] font-bold leading-tight lg:text-[1.2rem]',
  cardText: 'mt-1 text-[1rem] leading-snug lg:text-[1.05rem]',
  card: 'rounded-2xl bg-white ring-1 ring-paper-200 shadow-[0_10px_30px_-20px_rgba(10,23,48,0.4)]',
}
const ink = (tone) => (tone === 'light' ? 'text-white' : 'text-navy-900')
const inkSoft = (tone) => (tone === 'light' ? 'text-white/85' : 'text-ink-700')

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

/* Círculo azul-claro com o ícone em branco. */
function IconBadge({ icon, size = 'md' }) {
  const Icon = ICONS[icon] ?? Sparkles
  const box = size === 'sm' ? 'h-11 w-11' : 'h-12 w-12 lg:h-13 lg:w-13'
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-brand-500 text-white ${box}`}>
      <Icon size={size === 'sm' ? 20 : 24} strokeWidth={2.1} aria-hidden="true" />
    </span>
  )
}

/* Número de passo: mesmo círculo azul dos ícones. */
function NumberBadge({ n }) {
  return <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500 text-[1.2rem] font-bold text-white">{n}</span>
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

function ThemeHeader({ n, kicker, title, subtitle, tone = 'dark', center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {(kicker || n) && <Kicker tone={tone}>{kicker ?? `Proposta ${String(n).padStart(2, '0')}`}</Kicker>}
      <h2 className={`${T.title} mt-2 ${ink(tone)}`}>{title}</h2>
      {subtitle && <p className={`${T.sub} mt-3 ${inkSoft(tone)}`}>{subtitle}</p>}
    </div>
  )
}

function Points({ items }) {
  return (
    <ul className="space-y-2.5 lg:space-y-3">
      {items.map((t) => (
        <li key={t} className={`flex items-start gap-3 ${T.body} text-ink-700`}>
          <Check size={22} strokeWidth={3} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  )
}

/* Antes e depois na mesma foto, cortados na diagonal: "antes" à esquerda, "depois" à direita. */
function DiagonalCompare({ before, after, alt, position = '30% 50%', className = '' }) {
  /* position: as duas fotos usam o mesmo recorte, centrado na rua, para o corte diagonal passar por ela. */
  const cut = 'polygon(64% 0, 100% 0, 100% 100%, 36% 100%)'
  const chip = 'absolute rounded-full px-3 py-1 text-[0.85rem] font-bold tracking-[0.12em] uppercase lg:text-[0.95rem]'
  return (
    <div className={`relative overflow-hidden bg-paper-200 ${className}`}>
      <img src={before} alt={`${alt}: antes`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
      <img src={after} alt={`${alt}: simulação de como pode ficar`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position, clipPath: cut }} />
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="64" y1="0" x2="36" y2="100" stroke="white" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
      </svg>
      <span className={`${chip} top-4 left-4 bg-navy-950/80 text-white`}>Antes</span>
      <span className={`${chip} right-4 bottom-4 bg-gold-400 text-navy-900`}>Como pode ficar</span>
    </div>
  )
}

/* Card com ícone ao lado do texto (usado em todas as listas de itens). */
function ItemCard({ icon, title, text, tone = 'dark' }) {
  const box = tone === 'light' ? 'rounded-2xl bg-white/10 ring-1 ring-white/20' : T.card
  return (
    <li className={`flex items-center gap-4 px-4 py-3.5 lg:px-5 ${box}`}>
      <IconBadge icon={icon} />
      <div>
        <p className={`${T.cardTitle} ${ink(tone)}`}>{title}</p>
        <p className={`${T.cardText} ${tone === 'light' ? 'text-white/85' : 'text-ink-600'}`}>{text}</p>
      </div>
    </li>
  )
}

/* Painel com o ícone da proposta em destaque, no lugar de uma foto. */
function IconPanel({ icon, className = '' }) {
  const Icon = ICONS[icon] ?? Sparkles
  return (
    <div aria-hidden="true" className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-sky-600 to-sky-900 ${className}`}>
      <span className="relative grid h-32 w-32 place-items-center rounded-full bg-brand-500 text-white ring-[6px] ring-white/90 lg:h-56 lg:w-56 lg:ring-8">
        <Icon className="h-16 w-16 lg:h-24 lg:w-24" strokeWidth={1.8} />
      </span>
    </div>
  )
}

/* Meia tela de foto (ou ícone) + meia de conteúdo. No celular, a imagem fica em cima. */
function MediaSplit({ img, alt, icon, position, media: custom, side = 'left', children }) {
  const media = `shrink-0 lg:h-auto lg:w-[36%] ${side === 'right' ? 'lg:order-2' : ''}`
  return (
    <div className="flex flex-1 flex-col bg-white lg:flex-row">
      {custom ? (
        custom(`h-[34vh] ${media}`)
      ) : img ? (
        <Photo src={img} alt={alt} position={position} className={`h-[34vh] ${media}`} />
      ) : (
        <IconPanel icon={icon} className={`h-[24vh] ${media}`} />
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
    <div className="flex flex-1 flex-col justify-center gap-7 bg-white px-6 py-8 lg:gap-9 lg:px-16">
      <div className="text-center">
        {/* Mesma etiqueta amarela de "Presidente" / "Vice-presidente" nos slides da chapa. */}
        <span className="inline-block rounded-full bg-gold-400 px-4 py-1.5 text-[1rem] font-bold tracking-[0.1em] text-navy-900 uppercase lg:text-[1.3rem]">
          {o.overline}
        </span>
        <h2 className={`${T.title} mx-auto mt-4 max-w-[20ch] text-navy-900 lg:max-w-none lg:text-[2.85rem]`}>{o.title}</h2>
      </div>
      {/* Duas colunas de quatro, todos os cards do mesmo tamanho (auto-rows-fr iguala as linhas pela mais alta). */}
      <ol className="grid auto-rows-fr gap-3 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
        {v2.proposals.map((p) => (
          <ItemCard key={p.n} icon={p.icon} title={`${p.n}. ${p.title}`} text={p.text} />
        ))}
      </ol>
    </div>
  )
}

function PavingSlide() {
  const p = v2.paving
  return (
    <MediaSplit
      media={(cls) => (
        <DiagonalCompare
          before="/assets/ruas/jose-de-oliveira-leite-1-antes.webp"
          after="/assets/ruas/jose-de-oliveira-leite-1-depois.webp"
          alt="Rua José de Oliveira Leite"
          className={cls}
        />
      )}
    >
      <ThemeHeader n={1} title={p.title} subtitle={p.subtitle} />
      <ol className="grid auto-rows-fr gap-3">
        {p.steps.map((s, i) => (
          <li key={s.title} className={`flex items-center gap-4 px-4 py-3.5 ${T.card}`}>
            <NumberBadge n={i + 1} />
            <div>
              <p className={`${T.cardTitle} text-navy-900`}>{s.title}</p>
              <p className={`${T.cardText} text-ink-600`}>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </MediaSplit>
  )
}

function SecuritySlide() {
  const s = v2.security
  return (
    <MediaSplit img="/assets/v2/seguranca-poste.jpg" alt="Poste com câmeras de segurança numa rua arborizada" position="55% 30%" side="right">
      <ThemeHeader n={2} title={s.title} subtitle={s.subtitle} />
      <ul className="grid auto-rows-fr gap-3">
        {s.items.map((it) => (
          <ItemCard key={it.title} {...it} />
        ))}
      </ul>
    </MediaSplit>
  )
}

function TransparencySlide() {
  const t = v2.transparency
  return (
    <div className="slide-bg-sky flex flex-1 flex-col gap-8 overflow-hidden px-6 pt-8 text-white lg:flex-row lg:gap-10 lg:px-14">
      <div className="flex flex-1 flex-col justify-center gap-6 lg:pb-8">
        <ThemeHeader n={3} title={t.title} subtitle={t.subtitle} tone="light" />
        <ul className="grid auto-rows-fr gap-3">
          {t.items.map((it) => (
            <ItemCard key={it.title} {...it} tone="light" />
          ))}
        </ul>
        <a href={t.appUrl} target="_blank" rel="noopener noreferrer" className={`${BUTTON} self-start`}>
          <Smartphone size={22} strokeWidth={2.6} aria-hidden="true" />
          Acessar o aplicativo
        </a>
      </div>

      {/* Celular grande com o print real do aplicativo: a foto passa das bordas e a mão fica cortada embaixo. */}
      <div className="relative flex shrink-0 justify-center lg:w-[24rem] lg:self-stretch">
        <img
          src="/assets/v2/app-celular.webp"
          alt="Celular mostrando a tela inicial do aplicativo do Aquarius"
          className="w-[22rem] max-w-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)] lg:absolute lg:top-[-6.5rem] lg:left-1/2 lg:w-[42rem] lg:-translate-x-1/2"
        />
      </div>
    </div>
  )
}

function HallSlide() {
  const h = v2.hall
  return (
    <MediaSplit img="/assets/v2/piscina-aquarius.jpg" alt="Piscina do clube do Residencial Aquarius" position="50% 60%">
      <ThemeHeader n={4} title={h.title} subtitle={h.subtitle} />
      <p className={`${T.body} text-ink-700`}>{h.text}</p>
      <Points items={h.points} />
    </MediaSplit>
  )
}

function PruningProblemSlide() {
  const p = v2.pruning
  /* Comparação lado a lado: cada problema de hoje na mesma linha da resposta da proposta. */
  const rows = p.problem.map((today, i) => [today, p.proposal[i]])
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 bg-white px-6 py-8 lg:gap-8 lg:px-12">
      <ThemeHeader kicker="Proposta 05 · Destinação das podas" title={p.title.replaceAll('R$ ', 'R$\u00a0')} subtitle={p.goal.replaceAll('R$ ', 'R$\u00a0')} />
      <div className="grid gap-3 lg:grid-cols-[1fr_2.5rem_1fr] lg:gap-x-3 lg:gap-y-3">
        <p className={`${T.cardTitle} hidden text-ink-600 lg:block`}>Hoje</p>
        <span className="hidden lg:block" />
        <p className={`${T.cardTitle} hidden text-navy-900 lg:block`}>Com a proposta</p>
        {rows.map(([today, plan]) => (
          <div key={today} className="contents">
            <p className={`flex items-center rounded-2xl bg-paper-100 px-5 py-4 ${T.cardText} mt-0 text-ink-600`}>{today}</p>
            <ArrowRight size={26} strokeWidth={2.6} className="hidden self-center justify-self-center text-brand-500 lg:block" aria-hidden="true" />
            <p className={`flex items-center gap-3 px-5 py-4 ${T.card} ${T.cardText} mt-0 font-semibold text-navy-900`}>
              <Check size={22} strokeWidth={3} className="shrink-0 text-green-600" aria-hidden="true" />
              {plan}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PruningFlowSlide() {
  const p = v2.pruning
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 bg-white px-6 py-8 lg:gap-8 lg:px-12">
      <ThemeHeader kicker="Proposta 05 · Destinação das podas" title="Como funciona a compostagem" />
      {/* Passos em 2×2 à esquerda; os ganhos em lista ao lado, na mesma altura. */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <ol className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:gap-4">
          {p.flow.map((f, i) => (
            <li key={f.title} className={`flex items-start gap-4 px-5 py-4 ${T.card}`}>
              <NumberBadge n={i + 1} />
              <div>
                <p className={`${T.cardTitle} text-navy-900`}>{f.title}</p>
                <p className={`${T.cardText} text-ink-600`}>{f.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col justify-center rounded-2xl bg-sky-50 px-6 py-5 ring-1 ring-sky-100">
          <p className={`${T.cardTitle} text-navy-900`}>O que o Aquarius ganha</p>
          <ul className="mt-4 space-y-3">
            {p.gains.map((g) => (
              <li key={g} className={`flex items-start gap-3 ${T.cardText} mt-0 text-ink-700`}>
                <Check size={20} strokeWidth={3} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function BylawsSlide() {
  const b = v2.bylaws
  return (
    <MediaSplit img="/assets/v2/estatuto-maos.jpg" alt="Várias mãos levantadas numa votação" position="50% 45%" side="right">
      <ThemeHeader n={6} title={b.title} subtitle={b.subtitle} />
      <p className={`${T.body} text-ink-700`}>{b.text}</p>
      <ul className="space-y-3">
        {b.points.map((pt) => (
          <li key={pt.title} className="flex items-start gap-3">
            <Check size={22} strokeWidth={3} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
            <div>
              <p className={`${T.cardTitle} text-navy-900`}>{pt.title}</p>
              <p className={`${T.cardText} text-ink-600`}>{pt.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </MediaSplit>
  )
}

function SimpleProposalSlide({ n, data, icon, img, alt, position, side }) {
  return (
    <MediaSplit icon={icon} img={img} alt={alt} position={position} side={side}>
      <ThemeHeader n={n} title={data.title} subtitle={data.subtitle} />
      <p className={`${T.body} text-ink-700`}>{data.text}</p>
      <Points items={data.points} />
    </MediaSplit>
  )
}

function ClubSlide() {
  const c = v2.club
  return (
    <div className="slide-bg-sky flex flex-1 flex-col text-white lg:flex-row">
      {/* Foto real da quadra do Aquarius. */}
      <Photo src="/assets/v2/quadra-aquarius.jpg" alt="Quadra poliesportiva do Residencial Aquarius" position="28% 70%" className="h-[30vh] shrink-0 lg:h-auto lg:w-[30%]" />
      <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8 lg:gap-7 lg:px-12">
        <ThemeHeader kicker={c.overline} title={c.title} subtitle={c.subtitle} tone="light" />
        <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:gap-3.5">
          {c.items.map((it) => (
            <ItemCard key={it.title} icon={it.icon} title={it.title} text={it.text} />
          ))}
        </ul>
        <p className={`${T.sub} text-white/90`}>E também: {c.extras.join(' · ')}</p>
      </div>
    </div>
  )
}

function NatureSlide() {
  const n = v2.nature
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Faixa com a foto real do lago do Aquarius; o título fica sobre a foto. */}
      <div className="relative flex h-[34vh] shrink-0 items-end overflow-hidden lg:h-[54%]">
        <img src="/assets/v2/lago-aquarius.jpg" alt="Lago do Residencial Aquarius ao entardecer" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
        <div className="relative px-6 pb-6 lg:px-12 lg:pb-7">
          <h2 className={`${T.title} text-white`}>{n.title}</h2>
          <p className={`${T.sub} mt-2 text-white/90`}>{n.subtitle}</p>
        </div>
      </div>
      <div className="flex flex-1 items-center px-6 py-6 lg:px-12">
        <ul className="grid w-full auto-rows-fr gap-3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
          {n.items.map((it) => (
            <ItemCard key={it.title} {...it} />
          ))}
        </ul>
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
    render: () => <SimpleProposalSlide n={7} data={v2.pets} icon="paw" img="/assets/v2/pets-caramelo.jpg" alt="Cachorro caramelo e gato malhado sentados lado a lado na grama" position="45% 68%" />,
  },
  {
    id: 'correspondencias',
    label: '8. Correspondências',
    render: () => <SimpleProposalSlide n={8} data={v2.mail} icon="mail" img="/assets/v2/carteiro-portao.jpg" alt="Carteiro entregando uma carta em mãos para uma senhora no portão de uma chácara" position="50% 48%" side="right" />,
  },
  { id: 'clube', label: 'Clube: atividades', render: () => <ClubSlide /> },
  { id: 'natureza', label: 'Natureza e qualidade de vida', render: () => <NatureSlide /> },
  { id: 'fim', label: 'Encerramento', render: () => <ClosingSlide /> },
]

export function PresentationV2() {
  return <Presentation slides={SLIDES_V2} pdfUrl={PDF_URL_V2} pdfName="Aquarius-Sem-Buracos-Propostas-v2.pdf" />
}
