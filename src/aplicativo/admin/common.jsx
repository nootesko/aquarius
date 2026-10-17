import { motion } from 'motion/react'
import { pushNotification } from '../lib/store.jsx'
import { EASE } from '../lib/motion.js'
import { cx } from '../ui/kit.jsx'

/* Utilidades locais do painel da administração. */

/* Avisa todos os moradores ativos (cadastros permanentes vinculados a uma unidade) */
export const notifyAll = (draft, titulo, texto, link) =>
  draft.persons
    .filter((p) => p.tipo === 'permanente' && p.status === 'ativo' && p.unitId)
    .forEach((p) => pushNotification(draft, p.id, titulo, texto, link))

/* Gráfico de barras horizontais simples, em CSS */
export function HBars({ rows, tone = 'brand', format = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  const bar = { brand: 'bg-brand-500', gold: 'bg-gold-400', navy: 'bg-brand-600', green: 'bg-brand-500' }[tone]
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-[0.82rem]">
            <span className="truncate font-semibold text-ink-700">{r.label}</span>
            <span className="shrink-0 font-bold text-ink-900">{format(r.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-paper-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE.out }}
              className={cx('h-full rounded-full', r.tone ?? bar)}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* Colunas pareadas (ex.: receitas × despesas por mês) */
export function PairBars({ rows, a, b, labels = ['A', 'B'], format = (v) => v }) {
  const max = Math.max(1, ...rows.flatMap((r) => [r[a], r[b]]))
  return (
    <div>
      <div className="flex h-48 items-end gap-3 sm:gap-5">
        {rows.map((r) => (
          <div key={r.mes} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end justify-center gap-1">
              {[a, b].map((k, i) => (
                <motion.div
                  key={k}
                  title={`${labels[i]}: ${format(r[k])}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${(r[k] / max) * 100}%` }}
                  transition={{ duration: 0.8, ease: EASE.out, delay: i * 0.05 }}
                  className={cx('w-1/2 max-w-6 rounded-t-md', i === 0 ? 'bg-brand-500' : 'bg-gold-400')}
                />
              ))}
            </div>
            <span className="text-[0.72rem] font-semibold text-ink-500">{r.mes}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-[0.78rem] text-ink-600">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> {labels[0]}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-gold-400" /> {labels[1]}
        </span>
      </div>
    </div>
  )
}

export const money = (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const personName = (db, id) => db.persons.find((p) => p.id === id)?.nome ?? '—'
