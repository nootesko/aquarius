import { useState } from 'react'
import { motion } from 'motion/react'
import { CalendarX2, ChevronLeft, ChevronRight, ListChecks, Users } from 'lucide-react'
import { areaById, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { addDays, fmtDate, fmtDateLong, parseYmd, today, uid, ymd } from '../lib/format.js'
import { go } from '../lib/router.js'
import { EASE } from '../lib/motion.js'
import {
  AreaArt, Badge, Button, Card, Check, Empty, Field, Input, Modal, Notice, PageHeader, SectionTitle, StatusBadge, Tabs, Textarea, cx,
} from '../ui/kit.jsx'

const ACTIVE = ['confirmada', 'pendente']

export function Reservas({ parts }) {
  const [view, id] = parts
  if (view === 'area' && id) return <AreaDetail areaId={id} />
  return <Overview tab={view === 'minhas' ? 'minhas' : 'espacos'} picking={view === 'nova'} />
}

function Overview({ tab, picking }) {
  const { db, user } = useStore()
  const mine = db.reservations.filter((r) => r.unitId === user.unitId)
  return (
    <>
      <PageHeader
        overline="Áreas comuns"
        title="Reservas"
        lead={picking ? 'Escolha o espaço que você quer reservar.' : 'Quiosques, campo, quadra e salão de festas. Veja a disponibilidade e reserve em poucos toques.'}
      />
      <Tabs
        value={tab}
        onChange={(t) => go(t === 'minhas' ? 'morador/reservas/minhas' : 'morador/reservas')}
        tabs={[
          { id: 'espacos', label: 'Espaços' },
          { id: 'minhas', label: 'Minhas reservas', count: mine.filter((r) => ACTIVE.includes(r.status) && r.data >= today()).length },
        ]}
      />
      {tab === 'espacos' ? <Areas /> : <MyReservations list={mine} />}
    </>
  )
}

function Areas() {
  const { db } = useStore()
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {db.areas
        .filter((a) => a.ativo)
        .map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: EASE.out }}>
            <Card padded={false} to={`morador/reservas/area/${a.id}`} className="h-full overflow-hidden">
              <AreaArt area={a} className="h-32" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="display text-[1.2rem] text-ink-900">{a.nome}</p>
                  {a.semReserva && <Badge tone="green">Uso livre</Badge>}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[0.84rem] text-ink-600">{a.descricao}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[0.78rem] font-semibold text-ink-500">
                  <Users size={14} aria-hidden="true" /> Até {a.capacidade} pessoas
                  {a.exigeAprovacao && <span className="ml-auto text-gold-ink">Exige aprovação</span>}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
    </div>
  )
}

