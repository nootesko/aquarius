import { useState } from 'react'
import { Ban, Check, Lock, Pencil, Trash2, X } from 'lucide-react'
import { areaById, personById, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, today, uid } from '../lib/format.js'
import {
  AreaArt, Badge, Button, Card, Check as CheckBox, Empty, Field, Input, List, Modal, Notice, PageHeader, Row, SectionTitle, Select, StatusBadge, Table, Tabs, Td, Textarea, Toggle,
} from '../ui/kit.jsx'

/* ---------- Áreas comuns e regras ---------- */

export function Areas() {
  const { db } = useStore()
  const [edit, setEdit] = useState(null)
  return (
    <>
      <PageHeader overline="Gestão" title="Áreas comuns e regras" lead="Horários, capacidade, limites e antecedência de cada espaço." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {db.areas.map((a) => (
          <Card key={a.id} padded={false} className="overflow-hidden">
            <AreaArt area={a} className="h-28" size={38} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="display text-[1.2rem] text-ink-900">{a.nome}</p>
                  <p className="text-[0.78rem] text-ink-500">{a.tipo}</p>
                </div>
                {a.ativo ? <Badge tone="green" dot>Ativa</Badge> : <Badge tone="gray" dot>Inativa</Badge>}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.8rem]">
                <dt className="text-ink-500">Capacidade</dt>
                <dd className="font-semibold text-ink-900">{a.capacidade} pessoas</dd>
                {a.semReserva ? (
                  <>
                    <dt className="text-ink-500">Reserva</dt>
                    <dd className="font-semibold text-ink-900">Uso livre</dd>
                  </>
                ) : (
                  <>
                    <dt className="text-ink-500">Antecedência</dt>
                    <dd className="font-semibold text-ink-900">{a.antecedenciaDias} dia(s)</dd>
                    <dt className="text-ink-500">Limite/mês</dt>
                    <dd className="font-semibold text-ink-900">{a.limiteMes} por casa</dd>
                    <dt className="text-ink-500">Aprovação</dt>
                    <dd className="font-semibold text-ink-900">{a.exigeAprovacao ? 'Obrigatória' : 'Automática'}</dd>
                  </>
                )}
              </dl>
              <Button variant="outline" size="sm" icon={Pencil} className="mt-5" onClick={() => setEdit(a)}>
                Editar regras
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {edit && <AreaEditor area={edit} onClose={() => setEdit(null)} />}
    </>
  )
}

function AreaEditor({ area, onClose }) {
  const { mutate, toast } = useStore()
  const [f, setF] = useState({ ...area, regrasTxt: area.regras.join('\n') })
  const num = (k) => (e) => setF((x) => ({ ...x, [k]: Number(e.target.value) }))
  const save = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        const a = d.areas.find((x) => x.id === area.id)
        Object.assign(a, {
          capacidade: f.capacidade, taxa: f.taxa, antecedenciaDias: f.antecedenciaDias, limiteMes: f.limiteMes,
          exigeAprovacao: f.exigeAprovacao, ativo: f.ativo, descricao: f.descricao,
          regras: f.regrasTxt.split('\n').map((s) => s.trim()).filter(Boolean),
        })
      },
      { acao: 'Alterou regras da área', alvo: area.nome },
    )
    toast('Regras atualizadas')
    onClose()
  }
  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={area.nome}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="area-form">
            Salvar
          </Button>
        </>
      }
    >
      <form id="area-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Capacidade (pessoas)">
          <Input type="number" min={1} value={f.capacidade} onChange={num('capacidade')} />
        </Field>
        <Field label="Antecedência mínima (dias)">
          <Input type="number" min={0} value={f.antecedenciaDias} onChange={num('antecedenciaDias')} />
        </Field>
        <Field label="Limite por casa/mês">
          <Input type="number" min={0} value={f.limiteMes} onChange={num('limiteMes')} />
        </Field>
        <Field label="Descrição" className="sm:col-span-2">
          <Input value={f.descricao} onChange={(e) => setF((x) => ({ ...x, descricao: e.target.value }))} />
        </Field>
        <Field label="Regras (uma por linha)" className="sm:col-span-2">
          <Textarea value={f.regrasTxt} onChange={(e) => setF((x) => ({ ...x, regrasTxt: e.target.value }))} />
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-100 px-4 py-3 text-[0.86rem] font-semibold text-ink-700">
          Exige aprovação
          <Toggle checked={f.exigeAprovacao} label="Exige aprovação" onChange={(v) => setF((x) => ({ ...x, exigeAprovacao: v }))} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-paper-100 px-4 py-3 text-[0.86rem] font-semibold text-ink-700">
          Área ativa
          <Toggle checked={f.ativo} label="Área ativa" onChange={(v) => setF((x) => ({ ...x, ativo: v }))} />
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Gestão de reservas ---------- */

