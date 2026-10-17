import { useMemo, useState } from 'react'
import { Car, Dog, Home, Phone, Users } from 'lucide-react'
import { unitById, unitLabel, useStore } from '../lib/store.jsx'
import { Avatar, Badge, Card, Empty, PageHeader, SearchInput, StatusBadge } from '../ui/kit.jsx'
import { normalize } from './helpers.js'

/* Consulta de moradores: identificar a pessoa e a casa */
export function Moradores() {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)

  const people = useMemo(() => {
    const n = normalize(q)
    return db.persons
      .filter((p) => p.unitId && p.tipo === 'permanente' && p.status !== 'inativo')
      .filter((p) => !n || normalize(`${p.nome} ${unitLabel(unitById(db, p.unitId))} ${p.vinculo}`).includes(n))
  }, [db, q])

  const current = sel ? db.persons.find((p) => p.id === sel) : null
  const u = current && unitById(db, current.unitId)

  return (
    <>
      <PageHeader overline="Portaria" title="Moradores" lead="Identifique pessoas e suas casas. Dados de contato só para uso da portaria." />
      <SearchInput value={q} onChange={setQ} placeholder="Nome, rua ou número…" className="mb-5 [&_input]:py-3.5 [&_input]:text-[1rem]" />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {people.length === 0 && (
            <div className="sm:col-span-2">
              <Empty icon={Users} title="Ninguém encontrado" />
            </div>
          )}
          {people.map((p) => (
            <Card key={p.id} onClick={() => setSel(p.id)} className={sel === p.id ? 'ring-2 ring-brand-500' : ''}>
              <div className="flex items-center gap-3">
                <Avatar name={p.nome} size={46} photo={p.foto} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{p.nome}</p>
                  <p className="truncate text-[0.8rem] text-ink-500">{unitLabel(unitById(db, p.unitId))}</p>
                  <div className="mt-1 flex gap-1.5">
                    <Badge tone="blue">{p.vinculo}</Badge>
                    {p.status === 'pendente' && <StatusBadge status="pendente" label="Vínculo pendente" />}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {!current ? (
            <Empty icon={Home} title="Selecione um morador" text="Veja a casa, quem mora junto, veículos e pets." />
          ) : (
            <Card>
              <div className="flex items-center gap-4">
                <Avatar name={current.nome} size={72} photo={current.foto} />
                <div>
                  <p className="display text-[1.3rem] text-ink-900">{current.nome}</p>
                  <p className="text-[0.84rem] text-ink-500">{current.vinculo}</p>
                  <a href={`tel:${current.telefone}`} className="mt-1 inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-brand-700">
                    <Phone size={14} /> {current.telefone}
                  </a>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-paper-100 px-4 py-3">
                <p className="font-bold text-ink-900">{unitLabel(u)}</p>
                <p className="text-[0.78rem] text-ink-500">
                  Quadra {u.quadra} · Lote {u.lote} · {u.status}
                </p>
              </div>

              <Block title="Moram na casa" icon={Users}>
                {db.persons
                  .filter((p) => p.unitId === u.id && p.id !== current.id && p.status !== 'inativo')
                  .map((p) => (
                    <li key={p.id} className="flex items-center gap-2.5">
                      <Avatar name={p.nome} size={28} photo={p.foto} />
                      <span className="flex-1 text-[0.86rem] text-ink-900">{p.nome}</span>
                      <span className="text-[0.74rem] text-ink-500">{p.obs && p.tipo === 'prestador' ? p.obs : p.vinculo}</span>
                    </li>
                  ))}
              </Block>

              <Block title="Veículos" icon={Car}>
                {db.vehicles
                  .filter((v) => v.unitId === u.id)
                  .map((v) => (
                    <li key={v.id} className="flex items-center justify-between text-[0.86rem]">
                      <span className="text-ink-900">
                        {v.modelo} · {v.cor}
                      </span>
                      <span className="rounded-md bg-brand-600 px-2 py-0.5 font-mono text-[0.78rem] font-bold text-white">{v.placa}</span>
                    </li>
                  ))}
              </Block>

              <Block title="Pets" icon={Dog}>
                {db.pets
                  .filter((p) => p.unitId === u.id)
                  .map((p) => (
                    <li key={p.id} className="text-[0.86rem] text-ink-900">
                      {p.nome} <span className="text-ink-500">· {p.especie}, {p.raca}</span>
                    </li>
                  ))}
              </Block>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function Block({ title, icon: Icon, children }) {
  const items = [children].flat().filter(Boolean)
  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] text-ink-500 uppercase">
        <Icon size={14} /> {title}
      </p>
      {items.length ? <ul className="space-y-2">{children}</ul> : <p className="text-[0.84rem] text-ink-500">Nenhum cadastrado.</p>}
    </div>
  )
}
