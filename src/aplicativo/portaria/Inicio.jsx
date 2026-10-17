import { useState } from 'react'
import { motion } from 'motion/react'
import { CalendarClock, DoorClosed, DoorOpen, PartyPopper, Siren, UserPlus } from 'lucide-react'
import { areaById, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDateLong, fmtTime, today } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Avatar, Badge, Button, Card, Empty, List, Notice, Progress, SearchInput, SectionTitle, Stat } from '../ui/kit.jsx'
import { AuthRow, useAuthSearch, useGate } from './Autorizacoes.jsx'
import { validToday } from './helpers.js'

export function Inicio() {
  const { db, user } = useStore()
  const { sair } = useGate()
  const [q, setQ] = useState('')
  const results = useAuthSearch(q)
  const t = today()

  const previstas = db.authorizations.filter(validToday)
  const avulsas = previstas.filter((a) => a.tipo !== 'Lista de convidados')
  const listas = previstas.filter((a) => a.tipo === 'Lista de convidados')
  const dentro = db.accessLog.filter((l) => !l.saida)
  const alertas = db.alerts.filter((a) => a.status !== 'verificado')
  const reservasHoje = db.reservations.filter((r) => r.data === t && r.status === 'confirmada')

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE.out }}
        className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 to-sky-950 p-6 text-white sm:p-8"
      >
        <div className="paver-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase">Portaria · {fmtDateLong(t)}</p>
          <h1 className="display mt-2 text-[clamp(1.8rem,4vw,2.6rem)]">Bom turno, {user.nome.split(' ')[0]}.</h1>
          <div className="mt-5 max-w-2xl">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar visitante, código ou casa…" className="[&_input]:border-0 [&_input]:py-4 [&_input]:text-[1.05rem] [&_input]:shadow-lg" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="gold" size="lg" icon={UserPlus} to="portaria/sem-autorizacao">
              Visitante sem autorização
            </Button>
          </div>
        </div>
      </motion.section>

      {q.trim() && (
        <div className="mb-6">
          <SectionTitle>Resultado da busca</SectionTitle>
          {results.length ? (
            <List>
              {results.map((a) => (
                <AuthRow key={a.id} a={a} />
              ))}
            </List>
          ) : (
            <Empty title="Nada encontrado" text="Confira o nome ou use “Visitante sem autorização”." />
          )}
        </div>
      )}

      {alertas.length > 0 && (
        <a href="#/portaria/alertas" className="mb-5 block">
          <Notice tone="red" icon={Siren}>
            <b>{alertas.length} denúncia{alertas.length > 1 ? 's' : ''}</b> enviada{alertas.length > 1 ? 's' : ''} por moradores aguardando verificação.
          </Notice>
        </a>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Previstos hoje" value={avulsas.length} icon={CalendarClock} />
        <Stat label="Dentro agora" value={dentro.length} icon={DoorOpen} tone="green" to="portaria/acessos" />
        <Stat label="Listas de eventos" value={listas.length} icon={PartyPopper} tone="gold" to="portaria/eventos" />
        <Stat label="Denúncias pendentes" value={alertas.length} icon={Siren} tone="gold" to="portaria/alertas" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <SectionTitle>Entradas previstas hoje</SectionTitle>
            {avulsas.length ? (
              <List>
                {avulsas.map((a) => (
                  <AuthRow key={a.id} a={a} />
                ))}
              </List>
            ) : (
              <Empty title="Nenhuma entrada prevista" />
            )}
          </div>

          {listas.length > 0 && (
            <div>
              <SectionTitle action={<a href="#/portaria/eventos" className="text-[0.8rem] font-semibold text-brand-700 hover:underline">Ver todas</a>}>Eventos de hoje</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {listas.map((a) => {
                  const r = db.reservations.find((x) => x.id === a.reservaId)
                  const n = a.convidados.filter((c) => c.entrouEm).length
                  return (
                    <Card key={a.id} to={`portaria/autorizacoes/${a.id}`}>
                      <p className="font-semibold text-ink-900">{a.nome}</p>
                      <p className="text-[0.8rem] text-ink-500">
                        {unitLabel(unitById(db, a.unitId))}
                        {r ? ` · ${areaById(db, r.areaId)?.nome} · ${r.slot}` : ''}
                      </p>
                      <Progress value={(n / a.convidados.length) * 100} tone="gold" className="mt-3" />
                      <p className="mt-1.5 text-[0.78rem] font-semibold text-ink-700">
                        {n} de {a.convidados.length} convidados chegaram
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle>Dentro do residencial</SectionTitle>
            {dentro.length ? (
              <List>
                {dentro.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={l.nome} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.88rem] font-semibold text-ink-900">{l.nome}</p>
                      <p className="truncate text-[0.75rem] text-ink-500">
                        {unitLabel(unitById(db, l.unitId))} · desde {fmtTime(l.entrada)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" icon={DoorClosed} onClick={() => sair(l.id, l.nome)}>
                      Saída
                    </Button>
                  </div>
                ))}
              </List>
            ) : (
              <Empty title="Ninguém de fora no momento" />
            )}
          </div>

          <div>
            <SectionTitle>Reservas de hoje</SectionTitle>
            <List>
              {reservasHoje.length === 0 && <p className="px-4 py-4 text-[0.86rem] text-ink-500">Sem reservas hoje.</p>}
              {reservasHoje.map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.88rem] font-semibold text-ink-900">{areaById(db, r.areaId)?.nome}</p>
                    <Badge tone="blue">{r.convidados} pessoas</Badge>
                  </div>
                  <p className="text-[0.75rem] text-ink-500">
                    {r.slot} · {unitLabel(unitById(db, r.unitId))}
                  </p>
                </div>
              ))}
            </List>
          </div>
        </div>
      </div>
    </>
  )
}
