import { motion } from 'motion/react'
import { ArrowRight, CalendarPlus, HardHat, MessageSquarePlus, Siren, UserPlus, Vote } from 'lucide-react'
import { areaById, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDay, fmtDateLong, parseYmd, timeAgo, today } from '../lib/format.js'
import { EASE, SPRING } from '../lib/motion.js'
import { href } from '../lib/router.js'
import { Badge, Card, List, Row, SectionTitle, StatusBadge, cx } from '../ui/kit.jsx'
import { AGENDA_STYLE, eventsForDay } from './Agenda.jsx'
import { obraProgress } from './Obras.jsx'
import { VoteTypeBadge } from './Votacoes.jsx'

const QUICK = [
  { to: 'morador/autorizacoes/nova', label: 'Autorizar visita', icon: UserPlus },
  { to: 'morador/reservas/nova', label: 'Reservar espaço', icon: CalendarPlus },
  { to: 'morador/solicitacoes/nova', label: 'Abrir solicitação', icon: MessageSquarePlus },
  { to: 'morador/seguranca', label: 'Fazer denúncia', icon: Siren },
]

export function Inicio() {
  const { db, user } = useStore()
  const t = today()
  const unit = unitById(db, user.unitId)
  const first = user.nome.split(' ')[0]
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const todayEvents = eventsForDay(db, user, t)
  const nextRes = db.reservations
    .filter((r) => r.unitId === user.unitId && r.data >= t && (r.status === 'confirmada' || r.status === 'pendente'))
    .sort((a, b) => a.data.localeCompare(b.data))
  const openVotes = db.votes.filter((v) => v.status === 'aberta')
  const recentReq = db.requests.filter((r) => r.personId === user.id).slice(0, 3)
  const obra = db.obras?.[0]
  const prog = obra && obraProgress(obra)
  const news = db.news.filter((n) => n.status === 'publicado').slice(0, 3)

  return (
    <>
      {/* Faixa de boas-vindas */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE.out }}
        className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-950 p-6 text-white sm:p-8"
      >
        <div className="paver-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-300 uppercase first-letter:uppercase">{fmtDateLong(t)}</p>
          <h1 className="display mt-2 text-[clamp(2rem,5vw,3.2rem)]">
            {hello}, <span className="text-gold-400">{first}</span>.
          </h1>
          <p className="mt-2 text-white/80">
            {unitLabel(unit)} · Quadra {unit.quadra}
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK.map((q, i) => (
              <motion.a
                key={q.to}
                href={href(q.to)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.45, ease: EASE.out }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={cx(
                  'flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-[0.88rem] font-bold whitespace-nowrap ring-1 ring-inset backdrop-blur',
                  i === 0 ? 'bg-gold-400 text-navy-900 ring-gold-300' : 'bg-white/10 text-white ring-white/15 hover:bg-white/15',
                )}
              >
                <q.icon size={18} aria-hidden="true" />
                {q.label}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>


      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {/* Hoje */}
          <section>
            <SectionTitle action={<a href={href('morador/agenda')} className="text-[0.8rem] font-semibold text-brand-700 hover:underline">Agenda completa</a>}>Hoje no Aquarius</SectionTitle>
            <Card className="space-y-2.5">
              {todayEvents.length === 0 && <p className="text-[0.88rem] text-ink-500">Sem coletas ou atividades hoje.</p>}
              {todayEvents.map((e) => {
                const st = AGENDA_STYLE[e.tipo]
                return (
                  <div key={e.key} className="flex items-center gap-3">
                    <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', st.cls)}>
                      <st.icon size={17} aria-hidden="true" />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[0.9rem] font-semibold text-ink-900">{e.titulo}</p>
                    <span className="shrink-0 text-[0.78rem] text-ink-500">{e.horario}</span>
                  </div>
                )
              })}
            </Card>
          </section>

          {/* Votações */}
          {openVotes.length > 0 && (
            <section>
              <SectionTitle>Votações abertas</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {openVotes.map((v) => {
                  const voted = v.votos.some((x) => (v.votoPor === 'unidade' ? x.unitId === user.unitId : x.personId === user.id))
                  return (
                    <Card key={v.id} to={`morador/votacoes/${v.id}`} className="flex flex-col">
                      <div className="mb-2 flex items-center gap-2">
                        <Vote size={16} className="text-brand-600" aria-hidden="true" />
                        <VoteTypeBadge tipo={v.tipo} />
                        <span className="ml-auto text-[0.75rem] whitespace-nowrap text-ink-500">até {fmtDay(v.fim)}</span>
                      </div>
                      <p className="flex-1 font-semibold text-ink-900">{v.titulo}</p>
                      {voted && <p className="mt-3 text-[0.8rem] font-bold text-brand-700">✓ Você já votou</p>}
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {/* Comunicados */}
          <section>
            <SectionTitle action={<a href={href('morador/comunicados')} className="text-[0.8rem] font-semibold text-brand-700 hover:underline">Ver todos</a>}>Últimos comunicados</SectionTitle>
            <List>
              {news.map((n) => (
                <Row
                  key={n.id}
                  to={`morador/comunicados/${n.id}`}
                  leading={<Badge tone={n.categoria === 'Urgente' ? 'red' : n.categoria === 'Feirinha' || n.categoria === 'Evento' ? 'gold' : 'blue'}>{n.categoria}</Badge>}
                  title={n.titulo}
                  subtitle={timeAgo(n.data)}
                />
              ))}
            </List>
          </section>
        </div>

        <div className="space-y-6">
          {obra && (
            <motion.a
              href={href(`morador/obras/${obra.id}`)}
              whileHover={{ y: -2 }}
              transition={SPRING.snappy}
              className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 to-sky-950 p-5 text-white"
            >
              <div className="paver-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.66rem] font-bold tracking-[0.2em] text-gold-300 uppercase">Andamento de obras</p>
                  <HardHat size={20} className="text-gold-400" aria-hidden="true" />
                </div>
                <p className="display mt-2 text-[1.3rem] leading-[1.15]">{obra.titulo}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-gold-400" style={{ width: `${Math.max(prog.pct, 2)}%` }} />
                  </div>
                  <span className="display text-[1.1rem] text-gold-400">{prog.pct}%</span>
                </div>
                <p className="mt-2 text-[0.8rem] text-white/80">Etapa atual: {prog.current?.title ?? 'concluída'}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-gold-300 uppercase">
                  Ver todas as obras <ArrowRight size={14} aria-hidden="true" />
                </p>
              </div>
            </motion.a>
          )}

          <section>
            <SectionTitle action={<a href={href('morador/reservas/minhas')} className="text-[0.8rem] font-semibold text-brand-700 hover:underline">Ver todas</a>}>Minhas reservas</SectionTitle>
            {nextRes.length === 0 ? (
              <Card className="text-[0.88rem] text-ink-500">Nenhuma reserva futura.</Card>
            ) : (
              <List>
                {nextRes.map((r) => (
                  <Row
                    key={r.id}
                    to="morador/reservas/minhas"
                    leading={
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-center leading-none text-white">
                        <span>
                          <span className="display block text-[1.1rem]">{r.data.slice(8)}</span>
                          <span className="block text-[0.58rem] font-bold text-gold-300 uppercase">{parseYmd(r.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                        </span>
                      </span>
                    }
                    title={areaById(db, r.areaId).nome}
                    subtitle={r.slot}
                    trailing={<StatusBadge status={r.status} label={r.status === 'pendente' ? 'Em análise' : undefined} />}
                  />
                ))}
              </List>
            )}
          </section>

          <section>
            <SectionTitle action={<a href={href('morador/solicitacoes')} className="text-[0.8rem] font-semibold text-brand-700 hover:underline">Ver todas</a>}>Minhas solicitações</SectionTitle>
            <List>
              {recentReq.map((r) => (
                <Row key={r.id} to={`morador/solicitacoes/${r.id}`} title={r.titulo} subtitle={`${r.protocolo} · ${timeAgo(r.criadaEm)}`} trailing={<StatusBadge status={r.status} />} />
              ))}
            </List>
          </section>
        </div>
      </div>
    </>
  )
}
