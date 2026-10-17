import { useState } from 'react'
import { motion } from 'motion/react'
import { Clock3, Home, MapPin, Plus, Users, Wallet } from 'lucide-react'
import { personById, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { uid } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Badge, Button, Card, Field, Input, Modal, Notice, PageHeader, Progress, Select, Tabs, Textarea, cx } from '../ui/kit.jsx'

/* Clubes criados pelos moradores: cada um diz onde acontece, quanto custa e
   quantas pessoas precisa para começar. Qualquer morador pode sugerir um. */

const CATEGORIAS = ['Cultura', 'Jogos', 'Esporte', 'Bem-estar', 'Música', 'Crianças', 'Outros']

const custoLabel = (c) => (c.custo ? `R$ ${c.custo.toLocaleString('pt-BR')} ${c.custoInfo || 'por mês'}` : 'Gratuito')
export const clubeAtivo = (c) => !c.minimo || c.inscritos.length >= c.minimo

export function Clubes() {
  const { db, user, mutate, toast } = useStore()
  const [tab, setTab] = useState('todos')
  const [suggest, setSuggest] = useState(false)

  const list = db.activities.filter((c) => (tab === 'todos' ? true : tab === 'ativos' ? clubeAtivo(c) : !clubeAtivo(c)))

  const toggle = (c) => {
    const inside = c.inscritos.includes(user.id)
    const willStart = !inside && !clubeAtivo(c) && c.inscritos.length + 1 >= c.minimo
    mutate(
      (d) => {
        const x = d.activities.find((y) => y.id === c.id)
        x.inscritos = inside ? x.inscritos.filter((p) => p !== user.id) : [...x.inscritos, user.id]
        if (willStart && c.organizadorId && c.organizadorId !== user.id)
          pushNotification(d, c.organizadorId, 'Seu clube vai começar!', `${c.titulo} atingiu o mínimo de ${c.minimo} participantes.`, 'morador/atividades')
      },
      { acao: inside ? 'Saiu do clube' : 'Entrou no clube', alvo: c.titulo },
    )
    toast(inside ? `Você saiu do ${c.titulo}` : willStart ? `${c.titulo} atingiu o mínimo e vai começar!` : `Você entrou no ${c.titulo}`)
  }

  return (
    <>
      <PageHeader
        overline="Convivência"
        title="Clubes"
        lead="Grupos dos moradores, em casa ou nos espaços do condomínio. Participe ou sugira o seu."
        actions={
          <Button variant="gold" icon={Plus} onClick={() => setSuggest(true)}>
            Sugerir um clube
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'todos', label: 'Todos', count: db.activities.length },
          { id: 'ativos', label: 'Acontecendo' },
          { id: 'formando', label: 'Em formação', count: db.activities.filter((c) => !clubeAtivo(c)).length },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c, i) => {
          const inside = c.inscritos.includes(user.id)
          const ativo = clubeAtivo(c)
          const full = c.vagas && c.inscritos.length >= c.vagas
          const falta = c.minimo ? c.minimo - c.inscritos.length : 0
          const org = c.organizadorId && personById(db, c.organizadorId)
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.45, ease: EASE.out }}>
              <Card className={cx('flex h-full flex-col', inside && 'ring-2 ring-gold-400')}>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="blue">{c.categoria}</Badge>
                  {inside ? <Badge tone="green">Você participa</Badge> : !ativo && <Badge tone="gold">Em formação</Badge>}
                </div>

                <p className="display mt-3 text-[1.25rem] leading-[1.1] text-ink-900">{c.titulo}</p>
                {c.descricao && <p className="mt-1.5 text-[0.84rem] text-ink-600">{c.descricao}</p>}

                <ul className="mt-3 space-y-1.5 text-[0.8rem] text-ink-700">
                  <li className="flex items-start gap-2">
                    {c.onde === 'casa' ? <Home size={14} className="mt-0.5 shrink-0 text-brand-600" /> : <MapPin size={14} className="mt-0.5 shrink-0 text-brand-600" />}
                    {c.local}
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock3 size={14} className="mt-0.5 shrink-0 text-brand-600" />
                    {c.quando}
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet size={14} className="mt-0.5 shrink-0 text-brand-600" />
                    <span className={c.custo ? '' : 'font-semibold text-brand-700'}>{custoLabel(c)}</span>
                  </li>
                </ul>

                <div className="mt-4 flex-1">
                  <div className="mb-1 flex justify-between gap-2 text-[0.75rem] text-ink-500">
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {c.inscritos.length} {c.inscritos.length === 1 ? 'participante' : 'participantes'}
                    </span>
                    <span>{ativo ? (c.vagas ? `${c.vagas - c.inscritos.length} vagas` : '') : `faltam ${falta} para começar`}</span>
                  </div>
                  <Progress value={ativo ? (c.vagas ? (c.inscritos.length / c.vagas) * 100 : 100) : (c.inscritos.length / c.minimo) * 100} tone={ativo ? 'brand' : 'gold'} />
                  {c.minimo > 0 && <p className="mt-1 text-[0.72rem] text-ink-500">Mínimo de {c.minimo} pessoas para começar</p>}
                </div>

                {org && <p className="mt-3 text-[0.72rem] text-ink-500">Sugerido por {org.id === user.id ? 'você' : org.nome}</p>}

                <Button variant={inside ? 'outline' : 'gold'} className="mt-3" disabled={!inside && full} onClick={() => toggle(c)}>
                  {inside ? 'Sair do clube' : full ? 'Lotado' : 'Quero participar'}
                </Button>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {suggest && <SuggestModal onClose={() => setSuggest(false)} />}
    </>
  )
}

