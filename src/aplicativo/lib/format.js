/* Datas da demonstração são sempre relativas a hoje, para a tela nunca parecer velha.
   Datas "puras" (sem hora) circulam como 'AAAA-MM-DD'; instantes, como ISO completo. */

const pad = (n) => String(n).padStart(2, '0')

export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => ymd(new Date())

export const addDays = (base, n) => {
  const d = typeof base === 'string' ? parseYmd(base) : new Date(base)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

export const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/* Instante relativo a agora: daysAgo(2, '14:30') */
export const at = (days, hhmm = '09:00') => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export const fmtDate = (s) => {
  if (!s) return '—'
  const d = s.length === 10 ? parseYmd(s) : new Date(s)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const fmtDateLong = (s) => {
  const d = s.length === 10 ? parseYmd(s) : new Date(s)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const fmtDay = (s) => {
  const d = s.length === 10 ? parseYmd(s) : new Date(s)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

export const fmtTime = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const fmtMoney = (v) => (v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Gratuito')

export function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'agora'
  const m = Math.round(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d < 30) return `há ${d} dia${d > 1 ? 's' : ''}`
  return fmtDate(iso)
}

export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export const accessCode = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => abc[Math.floor(Math.random() * abc.length)]).join('')
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter((p) => p.length > 2 || p === name)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

export function downloadCsv(filename, rows) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

/* Próxima data (a partir de `from`, inclusive) que cai no dia da semana `dow` (0 = domingo) */
export const nextWeekday = (dow, from = today()) => {
  const d = parseYmd(from)
  d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7))
  return ymd(d)
}

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
