import { useState } from 'react'
import { CalendarClock, Download, Eye, EyeOff, Megaphone, Paperclip, Plus, Send, Trash2, Users, Vote } from 'lucide-react'
import { personById, tally, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { addDays, downloadCsv, fmtDate, fmtDateTime, today, uid } from '../lib/format.js'
import { go } from '../lib/router.js'
import {
  Avatar, Badge, Button, Card, Check, Empty, Field, Input, List, Modal, Notice, PageHeader, Progress, Row, SectionTitle, Select, StatusBadge, Table, Tabs, Td, Textarea,
} from '../ui/kit.jsx'
import { notifyAll } from './common.jsx'
import { VoteTypeBadge } from '../morador/Votacoes.jsx'

const CAT_TONE = { Urgente: 'red', Feirinha: 'gold', Evento: 'blue', Informativo: 'gray', Obras: 'orange', Manutenção: 'orange' }
const residents = (db) => db.persons.filter((p) => p.tipo === 'permanente' && p.status === 'ativo' && p.unitId)

/* ---------- Comunicados ---------- */

export function News({ id }) {
  const { db } = useStore()
  const [tab, setTab] = useState('publicado')
  if (id === 'novo') return <NewsForm />
  if (id) return <NewsDetail id={id} />
  const rows = db.news.filter((n) => tab === 'todos' || n.status === tab).sort((a, b) => b.data.localeCompare(a.data))
  return (
    <>
      <PageHeader
        overline="Comunicação"
        title="Notícias e comunicados"
        lead="Crie, publique, agende e acompanhe a leitura."
        actions={
          <Button variant="gold" icon={Plus} to="admin/comunicados/novo">
            Novo comunicado
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'publicado', label: 'Publicados', count: db.news.filter((n) => n.status === 'publicado').length },
          { id: 'agendado', label: 'Agendados', count: db.news.filter((n) => n.status === 'agendado').length },
          { id: 'todos', label: 'Todos' },
        ]}
      />
      {rows.length === 0 ? (
        <Empty icon={Megaphone} title="Nenhum comunicado aqui" />
      ) : (
        <List>
          {rows.map((n) => (
            <Row
              key={n.id}
              to={`admin/comunicados/${n.id}`}
              leading={<Badge tone={CAT_TONE[n.categoria] ?? 'gray'}>{n.categoria}</Badge>}
              title={n.titulo}
              subtitle={`${fmtDateTime(n.data)} · ${n.autor}${n.exigeConfirmacao ? ` · ${n.leituras.length} confirmações` : ''}`}
              trailing={<StatusBadge status={n.status} />}
            />
          ))}
        </List>
      )}
    </>
  )
}

