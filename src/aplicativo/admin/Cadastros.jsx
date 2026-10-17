import { useState } from 'react'
import { Car, Check, Home, PawPrint, Plus, X } from 'lucide-react'
import { unitById, unitLabel, useStore } from '../lib/store.jsx'
import { uid } from '../lib/format.js'
import {
  Avatar, Badge, Button, Card, Empty, Field, Input, List, Modal, Notice, PageHeader, Row, SearchInput, SectionTitle, Select, StatusBadge, Table, Tabs, Td,
} from '../ui/kit.jsx'

const UNIT_TONE = { ocupada: 'green', alugada: 'blue', vazia: 'gray', 'em obra': 'orange' }

/* ---------- Unidades ---------- */

export function Units({ id }) {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  if (id) return <UnitDetail id={id} />

  const term = q.toLowerCase()
  const rows = db.units.filter((u) => {
    const people = db.persons.filter((p) => p.unitId === u.id).map((p) => p.nome)
    return [u.rua, u.numero, u.quadra, ...people].join(' ').toLowerCase().includes(term)
  })

  return (
    <>
      <PageHeader
        overline="Gestão"
        title="Unidades"
        lead={`${db.units.length} casas cadastradas na demonstração.`}
        actions={
          <Button variant="gold" icon={Plus} onClick={() => setOpen(true)}>
            Cadastrar unidade
          </Button>
        }
      />
      <SearchInput value={q} onChange={setQ} placeholder="Buscar por rua, número, quadra ou morador" className="mb-4 max-w-md" />
      <Table head={['Unidade', 'Quadra/lote', 'Proprietário', 'Moradores', 'Situação']}>
        {rows.map((u) => {
          const owner = db.ownership.find((o) => o.unitId === u.id && o.papel.startsWith('Propriet'))
          const ownerName = owner ? db.persons.find((p) => p.id === owner.personId)?.nome : db.persons.find((p) => p.unitId === u.id && p.vinculo.startsWith('Propriet'))?.nome
          const n = db.persons.filter((p) => p.unitId === u.id && p.status !== 'inativo').length
          return (
            <tr key={u.id} className="cursor-pointer hover:bg-paper-100" onClick={() => (window.location.hash = `/admin/unidades/${u.id}`)}>
              <Td className="font-semibold text-ink-900">
                <a href={`#/admin/unidades/${u.id}`}>{unitLabel(u)}</a>
              </Td>
              <Td className="text-ink-600">
                {u.quadra} / {u.lote}
              </Td>
              <Td>{ownerName ?? '—'}</Td>
              <Td>{n}</Td>
              <Td>
                <Badge tone={UNIT_TONE[u.status]} dot>
                  {u.status}
                </Badge>
              </Td>
            </tr>
          )
        })}
      </Table>
      <NewUnit open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function NewUnit({ open, onClose }) {
  const { mutate, toast } = useStore()
  const [f, setF] = useState({ rua: 'Rua Noel Infante', numero: '', quadra: '', lote: '', area: '', status: 'vazia' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const save = (e) => {
    e.preventDefault()
    mutate((d) => d.units.push({ id: uid('u'), tipo: 'Casa', ...f, area: Number(f.area) || 0 }), { acao: 'Cadastrou unidade', alvo: `${f.rua}, ${f.numero}` })
    toast('Unidade cadastrada')
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova unidade"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="new-unit">
            Cadastrar
          </Button>
        </>
      }
    >
      <form id="new-unit" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Rua" className="sm:col-span-2">
          <Select value={f.rua} onChange={set('rua')} options={['Rua Noel Infante', 'Rua Lázaro Ferreira Pinto', 'Rua Valentina Sales', 'Rua Francisco Paulino Vicente', 'Rua José de Oliveira Leite', 'Rua Acácio Antunes Pinto', 'Rua Benedita Maria de Jesus', 'Rua Nelson Caetano de Oliveira']} />
        </Field>
        <Field label="Número">
          <Input value={f.numero} onChange={set('numero')} required />
        </Field>
        <Field label="Área (m²)">
          <Input type="number" value={f.area} onChange={set('area')} />
        </Field>
        <Field label="Quadra">
          <Input value={f.quadra} onChange={set('quadra')} required />
        </Field>
        <Field label="Lote">
          <Input value={f.lote} onChange={set('lote')} required />
        </Field>
        <Field label="Situação" className="sm:col-span-2">
          <Select value={f.status} onChange={set('status')} options={['ocupada', 'alugada', 'vazia', 'em obra']} />
        </Field>
      </form>
    </Modal>
  )
}

function UnitDetail({ id }) {
  const { db, mutate, toast } = useStore()
  const u = unitById(db, id)
  if (!u) return <Empty title="Unidade não encontrada" action={<Button to="admin/unidades">Voltar</Button>} />
  const people = db.persons.filter((p) => p.unitId === id)
  const links = db.ownership.filter((o) => o.unitId === id)
  const vehicles = db.vehicles.filter((v) => v.unitId === id)
  const pets = db.pets.filter((p) => p.unitId === id)

  return (
    <>
      <PageHeader back="admin/unidades" overline={`Casa · Quadra ${u.quadra} · Lote ${u.lote}`} title={unitLabel(u)} lead={`${u.area} m² · situação: ${u.status}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section>
            <SectionTitle>Responsáveis</SectionTitle>
            <List>
              {links.length === 0 && <Row title="Sem vínculo de propriedade registrado" />}
              {links.map((o) => {
                const p = db.persons.find((x) => x.id === o.personId)
                return <Row key={o.personId + o.papel} leading={<Avatar name={p.nome} photo={p.foto} />} title={p.nome} subtitle={`${o.papel} · ${p.telefone}`} trailing={<Badge tone={o.papel === 'Inquilino' ? 'blue' : 'gold'}>{o.papel}</Badge>} />
              })}
            </List>
          </section>
          <section>
            <SectionTitle>Pessoas vinculadas</SectionTitle>
            <List>
              {people.length === 0 && <Row title="Nenhuma pessoa cadastrada" />}
              {people.map((p) => (
                <Row
                  key={p.id}
                  leading={<Avatar name={p.nome} photo={p.foto} />}
                  title={p.nome}
                  subtitle={`${p.vinculo}${p.obs ? ` · ${p.obs}` : ''}`}
                  trailing={
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} label={p.status === 'pendente' ? 'Pendente' : undefined} />
                      {p.status !== 'inativo' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            mutate((d) => (d.persons.find((x) => x.id === p.id).status = 'inativo'), { acao: 'Desativou cadastro', alvo: p.nome })
                            toast('Cadastro desativado')
                          }}
                        >
                          Desativar
                        </Button>
                      )}
                    </div>
                  }
                />
              ))}
            </List>
          </section>
        </div>
        <div className="space-y-6">
          <section>
            <SectionTitle>Veículos</SectionTitle>
            <List>
              {vehicles.length === 0 && <Row title="Nenhum veículo" />}
              {vehicles.map((v) => (
                <Row key={v.id} leading={<Car size={20} className="text-brand-700" />} title={v.placa} subtitle={`${v.modelo} · ${v.cor}`} />
              ))}
            </List>
          </section>
          <section>
            <SectionTitle>Pets</SectionTitle>
            <List>
              {pets.length === 0 && <Row title="Nenhum pet" />}
              {pets.map((p) => (
                <Row key={p.id} leading={<PawPrint size={20} className="text-gold-ink" />} title={p.nome} subtitle={`${p.especie} · ${p.raca}`} />
              ))}
            </List>
          </section>
        </div>
      </div>
    </>
  )
}

/* ---------- Pessoas ---------- */

export function People() {
  const { db, mutate, toast } = useStore()
  const [tab, setTab] = useState('pendente')
  const [q, setQ] = useState('')
  const all = db.persons.filter((p) => p.tipo !== 'equipe')
  const count = (s) => all.filter((p) => p.status === s).length
  const rows = all.filter((p) => (tab === 'todos' || p.status === tab) && p.nome.toLowerCase().includes(q.toLowerCase()))

  const decide = (p, ok) => {
    mutate(
      (d) => {
        d.persons.find((x) => x.id === p.id).status = ok ? 'ativo' : 'inativo'
      },
      { acao: ok ? 'Aprovou vínculo' : 'Recusou vínculo', alvo: p.nome },
    )
    toast(ok ? `${p.nome} aprovado` : 'Vínculo recusado')
  }

  return (
    <>
      <PageHeader overline="Gestão" title="Pessoas e moradores" lead="Confira cadastros, fotos e aprove novos vínculos." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'pendente', label: 'Pendentes', count: count('pendente') },
          { id: 'ativo', label: 'Ativos', count: count('ativo') },
          { id: 'inativo', label: 'Inativos', count: count('inativo') },
          { id: 'todos', label: 'Todos' },
        ]}
      />
      <SearchInput value={q} onChange={setQ} placeholder="Buscar pessoa" className="mb-4 max-w-md" />
      {tab === 'pendente' && rows.length > 0 && (
        <Notice tone="gold" className="mb-4">
          Confira os documentos enviados antes de aprovar. A pessoa só acessa o app depois da aprovação.
        </Notice>
      )}
      {rows.length === 0 ? (
        <Empty title="Ninguém por aqui" />
      ) : (
        <List>
          {rows.map((p) => (
            <Row
              key={p.id}
              leading={<Avatar name={p.nome} photo={p.foto} />}
              title={p.nome}
              subtitle={`${p.vinculo} · ${unitLabel(unitById(db, p.unitId))}${p.obs ? ` · ${p.obs}` : ''}`}
              trailing={
                p.status === 'pendente' ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" icon={X} onClick={() => decide(p, false)}>
                      Recusar
                    </Button>
                    <Button size="sm" variant="brand" icon={Check} onClick={() => decide(p, true)}>
                      Aprovar
                    </Button>
                  </div>
                ) : (
                  <StatusBadge status={p.status} />
                )
              }
            />
          ))}
        </List>
      )}
    </>
  )
}

/* ---------- Usuários e permissões ---------- */

const LEVEL_TONE = { nenhum: 'text-ink-500 bg-paper-100', ver: 'text-brand-700 bg-brand-50', editar: 'text-white bg-brand-600' }

export function Permissions() {
  const { db, mutate, toast } = useStore()
  const change = (mod, i, v) => {
    mutate(
      (d) => {
        d.permissions[mod][i] = v
      },
      { acao: 'Alterou permissão', alvo: `${db.roles[i]} · ${mod}: ${v}` },
    )
    toast('Permissão atualizada')
  }
  return (
    <>
      <PageHeader overline="Sistema" title="Usuários e permissões" lead="Defina o que cada perfil pode acessar. Fotos, denúncias e votos individuais têm acesso restrito." />
      <Table head={['Módulo', ...db.roles]}>
        {Object.entries(db.permissions).map(([mod, levels]) => (
          <tr key={mod}>
            <Td className="font-semibold whitespace-nowrap text-ink-900">{mod}</Td>
            {levels.map((lv, i) => (
              <Td key={i}>
                <select
                  aria-label={`${mod} · ${db.roles[i]}`}
                  value={lv}
                  onChange={(e) => change(mod, i, e.target.value)}
                  className={`rounded-lg px-2 py-1.5 text-[0.8rem] font-bold outline-none focus:ring-2 focus:ring-brand-500 ${LEVEL_TONE[lv]}`}
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="ver">Ver</option>
                  <option value="editar">Editar</option>
                </select>
              </Td>
            ))}
          </tr>
        ))}
      </Table>
      <SectionTitle className="mt-8">Equipe com acesso</SectionTitle>
      <List>
        {db.persons
          .filter((p) => p.tipo === 'equipe')
          .map((p) => (
            <Row key={p.id} leading={<Avatar name={p.nome} />} title={p.nome} subtitle={p.email} trailing={<Badge tone="navy">{p.vinculo}</Badge>} />
          ))}
        <Row leading={<Home size={20} className="text-brand-700" />} title="Moradores" subtitle={`${db.persons.filter((p) => p.tipo === 'permanente' && p.status === 'ativo').length} cadastros ativos`} trailing={<Badge tone="blue">Morador</Badge>} />
      </List>
    </>
  )
}

