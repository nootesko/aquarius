import { useState } from 'react'
import { Download, Save } from 'lucide-react'
import { areaById, useStore } from '../lib/store.jsx'
import { downloadCsv, fmtDateTime } from '../lib/format.js'
import { Button, Card, Field, Input, PageHeader, SearchInput, SectionTitle, Select, Stat, Table, Td, Toggle } from '../ui/kit.jsx'
import { HBars } from './common.jsx'

const countBy = (items, key) =>
  Object.entries(items.reduce((acc, x) => ({ ...acc, [key(x)]: (acc[key(x)] ?? 0) + 1 }), {}))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

/* ---------- Relatórios ---------- */

export function Reports() {
  const { db } = useStore()
  const valid = db.reservations.filter((r) => !['cancelada', 'recusada'].includes(r.status))
  const receita = valid.reduce((s, r) => s + (r.taxa || 0), 0)
  const resolvidas = db.requests.filter((r) => ['resolvida', 'encerrada'].includes(r.status)).length
  const habilitadas = db.units.filter((u) => u.status !== 'vazia').length

  const participacao = db.votes
    .filter((v) => v.status !== 'futura')
    .map((v) => {
      const n = v.votoPor === 'unidade' ? new Set(v.votos.map((x) => x.unitId)).size : v.votos.length
      const base = v.votoPor === 'unidade' ? habilitadas : db.persons.filter((p) => p.tipo === 'permanente' && p.status === 'ativo').length
      return { label: v.titulo, value: Math.round((n / base) * 100) }
    })

  return (
    <>
      <PageHeader overline="Sistema" title="Relatórios" lead="Uso dos espaços, atendimento e participação dos moradores." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Reservas no período" value={valid.length} />
        <Stat label="Taxas de reserva" value={receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} tone="gold" />
        <Stat label="Solicitações resolvidas" value={`${resolvidas}/${db.requests.length}`} tone="green" />
        <Stat label="Atividades com inscrição" value={db.activities.reduce((s, a) => s + a.inscritos.length, 0)} tone="navy" hint="inscrições no total" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Uso por área</SectionTitle>
          <HBars rows={countBy(valid, (r) => areaById(db, r.areaId)?.nome)} />
        </Card>
        <Card>
          <SectionTitle>Participação nas votações (%)</SectionTitle>
          <HBars rows={participacao} tone="gold" format={(v) => `${v}%`} />
        </Card>
        <Card>
          <SectionTitle>Solicitações por categoria</SectionTitle>
          <HBars rows={countBy(db.requests, (r) => r.categoria)} tone="navy" />
        </Card>
        <Card>
          <SectionTitle>Solicitações por situação</SectionTitle>
          <HBars rows={countBy(db.requests, (r) => r.status)} tone="green" />
        </Card>
      </div>
    </>
  )
}

/* ---------- Histórico de ações ---------- */

export function AuditLog() {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const rows = db.audit.filter((a) => [a.quem, a.acao, a.alvo].join(' ').toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHeader
        overline="Sistema"
        title="Histórico de ações"
        lead="Quem alterou cadastros, documentos, reservas e configurações."
        actions={
          <Button variant="outline" icon={Download} onClick={() => downloadCsv('historico-de-acoes.csv', [['Data', 'Quem', 'Ação', 'Alvo'], ...rows.map((a) => [fmtDateTime(a.em), a.quem, a.acao, a.alvo])])}>
            Exportar
          </Button>
        }
      />
      <SearchInput value={q} onChange={setQ} placeholder="Buscar por pessoa, ação ou item" className="mb-4 max-w-md" />
      <Table head={['Quando', 'Quem', 'Ação', 'Item']}>
        {rows.map((a) => (
          <tr key={a.id}>
            <Td className="whitespace-nowrap text-ink-500">{fmtDateTime(a.em)}</Td>
            <Td className="font-semibold whitespace-nowrap text-ink-900">{a.quem}</Td>
            <Td className="whitespace-nowrap">{a.acao}</Td>
            <Td className="text-ink-600">{a.alvo}</Td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/* ---------- Configurações ---------- */

export function Settings() {
  const { db, mutate, toast } = useStore()
  const [f, setF] = useState(db.settings)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const save = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        d.settings = { ...f, reservaAntecedenciaMax: Number(f.reservaAntecedenciaMax), cancelamentoSemTaxaHoras: Number(f.cancelamentoSemTaxaHoras) }
      },
      { acao: 'Alterou configurações', alvo: 'Condomínio' },
    )
    toast('Configurações salvas')
  }
  return (
    <>
      <PageHeader overline="Sistema" title="Configurações" lead="Dados do condomínio, notificações e políticas." />
      <form onSubmit={save} className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle className="mb-0">Condomínio</SectionTitle>
          <Field label="Nome">
            <Input value={f.nome} onChange={set('nome')} />
          </Field>
          <Field label="CNPJ">
            <Input value={f.cnpj} onChange={set('cnpj')} />
          </Field>
          <Field label="Endereço">
            <Input value={f.endereco} onChange={set('endereco')} />
          </Field>
          <Field label="E-mail da administração">
            <Input type="email" value={f.emailAdm} onChange={set('emailAdm')} />
          </Field>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <SectionTitle className="mb-0">Políticas</SectionTitle>
            <Field label="Reservar com até quantos dias de antecedência">
              <Input type="number" value={f.reservaAntecedenciaMax} onChange={set('reservaAntecedenciaMax')} />
            </Field>
            <Field label="Cancelamento sem taxa até (horas antes)">
              <Input type="number" value={f.cancelamentoSemTaxaHoras} onChange={set('cancelamentoSemTaxaHoras')} />
            </Field>
            <Field label="Voto padrão nas votações formais">
              <Select value={f.votoPadrao} onChange={set('votoPadrao')} options={[{ value: 'unidade', label: 'Por unidade' }, { value: 'pessoa', label: 'Por pessoa' }]} />
            </Field>
          </Card>
          <Card className="space-y-3">
            <SectionTitle className="mb-0">Notificações</SectionTitle>
            {[
              ['notificarPorPush', 'Notificações no aplicativo'],
              ['notificarPorEmail', 'Cópia por e-mail'],
            ].map(([k, l]) => (
              <div key={k} className="flex items-center justify-between text-[0.88rem] text-ink-700">
                {l}
                <Toggle checked={f[k]} label={l} onChange={(v) => setF((x) => ({ ...x, [k]: v }))} />
              </div>
            ))}
          </Card>
          <Button type="submit" variant="gold" icon={Save}>
            Salvar configurações
          </Button>
        </div>
      </form>
    </>
  )
}
