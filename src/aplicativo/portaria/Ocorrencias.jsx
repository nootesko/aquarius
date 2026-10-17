import { useState } from 'react'
import { CheckCircle2, ClipboardList, MapPin, Plus, Siren } from 'lucide-react'
import { pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDateTime, timeAgo, uid } from '../lib/format.js'
import { Badge, Button, Card, Empty, Field, Input, Modal, Notice, PageHeader, Select, StatusBadge, Tabs, Textarea } from '../ui/kit.jsx'
import { unitOptions } from './Acessos.jsx'

const CATEGORIAS = ['Segurança', 'Manutenção', 'Barulho', 'Áreas comuns', 'Veículos', 'Animais', 'Outros']

/* ---------- Ocorrências de portaria ---------- */

export function Ocorrencias() {
  const { db, mutate, user, toast } = useStore()
  const [tab, setTab] = useState('abertas')
  const [open, setOpen] = useState(false)
  const empty = { titulo: '', categoria: 'Segurança', descricao: '', unitId: '' }
  const [f, setF] = useState(empty)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const list = db.incidents.filter((o) => (tab === 'abertas' ? o.status !== 'resolvida' : o.status === 'resolvida'))

  const salvar = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        d.incidents.unshift({ id: uid('oc'), ...f, unitId: f.unitId || null, em: new Date().toISOString(), porteiro: user.nome, status: 'encaminhada' })
        pushNotification(d, 'admin', `Ocorrência: ${f.categoria}`, f.titulo, 'admin/ocorrencias')
      },
      { acao: 'Registrou ocorrência', alvo: f.titulo },
    )
    toast('Ocorrência registrada e enviada à administração')
    setF(empty)
    setOpen(false)
  }

  const resolver = (o) => {
    mutate(
      (d) => {
        d.incidents.find((x) => x.id === o.id).status = 'resolvida'
      },
      { acao: 'Encerrou ocorrência', alvo: o.titulo },
    )
    toast('Ocorrência marcada como resolvida')
  }

  return (
    <>
      <PageHeader
        overline="Portaria"
        title="Ocorrências"
        lead="Registre problemas do turno. A administração é avisada na hora."
        actions={
          <Button variant="gold" size="lg" icon={Plus} onClick={() => setOpen(true)}>
            Nova ocorrência
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'abertas', label: 'Em aberto', count: db.incidents.filter((o) => o.status !== 'resolvida').length },
          { id: 'resolvidas', label: 'Resolvidas' },
        ]}
      />

      {list.length === 0 ? (
        <Empty icon={ClipboardList} title="Nenhuma ocorrência aqui" />
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={o.categoria === 'Segurança' ? 'red' : 'blue'}>{o.categoria}</Badge>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="font-bold text-ink-900">{o.titulo}</p>
                  <p className="mt-1 text-[0.88rem] text-ink-700">{o.descricao}</p>
                  <p className="mt-2 text-[0.76rem] text-ink-500">
                    {fmtDateTime(o.em)} · {o.porteiro}
                    {o.unitId ? ` · ${unitLabel(unitById(db, o.unitId))}` : ''}
                  </p>
                </div>
                {o.status !== 'resolvida' && (
                  <Button variant="outline" icon={CheckCircle2} onClick={() => resolver(o)}>
                    Resolvida
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova ocorrência"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-ocorrencia" variant="gold">
              Registrar e avisar
            </Button>
          </>
        }
      >
        <form id="form-ocorrencia" onSubmit={salvar} className="space-y-4">
          <Field label="O que aconteceu?">
            <Input value={f.titulo} onChange={set('titulo')} required placeholder="Ex.: portão travando" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <Select value={f.categoria} onChange={set('categoria')} options={CATEGORIAS} />
            </Field>
            <Field label="Casa envolvida" optional>
              <Select value={f.unitId} onChange={set('unitId')} options={[{ value: '', label: 'Nenhuma' }, ...unitOptions(db).slice(1)]} />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea value={f.descricao} onChange={set('descricao')} required placeholder="Horário, pessoas, o que foi feito…" />
          </Field>
        </form>
      </Modal>
    </>
  )
}

/* ---------- Alertas de segurança (monitoramento solidário) ---------- */

export function Alertas() {
  const { db, mutate, toast } = useStore()
  const [sel, setSel] = useState(null)
  const [resposta, setResposta] = useState('')
  const pend = db.alerts.filter((a) => a.status !== 'verificado')
  const done = db.alerts.filter((a) => a.status === 'verificado')

  const verificar = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        const a = d.alerts.find((x) => x.id === sel.id)
        a.status = 'verificado'
        a.resposta = resposta
        const autor = d.persons.find((p) => p.nome === a.autor)
        if (autor) pushNotification(d, autor.id, 'Denúncia verificada pela portaria', resposta, 'morador/seguranca')
      },
      { acao: 'Verificou denúncia', alvo: sel.tipo },
    )
    toast('Denúncia verificada e morador avisado')
    setSel(null)
    setResposta('')
  }

  const Item = ({ a }) => (
    <Card className={a.status !== 'verificado' ? 'ring-2 ring-gold-400' : ''}>
      <div className="flex flex-wrap items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${a.status !== 'verificado' ? 'bg-gold-400 text-navy-900' : 'bg-paper-100 text-ink-500'}`}>
          <Siren size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-ink-900">{a.tipo}</p>
            <StatusBadge status={a.status === 'verificado' ? 'verificado' : 'novo'} />
          </div>
          <p className="mt-1 text-[0.9rem] text-ink-700">{a.descricao}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[0.78rem] text-ink-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {a.local}
            </span>
            <span>
              {a.autor} · {timeAgo(a.em)}
            </span>
          </p>
          {a.resposta && <Notice tone="green" icon={CheckCircle2} className="mt-3">{a.resposta}</Notice>}
        </div>
        {a.status !== 'verificado' && (
          <Button variant="gold" size="lg" onClick={() => setSel(a)}>
            Fiz a verificação
          </Button>
        )}
      </div>
    </Card>
  )

  return (
    <>
      <PageHeader overline="Monitoramento solidário" title="Denúncias" lead="Denúncias enviadas pelos moradores. Verifique, faça a ronda e responda." />
      {pend.length === 0 && <Notice tone="green" icon={CheckCircle2} className="mb-5">Nenhuma denúncia pendente.</Notice>}
      <div className="space-y-3">
        {[...pend, ...done].map((a) => (
          <Item key={a.id} a={a} />
        ))}
        {db.alerts.length === 0 && <Empty icon={Siren} title="Nenhuma denúncia registrada" />}
      </div>

      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title="Resultado da verificação"
        footer={
          <Button type="submit" form="form-alerta" variant="gold">
            Enviar ao morador
          </Button>
        }
      >
        <form id="form-alerta" onSubmit={verificar}>
          <Field label="O que foi encontrado?">
            <Textarea value={resposta} onChange={(e) => setResposta(e.target.value)} required placeholder="Ex.: ronda feita, nada encontrado." />
          </Field>
        </form>
      </Modal>
    </>
  )
}