function SuggestModal({ onClose }) {
  const { db, user, mutate, toast } = useStore()
  const unit = unitById(db, user.unitId)
  const [f, setF] = useState({ titulo: '', categoria: 'Cultura', descricao: '', onde: 'casa', area: 'Salão do clube', quando: '', pago: false, custo: '', custoInfo: 'por mês', minimo: 5, vagas: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const espacos = ['Salão do clube', ...db.areas.filter((a) => a.ativo && a.nome !== 'Salão de festas').map((a) => a.nome)]

  const submit = (e) => {
    e.preventDefault()
    const local = f.onde === 'casa' ? `Casa de ${user.nome.split(' ')[0]} · ${unitLabel(unit)}` : f.area
    mutate(
      (d) => {
        d.activities.unshift({
          id: uid('at'), titulo: f.titulo, categoria: f.categoria, descricao: f.descricao, onde: f.onde === 'casa' ? 'casa' : f.area === 'Salão do clube' ? 'salao' : 'area',
          local, quando: f.quando, custo: f.pago ? Number(f.custo) || 0 : 0, custoInfo: f.pago ? f.custoInfo : '', minimo: Number(f.minimo) || 0,
          vagas: Number(f.vagas) || 0, inscritos: [user.id], responsavel: user.nome, organizadorId: user.id, criadoEm: new Date().toISOString(),
        })
        pushNotification(d, 'admin', 'Novo clube sugerido', `${f.titulo} · por ${user.nome}`, 'admin/atividades')
      },
      { acao: 'Sugeriu um clube', alvo: f.titulo },
    )
    toast('Clube publicado! Agora é só chamar os vizinhos.')
    onClose()
  }

  const opt = (on) => cx('flex-1 rounded-xl px-3 py-2.5 text-[0.84rem] font-semibold ring-1 ring-inset', on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-700 ring-paper-300 hover:bg-paper-100')

  return (
    <Modal
      open
      onClose={onClose}
      title="Sugerir um clube"
      wide
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="gold" type="submit" form="form-clube">
            Publicar clube
          </Button>
        </>
      }
    >
      <form id="form-clube" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do clube" className="sm:col-span-2">
          <Input value={f.titulo} onChange={set('titulo')} required placeholder="Ex.: Clube do livro" />
        </Field>
        <Field label="Categoria">
          <Select value={f.categoria} onChange={set('categoria')} options={CATEGORIAS} />
        </Field>
        <Field label="Quando">
          <Input value={f.quando} onChange={set('quando')} required placeholder="Ex.: Sextas · 19h" />
        </Field>
        <Field label="Sobre o clube" optional className="sm:col-span-2">
          <Textarea rows={2} value={f.descricao} onChange={set('descricao')} placeholder="O que o grupo vai fazer" />
        </Field>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-700">Onde vai acontecer</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className={opt(f.onde === 'casa')} onClick={() => setF({ ...f, onde: 'casa' })} aria-pressed={f.onde === 'casa'}>
              Na minha casa
            </button>
            <button type="button" className={opt(f.onde === 'espaco')} onClick={() => setF({ ...f, onde: 'espaco' })} aria-pressed={f.onde === 'espaco'}>
              Num espaço do condomínio
            </button>
          </div>
          {f.onde === 'espaco' ? (
            <div className="mt-2">
              <Select value={f.area} onChange={set('area')} options={espacos} aria-label="Espaço" />
            </div>
          ) : (
            <p className="mt-1.5 text-[0.76rem] text-ink-500">Aparece como "Casa de {user.nome.split(' ')[0]} · {unitLabel(unit)}".</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-700">Tem custo?</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className={opt(!f.pago)} onClick={() => setF({ ...f, pago: false })} aria-pressed={!f.pago}>
              Gratuito
            </button>
            <button type="button" className={opt(f.pago)} onClick={() => setF({ ...f, pago: true })} aria-pressed={f.pago}>
              Tem custo
            </button>
          </div>
          {f.pago && (
            <div className="mt-2 grid grid-cols-[120px_1fr] gap-2">
              <Input type="number" min={1} value={f.custo} onChange={set('custo')} placeholder="R$" required aria-label="Valor em reais" />
              <Input value={f.custoInfo} onChange={set('custoInfo')} placeholder="por mês, pago ao professor…" aria-label="Detalhe do custo" />
            </div>
          )}
        </div>

        <Field label="Mínimo para começar" hint="O clube só começa quando atingir esse número.">
          <Input type="number" min={1} value={f.minimo} onChange={set('minimo')} required />
        </Field>
        <Field label="Máximo de participantes" optional>
          <Input type="number" min={1} value={f.vagas} onChange={set('vagas')} placeholder="Sem limite" />
        </Field>

        <Notice className="sm:col-span-2">Você entra como primeiro participante. Os vizinhos veem o clube na hora e podem participar.</Notice>
      </form>
    </Modal>
  )
}
