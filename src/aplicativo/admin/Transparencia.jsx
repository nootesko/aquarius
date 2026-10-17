import { useState } from 'react'
import { FilePlus2, FileText, History, Landmark, Plus, Save, ShieldCheck, Upload } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { fmtDate, today, uid } from '../lib/format.js'
import {
  Badge, Button, Card, Empty, Field, Input, Modal, Notice, PageHeader, SectionTitle, Select, Stat, StatusBadge, Table, Tabs, Td, cx,
} from '../ui/kit.jsx'
import { HBars, PairBars, money, notifyAll } from './common.jsx'

const CATS = ['Balancete', 'Balanço', 'DRE', 'Contrato', 'Estatuto', 'Convenção', 'Regimento', 'Ata', 'Relatório']

/* ---------- Documentos ---------- */

export function Documents() {
  const { db, mutate, toast } = useStore()
  const [cat, setCat] = useState('todos')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ titulo: '', categoria: 'Balancete', periodo: '', avisar: true })

  const rows = db.documents.filter((d) => cat === 'todos' || d.categoria === cat).sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))

  const publish = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        d.documents.unshift({ id: uid('d'), ...f, ano: new Date().getFullYear(), tamanho: `${Math.round(200 + Math.random() * 800)} KB`, publicadoEm: new Date().toISOString(), versao: 1 })
        if (f.avisar) notifyAll(d, 'Novo documento em Transparência', f.titulo, 'morador/transparencia')
      },
      { acao: 'Publicou documento', alvo: f.titulo },
    )
    toast('Documento publicado')
    setOpen(false)
    setF({ titulo: '', categoria: 'Balancete', periodo: '', avisar: true })
  }

  const newVersion = (doc) => {
    mutate(
      (d) => {
        const x = d.documents.find((y) => y.id === doc.id)
        x.versao += 1
        x.publicadoEm = new Date().toISOString()
      },
      { acao: 'Publicou nova versão', alvo: `${doc.titulo} (v${doc.versao + 1})` },
    )
    toast(`Versão ${doc.versao + 1} publicada`)
  }

  return (
    <>
      <PageHeader
        overline="Transparência"
        title="Documentos"
        lead="Balancetes, balanços, contratos, estatuto, convenção, regimento e atas."
        actions={
          <Button variant="gold" icon={Upload} onClick={() => setOpen(true)}>
            Publicar documento
          </Button>
        }
      />
      <Tabs value={cat} onChange={setCat} tabs={[{ id: 'todos', label: 'Todos', count: db.documents.length }, ...CATS.map((c) => ({ id: c, label: c }))]} />
      {rows.length === 0 ? (
        <Empty icon={FileText} title="Nenhum documento nesta categoria" />
      ) : (
        <Table head={['Documento', 'Categoria', 'Período', 'Versão', 'Publicado', '']}>
          {rows.map((d) => (
            <tr key={d.id}>
              <Td>
                <span className="flex items-center gap-3">
                  <FileText size={18} className="shrink-0 text-brand-600" />
                  <span>
                    <span className="block font-semibold text-ink-900">{d.titulo}</span>
                    <span className="text-[0.75rem] text-ink-500">PDF · {d.tamanho}</span>
                  </span>
                </span>
              </Td>
              <Td>
                <Badge tone="blue">{d.categoria}</Badge>
              </Td>
              <Td className="whitespace-nowrap">{d.periodo}</Td>
              <Td>v{d.versao}</Td>
              <Td className="whitespace-nowrap text-ink-500">{fmtDate(d.publicadoEm)}</Td>
              <Td>
                <Button size="sm" variant="ghost" icon={History} onClick={() => newVersion(d)}>
                  Nova versão
                </Button>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Publicar documento"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="doc-form" icon={FilePlus2}>
              Publicar
            </Button>
          </>
        }
      >
        <form id="doc-form" onSubmit={publish} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-paper-300 px-4 py-8 text-center text-[0.86rem] text-ink-500 hover:bg-paper-100">
            <Upload size={24} className="text-brand-600" />
            Arraste o PDF ou clique para escolher
            <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files[0] && setF((x) => ({ ...x, titulo: x.titulo || e.target.files[0].name.replace(/\.pdf$/i, '') }))} />
          </label>
          <Field label="Título">
            <Input value={f.titulo} onChange={(e) => setF((x) => ({ ...x, titulo: e.target.value }))} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <Select value={f.categoria} onChange={(e) => setF((x) => ({ ...x, categoria: e.target.value }))} options={CATS} />
            </Field>
            <Field label="Período">
              <Input value={f.periodo} onChange={(e) => setF((x) => ({ ...x, periodo: e.target.value }))} placeholder="Out/2026" required />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[0.86rem] text-ink-700">
            <input type="checkbox" checked={f.avisar} onChange={(e) => setF((x) => ({ ...x, avisar: e.target.checked }))} className="accent-brand-600" />
            Avisar os moradores
          </label>
        </form>
      </Modal>
    </>
  )
}

/* ---------- Finanças ---------- */

export function Finance() {
  const { db, mutate, toast } = useStore()
  const fin = db.finance
  const [f, setF] = useState({ saldoCaixa: fin.saldoCaixa, fundoReserva: fin.fundoReserva, inadimplencia: fin.inadimplencia, limiteSemAssembleia: fin.limiteSemAssembleia })
  const last = fin.meses[fin.meses.length - 1]
  const result = last.receitas - last.despesas

  const save = (e) => {
    e.preventDefault()
    mutate((d) => Object.assign(d.finance, Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Number(v)]))), { acao: 'Atualizou resumo financeiro', alvo: 'Finanças' })
    toast('Resumo financeiro atualizado')
  }

  return (
    <>
      <PageHeader overline="Transparência" title="Finanças" lead="Resumo que os moradores veem em Transparência. Os detalhes ficam nos balancetes." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saldo em caixa" value={money(fin.saldoCaixa)} icon={Landmark} tone="navy" />
        <Stat label="Fundo de reserva" value={money(fin.fundoReserva)} icon={ShieldCheck} tone="blue" />
        <Stat label={`Resultado de ${last.mes}`} value={money(result)} tone={result >= 0 ? 'green' : 'red'} />
        <Stat label="Inadimplência" value={`${fin.inadimplencia}%`} tone="gold" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle>Receitas × despesas</SectionTitle>
          <PairBars rows={fin.meses} a="receitas" b="despesas" labels={['Receitas', 'Despesas']} format={money} />
        </Card>
        <Card>
          <SectionTitle>Despesas de {last.mes}</SectionTitle>
          <HBars rows={fin.despesasMes.map((x) => ({ label: x.item, value: x.valor }))} format={money} tone="gold" />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Atualizar resumo</SectionTitle>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {[
              ['saldoCaixa', 'Saldo em caixa (R$)'],
              ['fundoReserva', 'Fundo de reserva (R$)'],
              ['inadimplencia', 'Inadimplência (%)'],
              ['limiteSemAssembleia', 'Limite sem assembleia (R$)'],
            ].map(([k, l]) => (
              <Field key={k} label={l}>
                <Input type="number" step="any" value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} />
              </Field>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" icon={Save}>
                Salvar
              </Button>
            </div>
          </form>
        </Card>
        <Notice tone="gold" icon={ShieldCheck} className="h-fit">
          <b>Salvaguarda:</b> gastos acima de {money(fin.limiteSemAssembleia)} precisam de aprovação dos proprietários em votação formal antes da contratação. Isso aparece para os moradores na tela de Transparência.
        </Notice>
      </div>
    </>
  )
}

/* ---------- Obras e ações ---------- */

const PRIO = { Alta: 'red', Média: 'gold', Baixa: 'gray' }

export function Works() {
  const { db, mutate, toast } = useStore()
  const w = db.works
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ titulo: '', area: 'Ruas', data: today(), status: 'planejada', valor: '' })

  const setEtapa = (rua, etapa) => {
    mutate(
      (d) => {
        d.works.ruas.find((r) => r.rua === rua).etapa = etapa
      },
      { acao: 'Atualizou etapa da rua', alvo: `${rua}: ${w.etapas[etapa]}` },
    )
    toast(`${rua}: ${w.etapas[etapa]}`)
  }

  const setStatus = (id, status) => mutate((d) => (d.works.acoes.find((a) => a.id === id).status = status), { acao: 'Atualizou ação', alvo: status })

  const add = (e) => {
    e.preventDefault()
    mutate((d) => d.works.acoes.unshift({ id: uid('w'), ...f, valor: Number(f.valor) || 0 }), { acao: 'Registrou ação', alvo: f.titulo })
    toast('Ação registrada')
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        overline="Transparência"
        title="Obras e ações"
        lead="Andamento das ruas e de tudo o que a gestão está fazendo."
        actions={
          <Button variant="gold" icon={Plus} onClick={() => setOpen(true)}>
            Registrar ação
          </Button>
        }
      />
      <SectionTitle>Ruas, pavimentação e drenagem</SectionTitle>
      <Table head={['Rua', 'Prioridade', 'Problema', 'Extensão', 'Etapa']}>
        {w.ruas.map((r) => (
          <tr key={r.rua}>
            <Td className="font-semibold whitespace-nowrap text-ink-900">{r.rua}</Td>
            <Td>
              <Badge tone={PRIO[r.prioridade]}>{r.prioridade}</Badge>
            </Td>
            <Td className="text-ink-600">{r.problema}</Td>
            <Td className="whitespace-nowrap">{r.extensao} m</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5" aria-hidden="true">
                  {w.etapas.map((_, i) => (
                    <span key={i} className={cx('h-2 w-4 rounded-full', i <= r.etapa ? 'bg-gold-400' : 'bg-paper-200')} />
                  ))}
                </div>
                <select
                  aria-label={`Etapa · ${r.rua}`}
                  value={r.etapa}
                  onChange={(e) => setEtapa(r.rua, Number(e.target.value))}
                  className="rounded-lg bg-paper-100 px-2 py-1 text-[0.8rem] font-semibold text-ink-700 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {w.etapas.map((et, i) => (
                    <option key={et} value={i}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      <SectionTitle className="mt-8">Ações da gestão</SectionTitle>
      <Table head={['Ação', 'Frente', 'Data', 'Valor', 'Situação']}>
        {w.acoes
          .slice()
          .sort((a, b) => b.data.localeCompare(a.data))
          .map((a) => (
            <tr key={a.id}>
              <Td className="font-semibold text-ink-900">{a.titulo}</Td>
              <Td>
                <Badge tone="blue">{a.area}</Badge>
              </Td>
              <Td className="whitespace-nowrap">{fmtDate(a.data)}</Td>
              <Td className="whitespace-nowrap">{a.valor ? money(a.valor) : '—'}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status === 'concluída' ? 'resolvida' : a.status} label={a.status} />
                  <select
                    aria-label="Mudar situação"
                    value={a.status}
                    onChange={(e) => setStatus(a.id, e.target.value)}
                    className="rounded-lg bg-paper-100 px-1.5 py-1 text-[0.75rem] text-ink-700 outline-none"
                  >
                    {['planejada', 'em andamento', 'concluída'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </Td>
            </tr>
          ))}
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar ação"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="work-form">
              Registrar
            </Button>
          </>
        }
      >
        <form id="work-form" onSubmit={add} className="grid gap-4 sm:grid-cols-2">
          <Field label="Ação" className="sm:col-span-2">
            <Input value={f.titulo} onChange={(e) => setF((x) => ({ ...x, titulo: e.target.value }))} required />
          </Field>
          <Field label="Frente">
            <Select value={f.area} onChange={(e) => setF((x) => ({ ...x, area: e.target.value }))} options={['Ruas', 'Segurança', 'Lazer', 'Natureza', 'Comunidade', 'Transparência']} />
          </Field>
          <Field label="Situação">
            <Select value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))} options={['planejada', 'em andamento', 'concluída']} />
          </Field>
          <Field label="Data">
            <Input type="date" value={f.data} onChange={(e) => setF((x) => ({ ...x, data: e.target.value }))} />
          </Field>
          <Field label="Valor (R$)" optional>
            <Input type="number" value={f.valor} onChange={(e) => setF((x) => ({ ...x, valor: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </>
  )
}
