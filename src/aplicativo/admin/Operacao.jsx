import { useState } from 'react'
import { Camera, CheckCircle2, EyeOff, MapPin, MessageSquare, Send, ShieldAlert, UserCog } from 'lucide-react'
import { personById, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, fmtDateTime, fmtTime, timeAgo, today } from '../lib/format.js'
import {
  Badge, Button, Card, Empty, Field, Input, List, Modal, Notice, PageHeader, Row, SearchInput, SectionTitle, Select, StatusBadge, Table, Tabs, Td, Textarea, cx,
} from '../ui/kit.jsx'

const RESPONSAVEIS = ['Síndico', 'Equipe de manutenção', 'Zeladoria', 'Segurança', 'Administradora', 'Conselho', 'Comissão Pets']
const STATUS_OPTS = [
  { value: 'recebida', label: 'Recebida' },
  { value: 'em andamento', label: 'Em andamento' },
  { value: 'resolvida', label: 'Resolvida' },
  { value: 'encerrada', label: 'Encerrada' },
]
const who = (db, r) => (r.anonima ? 'Anônimo' : `${personById(db, r.personId)?.nome} · ${unitLabel(unitById(db, r.unitId))}`)

/* ---------- Central de solicitações ---------- */

export function Requests({ id }) {
  const { db } = useStore()
  const [tab, setTab] = useState('abertas')
  const [q, setQ] = useState('')
  if (id) return <RequestDetail id={id} />
  const isOpen = (r) => !['resolvida', 'encerrada'].includes(r.status)
  const rows = db.requests
    .filter((r) => (tab === 'abertas' ? isOpen(r) : tab === 'anonimas' ? r.anonima : !isOpen(r)))
    .filter((r) => [r.titulo, r.protocolo, r.categoria].join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
  const t = today()

  return (
    <>
      <PageHeader overline="Operação" title="Central de solicitações" lead="Reclamações, sugestões e denúncias com protocolo e prazo." />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'abertas', label: 'Em aberto', count: db.requests.filter(isOpen).length },
            { id: 'anonimas', label: 'Denúncias anônimas', count: db.requests.filter((r) => r.anonima).length },
            { id: 'fechadas', label: 'Resolvidas' },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Protocolo, título ou categoria" className="w-full max-w-xs" />
      </div>
      {rows.length === 0 ? (
        <Empty icon={MessageSquare} title="Nenhuma solicitação" />
      ) : (
        <Table head={['Protocolo', 'Solicitação', 'Quem', 'Responsável', 'Prazo', 'Situação']}>
          {rows.map((r) => {
            const late = isOpen(r) && r.prazo < t
            return (
              <tr key={r.id} className="cursor-pointer hover:bg-paper-100" onClick={() => (window.location.hash = `/admin/solicitacoes/${r.id}`)}>
                <Td className="font-mono text-[0.78rem] whitespace-nowrap text-ink-600">{r.protocolo}</Td>
                <Td>
                  <a href={`#/admin/solicitacoes/${r.id}`} className="font-semibold text-ink-900">
                    {r.titulo}
                  </a>
                  <span className="mt-0.5 flex gap-1.5">
                    <Badge tone={r.tipo === 'Sugestão' ? 'green' : r.tipo === 'Denúncia' ? 'navy' : 'orange'}>{r.tipo}</Badge>
                    <Badge tone="gray">{r.categoria}</Badge>
                  </span>
                </Td>
                <Td className="text-[0.82rem] whitespace-nowrap">{r.anonima ? <span className="flex items-center gap-1.5 text-ink-500"><EyeOff size={14} /> Anônimo</span> : who(db, r)}</Td>
                <Td className="whitespace-nowrap">{r.responsavel || <span className="text-gold-ink font-semibold">Atribuir</span>}</Td>
                <Td className={cx('whitespace-nowrap', late && 'font-bold text-gold-ink')}>{fmtDate(r.prazo)}{late && ' · atrasada'}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
              </tr>
            )
          })}
        </Table>
      )}
    </>
  )
}

