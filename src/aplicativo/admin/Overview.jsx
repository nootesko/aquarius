import { BellRing, CalendarCheck, Inbox, MessageSquareWarning, ShieldAlert, UserCheck, Vote } from 'lucide-react'
import { areaById, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, fmtDay, timeAgo, today } from '../lib/format.js'
import { Badge, Button, Card, Empty, List, PageHeader, Progress, Row, SectionTitle, Stat, StatusBadge } from '../ui/kit.jsx'

export function Overview() {
  const { db, user } = useStore()
  const t = today()

  const pendRes = db.reservations.filter((r) => r.status === 'pendente')
  const semResp = db.requests.filter((r) => !r.responsavel && !['resolvida', 'encerrada'].includes(r.status))
  const abertas = db.requests.filter((r) => !['resolvida', 'encerrada'].includes(r.status))
  const pendPes = db.persons.filter((p) => p.status === 'pendente')
  const votos = db.votes.filter((v) => v.status === 'aberta')
  const alertas = db.alerts.filter((a) => a.status !== 'verificado')
  const hoje = db.reservations.filter((r) => r.data === t && r.status === 'confirmada')
  const votantes = db.units.filter((u) => u.status !== 'vazia').length

  return (
    <>
      <PageHeader
        overline="Administração"
        title={`Olá, ${user.nome.split(' ')[0]}`}
        lead="Resumo do que precisa da sua atenção hoje."
        actions={
          <>
            <Button variant="outline" to="admin/comunicados/novo" icon={BellRing}>
              Novo comunicado
            </Button>
            <Button variant="gold" to="admin/votacoes/nova" icon={Vote}>
              Nova votação
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Reservas aguardando" value={pendRes.length} icon={CalendarCheck} tone="gold" to="admin/reservas" hint={`${hoje.length} reservas hoje`} />
        <Stat label="Solicitações abertas" value={abertas.length} icon={Inbox} tone="blue" to="admin/solicitacoes" hint={`${semResp.length} sem responsável`} />
        <Stat label="Cadastros pendentes" value={pendPes.length} icon={UserCheck} tone="green" to="admin/pessoas" hint="Vínculos para aprovar" />
        <Stat label="Votações abertas" value={votos.length} icon={Vote} tone="navy" to="admin/votacoes" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle action={<a href="#/admin/reservas" className="text-[0.78rem] font-semibold text-brand-700 hover:underline">Ver todas</a>}>
            Reservas para aprovar
          </SectionTitle>
          {pendRes.length ? (
            <List>
              {pendRes.map((r) => (
                <Row
                  key={r.id}
                  to="admin/reservas"
                  title={`${areaById(db, r.areaId)?.nome} · ${fmtDay(r.data)}`}
                  subtitle={`${unitLabel(unitById(db, r.unitId))} · ${r.convidados} convidados${r.obs ? ` · ${r.obs}` : ''}`}
                  trailing={<StatusBadge status="pendente" label="Aprovar" />}
                />
              ))}
            </List>
          ) : (
            <Empty icon={CalendarCheck} title="Nenhuma reserva pendente" />
          )}
        </section>

        <section>
          <SectionTitle action={<a href="#/admin/solicitacoes" className="text-[0.78rem] font-semibold text-brand-700 hover:underline">Central</a>}>
            Solicitações sem responsável
          </SectionTitle>
          {semResp.length ? (
            <List>
              {semResp.map((r) => (
                <Row
                  key={r.id}
                  to={`admin/solicitacoes/${r.id}`}
                  title={r.titulo}
                  subtitle={`${r.protocolo} · ${r.anonima ? 'Anônimo' : unitLabel(unitById(db, r.unitId))} · ${timeAgo(r.criadaEm)}`}
                  trailing={r.anonima ? <Badge tone="navy">{r.tipo}</Badge> : <Badge tone="blue">{r.categoria}</Badge>}
                />
              ))}
            </List>
          ) : (
            <Empty icon={Inbox} title="Tudo atribuído" />
          )}
        </section>

        <section>
          <SectionTitle>Participação nas votações</SectionTitle>
          <Card className="space-y-5">
            {votos.map((v) => {
              const n = v.votoPor === 'unidade' ? new Set(v.votos.map((x) => x.unitId)).size : v.votos.length
              const base = v.votoPor === 'unidade' ? votantes : db.persons.filter((p) => p.tipo === 'permanente' && p.status === 'ativo').length
              const pct = Math.round((n / base) * 100)
              return (
                <a key={v.id} href={`#/admin/votacoes/${v.id}`} className="block">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="truncate text-[0.88rem] font-semibold text-ink-900">{v.titulo}</p>
                    <span className="shrink-0 text-[0.78rem] font-bold text-ink-700">{pct}%</span>
                  </div>
                  <Progress value={pct} tone={v.tipo === 'formal' ? 'brand' : 'gold'} />
                  <p className="mt-1 text-[0.74rem] text-ink-500">
                    {n} de {base} {v.votoPor === 'unidade' ? 'unidades' : 'pessoas'} · até {fmtDate(v.fim)}
                  </p>
                </a>
              )
            })}
          </Card>
        </section>

        <section>
          <SectionTitle>Cadastros e denúncias</SectionTitle>
          <List>
            {pendPes.map((p) => (
              <Row key={p.id} to="admin/pessoas" leading={<UserCheck size={20} className="text-brand-600" />} title={p.nome} subtitle={`${p.vinculo} · ${unitLabel(unitById(db, p.unitId))}`} trailing={<StatusBadge status="pendente" label="Aprovar vínculo" />} />
            ))}
            {alertas.map((a) => (
              <Row key={a.id} to="admin/alertas" leading={<ShieldAlert size={20} className="text-gold-ink" />} title={a.tipo} subtitle={`${a.local} · ${timeAgo(a.em)}`} trailing={<StatusBadge status="novo" />} />
            ))}
            {db.incidents
              .filter((o) => o.status === 'aberta')
              .map((o) => (
                <Row key={o.id} to="admin/ocorrencias" leading={<MessageSquareWarning size={20} className="text-gold-ink" />} title={o.titulo} subtitle={`Ocorrência da portaria · ${o.porteiro}`} trailing={<StatusBadge status="aberta" label="Aberta" />} />
              ))}
            {!pendPes.length && !alertas.length && <Row title="Nada pendente" subtitle="Cadastros e denúncias em dia" />}
          </List>
        </section>
      </div>

      <section className="mt-8">
        <SectionTitle>Últimas ações</SectionTitle>
        <List>
          {db.audit.slice(0, 5).map((a) => (
            <Row key={a.id} title={`${a.quem} · ${a.acao}`} subtitle={a.alvo} trailing={<span className="text-[0.75rem] text-ink-500">{timeAgo(a.em)}</span>} />
          ))}
        </List>
      </section>
    </>
  )
}
