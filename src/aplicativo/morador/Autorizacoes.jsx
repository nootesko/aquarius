import { useState } from 'react'
import { motion } from 'motion/react'
import { Ban, HardHat, ListChecks, Plus, Share2, Trash2, UserPlus, UserRound } from 'lucide-react'
import { areaById, pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { accessCode, addDays, fmtDate, fmtDateTime, today, uid } from '../lib/format.js'
import { go } from '../lib/router.js'
import { EASE, SPRING } from '../lib/motion.js'
import { Avatar, Badge, Button, Card, Empty, Field, Input, List, Modal, Notice, PageHeader, Row, SectionTitle, Select, StatusBadge, Tabs, Textarea, cx } from '../ui/kit.jsx'

const TIPOS = [
  { id: 'Visitante', icon: UserRound, text: 'Amigos e familiares' },
  { id: 'Prestador', icon: HardHat, text: 'Serviços e entregas grandes' },
  { id: 'Lista de convidados', icon: ListChecks, text: 'Festas e reservas' },
]
const TIPO_ICON = Object.fromEntries(TIPOS.map((t) => [t.id, t.icon]))

/* Autorização vencida vira "expirada" na leitura, sem precisar de rotina no servidor */
const effective = (a) => (a.status === 'ativa' && a.validoAte < today() ? 'expirada' : a.status)

export function Autorizacoes({ parts }) {
  if (parts[0] === 'nova') return <NewAuth presetReserva={parts[1] === 'lista' ? parts[2] : null} />
  if (parts[0]) return <Detail id={parts[0]} />
  return <ListView />
}

function ListView() {
  const { db, user } = useStore()
  const [tab, setTab] = useState('validas')
  const mine = db.authorizations.filter((a) => a.unitId === user.unitId)
  const valid = mine.filter((a) => effective(a) === 'ativa')
  const history = mine.filter((a) => effective(a) !== 'ativa')
  const entries = db.accessLog.filter((x) => x.unitId === user.unitId)

  return (
    <>
      <PageHeader
        overline="Portaria"
        title="Visitantes e acessos"
        lead="Libere visitantes, prestadores e listas de convidados com prazo de validade. A portaria recebe na hora."
        actions={
          <Button variant="gold" icon={UserPlus} to="morador/autorizacoes/nova">
            Nova autorização
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'validas', label: 'Válidas', count: valid.length },
          { id: 'historico', label: 'Histórico' },
          { id: 'entradas', label: 'Entradas registradas', count: entries.length },
        ]}
      />

      {tab === 'validas' &&
        (valid.length === 0 ? (
          <Empty icon={UserPlus} title="Nenhuma autorização válida" action={<Button variant="gold" to="morador/autorizacoes/nova">Autorizar alguém</Button>} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {valid.map((a, i) => (
              <AuthCard key={a.id} a={a} i={i} />
            ))}
          </div>
        ))}

      {tab === 'historico' && (
        <List>
          {history.length === 0 && <p className="p-5 text-[0.88rem] text-ink-500">Sem histórico.</p>}
          {history.map((a) => {
            const Icon = TIPO_ICON[a.tipo]
            return (
              <Row
                key={a.id}
                to={`morador/autorizacoes/${a.id}`}
                leading={
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper-100 text-ink-600">
                    <Icon size={18} />
                  </span>
                }
                title={a.nome}
                subtitle={`${a.tipo} · ${fmtDate(a.validoDe)}`}
                trailing={<StatusBadge status={effective(a)} />}
              />
            )
          })}
        </List>
      )}

      {tab === 'entradas' && (
        <List>
          {entries.map((e) => (
            <Row
              key={e.id}
              leading={<Avatar name={e.nome} size={40} />}
              title={e.nome}
              subtitle={`${e.tipo} · entrou ${fmtDateTime(e.entrada)}${e.saida ? ` · saiu ${fmtDateTime(e.saida).slice(-5)}` : ''}`}
              trailing={e.saida ? <Badge>Saiu</Badge> : <Badge tone="green" dot>No condomínio</Badge>}
            />
          ))}
        </List>
      )}
    </>
  )
}

function AuthCard({ a, i }) {
  const Icon = TIPO_ICON[a.tipo]
  const guests = a.convidados
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: EASE.out }}>
      <Card to={`morador/autorizacoes/${a.id}`} className="h-full">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-gold-400">
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink-900">{a.nome}</p>
            <p className="text-[0.8rem] text-ink-500">{a.tipo}</p>
            {(a.servico || guests) && <p className="text-[0.8rem] text-ink-500">{a.servico ?? `${guests.length} convidados`}</p>}
          </div>
          <span className="rounded-lg bg-paper-100 px-2 py-1 font-mono text-[0.8rem] font-bold tracking-wider text-ink-900">{a.codigo}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-[0.8rem]">
          <span className="text-ink-600">
            {a.validoDe === a.validoAte ? (a.validoDe === today() ? 'Somente hoje' : fmtDate(a.validoDe)) : `${fmtDate(a.validoDe)} a ${fmtDate(a.validoAte)}`}
            {a.recorrente && ` · ${a.recorrente}`}
          </span>
          <StatusBadge status="ativa" />
        </div>
      </Card>
    </motion.div>
  )
}

