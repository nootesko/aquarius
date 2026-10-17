import { useMemo, useState } from 'react'
import { BellRing, DoorClosed, DoorOpen, Download, PartyPopper, PhoneCall } from 'lucide-react'
import { areaById, notifyUnit, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { accessCode, downloadCsv, fmtDate, fmtDateTime, fmtTime, today, uid } from '../lib/format.js'
import { go } from '../lib/router.js'
import { Avatar, Badge, Button, Card, Empty, Field, Input, Notice, PageHeader, Progress, SearchInput, Select, Table, Tabs, Td, Textarea, cx, inputCls } from '../ui/kit.jsx'
import { TipoBadge, useGate } from './Autorizacoes.jsx'
import { authState, isToday, normalize, residentsOf } from './helpers.js'

export const unitOptions = (db) => [{ value: '', label: 'Selecione a casa…' }, ...db.units.map((u) => ({ value: u.id, label: unitLabel(u) }))]

/* ---------- Registro de acessos ---------- */

export function Acessos() {
  const { db } = useStore()
  const { sair } = useGate()
  const [tab, setTab] = useState('hoje')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    let r = db.accessLog
    if (tab === 'hoje') r = r.filter((l) => isToday(l.entrada) || !l.saida)
    if (tab === 'dentro') r = r.filter((l) => !l.saida)
    const n = normalize(q)
    if (n) r = r.filter((l) => normalize(`${l.nome} ${unitLabel(unitById(db, l.unitId))} ${l.placa}`).includes(n))
    return r
  }, [db, tab, q])

  const exportar = () =>
    downloadCsv(`acessos-${today()}.csv`, [
      ['Nome', 'Tipo', 'Unidade', 'Placa', 'Entrada', 'Saída', 'Porteiro'],
      ...rows.map((l) => [l.nome, l.tipo, unitLabel(unitById(db, l.unitId)), l.placa, fmtDateTime(l.entrada), fmtDateTime(l.saida), l.porteiro]),
    ])

  return (
    <>
      <PageHeader
        overline="Portaria"
        title="Registro de acessos"
        actions={
          <Button variant="outline" icon={Download} onClick={exportar}>
            Exportar
          </Button>
        }
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'hoje', label: 'Hoje' },
            { id: 'dentro', label: 'Dentro agora', count: db.accessLog.filter((l) => !l.saida).length },
            { id: 'todos', label: 'Todos' },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Nome, casa ou placa…" className="w-full sm:w-72" />
      </div>

      {rows.length === 0 ? (
        <Empty icon={DoorOpen} title="Nenhum acesso" />
      ) : (
        <Table head={['Pessoa', 'Destino', 'Entrada', 'Saída', 'Porteiro']}>
          {rows.map((l) => (
            <tr key={l.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={l.nome} size={34} />
                  <div>
                    <p className="font-semibold text-ink-900">{l.nome}</p>
                    <div className="flex gap-1.5">
                      <TipoBadge tipo={l.tipo} />
                      {l.placa && <span className="font-mono text-[0.74rem] text-ink-500">{l.placa}</span>}
                    </div>
                  </div>
                </div>
              </Td>
              <Td className="whitespace-nowrap text-ink-700">{unitLabel(unitById(db, l.unitId))}</Td>
              <Td className="whitespace-nowrap text-ink-700">{isToday(l.entrada) ? fmtTime(l.entrada) : fmtDateTime(l.entrada)}</Td>
              <Td className="whitespace-nowrap">
                {l.saida ? (
                  <span className="text-ink-700">{isToday(l.saida) ? fmtTime(l.saida) : fmtDateTime(l.saida)}</span>
                ) : (
                  <Button variant="gold" size="sm" icon={DoorClosed} onClick={() => sair(l.id, l.nome)}>
                    Registrar saída
                  </Button>
                )}
              </Td>
              <Td className="whitespace-nowrap text-ink-500">{l.porteiro}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  )
}

/* ---------- Listas de eventos ---------- */

export function Eventos() {
  const { db } = useStore()
  const t = today()
  const listas = db.authorizations
    .filter((a) => a.tipo === 'Lista de convidados' && a.validoAte >= t && a.status === 'ativa')
    .sort((a, b) => a.validoDe.localeCompare(b.validoDe))

  return (
    <>
      <PageHeader overline="Portaria" title="Listas de eventos" lead="Convidados das festas e reservas. Marque a chegada de cada um." />
      {listas.length === 0 ? (
        <Empty icon={PartyPopper} title="Nenhuma lista ativa" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listas.map((a) => {
            const r = db.reservations.find((x) => x.id === a.reservaId)
            const n = a.convidados.filter((c) => c.entrouEm).length
            const hoje = a.validoDe <= t
            return (
              <Card key={a.id} to={`portaria/autorizacoes/${a.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900">{a.nome}</p>
                    <p className="text-[0.8rem] text-ink-500">{unitLabel(unitById(db, a.unitId))}</p>
                  </div>
                  <Badge tone={hoje ? 'green' : 'blue'} dot>
                    {hoje ? 'Hoje' : fmtDate(a.validoDe)}
                  </Badge>
                </div>
                {r && (
                  <p className="mt-3 text-[0.84rem] text-ink-700">
                    {areaById(db, r.areaId)?.nome} · {r.slot}
                  </p>
                )}
                <Progress value={(n / a.convidados.length) * 100} tone="gold" className="mt-3" />
                <p className="mt-1.5 text-[0.78rem] font-semibold text-ink-700">
                  {n} de {a.convidados.length} chegaram · código <span className="font-mono">{a.codigo}</span>
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ---------- Visitante sem autorização ---------- */

export function SemAutorizacao() {
  const { db, mutate, user, toast } = useStore()
  const empty = { nome: '', documento: '', tipo: 'Visitante', unitId: '', placa: '', motivo: '' }
  const [f, setF] = useState(empty)
  const [aviso, setAviso] = useState(null)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const u = unitById(db, f.unitId)

  const avisar = (e) => {
    e.preventDefault()
    mutate(
      (d) =>
        notifyUnit(d, f.unitId, `${f.tipo} na portaria`, `${f.nome} quer entrar${f.motivo ? ` (${f.motivo})` : ''}. Autorize pelo app ou ligue para a portaria.`, 'morador/autorizacoes'),
      { acao: 'Avisou morador sobre visitante', alvo: `${f.nome} → ${unitLabel(u)}` },
    )
    setAviso({ ...f })
    toast('Morador avisado no aplicativo')
  }

  const liberar = (canal) => {
    const t = today()
    const id = uid('au')
    mutate(
      (d) => {
        d.authorizations.unshift({
          id, unitId: aviso.unitId, criadoPor: null, tipo: aviso.tipo, nome: aviso.nome, documento: aviso.documento,
          validoDe: t, validoAte: t, codigo: accessCode(), status: 'ativa', criadaEm: new Date().toISOString(),
          obs: `Autorizado ${canal}, registrado pela portaria (${user.nome}).${aviso.motivo ? ` Motivo: ${aviso.motivo}` : ''}`,
        })
        d.accessLog.unshift({ id: uid('ac'), autorizacaoId: id, nome: aviso.nome, unitId: aviso.unitId, tipo: aviso.tipo, entrada: new Date().toISOString(), saida: null, porteiro: user.nome, placa: aviso.placa })
        notifyUnit(d, aviso.unitId, 'Entrada liberada', `${aviso.nome} entrou com sua autorização ${canal}.`, 'morador/autorizacoes')
      },
      { acao: 'Liberou visitante sem autorização prévia', alvo: aviso.nome },
    )
    toast(`Entrada de ${aviso.nome} registrada`)
    setAviso(null)
    setF(empty)
    go(`portaria/autorizacoes/${id}`, { replace: true })
  }

  const recusar = () => {
    mutate((d) => {
      d.accessLog.unshift({ id: uid('ac'), autorizacaoId: null, nome: `${aviso.nome} (entrada negada)`, unitId: aviso.unitId, tipo: aviso.tipo, entrada: new Date().toISOString(), saida: new Date().toISOString(), porteiro: user.nome, placa: aviso.placa })
    }, { acao: 'Negou entrada', alvo: aviso.nome })
    toast('Entrada negada e registrada', 'error')
    setAviso(null)
    setF(empty)
  }

  return (
    <>
      <PageHeader overline="Portaria" title="Visitante sem autorização" lead="Registre quem chegou e avise o morador. A entrada só é liberada com o aceite dele." />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <form onSubmit={avisar} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" className="sm:col-span-2">
              <Input value={f.nome} onChange={set('nome')} required disabled={!!aviso} />
            </Field>
            <Field label="Documento">
              <Input value={f.documento} onChange={set('documento')} placeholder="RG ou CPF" disabled={!!aviso} />
            </Field>
            <Field label="Tipo">
              <Select value={f.tipo} onChange={set('tipo')} options={['Visitante', 'Prestador', 'Entregador']} disabled={!!aviso} />
            </Field>
            <Field label="Casa de destino">
              <Select value={f.unitId} onChange={set('unitId')} options={unitOptions(db)} required disabled={!!aviso} />
            </Field>
            <Field label="Placa" optional>
              <input className={cx(inputCls, 'font-mono uppercase')} value={f.placa} onChange={(e) => setF((x) => ({ ...x, placa: e.target.value.toUpperCase() }))} disabled={!!aviso} />
            </Field>
            <Field label="Motivo da visita" optional className="sm:col-span-2">
              <Textarea rows={2} value={f.motivo} onChange={set('motivo')} placeholder="Ex.: entrega de móveis, orçamento de pintura…" disabled={!!aviso} />
            </Field>
            {!aviso && (
              <div className="sm:col-span-2">
                <Button type="submit" variant="gold" size="lg" icon={BellRing} className="w-full sm:w-auto">
                  Avisar morador
                </Button>
              </div>
            )}
          </form>

          {aviso && (
            <div className="mt-6 border-t border-paper-200 pt-5">
              <Notice tone="gold" icon={BellRing}>
                Aviso enviado para <b>{unitLabel(unitById(db, aviso.unitId))}</b>. Aguarde a resposta ou ligue para o morador.
              </Notice>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="gold" size="lg" icon={PhoneCall} onClick={() => liberar('por telefone')}>
                  Morador autorizou por telefone
                </Button>
                <Button variant="soft" size="lg" icon={DoorOpen} onClick={() => liberar('pelo app')}>
                  Autorizou pelo app
                </Button>
                <Button variant="danger" size="lg" onClick={recusar}>
                  Não autorizou
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-3 text-[0.72rem] font-bold tracking-[0.18em] text-ink-500 uppercase">Moradores da casa</p>
          {!u ? (
            <p className="text-[0.86rem] text-ink-500">Escolha a casa de destino para ver quem mora lá.</p>
          ) : (
            <>
              <p className="display text-[1.2rem] text-ink-900">{unitLabel(u)}</p>
              <ul className="mt-3 space-y-2.5">
                {residentsOf(db, u.id).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Avatar name={p.nome} size={34} photo={p.foto} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.88rem] font-semibold text-ink-900">{p.nome}</p>
                      <p className="text-[0.75rem] text-ink-500">
                        {p.vinculo} · {p.telefone}
                      </p>
                    </div>
                  </li>
                ))}
                {residentsOf(db, u.id).length === 0 && <li className="text-[0.86rem] text-ink-500">Nenhum morador ativo. Contate a administração.</li>}
              </ul>
              <p className="mt-4 text-[0.78rem] text-ink-500">
                Autorizações válidas desta casa hoje:{' '}
                <b className="text-ink-700">{db.authorizations.filter((a) => a.unitId === u.id && authState(a) === 'ativa').length}</b>
              </p>
            </>
          )}
        </Card>
      </div>
    </>
  )
}

