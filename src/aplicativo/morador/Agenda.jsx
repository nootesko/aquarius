import { useState } from 'react'
import { motion } from 'motion/react'
import { CalendarCheck2, Droplets, Leaf, Recycle, Trash2, Trophy, TriangleAlert } from 'lucide-react'
import { areaById, useStore } from '../lib/store.jsx'
import { addDays, fmtDateLong, parseYmd, today, WEEKDAYS } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Button, Card, Notice, PageHeader, SectionTitle, cx } from '../ui/kit.jsx'

export const AGENDA_STYLE = {
  lixo: { icon: Trash2, cls: 'bg-brand-100 text-brand-600', label: 'Lixo' },
  reciclagem: { icon: Recycle, cls: 'bg-brand-100 text-brand-600', label: 'Reciclagem' },
  poda: { icon: Leaf, cls: 'bg-brand-100 text-brand-600', label: 'Podas' },
  atividade: { icon: Trophy, cls: 'bg-brand-50 text-brand-700', label: 'Atividade' },
  aviso: { icon: TriangleAlert, cls: 'bg-gold-400 text-navy-900', label: 'Aviso' },
  reserva: { icon: CalendarCheck2, cls: 'bg-gold-400 text-navy-900', label: 'Sua reserva' },
  agua: { icon: Droplets, cls: 'bg-brand-50 text-brand-700', label: 'Aviso' },
}

/* Tudo o que acontece num dia: agenda fixa da semana + reservas da unidade */
export function eventsForDay(db, user, day) {
  const dow = parseYmd(day).getDay()
  const fixed = db.schedule.filter((s) => s.dias.includes(dow)).map((s) => ({ ...s, key: s.id }))
  const res = db.reservations
    .filter((r) => r.unitId === user.unitId && r.data === day && (r.status === 'confirmada' || r.status === 'pendente'))
    .map((r) => ({ key: r.id, tipo: 'reserva', titulo: areaById(db, r.areaId).nome, horario: r.slot, dica: r.status === 'pendente' ? 'Aguardando aprovação' : `${r.convidados} convidados` }))
  return [...res, ...fixed]
}

export function Agenda() {
  const { db, user } = useStore()
  const t = today()
  const [sel, setSel] = useState(t)
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, i))
  const events = eventsForDay(db, user, sel)

  return (
    <>
      <PageHeader overline="Agenda" title="Agenda da semana" lead="Coleta de lixo, reciclagem, podas, atividades do clube e as suas reservas." />

      {/* Rotina fixa */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {db.schedule
          .filter((s) => ['lixo', 'reciclagem', 'poda'].includes(s.tipo))
          .map((s, i) => {
            const st = AGENDA_STYLE[s.tipo]
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: EASE.out }}>
                <Card className="h-full">
                  <div className="flex items-center gap-3">
                    <span className={cx('grid h-11 w-11 place-items-center rounded-xl', st.cls)}>
                      <st.icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-bold text-ink-900">{s.titulo}</p>
                      <p className="text-[0.8rem] text-ink-500">{s.horario}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {WEEKDAYS.map((w, d) => (
                      <span
                        key={w}
                        title={w}
                        className={cx(
                          'grid h-8 flex-1 place-items-center rounded-lg text-[0.7rem] font-bold',
                          s.dias.includes(d) ? 'bg-brand-600 text-white' : 'bg-paper-100 text-ink-500',
                        )}
                      >
                        {w.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[0.8rem] text-ink-600">{s.dica}</p>
                </Card>
              </motion.div>
            )
          })}
      </div>

      {/* Linha do tempo de dias */}
      <SectionTitle>Próximos 14 dias</SectionTitle>
      <div className="scroll-track -mx-4 mb-5 flex gap-2 px-4 pb-1 sm:mx-0 sm:px-0">
        {days.map((d) => {
          const date = parseYmd(d)
          const on = d === sel
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSel(d)}
              aria-pressed={on}
              className={cx(
                'flex w-[68px] shrink-0 flex-col items-center rounded-2xl px-2 py-3 ring-1 transition-colors ring-inset',
                on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-900 ring-paper-300 hover:bg-paper-100',
              )}
            >
              <span className={cx('text-[0.66rem] font-bold uppercase', on ? 'text-gold-300' : 'text-ink-500')}>{d === t ? 'Hoje' : WEEKDAYS[date.getDay()].slice(0, 3)}</span>
              <span className="display mt-1 text-[1.5rem]">{date.getDate()}</span>
            </button>
          )
        })}
      </div>

      <Card>
        <p className="display mb-4 text-[1.2rem] text-ink-900 first-letter:uppercase">{fmtDateLong(sel)}</p>
        {events.length === 0 ? (
          <Notice>Nenhuma coleta ou atividade programada para este dia.</Notice>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => {
              const st = AGENDA_STYLE[e.tipo]
              return (
                <li key={e.key} className="flex items-start gap-3.5 rounded-xl bg-paper-100 px-4 py-3">
                  <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', st.cls)}>
                    <st.icon size={19} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{e.titulo}</p>
                    <p className="text-[0.82rem] text-ink-600">{e.horario}</p>
                    {e.dica && <p className="mt-0.5 text-[0.78rem] text-ink-500">{e.dica}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