export function Reservations() {
  const { db, mutate, toast } = useStore()
  const [tab, setTab] = useState('pendente')
  const [area, setArea] = useState('todas')
  const [blockOpen, setBlockOpen] = useState(false)
  const t = today()

  const filtered = db.reservations
    .filter((r) => area === 'todas' || r.areaId === area)
    .filter((r) => {
      if (tab === 'pendente') return r.status === 'pendente'
      if (tab === 'proximas') return r.status === 'confirmada' && r.data >= t
      if (tab === 'historico') return r.data < t || ['cancelada', 'concluída', 'recusada'].includes(r.status)
      return true
    })
    .sort((a, b) => a.data.localeCompare(b.data))

  const setStatus = (r, status, msg) => {
    const a = areaById(db, r.areaId)
    mutate(
      (d) => {
        d.reservations.find((x) => x.id === r.id).status = status
        pushNotification(d, r.personId, `Reserva ${msg}`, `${a.nome} · ${fmtDate(r.data)}`, 'morador/reservas/minhas')
      },
      { acao: `Reserva ${msg}`, alvo: `${a.nome} · ${unitLabel(unitById(db, r.unitId))}` },
    )
    toast(`Reserva ${msg}`)
  }

  const count = (s) => db.reservations.filter((r) => r.status === s).length

  return (
    <>
      <PageHeader
        overline="Gestão"
        title="Reservas"
        lead="Aprove, cancele e bloqueie datas para manutenção."
        actions={
          <Button variant="outline" icon={Lock} onClick={() => setBlockOpen(true)}>
            Bloquear data
          </Button>
        }
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pendente', label: 'Para aprovar', count: count('pendente') },
            { id: 'proximas', label: 'Próximas' },
            { id: 'historico', label: 'Histórico' },
            { id: 'todas', label: 'Todas' },
          ]}
        />
        <div className="w-52">
          <Select value={area} onChange={(e) => setArea(e.target.value)} options={[{ value: 'todas', label: 'Todas as áreas' }, ...db.areas.filter((a) => !a.semReserva).map((a) => ({ value: a.id, label: a.nome }))]} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="Nenhuma reserva neste filtro" />
      ) : (
        <Table head={['Data', 'Área', 'Unidade', 'Período', 'Convidados', 'Situação', '']}>
          {filtered.map((r) => (
            <tr key={r.id}>
              <Td className="font-semibold whitespace-nowrap text-ink-900">{fmtDate(r.data)}</Td>
              <Td className="whitespace-nowrap">{areaById(db, r.areaId)?.nome}</Td>
              <Td className="whitespace-nowrap">
                {unitLabel(unitById(db, r.unitId))}
                <span className="block text-[0.75rem] text-ink-500">{personById(db, r.personId)?.nome}{r.obs ? ` · ${r.obs}` : ''}</span>
              </Td>
              <Td className="text-[0.8rem] whitespace-nowrap text-ink-600">{r.slot}</Td>
              <Td>{r.convidados}</Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
              <Td>
                <div className="flex justify-end gap-1.5">
                  {r.status === 'pendente' && (
                    <>
                      <Button size="sm" variant="danger" icon={X} onClick={() => setStatus(r, 'recusada', 'recusada')}>
                        Recusar
                      </Button>
                      <Button size="sm" variant="brand" icon={Check} onClick={() => setStatus(r, 'confirmada', 'aprovada')}>
                        Aprovar
                      </Button>
                    </>
                  )}
                  {r.status === 'confirmada' && r.data >= t && (
                    <Button size="sm" variant="ghost" icon={Ban} onClick={() => setStatus(r, 'cancelada', 'cancelada')}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <SectionTitle className="mt-8">Datas bloqueadas</SectionTitle>
      <List>
        {db.blocks.length === 0 && <Row title="Nenhuma data bloqueada" />}
        {db.blocks
          .slice()
          .sort((a, b) => a.data.localeCompare(b.data))
          .map((b) => (
            <Row
              key={b.id}
              leading={<Lock size={18} className="text-gold-ink" />}
              title={`${areaById(db, b.areaId)?.nome} · ${fmtDate(b.data)}`}
              subtitle={b.motivo}
              trailing={
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => {
                    mutate((d) => (d.blocks = d.blocks.filter((x) => x.id !== b.id)), { acao: 'Desbloqueou data', alvo: `${areaById(db, b.areaId)?.nome} · ${fmtDate(b.data)}` })
                    toast('Data liberada')
                  }}
                >
                  Liberar
                </Button>
              }
            />
          ))}
      </List>
      <BlockModal open={blockOpen} onClose={() => setBlockOpen(false)} />
    </>
  )
}

function BlockModal({ open, onClose }) {
  const { db, mutate, toast } = useStore()
  const areas = db.areas.filter((a) => !a.semReserva)
  const [f, setF] = useState({ areaId: areas[0].id, data: today(), motivo: '', cancelar: true })
  const conflicts = db.reservations.filter((r) => r.areaId === f.areaId && r.data === f.data && ['confirmada', 'pendente'].includes(r.status))
  const save = (e) => {
    e.preventDefault()
    const a = areaById(db, f.areaId)
    mutate(
      (d) => {
        d.blocks.push({ id: uid('b'), areaId: f.areaId, data: f.data, motivo: f.motivo })
        if (f.cancelar)
          d.reservations
            .filter((r) => r.areaId === f.areaId && r.data === f.data && ['confirmada', 'pendente'].includes(r.status))
            .forEach((r) => {
              r.status = 'cancelada'
              pushNotification(d, r.personId, 'Reserva cancelada pela administração', `${a.nome} · ${fmtDate(r.data)}: ${f.motivo}`, 'morador/reservas/minhas')
            })
      },
      { acao: 'Bloqueou data', alvo: `${a.nome} · ${fmtDate(f.data)}` },
    )
    toast('Data bloqueada')
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bloquear data"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="block-form" icon={Lock}>
            Bloquear
          </Button>
        </>
      }
    >
      <form id="block-form" onSubmit={save} className="space-y-4">
        <Field label="Área">
          <Select value={f.areaId} onChange={(e) => setF((x) => ({ ...x, areaId: e.target.value }))} options={areas.map((a) => ({ value: a.id, label: a.nome }))} />
        </Field>
        <Field label="Data">
          <Input type="date" value={f.data} min={today()} onChange={(e) => setF((x) => ({ ...x, data: e.target.value }))} required />
        </Field>
        <Field label="Motivo">
          <Input value={f.motivo} onChange={(e) => setF((x) => ({ ...x, motivo: e.target.value }))} placeholder="Ex.: manutenção da churrasqueira" required />
        </Field>
        {conflicts.length > 0 && (
          <Notice tone="gold">
            Há {conflicts.length} reserva(s) nesta data.
            <div className="mt-2">
              <CheckBox checked={f.cancelar} onChange={(v) => setF((x) => ({ ...x, cancelar: v }))}>
                Cancelar e avisar os moradores
              </CheckBox>
            </div>
          </Notice>
        )}
      </form>
    </Modal>
  )
}