function NewsForm() {
  const { mutate, toast } = useStore()
  const [f, setF] = useState({ titulo: '', categoria: 'Informativo', resumo: '', conteudo: '', exigeConfirmacao: false, quando: 'agora', publicarEm: addDays(today(), 1), anexo: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const save = (e) => {
    e.preventDefault()
    const id = uid('n')
    const agora = f.quando === 'agora'
    mutate(
      (d) => {
        d.news.unshift({
          id, titulo: f.titulo, categoria: f.categoria, resumo: f.resumo || f.conteudo.slice(0, 110), conteudo: f.conteudo,
          data: agora ? new Date().toISOString() : new Date(`${f.publicarEm}T08:00`).toISOString(),
          autor: 'Administração', status: agora ? 'publicado' : 'agendado', anexos: f.anexo ? [f.anexo] : [], exigeConfirmacao: f.exigeConfirmacao, leituras: [],
        })
        if (agora) notifyAll(d, f.categoria === 'Urgente' ? 'Comunicado urgente' : 'Novo comunicado', f.titulo, `morador/comunicados/${id}`)
      },
      { acao: agora ? 'Publicou comunicado' : 'Agendou comunicado', alvo: f.titulo },
    )
    toast(agora ? 'Comunicado publicado e moradores notificados' : `Agendado para ${fmtDate(f.publicarEm)}`)
    go(`admin/comunicados/${id}`, { replace: true })
  }
  return (
    <>
      <PageHeader back="admin/comunicados" overline="Comunicação" title="Novo comunicado" />
      <Card className="max-w-3xl">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" className="sm:col-span-2">
            <Input value={f.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Categoria">
            <Select value={f.categoria} onChange={set('categoria')} options={['Informativo', 'Urgente', 'Evento', 'Feirinha', 'Obras', 'Manutenção']} />
          </Field>
          <Field label="Anexo" optional>
            <Input value={f.anexo} onChange={set('anexo')} placeholder="nome-do-arquivo.pdf" />
          </Field>
          <Field label="Resumo" optional className="sm:col-span-2">
            <Input value={f.resumo} onChange={set('resumo')} />
          </Field>
          <Field label="Conteúdo" className="sm:col-span-2">
            <Textarea rows={7} value={f.conteudo} onChange={set('conteudo')} required />
          </Field>
          <div className="sm:col-span-2">
            <Check checked={f.exigeConfirmacao} onChange={(v) => setF((x) => ({ ...x, exigeConfirmacao: v }))}>
              Pedir confirmação de leitura
            </Check>
          </div>
          <Field label="Publicação">
            <Select value={f.quando} onChange={set('quando')} options={[{ value: 'agora', label: 'Publicar agora' }, { value: 'agendar', label: 'Agendar' }]} />
          </Field>
          {f.quando === 'agendar' && (
            <Field label="Data de publicação">
              <Input type="date" min={today()} value={f.publicarEm} onChange={set('publicarEm')} />
            </Field>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="gold" icon={f.quando === 'agora' ? Send : CalendarClock}>
              {f.quando === 'agora' ? 'Publicar e notificar' : 'Agendar'}
            </Button>
            <Button variant="ghost" to="admin/comunicados">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}

function NewsDetail({ id }) {
  const { db, mutate, toast } = useStore()
  const n = db.news.find((x) => x.id === id)
  if (!n) return <Empty title="Comunicado não encontrado" />
  const people = residents(db)
  const lidos = people.filter((p) => n.leituras.includes(p.id))

  const publish = () => {
    mutate(
      (d) => {
        const x = d.news.find((y) => y.id === id)
        x.status = 'publicado'
        x.data = new Date().toISOString()
        notifyAll(d, 'Novo comunicado', x.titulo, `morador/comunicados/${id}`)
      },
      { acao: 'Publicou comunicado', alvo: n.titulo },
    )
    toast('Publicado e moradores notificados')
  }
  const remove = () => {
    mutate((d) => (d.news = d.news.filter((x) => x.id !== id)), { acao: 'Excluiu comunicado', alvo: n.titulo })
    toast('Comunicado excluído')
    go('admin/comunicados')
  }

  return (
    <>
      <PageHeader
        back="admin/comunicados"
        overline={`${n.categoria} · ${fmtDateTime(n.data)}`}
        title={n.titulo}
        actions={
          <>
            <Button variant="danger" icon={Trash2} onClick={remove}>
              Excluir
            </Button>
            {n.status !== 'publicado' && (
              <Button variant="gold" icon={Send} onClick={publish}>
                Publicar agora
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <StatusBadge status={n.status} />
          <p className="mt-4 font-semibold text-ink-900">{n.resumo}</p>
          <div className="mt-3 space-y-3 text-ink-700">
            {n.conteudo.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {n.anexos.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {n.anexos.map((a) => (
                <Badge key={a} tone="blue">
                  <Paperclip size={12} /> {a}
                </Badge>
              ))}
            </div>
          )}
        </Card>
        <div>
          <SectionTitle>Confirmação de leitura</SectionTitle>
          {n.exigeConfirmacao ? (
            <Card>
              <p className="display text-[2rem] text-ink-900">
                {lidos.length}
                <span className="text-[1rem] text-ink-500"> / {people.length}</span>
              </p>
              <Progress value={(lidos.length / people.length) * 100} className="mt-2" />
              <ul className="mt-4 space-y-2">
                {lidos.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-[0.84rem]">
                    <Avatar name={p.nome} size={26} /> {p.nome}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card className="text-[0.86rem] text-ink-500">Este comunicado não pede confirmação.</Card>
          )}
        </div>
      </div>
    </>
  )
}

/* ---------- Votações ---------- */

export function Votes({ id }) {
  const { db } = useStore()
  const [tab, setTab] = useState('aberta')
  if (id === 'nova') return <VoteForm />
  if (id) return <VoteDetail id={id} />
  const rows = db.votes.filter((v) => v.status === tab)
  return (
    <>
      <PageHeader
        overline="Comunicação"
        title="Votações e enquetes"
        lead="Enquete de opinião e votação formal são modalidades diferentes."
        actions={
          <Button variant="gold" icon={Plus} to="admin/votacoes/nova">
            Nova votação
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={['aberta', 'futura', 'encerrada'].map((s) => ({ id: s, label: { aberta: 'Abertas', futura: 'Futuras', encerrada: 'Encerradas' }[s], count: db.votes.filter((v) => v.status === s).length }))}
      />
      {rows.length === 0 ? (
        <Empty icon={Vote} title="Nenhuma votação aqui" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((v) => (
            <Card key={v.id} to={`admin/votacoes/${v.id}`}>
              <div className="flex flex-wrap gap-1.5">
                <VoteTypeBadge tipo={v.tipo} />
                <Badge tone="gray">{v.modalidade === 'nominal' ? 'Nominal' : 'Secreta'}</Badge>
                <Badge tone="gray">Por {v.votoPor}</Badge>
              </div>
              <p className="mt-3 font-bold text-ink-900">{v.titulo}</p>
              <p className="mt-1 text-[0.8rem] text-ink-500">
                {fmtDate(v.inicio)} a {fmtDate(v.fim)} · {v.votos.length} votos
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function VoteForm() {
  const { mutate, toast } = useStore()
  const [f, setF] = useState({
    titulo: '', descricao: '', tipo: 'formal', modalidade: 'nominal', votoPor: 'unidade', inicio: today(), fim: addDays(today(), 7),
    permiteAlterar: true, parcialVisivel: false, opcoes: ['Aprovo', 'Não aprovo', 'Abstenção'], anexo: '',
  })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const setOpt = (i, v) => setF((x) => ({ ...x, opcoes: x.opcoes.map((o, j) => (j === i ? v : o)) }))

  const save = (e) => {
    e.preventDefault()
    const id = uid('vt')
    const status = f.inicio > today() ? 'futura' : 'aberta'
    mutate(
      (d) => {
        d.votes.unshift({
          id, titulo: f.titulo, descricao: f.descricao, tipo: f.tipo, modalidade: f.modalidade, votoPor: f.votoPor, status, inicio: f.inicio, fim: f.fim,
          permiteAlterar: f.permiteAlterar, parcialVisivel: f.parcialVisivel, anexos: f.anexo ? [f.anexo] : [],
          opcoes: f.opcoes.filter((o) => o.trim()).map((texto, i) => ({ id: `o${i + 1}`, texto })), votos: [],
          quorum: f.tipo === 'formal' ? 'Maioria simples das unidades votantes' : undefined,
        })
        if (status === 'aberta') notifyAll(d, f.tipo === 'formal' ? 'Nova votação aberta' : 'Nova enquete', `${f.titulo} · até ${fmtDate(f.fim)}`, `morador/votacoes/${id}`)
      },
      { acao: status === 'aberta' ? 'Abriu votação' : 'Agendou votação', alvo: f.titulo },
    )
    toast(status === 'aberta' ? 'Votação aberta e moradores notificados' : 'Votação agendada')
    go(`admin/votacoes/${id}`, { replace: true })
  }

  return (
    <>
      <PageHeader back="admin/votacoes" overline="Comunicação" title="Nova votação" />
      <form onSubmit={save} className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="space-y-4">
          <Field label="Pauta">
            <Input value={f.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Proposta">
            <Textarea rows={5} value={f.descricao} onChange={set('descricao')} required />
          </Field>
          <Field label="Anexo" optional>
            <Input value={f.anexo} onChange={set('anexo')} placeholder="orcamentos.pdf" />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.8rem] font-semibold text-ink-700">Opções</p>
            <div className="space-y-2">
              {f.opcoes.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={o} onChange={(e) => setOpt(i, e.target.value)} aria-label={`Opção ${i + 1}`} />
                  {f.opcoes.length > 2 && (
                    <Button variant="ghost" size="sm" icon={Trash2} aria-label="Remover opção" onClick={() => setF((x) => ({ ...x, opcoes: x.opcoes.filter((_, j) => j !== i) }))} />
                  )}
                </div>
              ))}
            </div>
            <Button variant="soft" size="sm" icon={Plus} className="mt-2" onClick={() => setF((x) => ({ ...x, opcoes: [...x.opcoes, ''] }))}>
              Adicionar opção
            </Button>
          </div>
        </Card>
        <Card className="space-y-4">
          <Field label="Tipo">
            <Select value={f.tipo} onChange={set('tipo')} options={[{ value: 'formal', label: 'Votação formal' }, { value: 'enquete', label: 'Enquete de opinião' }]} />
          </Field>
          <Field label="Modalidade">
            <Select value={f.modalidade} onChange={set('modalidade')} options={[{ value: 'nominal', label: 'Nominal (votos visíveis)' }, { value: 'secreta', label: 'Secreta' }]} />
          </Field>
          <Field label="Voto por">
            <Select value={f.votoPor} onChange={set('votoPor')} options={[{ value: 'unidade', label: 'Unidade (1 voto por casa)' }, { value: 'pessoa', label: 'Pessoa' }]} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <Input type="date" value={f.inicio} onChange={set('inicio')} />
            </Field>
            <Field label="Fim">
              <Input type="date" min={f.inicio} value={f.fim} onChange={set('fim')} />
            </Field>
          </div>
          <Check checked={f.permiteAlterar} onChange={(v) => setF((x) => ({ ...x, permiteAlterar: v }))}>
            Permitir alterar o voto até o prazo
          </Check>
          <Check checked={f.parcialVisivel} onChange={(v) => setF((x) => ({ ...x, parcialVisivel: v }))}>
            Mostrar resultado parcial durante a votação
          </Check>
          {f.modalidade === 'nominal' && <Notice tone="gold">Os moradores verão, antes de confirmar, que o voto será identificado.</Notice>}
          <Button type="submit" variant="gold" className="w-full" icon={Send}>
            Criar votação
          </Button>
        </Card>
      </form>
    </>
  )
}

function VoteDetail({ id }) {
  const { db, mutate, toast } = useStore()
  const [confirm, setConfirm] = useState(false)
  const v = db.votes.find((x) => x.id === id)
  if (!v) return <Empty title="Votação não encontrada" />
  const res = tally(v)
  const nominal = v.modalidade === 'nominal'
  const habilitadas = db.units.filter((u) => u.status !== 'vazia')
  const unidadesVotaram = new Set(v.votos.map((x) => x.unitId))
  const base = v.votoPor === 'unidade' ? habilitadas.length : residents(db).length
  const part = v.votoPor === 'unidade' ? unidadesVotaram.size : v.votos.length
  const opt = (oid) => v.opcoes.find((o) => o.id === oid)?.texto

  const exportCsv = () => {
    const rows = [['Pauta', v.titulo], [], ['Opção', 'Votos', '%'], ...res.map((r) => [r.texto, r.n, `${r.pct}%`])]
    if (nominal) rows.push([], ['Unidade', 'Votante', 'Opção', 'Data do voto'], ...v.votos.map((x) => [unitLabel(unitById(db, x.unitId)), personById(db, x.personId)?.nome, opt(x.opcaoId), fmtDateTime(x.em)]))
    downloadCsv(`votacao-${v.id}.csv`, rows)
    mutate(() => {}, { acao: 'Exportou resultado', alvo: v.titulo })
  }

  const close = () => {
    mutate(
      (d) => {
        const x = d.votes.find((y) => y.id === id)
        x.status = 'encerrada'
        x.fim = today()
        notifyAll(d, 'Votação encerrada', `${x.titulo}: confira o resultado`, `morador/votacoes/${id}`)
      },
      { acao: 'Encerrou votação', alvo: v.titulo },
    )
    toast('Votação encerrada')
    setConfirm(false)
  }

  const winner = [...res].sort((a, b) => b.n - a.n)[0]

  return (
    <>
      <PageHeader
        back="admin/votacoes"
        overline={`${v.tipo === 'formal' ? 'Votação formal' : 'Enquete'} · ${nominal ? 'nominal' : 'secreta'} · por ${v.votoPor}`}
        title={v.titulo}
        lead={`${fmtDate(v.inicio)} a ${fmtDate(v.fim)}${v.quorum ? ` · ${v.quorum}` : ''}`}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={exportCsv}>
              Exportar
            </Button>
            {v.status === 'aberta' && (
              <Button variant="primary" onClick={() => setConfirm(true)}>
                Encerrar agora
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle className="mb-0">Resultado {v.status === 'aberta' && '(parcial · só a administração vê)'}</SectionTitle>
              <StatusBadge status={v.status} />
            </div>
            <ul className="space-y-4">
              {res.map((r) => (
                <li key={r.id}>
                  <div className="mb-1 flex justify-between gap-3 text-[0.88rem]">
                    <span className="font-semibold text-ink-900">{r.texto}</span>
                    <span className="shrink-0 font-bold text-ink-700">
                      {r.n} · {r.pct}%
                    </span>
                  </div>
                  <Progress value={r.pct} tone={r.id === winner?.id && r.n > 0 ? 'gold' : 'brand'} />
                </li>
              ))}
            </ul>
          </Card>

          <section>
            <SectionTitle>{nominal ? 'Registro nominal dos votos' : 'Registro dos votos'}</SectionTitle>
            {nominal ? (
              v.votos.length ? (
                <Table head={['Unidade', 'Votante', 'Opção', 'Data do voto']}>
                  {v.votos.map((x) => (
                    <tr key={x.unitId + x.personId}>
                      <Td className="font-semibold whitespace-nowrap text-ink-900">{unitLabel(unitById(db, x.unitId))}</Td>
                      <Td className="whitespace-nowrap">{personById(db, x.personId)?.nome}</Td>
                      <Td>{opt(x.opcaoId)}</Td>
                      <Td className="whitespace-nowrap text-ink-500">{fmtDateTime(x.em)}</Td>
                    </tr>
                  ))}
                </Table>
              ) : (
                <Empty title="Ainda sem votos" />
              )
            ) : (
              <Notice tone="blue" icon={EyeOff}>
                Votação secreta: o sistema registra apenas quem participou, nunca a opção escolhida por cada pessoa. Isso vale também para relatórios e exportações.
              </Notice>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Participação</SectionTitle>
            <p className="display text-[2.2rem] text-ink-900">
              {Math.round((part / base) * 100)}%
            </p>
            <Progress value={(part / base) * 100} tone="gold" className="mt-2" />
            <p className="mt-2 text-[0.8rem] text-ink-500">
              {part} de {base} {v.votoPor === 'unidade' ? 'unidades habilitadas' : 'pessoas'}
            </p>
          </Card>
          {v.votoPor === 'unidade' && (
            <Card padded={false}>
              <p className="px-5 pt-4 pb-2 text-[0.72rem] font-bold tracking-[0.18em] text-ink-500 uppercase">Unidades</p>
              <ul className="max-h-80 divide-y divide-paper-200 overflow-y-auto">
                {habilitadas.map((u) => (
                  <li key={u.id} className="flex items-center justify-between px-5 py-2.5 text-[0.84rem]">
                    <span className="text-ink-700">{unitLabel(u)}</span>
                    {unidadesVotaram.has(u.id) ? <Badge tone="green" dot>Votou</Badge> : <Badge tone="gray">Pendente</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <SectionTitle>Regras</SectionTitle>
            <ul className="space-y-1.5 text-[0.84rem] text-ink-700">
              <li className="flex gap-2"><Users size={15} className="mt-0.5 text-brand-700" /> Voto por {v.votoPor}</li>
              <li className="flex gap-2">{nominal ? <Eye size={15} className="mt-0.5 text-brand-700" /> : <EyeOff size={15} className="mt-0.5 text-brand-700" />} {nominal ? 'Nominal: votos visíveis após encerramento' : 'Secreta'}</li>
              <li>{v.permiteAlterar ? 'Permite alterar o voto até o prazo' : 'Voto definitivo'}</li>
              <li>{v.parcialVisivel ? 'Resultado parcial visível aos moradores' : 'Resultado só após o encerramento'}</li>
            </ul>
          </Card>
        </div>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Encerrar votação?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Voltar
            </Button>
            <Button onClick={close}>Encerrar e divulgar</Button>
          </>
        }
      >
        <p className="text-ink-700">Ninguém mais poderá votar e os moradores serão avisados do resultado.</p>
      </Modal>
    </>
  )
}

/* ---------- Atividades do clube ---------- */

export function Activities() {
  const { db, mutate, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(null)
  const [f, setF] = useState({ titulo: '', categoria: 'Esporte', local: '', quando: '', vagas: 20, responsavel: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const save = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        d.activities.unshift({ id: uid('at'), ...f, vagas: Number(f.vagas), inscritos: [] })
        notifyAll(d, 'Nova atividade no clube', `${f.titulo} · ${f.quando}`, 'morador/atividades')
      },
      { acao: 'Criou atividade', alvo: f.titulo },
    )
    toast('Atividade criada e divulgada')
    setOpen(false)
  }
  const act = view && db.activities.find((a) => a.id === view)

  return (
    <>
      <PageHeader
        overline="Comunicação"
        title="Atividades do clube"
        lead="Esportes, jogos, cultura, festas e bem-estar com inscrição pelo app."
        actions={
          <Button variant="gold" icon={Plus} onClick={() => setOpen(true)}>
            Nova atividade
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {db.activities.map((a) => (
          <Card key={a.id} onClick={() => setView(a.id)}>
            <Badge tone="blue">{a.categoria}</Badge>
            <p className="mt-3 font-bold text-ink-900">{a.titulo}</p>
            <p className="text-[0.8rem] text-ink-500">
              {a.quando} · {a.local}
            </p>
            <Progress value={a.vagas ? (a.inscritos.length / a.vagas) * 100 : 100} tone="gold" className="mt-4" />
            <p className="mt-1.5 text-[0.76rem] text-ink-500">
              {a.vagas ? `${a.inscritos.length} de ${a.vagas} vagas` : `${a.inscritos.length} participantes`} · {a.responsavel}
            </p>
          </Card>
        ))}
      </div>

      <Modal open={!!act} onClose={() => setView(null)} title={act?.titulo ?? ''}>
        {act && (
          <>
            <p className="mb-4 text-[0.86rem] text-ink-500">
              {act.quando} · {act.local} · {act.inscritos.length}{act.vagas ? `/${act.vagas}` : ''} inscritos
            </p>
            <ul className="space-y-2">
              {act.inscritos.length === 0 && <li className="text-ink-500">Nenhum inscrito ainda.</li>}
              {act.inscritos.map((pid) => {
                const p = personById(db, pid)
                return (
                  <li key={pid} className="flex items-center gap-3 text-[0.88rem]">
                    <Avatar name={p?.nome} size={30} />
                    <span className="font-semibold text-ink-900">{p?.nome}</span>
                    <span className="text-ink-500">{unitLabel(unitById(db, p?.unitId))}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Modal>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova atividade"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="act-form">
              Criar
            </Button>
          </>
        }
      >
        <form id="act-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={f.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Categoria">
            <Select value={f.categoria} onChange={set('categoria')} options={['Esporte', 'Bem-estar', 'Jogos', 'Cultura', 'Festa', 'Feira']} />
          </Field>
          <Field label="Vagas">
            <Input type="number" min={1} value={f.vagas} onChange={set('vagas')} />
          </Field>
          <Field label="Local">
            <Select value={f.local} onChange={set('local')} options={['', ...db.areas.map((a) => a.nome), 'Salão do clube', 'Praça central']} required />
          </Field>
          <Field label="Quando">
            <Input value={f.quando} onChange={set('quando')} placeholder="Sáb · 10h" required />
          </Field>
          <Field label="Responsável" className="sm:col-span-2">
            <Input value={f.responsavel} onChange={set('responsavel')} />
          </Field>
        </form>
      </Modal>
    </>
  )
}
