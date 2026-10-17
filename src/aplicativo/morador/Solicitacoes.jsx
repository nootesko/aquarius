import { useState } from 'react'
import { motion } from 'motion/react'
import { Camera, CheckCircle2, EyeOff, MapPin, MessageSquarePlus, Send, ShieldCheck } from 'lucide-react'
import { nextProtocol, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { addDays, fmtDate, fmtDateTime, timeAgo, today, uid } from '../lib/format.js'
import { go } from '../lib/router.js'
import { EASE } from '../lib/motion.js'
import { Badge, Button, Card, Check, Empty, Field, Input, List, Notice, PageHeader, Row, SectionTitle, Select, StatusBadge, Tabs, Textarea, cx } from '../ui/kit.jsx'

export const CATEGORIAS = ['Manutenção', 'Ruas e drenagem', 'Segurança', 'Limpeza', 'Descarte irregular', 'Barulho', 'Áreas comuns', 'Animais', 'Outros']
const STEPS = ['recebida', 'em andamento', 'resolvida']

export function Solicitacoes({ parts }) {
  if (parts[0] === 'nova') return <NewRequest />
  if (parts[0]) return <Detail id={parts[0]} />
  return <ListView />
}

function ListView() {
  const { db, user } = useStore()
  const [tab, setTab] = useState('abertas')
  const mine = db.requests.filter((r) => r.personId === user.id)
  const open = mine.filter((r) => r.status !== 'resolvida' && r.status !== 'encerrada')
  const items = tab === 'abertas' ? open : mine.filter((r) => !open.includes(r))
  return (
    <>
      <PageHeader
        overline="Fale com a administração"
        title="Solicitações"
        lead="Reclamações, sugestões e denúncias, com protocolo e acompanhamento até a solução."
        actions={
          <Button variant="gold" icon={MessageSquarePlus} to="morador/solicitacoes/nova">
            Nova solicitação
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'abertas', label: 'Em aberto', count: open.length },
          { id: 'finalizadas', label: 'Finalizadas' },
        ]}
      />
      {items.length === 0 ? (
        <Empty icon={CheckCircle2} title="Nada por aqui" text="Quando você abrir uma solicitação, ela aparece nesta lista com o protocolo." />
      ) : (
        <List>
          {items.map((r) => (
            <Row
              key={r.id}
              to={`morador/solicitacoes/${r.id}`}
              leading={<Badge tone={r.tipo === 'Sugestão' ? 'blue' : r.tipo === 'Denúncia' ? 'red' : 'gold'}>{r.tipo}</Badge>}
              title={r.titulo}
              subtitle={`${r.protocolo} · ${r.categoria} · ${timeAgo(r.criadaEm)}`}
              trailing={<StatusBadge status={r.status} />}
            />
          ))}
        </List>
      )}
      <Notice icon={EyeOff} className="mt-5">
        Denúncias anônimas não aparecem nesta lista. Guarde o protocolo mostrado ao enviar para acompanhar.
      </Notice>
    </>
  )
}