function MyReservations({ list }) {
  const { db, mutate, toast, user } = useStore()
  const [cancel, setCancel] = useState(null)
  const upcoming = list.filter((r) => r.data >= today() && ACTIVE.includes(r.status)).sort((a, b) => a.data.localeCompare(b.data))
  const past = list.filter((r) => !upcoming.includes(r)).sort((a, b) => b.data.localeCompare(a.data))

  const doCancel = () => {
    mutate(
      (d) => {
        d.reservations.find((r) => r.id === cancel.id).status = 'cancelada'
        d.authorizations.filter((a) => a.reservaId === cancel.id && a.status === 'ativa').forEach((a) => (a.status = 'revogada'))
        pushNotification(d, 'admin', 'Reserva cancelada', `${areaById(d, cancel.areaId).nome} · ${fmtDate(cancel.data)} · ${unitLabel(unitById(d, user.unitId))}`, 'admin/reservas')
      },
      { acao: 'Cancelou reserva', alvo: areaById(db, cancel.areaId).nome },
    )
    toast('Reserva cancelada')
    setCancel(null)
  }

  const card = (r) => {
    const a = areaById(db, r.areaId)
    const list = db.authorizations.find((x) => x.reservaId === r.id)
    return (
      <Card key={r.id} padded={false} className="flex overflow-hidden">
        <AreaArt area={a} className="w-20 shrink-0 sm:w-28" size={30} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-ink-900">{a.nome}</p>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-0.5 text-[0.84rem] text-ink-600 first-letter:uppercase">
            {fmtDateLong(r.data)} · {r.slot}
          </p>
          <p className="mt-0.5 text-[0.8rem] text-ink-500">
            {r.convidados} convidados
            {r.obs && ` · ${r.obs}`}
          </p>
          {upcoming.includes(r) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {list ? (
                <Button size="sm" variant="soft" icon={ListChecks} to={`morador/autorizacoes/${list.id}`}>
                  Lista de convidados ({list.convidados.length})
                </Button>
              ) : (
                <Button size="sm" variant="soft" icon={ListChecks} to={`morador/autorizacoes/nova/lista/${r.id}`}>
                  Criar lista de convidados
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => setCancel(r)}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <>
      {upcoming.length === 0 ? (
        <Empty icon={CalendarX2} title="Nenhuma reserva futura" action={<Button variant="gold" to="morador/reservas">Fazer uma reserva</Button>} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">{upcoming.map(card)}</div>
      )}
      {past.length > 0 && (
        <>
          <SectionTitle className="mt-8">Histórico</SectionTitle>
          <div className="grid gap-3 opacity-80 lg:grid-cols-2">{past.map(card)}</div>
        </>
      )}

      <Modal
        open={!!cancel}
        onClose={() => setCancel(null)}
        title="Cancelar reserva?"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancel(null)}>
              Manter reserva
            </Button>
            <Button variant="dangerSolid" onClick={doCancel}>
              Cancelar reserva
            </Button>
          </>
        }
      >
        {cancel && (
          <div className="space-y-3 text-[0.9rem] text-ink-700">
            <p>
              {areaById(db, cancel.areaId).nome} em {fmtDate(cancel.data)}, {cancel.slot}.
            </p>
            <p className="text-ink-500">Listas de convidados ligadas a esta reserva também serão revogadas.</p>
          </div>
        )}
      </Modal>
    </>
  )
}

/* ---------- Detalhe do espaço com calendário ---------- */

function slotState(db, area, day, slot) {
  if (db.blocks.some((b) => b.areaId === area.id && b.data === day)) return 'bloqueado'
  if (day < addDays(today(), area.antecedenciaDias)) return 'indisponivel'
  const r = db.reservations.find((x) => x.areaId === area.id && x.data === day && x.slot === slot && ACTIVE.includes(x.status))
  if (r) return 'ocupado'
  return 'livre'
}

function AreaDetail({ areaId }) {
  const { db, user, mutate, toast } = useStore()
  const area = areaById(db, areaId)
  const [monthOffset, setMonthOffset] = useState(0)
  const [day, setDay] = useState(addDays(today(), area?.antecedenciaDias ?? 0))
  const [booking, setBooking] = useState(null)

  if (!area) return <Empty title="Espaço não encontrado" />

  const base = new Date()
  base.setDate(1)
  base.setMonth(base.getMonth() + monthOffset)
  const monthLabel = base.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const startPad = base.getDay()
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => ymd(new Date(base.getFullYear(), base.getMonth(), i + 1)))]

  const block = db.blocks.find((b) => b.areaId === area.id && b.data === day)
  const usedThisMonth = db.reservations.filter((r) => r.unitId === user.unitId && r.areaId === area.id && r.data.slice(0, 7) === day.slice(0, 7) && ACTIVE.includes(r.status)).length

  const confirm = (form) => {
    const id = uid('r')
    const status = area.exigeAprovacao ? 'pendente' : 'confirmada'
    mutate(
      (d) => {
        d.reservations.push({ id, areaId: area.id, unitId: user.unitId, personId: user.id, data: day, slot: booking, status, convidados: Number(form.convidados) || 0, taxa: area.taxa, criadaEm: new Date().toISOString(), obs: form.obs })
        if (status === 'pendente') pushNotification(d, 'admin', 'Reserva aguardando aprovação', `${area.nome} · ${fmtDate(day)} · ${unitLabel(unitById(d, user.unitId))}`, 'admin/reservas')
        pushNotification(d, user.id, status === 'pendente' ? 'Reserva enviada para aprovação' : 'Reserva confirmada', `${area.nome} · ${fmtDate(day)} · ${booking}`, 'morador/reservas/minhas')
      },
      { acao: 'Reservou espaço', alvo: `${area.nome} · ${fmtDate(day)}` },
    )
    toast(status === 'pendente' ? 'Reserva enviada para aprovação' : 'Reserva confirmada!')
    setBooking(null)
    go('morador/reservas/minhas', { replace: true })
  }

  return (
    <>
      <PageHeader back="morador/reservas" overline="Área comum" title={area.nome} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {area.semReserva ? (
            <Card>
              <Notice tone="green">A {area.nome.toLowerCase()} é de uso livre, sem reserva. Confira os horários e as regras ao lado.</Notice>
            </Card>
          ) : (
            <>
              {/* Calendário do mês */}
              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" onClick={() => setMonthOffset((m) => Math.max(0, m - 1))} disabled={monthOffset === 0} aria-label="Mês anterior" className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-200 disabled:opacity-30">
                    <ChevronLeft size={18} />
                  </button>
                  <p className="display text-[1.15rem] text-ink-900 first-letter:uppercase">{monthLabel}</p>
                  <button type="button" onClick={() => setMonthOffset((m) => Math.min(2, m + 1))} disabled={monthOffset === 2} aria-label="Próximo mês" className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-200 disabled:opacity-30">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-bold text-ink-500 uppercase">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <span key={i} className="py-1">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    if (!d) return <span key={`p${i}`} />
                    const states = area.slots.map((s) => slotState(db, area, d, s))
                    const free = states.filter((s) => s === 'livre').length
                    const past = d < today()
                    const blocked = states.every((s) => s === 'bloqueado')
                    const mine = db.reservations.some((r) => r.areaId === area.id && r.data === d && r.unitId === user.unitId && ACTIVE.includes(r.status))
                    const on = d === day
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={past}
                        onClick={() => setDay(d)}
                        aria-pressed={on}
                        aria-label={`${fmtDate(d)}: ${blocked ? 'bloqueado' : `${free} horários livres`}`}
                        className={cx(
                          'relative flex aspect-square flex-col items-center justify-center rounded-xl text-[0.86rem] font-semibold transition-colors sm:aspect-[1.3]',
                          past && 'text-ink-500/40',
                          !past && !on && (blocked ? 'bg-paper-200 text-ink-500 line-through' : free === 0 ? 'bg-paper-200 text-ink-500' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'),
                          on && 'bg-brand-600 text-white',
                        )}
                      >
                        {Number(d.slice(8))}
                        {mine && <span className={cx('absolute bottom-1 h-1.5 w-1.5 rounded-full', on ? 'bg-gold-400' : 'bg-gold-500')} />}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-[0.74rem] text-ink-500">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-100" /> Livre</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-paper-200" /> Lotado ou sem antecedência</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-paper-200" /> <s>Bloqueado</s></span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> Sua reserva</span>
                </div>
              </Card>

              {/* Horários do dia */}
              <Card>
                <p className="display mb-1 text-[1.15rem] text-ink-900 first-letter:uppercase">{fmtDateLong(day)}</p>
                <p className="mb-4 text-[0.8rem] text-ink-500">
                  Você usou {usedThisMonth} de {area.limiteMes} reservas deste espaço no mês.
                </p>
                {block ? (
                  <Notice tone="red" icon={CalendarX2}>Indisponível neste dia: {block.motivo}.</Notice>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {area.slots.map((s) => {
                      const st = slotState(db, area, day, s)
                      const ok = st === 'livre' && usedThisMonth < area.limiteMes
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={!ok}
                          onClick={() => setBooking(s)}
                          className={cx(
                            'flex items-center justify-between rounded-xl px-4 py-3 text-left text-[0.88rem] font-semibold ring-1 ring-inset transition-colors',
                            ok ? 'bg-white text-ink-900 ring-paper-300 hover:bg-gold-100 hover:ring-gold-400' : 'bg-paper-100 text-ink-500 ring-paper-200',
                          )}
                        >
                          {s}
                          <span className="text-[0.74rem] font-bold">
                            {st === 'ocupado' ? 'Ocupado' : st === 'indisponivel' ? `Mín. ${area.antecedenciaDias} dias` : ok ? 'Reservar →' : 'Limite do mês'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <div className="order-first space-y-4 lg:order-none">
          <Card padded={false} className="overflow-hidden">
            <AreaArt area={area} className="h-48 lg:h-52" size={56} />
            <div className="p-5">
              <p className="text-[0.9rem] text-ink-700">{area.descricao}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.82rem]">
                <div>
                  <dt className="text-ink-500">Capacidade</dt>
                  <dd className="font-bold text-ink-900">{area.capacidade} pessoas</dd>
                </div>
                {!area.semReserva && (
                  <>
                    <div>
                      <dt className="text-ink-500">Antecedência</dt>
                      <dd className="font-bold text-ink-900">{area.antecedenciaDias ? `${area.antecedenciaDias} dias` : 'No mesmo dia'}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Limite</dt>
                      <dd className="font-bold text-ink-900">{area.limiteMes} por mês</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </Card>
          <Card>
            <SectionTitle>Regras de uso</SectionTitle>
            <ul className="space-y-2 text-[0.86rem] text-ink-700">
              {area.regras.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <BookingModal key={booking} area={area} day={day} slot={booking} onClose={() => setBooking(null)} onConfirm={confirm} />
    </>
  )
}

function BookingModal({ area, day, slot, onClose, onConfirm }) {
  const [accepted, setAccepted] = useState(false)
  const [form, setForm] = useState({ convidados: '', obs: '' })
  return (
    <Modal
      open={!!slot}
      onClose={onClose}
      title="Confirmar reserva"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="gold" disabled={!accepted} onClick={() => onConfirm(form)}>
            {area.exigeAprovacao ? 'Enviar pedido' : 'Confirmar reserva'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-paper-100 p-4">
          <p className="display text-[1.2rem] text-ink-900">{area.nome}</p>
          <p className="text-[0.86rem] text-ink-600 first-letter:uppercase">
            {day && fmtDateLong(day)} · {slot}
          </p>
        </div>
        <Field label="Nº de convidados" hint={`Máximo de ${area.capacidade}`}>
          <Input type="number" min={0} max={area.capacidade} value={form.convidados} onChange={(e) => setForm({ ...form, convidados: e.target.value })} />
        </Field>
        <Field label="Observações" optional>
          <Textarea rows={2} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} placeholder="Ex.: aniversário da Lívia" />
        </Field>
        {area.exigeAprovacao && <Notice>Este espaço exige aprovação da administração. Você será avisado assim que for analisado.</Notice>}
        <Check checked={accepted} onChange={setAccepted}>
          Li e aceito as regras de uso do {area.nome.toLowerCase()}.
        </Check>
      </div>
    </Modal>
  )
}
