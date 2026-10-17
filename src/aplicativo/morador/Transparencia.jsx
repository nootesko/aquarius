import { useState } from 'react'
import { motion } from 'motion/react'
import { FileDown, FileText, PiggyBank, ShieldCheck, TrendingDown, Wallet } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { fmtDate } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Badge, Card, Notice, PageHeader, SectionTitle, Select, Stat, Tabs, cx } from '../ui/kit.jsx'

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function Transparencia() {
  const [tab, setTab] = useState('financas')
  return (
    <>
      <PageHeader overline="Transparência" title="Prestação de contas" lead="Para onde vai o dinheiro do condomínio, com os documentos oficiais disponíveis a qualquer hora." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'financas', label: 'Resumo financeiro' },
          { id: 'documentos', label: 'Documentos' },
        ]}
      />
      {tab === 'financas' ? <Financas /> : <Documentos />}
    </>
  )
}

function Financas() {
  const { db } = useStore()
  const f = db.finance
  const last = f.meses.at(-1)
  const max = Math.max(...f.meses.flatMap((m) => [m.receitas, m.despesas]))
  const totalDesp = f.despesasMes.reduce((a, b) => a + b.valor, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Saldo em caixa" value={brl(f.saldoCaixa)} icon={Wallet} tone="navy" />
        <Stat label="Fundo de reserva" value={brl(f.fundoReserva)} icon={PiggyBank} tone="green" />
        <Stat label={`Resultado de ${last.mes.toLowerCase()}`} value={brl(last.receitas - last.despesas)} icon={TrendingDown} tone={last.receitas >= last.despesas ? 'green' : 'red'} />
        <Stat label="Inadimplência" value={`${f.inadimplencia.toLocaleString('pt-BR')}%`} icon={FileText} tone="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle>Receitas × despesas · últimos 6 meses</SectionTitle>
          <div className="flex h-56 items-end gap-3 border-b border-paper-300 pb-px sm:gap-5" role="img" aria-label="Gráfico de receitas e despesas mensais">
            {f.meses.map((m, i) => (
              <div key={m.mes} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex h-full items-end justify-center gap-1">
                  {[
                    ['receitas', 'bg-brand-500'],
                    ['despesas', 'bg-gold-400'],
                  ].map(([k, cls], j) => (
                    <motion.div
                      key={k}
                      title={`${k}: ${brl(m[k])}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${(m[k] / max) * 100}%` }}
                      transition={{ delay: i * 0.06 + j * 0.03, duration: 0.7, ease: EASE.out }}
                      className={cx('w-full max-w-7 rounded-t-md', cls)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 sm:gap-5">
            {f.meses.map((m) => (
              <span key={m.mes} className="flex-1 text-center text-[0.75rem] font-semibold text-ink-500">
                {m.mes}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-[0.78rem] text-ink-600">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-500" /> Receitas</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold-400" /> Despesas</span>
          </div>
        </Card>

        <Card>
          <SectionTitle>Despesas de {last.mes.toLowerCase()} · {brl(totalDesp)}</SectionTitle>
          <ul className="space-y-3">
            {f.despesasMes.map((d, i) => (
              <li key={d.item}>
                <div className="mb-1 flex justify-between gap-3 text-[0.84rem]">
                  <span className="text-ink-700">{d.item}</span>
                  <span className="font-bold text-ink-900">{brl(d.valor)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-paper-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(d.valor / totalDesp) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.7, ease: EASE.out }} className="h-full rounded-full bg-brand-700" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Notice tone="gold" icon={ShieldCheck}>
        <b>Salvaguarda:</b> gastos acima de {brl(f.limiteSemAssembleia)} só acontecem com aprovação dos proprietários em votação ou assembleia. Veja em <a href="#/morador/votacoes" className="font-semibold underline">Votações</a>.
      </Notice>
    </div>
  )
}

function Documentos() {
  const { db, toast } = useStore()
  const [cat, setCat] = useState('Todos')
  const [year, setYear] = useState('Todos')
  const cats = ['Todos', ...new Set(db.documents.map((d) => d.categoria))]
  const years = ['Todos', ...[...new Set(db.documents.map((d) => d.ano))].sort((a, b) => b - a).map(String)]
  const docs = db.documents.filter((d) => (cat === 'Todos' || d.categoria === cat) && (year === 'Todos' || String(d.ano) === year))

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="scroll-track flex gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold ring-1 ring-inset', cat === c ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-700 ring-paper-300 hover:bg-paper-100')}
            >
              {c}
            </button>
          ))}
        </div>
        <Select value={year} onChange={(e) => setYear(e.target.value)} options={years.map((y) => ({ value: y, label: y === 'Todos' ? 'Todos os anos' : y }))} aria-label="Ano" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.4, ease: EASE.out }}>
            <Card onClick={() => toast(`Download de "${d.titulo}" (demonstração)`)} className="flex items-center gap-4">
              <span className="grid h-12 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-[0.65rem] font-bold text-brand-700 ring-1 ring-brand-100 ring-inset">PDF</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{d.titulo}</p>
                <p className="text-[0.78rem] text-ink-500">
                  {d.periodo} · {d.tamanho} · publicado em {fmtDate(d.publicadoEm)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge tone="blue">{d.categoria}</Badge>
                {d.versao > 1 && <span className="text-[0.7rem] text-ink-500">versão {d.versao}</span>}
              </div>
              <FileDown size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  )
}