function RequestDetail({ id }) {
  const { db, mutate, toast } = useStore()
  const r = db.requests.find((x) => x.id === id)
  const [resp, setResp] = useState('')
  if (!r) return <Empty title="Solicitação não encontrada" />

  const update = (patch, texto, acao) => {
    mutate(
      (d) => {
        const x = d.requests.find((y) => y.id === id)
        Object.assign(x, patch)
        x.historico.push({ em: new Date().toISOString(), autor: 'Administração', tipo: 'status', texto })
        if (!x.anonima && x.personId) pushNotification(d, x.personId, `Atualização em ${x.protocolo}`, texto, `morador/solicitacoes/${x.id}`)
      },
      { acao, alvo: r.protocolo },
    )
    toast('Solicitação atualizada')
  }

  const reply = (e) => {
    e.preventDefault()
    if (!resp.trim()) return
    mutate(
      (d) => {
        const x = d.requests.find((y) => y.id === id)
        x.historico.push({ em: new Date().toISOString(), autor: 'Administração', tipo: 'resposta', texto: resp.trim() })
        if (x.status === 'recebida') x.status = 'em andamento'
        if (!x.anonima && x.personId) pushNotification(d, x.personId, `Resposta em ${x.protocolo}`, resp.trim().slice(0, 80), `morador/solicitacoes/${x.id}`)
      },
      { acao: 'Respondeu solicitação', alvo: r.protocolo },
    )
    setResp('')
    toast(r.anonima ? 'Resposta registrada (denúncia anônima: sem notificação)' : 'Resposta enviada ao morador')
  }

  return (
    <>
      <PageHeader back="admin/solicitacoes" overline={`${r.protocolo} · ${r.tipo} · ${r.categoria}`} title={r.titulo} lead={`Aberta ${timeAgo(r.criadaEm)} · prazo ${fmtDate(r.prazo)}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <p className="text-ink-700">{r.descricao}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.8rem]">
              <Badge tone="gray">
                <MapPin size={12} /> {r.local}
              </Badge>
              {r.fotos > 0 && (
                <Badge tone="blue">
                  <Camera size={12} /> {r.fotos} foto(s)
                </Badge>
              )}
            </div>
            {r.fotos > 0 && (
              <div className="mt-4 flex gap-2">
                {Array.from({ length: r.fotos }).map((_, i) => (
                  <div key={i} className="paver-grid-ink grid h-20 w-28 place-items-center rounded-xl bg-paper-200 text-ink-500">
                    <Camera size={20} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <section>
            <SectionTitle>Histórico de atendimento</SectionTitle>
            <Card>
              <ol className="relative space-y-5 border-l-2 border-paper-200 pl-5">
                {r.historico.map((h, i) => (
                  <li key={i} className="relative">
                    <span className={cx('absolute top-1 -left-[27px] h-3 w-3 rounded-full ring-4 ring-white', h.tipo === 'resposta' ? 'bg-gold-400' : h.tipo === 'abertura' ? 'bg-brand-600' : 'bg-brand-500')} />
                    <p className="text-[0.78rem] text-ink-500">
                      {fmtDateTime(h.em)} · <b className="text-ink-700">{h.autor}</b>
                    </p>
                    <p className={cx('mt-0.5 text-[0.9rem]', h.tipo === 'resposta' ? 'rounded-xl bg-gold-100/70 px-3 py-2 text-ink-900' : 'text-ink-700')}>{h.texto}</p>
                  </li>
                ))}
              </ol>
              <form onSubmit={reply} className="mt-6 space-y-3 border-t border-paper-200 pt-5">
                <Textarea rows={3} value={resp} onChange={(e) => setResp(e.target.value)} placeholder="Escreva uma resposta para o morador…" aria-label="Resposta" />
                <Button type="submit" variant="gold" icon={Send}>
                  Responder
                </Button>
              </form>
            </Card>
          </section>
        </div>

        <div className="space-y-5">
          <Card>
            <SectionTitle>Solicitante</SectionTitle>
            {r.anonima ? (
              <Notice tone="blue" icon={EyeOff}>
                Denúncia anônima. O sistema não guarda quem enviou e não é possível notificar o autor.
              </Notice>
            ) : (
              <p className="text-[0.9rem] font-semibold text-ink-900">{who(db, r)}</p>
            )}
          </Card>
          <Card className="space-y-4">
            <SectionTitle className="mb-0">Atendimento</SectionTitle>
            <Field label="Situação">
              <Select value={r.status} onChange={(e) => update({ status: e.target.value }, `Situação alterada para "${STATUS_OPTS.find((s) => s.value === e.target.value).label}".`, 'Alterou situação')} options={STATUS_OPTS} />
            </Field>
            <Field label="Responsável">
              <Select
                value={r.responsavel}
                onChange={(e) => update({ responsavel: e.target.value, status: r.status === 'recebida' ? 'em andamento' : r.status }, `Encaminhada para ${e.target.value}.`, 'Atribuiu responsável')}
                options={[{ value: '', label: 'Sem responsável' }, ...RESPONSAVEIS]}
              />
            </Field>
            <Field label="Prazo">
              <Input type="date" value={r.prazo} onChange={(e) => update({ prazo: e.target.value }, `Prazo ajustado para ${fmtDate(e.target.value)}.`, 'Alterou prazo')} />
            </Field>
            {r.status !== 'resolvida' && (
              <Button variant="brand" icon={CheckCircle2} className="w-full" onClick={() => update({ status: 'resolvida' }, 'Solicitação resolvida.', 'Resolveu solicitação')}>
                Marcar como resolvida
              </Button>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

/* ---------- Visitantes e acessos ---------- */

export function Visitors() {
  const { db, mutate, toast } = useStore()
  const [tab, setTab] = useState('autorizacoes')
  return (
    <>
      <PageHeader overline="Operação" title="Visitantes e acessos" lead="Liberações feitas pelos moradores e entradas registradas pela portaria." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'autorizacoes', label: 'Autorizações', count: db.authorizations.filter((a) => a.status === 'ativa').length },
          { id: 'acessos', label: 'Entradas e saídas', count: db.accessLog.length },
        ]}
      />
      {tab === 'autorizacoes' && (
        <Table head={['Autorizado', 'Tipo', 'Unidade', 'Validade', 'Código', 'Situação']}>
          {db.authorizations.map((a) => (
            <tr key={a.id}>
              <Td>
                <span className="font-semibold text-ink-900">{a.nome}</span>
                {a.servico && <span className="block text-[0.75rem] text-ink-500">{a.servico}</span>}
                {a.convidados && <span className="block text-[0.75rem] text-ink-500">{a.convidados.length} convidados</span>}
              </Td>
              <Td>
                <Badge tone={a.tipo === 'Prestador' ? 'orange' : a.tipo === 'Visitante' ? 'blue' : 'gold'}>{a.tipo}</Badge>
              </Td>
              <Td className="whitespace-nowrap">{unitLabel(unitById(db, a.unitId))}</Td>
              <Td className="text-[0.82rem] whitespace-nowrap">
                {a.validoDe === a.validoAte ? fmtDate(a.validoDe) : `${fmtDate(a.validoDe)} a ${fmtDate(a.validoAte)}`}
                {a.recorrente && <span className="block text-ink-500">{a.recorrente}</span>}
              </Td>
              <Td className="font-mono text-[0.8rem]">{a.codigo}</Td>
              <Td>
                <StatusBadge status={a.status} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
      {tab === 'acessos' && (
        <Table head={['Pessoa', 'Tipo', 'Unidade', 'Entrada', 'Saída', 'Porteiro']}>
          {db.accessLog.map((l) => (
            <tr key={l.id}>
              <Td className="font-semibold text-ink-900">
                {l.nome}
                {l.placa && <span className="block font-mono text-[0.74rem] font-normal text-ink-500">{l.placa}</span>}
              </Td>
              <Td>{l.tipo}</Td>
              <Td className="whitespace-nowrap">{unitLabel(unitById(db, l.unitId))}</Td>
              <Td className="whitespace-nowrap">{fmtDateTime(l.entrada)}</Td>
              <Td className="whitespace-nowrap">{l.saida ? fmtTime(l.saida) : <Badge tone="green" dot>No condomínio</Badge>}</Td>
              <Td className="whitespace-nowrap text-ink-500">{l.porteiro}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  )
}

/* ---------- Alertas de segurança ---------- */

export function Alerts() {
  const { db, mutate, toast } = useStore()
  const [target, setTarget] = useState(null)
  const [resp, setResp] = useState('')
  const a = target && db.alerts.find((x) => x.id === target)

  const verify = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        const x = d.alerts.find((y) => y.id === target)
        x.status = 'verificado'
        x.resposta = resp
        const autor = d.persons.find((p) => p.nome === x.autor)
        if (autor) pushNotification(d, autor.id, 'Denúncia verificada', resp, 'morador/seguranca')
      },
      { acao: 'Verificou denúncia', alvo: a.tipo },
    )
    toast('Denúncia marcada como verificada')
    setTarget(null)
    setResp('')
  }

  return (
    <>
      <PageHeader overline="Operação" title="Denúncias" lead="Monitoramento solidário: denúncias enviadas pelos vizinhos, que chegam também à portaria." />
      {db.alerts.length === 0 ? (
        <Empty icon={UserCog} title="Nenhuma denúncia" />
      ) : (
        <div className="space-y-3">
          {db.alerts.map((al) => (
            <Card key={al.id} className="flex flex-wrap items-start gap-4">
              <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', al.status === 'verificado' ? 'bg-paper-100 text-ink-500' : 'bg-gold-100 text-gold-ink')}>
                <ShieldAlert size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink-900">{al.tipo}</p>
                  <StatusBadge status={al.status} />
                </div>
                <p className="mt-1 text-ink-700">{al.descricao}</p>
                <p className="mt-1 text-[0.78rem] text-ink-500">
                  {al.local} · {al.autor} · {fmtDateTime(al.em)}
                </p>
                {al.resposta && <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-[0.85rem] text-brand-700">{al.resposta}</p>}
              </div>
              {al.status !== 'verificado' && (
                <Button variant="brand" size="sm" icon={CheckCircle2} onClick={() => setTarget(al.id)}>
                  Marcar verificado
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={!!a}
        onClose={() => setTarget(null)}
        title="Verificar denúncia"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="alert-form">
              Confirmar
            </Button>
          </>
        }
      >
        <form id="alert-form" onSubmit={verify}>
          <Field label="O que foi verificado?">
            <Textarea value={resp} onChange={(e) => setResp(e.target.value)} required placeholder="Ex.: ronda feita, nada encontrado." />
          </Field>
        </form>
      </Modal>
    </>
  )
}

/* ---------- Ocorrências da portaria ---------- */

export function Incidents() {
  const { db, mutate, toast } = useStore()
  const [tab, setTab] = useState('abertas')
  const [notes, setNotes] = useState({})
  const isOpen = (o) => o.status !== 'resolvida'
  const rows = db.incidents.filter((o) => (tab === 'abertas' ? isOpen(o) : !isOpen(o))).sort((a, b) => b.em.localeCompare(a.em))

  const setStatus = (o, status) => {
    mutate(
      (d) => {
        d.incidents.find((x) => x.id === o.id).status = status
        pushNotification(d, 'portaria', 'Ocorrência atualizada', `${o.titulo}: ${status}`, 'portaria/ocorrencias')
      },
      { acao: 'Alterou ocorrência', alvo: `${o.titulo}: ${status}` },
    )
    toast('Ocorrência atualizada')
  }

  const addNote = (o) => {
    const texto = (notes[o.id] ?? '').trim()
    if (!texto) return
    mutate(
      (d) => {
        const x = d.incidents.find((y) => y.id === o.id)
        x.notas = [...(x.notas ?? []), { em: new Date().toISOString(), autor: 'Administração', texto }]
        pushNotification(d, 'portaria', 'Nota da administração', `${o.titulo}: ${texto.slice(0, 60)}`, 'portaria/ocorrencias')
      },
      { acao: 'Anotou ocorrência', alvo: o.titulo },
    )
    setNotes((n) => ({ ...n, [o.id]: '' }))
    toast('Nota registrada')
  }

  return (
    <>
      <PageHeader overline="Operação" title="Ocorrências da portaria" lead="Problemas registrados pelos porteiros e comunicados à administração." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'abertas', label: 'Em aberto', count: db.incidents.filter(isOpen).length },
          { id: 'resolvidas', label: 'Resolvidas', count: db.incidents.filter((o) => !isOpen(o)).length },
        ]}
      />
      {rows.length === 0 ? (
        <Empty icon={ShieldAlert} title="Nenhuma ocorrência aqui" />
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-ink">
                  <ShieldAlert size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink-900">{o.titulo}</p>
                    <Badge tone="gray">{o.categoria}</Badge>
                  </div>
                  <p className="mt-1 text-ink-700">{o.descricao}</p>
                  <p className="mt-1 text-[0.78rem] text-ink-500">
                    {o.porteiro} · {fmtDateTime(o.em)}
                    {o.unitId && ` · ${unitLabel(unitById(db, o.unitId))}`}
                  </p>
                  {(o.notas ?? []).map((n, i) => (
                    <p key={i} className="mt-2 rounded-xl bg-paper-100 px-3 py-2 text-[0.84rem] text-ink-700">
                      <b>{n.autor}</b> · {fmtDateTime(n.em)}: {n.texto}
                    </p>
                  ))}
                  <div className="mt-3 flex gap-2">
                    <Input value={notes[o.id] ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [o.id]: e.target.value }))} placeholder="Adicionar nota…" aria-label="Nota" />
                    <Button variant="soft" icon={Send} onClick={() => addNote(o)}>
                      Anotar
                    </Button>
                  </div>
                </div>
                <div className="w-44">
                  <Select
                    aria-label="Situação"
                    value={o.status}
                    onChange={(e) => setStatus(o, e.target.value)}
                    options={[
                      { value: 'aberta', label: 'Aberta' },
                      { value: 'encaminhada', label: 'Encaminhada' },
                      { value: 'resolvida', label: 'Resolvida' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