function NewRequest() {
  const { db, user, mutate, toast } = useStore()
  const unit = unitById(db, user.unitId)
  const [f, setF] = useState({ tipo: 'Reclamação', categoria: 'Manutenção', titulo: '', descricao: '', local: unitLabel(unit) })
  const [anon, setAnon] = useState(false)
  const [photos, setPhotos] = useState([])
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const addPhotos = () => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', multiple: true })
    input.onchange = () => {
      ;[...(input.files ?? [])].slice(0, 4).forEach((file) => {
        const r = new FileReader()
        r.onload = () => setPhotos((p) => [...p, r.result].slice(0, 4))
        r.readAsDataURL(file)
      })
    }
    input.click()
  }

  const submit = (e) => {
    e.preventDefault()
    const id = uid('s')
    const protocolo = nextProtocol(db)
    const autor = anon ? 'Anônimo' : user.nome
    mutate(
      (d) => {
        d.requests.unshift({
          id, protocolo, unitId: anon ? null : user.unitId, personId: anon ? null : user.id, anonima: anon, tipo: anon ? 'Denúncia' : f.tipo, categoria: f.categoria,
          titulo: f.titulo, descricao: f.descricao, local: f.local, fotos: photos.length, fotosData: photos, status: 'recebida', responsavel: '', prazo: addDays(today(), 5),
          criadaEm: new Date().toISOString(), historico: [{ em: new Date().toISOString(), autor, tipo: 'abertura', texto: anon ? 'Denúncia anônima registrada.' : 'Solicitação aberta.' }],
        })
        pushNotification(d, 'admin', anon ? 'Denúncia anônima recebida' : `Nova ${f.tipo.toLowerCase()}`, `${protocolo} · ${f.titulo}`, `admin/solicitacoes/${id}`)
      },
      anon ? undefined : { acao: 'Abriu solicitação', alvo: protocolo },
    )
    if (anon) setDone(protocolo)
    else {
      toast(`Solicitação ${protocolo} enviada`)
      go(`morador/solicitacoes/${id}`, { replace: true })
    }
  }

  if (done)
    return (
      <>
        <PageHeader overline="Denúncia anônima" title="Recebida" />
        <Card className="max-w-lg text-center">
          <ShieldCheck size={40} className="mx-auto text-brand-600" />
          <p className="mt-3 text-ink-700">Sua denúncia foi registrada sem identificação. Anote o protocolo:</p>
          <p className="display mt-3 font-mono text-[2rem] text-ink-900">{done}</p>
          <Button variant="outline" className="mt-5" to="morador/solicitacoes">
            Voltar
          </Button>
        </Card>
      </>
    )

  return (
    <>
      <PageHeader back="morador/solicitacoes" overline="Fale com a administração" title="Nova solicitação" />
      <form onSubmit={submit} className="grid max-w-3xl gap-5">
        <Card className="grid gap-4 sm:grid-cols-2">
          {!anon && (
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-700">Tipo</span>
              <div className="flex gap-2">
                {['Reclamação', 'Sugestão'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setF({ ...f, tipo: t })}
                    aria-pressed={f.tipo === t}
                    className={cx('flex-1 rounded-xl px-4 py-3 text-[0.9rem] font-bold ring-1 ring-inset', f.tipo === t ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-700 ring-paper-300')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field label="Categoria">
            <Select value={f.categoria} onChange={set('categoria')} options={CATEGORIAS} />
          </Field>
          <Field label="Local">
            <div className="relative">
              <MapPin size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-500" />
              <Input value={f.local} onChange={set('local')} style={{ paddingLeft: '2.4rem' }} />
            </div>
          </Field>
          <Field label="Assunto" className="sm:col-span-2">
            <Input value={f.titulo} onChange={set('titulo')} required placeholder="Resumo em uma frase" />
          </Field>
          <Field label="Descrição" className="sm:col-span-2">
            <Textarea value={f.descricao} onChange={set('descricao')} required placeholder="Conte o que aconteceu, quando e onde." />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink-700">Fotos ({photos.length}/4)</span>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <img key={i} src={p} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-paper-300" />
              ))}
              {photos.length < 4 && (
                <button type="button" onClick={addPhotos} className="grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-paper-300 text-ink-500 hover:bg-paper-100">
                  <Camera size={22} />
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className={cx(anon && 'ring-2 ring-brand-600')}>
          <Check checked={anon} onChange={setAnon}>
            <b className="text-ink-900">Enviar como denúncia anônima</b>
            <span className="mt-0.5 block text-[0.82rem] text-ink-500">
              Seu nome e sua casa não são gravados. Em troca, a administração não consegue responder diretamente a você: acompanhe pelo protocolo.
            </span>
          </Check>
        </Card>

        <div>
          <Button type="submit" variant="gold" size="lg" icon={Send} className="w-full sm:w-auto">
            {anon ? 'Enviar denúncia anônima' : 'Enviar solicitação'}
          </Button>
        </div>
      </form>
    </>
  )
}

function Detail({ id }) {
  const { db, user, mutate, toast } = useStore()
  const [msg, setMsg] = useState('')
  const r = db.requests.find((x) => x.id === id)
  if (!r) return <Empty title="Solicitação não encontrada" />
  const stepIdx = Math.max(0, STEPS.indexOf(r.status === 'encerrada' ? 'resolvida' : r.status))
  const closed = r.status === 'resolvida' || r.status === 'encerrada'

  const send = (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    mutate(
      (d) => {
        d.requests.find((x) => x.id === id).historico.push({ em: new Date().toISOString(), autor: user.nome, tipo: 'resposta', texto: msg.trim() })
        pushNotification(d, 'admin', 'Nova mensagem do morador', `${r.protocolo} · ${user.nome}`, `admin/solicitacoes/${id}`)
      },
      { acao: 'Comentou solicitação', alvo: r.protocolo },
    )
    setMsg('')
    toast('Mensagem enviada')
  }

  return (
    <>
      <PageHeader back="morador/solicitacoes" overline={`${r.tipo} · ${r.protocolo}`} title={r.titulo} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Progresso */}
          <Card>
            <ol className="flex items-center">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.span
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cx('grid h-9 w-9 place-items-center rounded-full text-[0.8rem] font-bold', i <= stepIdx ? 'bg-brand-600 text-white' : 'bg-paper-200 text-ink-500')}
                    >
                      {i < stepIdx || (i === stepIdx && closed) ? <CheckCircle2 size={18} /> : i + 1}
                    </motion.span>
                    <span className={cx('text-[0.72rem] font-semibold capitalize', i <= stepIdx ? 'text-ink-900' : 'text-ink-500')}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mx-2 mb-5 h-1 flex-1 overflow-hidden rounded-full bg-paper-200">
                      <motion.div initial={{ width: 0 }} animate={{ width: i < stepIdx ? '100%' : '0%' }} transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease: EASE.out }} className="h-full bg-brand-600" />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <SectionTitle>Histórico de atendimento</SectionTitle>
            <ol className="space-y-4">
              {r.historico.map((h, i) => {
                const isMine = h.autor === user.nome
                return (
                  <li key={i} className={cx('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={cx('max-w-[85%] rounded-2xl px-4 py-3', h.tipo === 'status' ? 'bg-paper-100 ring-1 ring-paper-200 ring-inset' : isMine ? 'bg-brand-600 text-white' : 'bg-gold-100 text-ink-900')}>
                      <p className={cx('text-[0.72rem] font-bold', isMine ? 'text-white/80' : 'text-ink-500')}>
                        {h.autor} · {fmtDateTime(h.em)}
                      </p>
                      <p className="mt-0.5 text-[0.9rem]">{h.texto}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            {!closed && !r.anonima && (
              <form onSubmit={send} className="mt-5 flex gap-2 border-t border-paper-200 pt-4">
                <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Escreva uma mensagem para a administração" />
                <Button type="submit" variant="primary" icon={Send}>
                  Enviar
                </Button>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <dl className="space-y-3 text-[0.86rem]">
              <Dl k="Protocolo" v={<span className="font-mono">{r.protocolo}</span>} />
              <Dl k="Situação" v={<StatusBadge status={r.status} />} />
              <Dl k="Categoria" v={r.categoria} />
              <Dl k="Local" v={r.local} />
              <Dl k="Responsável" v={r.responsavel || 'A definir'} />
              <Dl k="Prazo" v={fmtDate(r.prazo)} />
              <Dl k="Aberta em" v={fmtDateTime(r.criadaEm)} />
            </dl>
          </Card>
          <Card>
            <SectionTitle>Descrição</SectionTitle>
            <p className="text-[0.9rem] text-ink-700">{r.descricao}</p>
            {r.fotosData?.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.fotosData.map((p, i) => (
                  <img key={i} src={p} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            ) : (
              r.fotos > 0 && <p className="mt-2 text-[0.78rem] text-ink-500">{r.fotos} foto(s) anexada(s)</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

const Dl = ({ k, v }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-ink-500">{k}</dt>
    <dd className="text-right font-semibold text-ink-900">{v}</dd>
  </div>
)
