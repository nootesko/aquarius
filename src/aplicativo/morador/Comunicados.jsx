import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, FileDown, Megaphone } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { fmtDateTime, timeAgo } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Badge, Button, Card, Empty, Notice, PageHeader, Tabs, cx } from '../ui/kit.jsx'

export const NEWS_TONE = { Urgente: 'red', Feirinha: 'gold', Evento: 'gold', Obras: 'navy', Informativo: 'blue', Manutenção: 'orange' }
const CATS = ['Todos', 'Urgente', 'Evento', 'Feirinha', 'Obras', 'Informativo']

export function Comunicados({ parts }) {
  if (parts[0]) return <Detail id={parts[0]} />
  return <ListView />
}

function ListView() {
  const { db, user } = useStore()
  const [cat, setCat] = useState('Todos')
  const items = db.news.filter((n) => n.status === 'publicado' && (cat === 'Todos' || n.categoria === cat))
  return (
    <>
      <PageHeader overline="Notícias" title="Comunicados" lead="Avisos da administração, eventos, feirinha e informativos." />
      <Tabs value={cat} onChange={setCat} tabs={CATS.map((c) => ({ id: c, label: c }))} />
      {items.length === 0 ? (
        <Empty icon={Megaphone} title="Nenhum comunicado nesta categoria" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((n, i) => {
            const unread = !n.leituras.includes(user.id)
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.45, ease: EASE.out }}>
                <Card to={`morador/comunicados/${n.id}`} className={cx('h-full', n.categoria === 'Urgente' && 'ring-2 ring-gold-400')}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <Badge tone={NEWS_TONE[n.categoria] ?? 'gray'}>{n.categoria}</Badge>
                    {unread && n.exigeConfirmacao && <Badge tone="red">Confirmar leitura</Badge>}
                    <span className="ml-auto text-[0.75rem] text-ink-500">{timeAgo(n.data)}</span>
                  </div>
                  <p className={cx('text-[1.02rem] text-ink-900', unread ? 'font-bold' : 'font-semibold')}>{n.titulo}</p>
                  <p className="mt-1 text-[0.86rem] text-ink-600">{n.resumo}</p>
                  <p className="mt-3 text-[0.75rem] text-ink-500">{n.autor}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}

function Detail({ id }) {
  const { db, user, mutate, toast } = useStore()
  const n = db.news.find((x) => x.id === id)
  const read = n?.leituras.includes(user.id)

  /* Comunicado comum conta como lido ao abrir; o que exige confirmação, só no botão */
  useEffect(() => {
    if (n && !n.exigeConfirmacao && !read) mutate((d) => d.news.find((x) => x.id === id).leituras.push(user.id))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return <Empty title="Comunicado não encontrado" />

  return (
    <>
      <PageHeader back="morador/comunicados" overline={n.categoria} title={n.titulo} lead={`${n.autor} · ${fmtDateTime(n.data)}`} />
      <Card className="max-w-3xl">
        <div className="space-y-4 text-[0.98rem] leading-relaxed text-ink-700">
          {n.conteudo.split('\n\n').map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {n.anexos.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-paper-200 pt-5">
            {n.anexos.map((a) => (
              <Button key={a} variant="outline" size="sm" icon={FileDown} onClick={() => toast(`Download de ${a} (demonstração)`)}>
                {a}
              </Button>
            ))}
          </div>
        )}
        {n.exigeConfirmacao && (
          <div className="mt-6 border-t border-paper-200 pt-5">
            {read ? (
              <Notice tone="green" icon={CheckCircle2}>
                Leitura confirmada.
              </Notice>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gold-100 p-4">
                <p className="text-[0.88rem] font-semibold text-gold-ink">A administração pediu a confirmação de leitura deste comunicado.</p>
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => {
                    mutate((d) => d.news.find((x) => x.id === id).leituras.push(user.id), { acao: 'Confirmou leitura', alvo: n.titulo })
                    toast('Leitura confirmada')
                  }}
                >
                  Confirmar leitura
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  )
}