function NewAuth({ presetReserva }) {
  const { db, user, mutate, toast } = useStore()
  const t = today()
  const myRes = db.reservations.filter((r) => r.unitId === user.unitId && r.data >= t && ['confirmada', 'pendente'].includes(r.status))
  const preset = myRes.find((r) => r.id === presetReserva)
  const [tipo, setTipo] = useState(preset ? 'Lista de convidados' : 'Visitante')
  const [f, setF] = useState({
    nome: preset ? `Convidados · ${areaById(db, preset.areaId).nome}` : '',
    documento: '',
    empresa: '',
    servico: '',
    validoDe: preset?.data ?? t,
    validoAte: preset?.data ?? t,
    obs: '',
    reservaId: preset?.id ?? '',
  })
  const [guests, setGuests] = useState([''])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const pickReserva = (id) => {
    const r = myRes.find((x) => x.id === id)
    setF({ ...f, reservaId: id, ...(r ? { validoDe: r.data, validoAte: r.data, nome: f.nome || `Convidados · ${areaById(db, r.areaId).nome}` } : {}) })
  }

  const submit = (e) => {
    e.preventDefault()
    const id = uid('au')
    const codigo = accessCode()
    const convidados = guests.map((g) => g.trim()).filter(Boolean).map((nome) => ({ nome, documento: '', entrouEm: null }))
    if (tipo === 'Lista de convidados' && convidados.length === 0) return toast('Adicione pelo menos um convidado', 'error')
    mutate(
      (d) => {
        d.authorizations.unshift({
          id, unitId: user.unitId, criadoPor: user.id, tipo, nome: f.nome, documento: f.documento, empresa: f.empresa || undefined, servico: f.servico || undefined,
          validoDe: f.validoDe, validoAte: f.validoAte < f.validoDe ? f.validoDe : f.validoAte, codigo, status: 'ativa', criadaEm: new Date().toISOString(), obs: f.obs,
          reservaId: f.reservaId || undefined, ...(tipo === 'Lista de convidados' ? { convidados } : {}),
        })
        pushNotification(d, 'portaria', tipo === 'Lista de convidados' ? 'Nova lista de convidados' : 'Nova autorização', `${f.nome} · ${unitLabel(unitById(d, user.unitId))}`, `portaria/autorizacoes/${id}`)
      },
      { acao: tipo === 'Lista de convidados' ? 'Criou lista de convidados' : `Autorizou ${tipo.toLowerCase()}`, alvo: f.nome },
    )
    toast('Autorização criada e enviada à portaria')
    go(`morador/autorizacoes/${id}`, { replace: true })
  }

  return (
    <>
      <PageHeader back="morador/autorizacoes" overline="Portaria" title="Nova autorização" />
      <form onSubmit={submit} className="grid max-w-3xl gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {TIPOS.map((t) => {
            const on = tipo === t.id
            return (
              <motion.button
                key={t.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                transition={SPRING.pop}
                onClick={() => setTipo(t.id)}
                aria-pressed={on}
                className={cx('flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition-colors ring-inset', on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-900 ring-paper-300 hover:bg-paper-100')}
              >
                <span className={cx('grid h-10 w-10 place-items-center rounded-xl', on ? 'bg-gold-400 text-navy-900' : 'bg-paper-100 text-ink-700')}>
                  <t.icon size={19} />
                </span>
                <span>
                  <span className="block text-[0.9rem] font-bold">{t.id}</span>
                  <span className={cx('block text-[0.75rem]', on ? 'text-white/70' : 'text-ink-500')}>{t.text}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <Card className="grid gap-4 sm:grid-cols-2">
          {tipo === 'Lista de convidados' && (
            <Field label="Vincular a uma reserva" optional className="sm:col-span-2">
              <Select
                value={f.reservaId}
                onChange={(e) => pickReserva(e.target.value)}
                options={[{ value: '', label: 'Sem reserva (evento na minha casa)' }, ...myRes.map((r) => ({ value: r.id, label: `${areaById(db, r.areaId).nome} · ${fmtDate(r.data)} · ${r.slot}` }))]}
              />
            </Field>
          )}
          <Field label={tipo === 'Lista de convidados' ? 'Nome do evento' : tipo === 'Prestador' ? 'Nome do prestador ou equipe' : 'Nome do visitante'} className="sm:col-span-2">
            <Input value={f.nome} onChange={set('nome')} required />
          </Field>
          {tipo !== 'Lista de convidados' && (
            <Field label="Documento (RG ou CPF)" optional>
              <Input value={f.documento} onChange={set('documento')} />
            </Field>
          )}
          {tipo === 'Prestador' && (
            <>
              <Field label="Empresa" optional>
                <Input value={f.empresa} onChange={set('empresa')} />
              </Field>
              <Field label="Serviço" className="sm:col-span-2">
                <Input value={f.servico} onChange={set('servico')} placeholder="Ex.: conserto do portão" required />
              </Field>
            </>
          )}
          <Field label="Válido de">
            <Input type="date" min={t} value={f.validoDe} onChange={set('validoDe')} required />
          </Field>
          <Field label="Até">
            <Input type="date" min={f.validoDe} max={addDays(t, 90)} value={f.validoAte} onChange={set('validoAte')} required />
          </Field>
          {tipo !== 'Lista de convidados' && (
            <Field label="Observação para a portaria" optional className="sm:col-span-2">
              <Textarea rows={2} value={f.obs} onChange={set('obs')} placeholder="Placa do carro, horário previsto…" />
            </Field>
          )}
        </Card>

        {tipo === 'Lista de convidados' && (
          <Card>
            <SectionTitle>Convidados ({guests.filter((g) => g.trim()).length})</SectionTitle>
            <div className="space-y-2">
              {guests.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={g}
                    placeholder={`Convidado ${i + 1}`}
                    onChange={(e) => setGuests(guests.map((x, j) => (j === i ? e.target.value : x)))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        setGuests([...guests, ''])
                      }
                    }}
                  />
                  <button type="button" aria-label="Remover" onClick={() => setGuests(guests.filter((_, j) => j !== i))} className="grid w-11 shrink-0 place-items-center rounded-xl text-ink-500 hover:bg-paper-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="soft" icon={Plus} className="mt-3" onClick={() => setGuests([...guests, ''])}>
              Adicionar convidado
            </Button>
          </Card>
        )}

        <div>
          <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto">
            Autorizar e gerar código
          </Button>
        </div>
      </form>
    </>
  )
}

function Detail({ id }) {
  const { db, mutate, toast } = useStore()
  const a = db.authorizations.find((x) => x.id === id)
  const [revoke, setRevoke] = useState(false)
  const [add, setAdd] = useState('')
  if (!a) return <Empty title="Autorização não encontrada" />
  const st = effective(a)
  const Icon = TIPO_ICON[a.tipo]
  const entries = db.accessLog.filter((x) => x.autorizacaoId === a.id)
  const arrived = a.convidados?.filter((c) => c.entrouEm).length ?? 0
  const reserva = a.reservaId && db.reservations.find((r) => r.id === a.reservaId)

  const share = () => {
    const text = `Olá! Sua entrada no Residencial Aquarius está liberada. Código: ${a.codigo}. Válido ${a.validoDe === a.validoAte ? `em ${fmtDate(a.validoDe)}` : `de ${fmtDate(a.validoDe)} a ${fmtDate(a.validoAte)}`}.`
    navigator.clipboard?.writeText(text).catch(() => {})
    toast('Mensagem copiada: é só colar no WhatsApp')
  }

  return (
    <>
      <PageHeader back="morador/autorizacoes" overline={a.tipo} title={a.nome} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Passe */}
        <motion.div initial={{ opacity: 0, rotateX: 12, y: 20 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ duration: 0.6, ease: EASE.out }}>
          <div className={cx('relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white', st === 'ativa' ? 'from-sky-700 to-sky-950' : 'from-ink-600 to-ink-900')}>
            <div className="paver-grid-light absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400 text-navy-900">
                  <Icon size={20} />
                </span>
                <StatusBadge status={st} />
              </div>
              <p className="mt-6 text-[0.68rem] font-bold tracking-[0.22em] text-gold-300 uppercase">Código de acesso</p>
              <p className="display mt-1 font-mono text-[2.6rem] tracking-[0.14em]">{a.codigo}</p>
              <FakeQr seed={a.codigo} dim={st !== 'ativa'} />
              <p className="mt-4 text-[0.86rem] text-white/85">
                {a.validoDe === a.validoAte ? `Válido em ${fmtDate(a.validoDe)}` : `Válido de ${fmtDate(a.validoDe)} a ${fmtDate(a.validoAte)}`}
                {a.recorrente && ` · ${a.recorrente}`}
              </p>
              <p className="text-[0.8rem] text-white/65">Destino: {unitLabel(unitById(db, a.unitId))}</p>
            </div>
          </div>
          {st === 'ativa' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="gold" icon={Share2} onClick={share}>
                Compartilhar
              </Button>
              <Button variant="danger" icon={Ban} onClick={() => setRevoke(true)}>
                Revogar
              </Button>
            </div>
          )}
        </motion.div>

        <div className="space-y-5">
          <Card>
            <dl className="grid gap-4 text-[0.88rem] sm:grid-cols-2">
              {a.documento && <Dl k="Documento" v={a.documento} />}
              {a.empresa && <Dl k="Empresa" v={a.empresa} />}
              {a.servico && <Dl k="Serviço" v={a.servico} />}
              {reserva && <Dl k="Reserva" v={`${areaById(db, reserva.areaId).nome} · ${reserva.slot}`} />}
              <Dl k="Criada em" v={fmtDateTime(a.criadaEm)} />
              {a.obs && <Dl k="Observação" v={a.obs} />}
            </dl>
          </Card>

          {a.convidados && (
            <Card>
              <SectionTitle>
                Convidados · {arrived} de {a.convidados.length} chegaram
              </SectionTitle>
              <ul className="divide-y divide-paper-200">
                {a.convidados.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5">
                    <Avatar name={c.nome} size={34} />
                    <span className="flex-1 text-[0.9rem] font-semibold text-ink-900">{c.nome}</span>
                    {c.entrouEm ? <Badge tone="green">Entrou {fmtDateTime(c.entrouEm).slice(-5)}</Badge> : <Badge>Aguardando</Badge>}
                  </li>
                ))}
              </ul>
              {st === 'ativa' && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!add.trim()) return
                    mutate((d) => d.authorizations.find((x) => x.id === id).convidados.push({ nome: add.trim(), documento: '', entrouEm: null }), { acao: 'Incluiu convidado', alvo: add.trim() })
                    setAdd('')
                    toast('Convidado incluído')
                  }}
                >
                  <Input value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Incluir mais um convidado" />
                  <Button type="submit" variant="soft" icon={Plus}>
                    Incluir
                  </Button>
                </form>
              )}
            </Card>
          )}

          <Card>
            <SectionTitle>Registro na portaria</SectionTitle>
            {entries.length === 0 ? (
              <p className="text-[0.88rem] text-ink-500">Nenhuma entrada registrada ainda. Você será avisado quando a pessoa chegar.</p>
            ) : (
              <ul className="space-y-2 text-[0.88rem]">
                {entries.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span className="text-ink-700">Entrada {fmtDateTime(e.entrada)}</span>
                    <span className="text-ink-500">{e.saida ? `Saída ${fmtDateTime(e.saida)}` : 'Ainda no condomínio'}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={revoke}
        onClose={() => setRevoke(false)}
        title="Revogar acesso?"
        footer={
          <>
            <Button variant="outline" onClick={() => setRevoke(false)}>
              Voltar
            </Button>
            <Button
              variant="dangerSolid"
              onClick={() => {
                mutate(
                  (d) => {
                    d.authorizations.find((x) => x.id === id).status = 'revogada'
                    pushNotification(d, 'portaria', 'Autorização revogada', `${a.nome} · código ${a.codigo}`, `portaria/autorizacoes/${id}`)
                  },
                  { acao: 'Revogou autorização', alvo: a.nome },
                )
                toast('Acesso revogado. A portaria foi avisada.')
                setRevoke(false)
              }}
            >
              Revogar
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] text-ink-700">
          O código <b className="font-mono">{a.codigo}</b> deixa de funcionar imediatamente e a portaria é avisada.
        </p>
      </Modal>
    </>
  )
}

const Dl = ({ k, v }) => (
  <div>
    <dt className="text-[0.75rem] font-semibold text-ink-500">{k}</dt>
    <dd className="font-semibold text-ink-900">{v}</dd>
  </div>
)

/* QR ilustrativo, gerado do código (não é lido por leitores reais) */
function FakeQr({ seed, dim }) {
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const cells = Array.from({ length: 121 }, () => {
    h = (h * 1103515245 + 12345) >>> 0
    return (h >> 16) & 1
  })
  const finder = (i) => {
    const x = i % 11
    const y = Math.floor(i / 11)
    const inBox = (bx, by) => x >= bx && x < bx + 3 && y >= by && y < by + 3
    return inBox(0, 0) || inBox(8, 0) || inBox(0, 8)
  }
  return (
    <div className={cx('mt-5 grid w-32 grid-cols-11 gap-[2px] rounded-xl bg-white p-2.5', dim && 'opacity-40')} aria-hidden="true">
      {cells.map((c, i) => (
        <span key={i} className={cx('aspect-square rounded-[1px]', finder(i) || c ? 'bg-brand-600' : 'bg-white')} />
      ))}
    </div>
  )
}

