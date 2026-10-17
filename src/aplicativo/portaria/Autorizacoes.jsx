import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BadgeCheck, Ban, CheckCircle2, DoorClosed, DoorOpen, FileText, KeyRound, Phone, ScanSearch, Users, Wrench } from 'lucide-react'
import { notifyUnit, personById, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, fmtTime, uid } from '../lib/format.js'
import { go } from '../lib/router.js'
import { EASE } from '../lib/motion.js'
import { Avatar, Badge, Button, Card, Empty, Field, List, Modal, Notice, PageHeader, Progress, SearchInput, SectionTitle, StatusBadge, cx, inputCls } from '../ui/kit.jsx'
import { authState, normalize, openEntry, residentsOf } from './helpers.js'

const TIPO_TONE = { Visitante: 'blue', Prestador: 'orange', 'Lista de convidados': 'gold' }

export function TipoBadge({ tipo }) {
  return <Badge tone={TIPO_TONE[tipo] ?? 'gray'}>{tipo}</Badge>
}

/* Ações de portão: entrada, saída e chegada de convidado de lista */
export function useGate() {
  const { mutate, user, toast } = useStore()

  const entrar = (a, placa = '') => {
    mutate(
      (d) => {
        d.accessLog.unshift({ id: uid('ac'), autorizacaoId: a.id, nome: a.nome, unitId: a.unitId, tipo: a.tipo, entrada: new Date().toISOString(), saida: null, porteiro: user.nome, placa })
        notifyUnit(d, a.unitId, a.tipo === 'Prestador' ? 'Prestador chegou' : 'Visitante chegou', `${a.nome} entrou pela portaria.`, 'morador/autorizacoes')
      },
      { acao: 'Registrou entrada', alvo: a.nome },
    )
    toast(`Entrada de ${a.nome} registrada`)
  }

  const sair = (logId, nome) => {
    mutate(
      (d) => {
        const l = d.accessLog.find((x) => x.id === logId)
        if (l) l.saida = new Date().toISOString()
      },
      { acao: 'Registrou saída', alvo: nome },
    )
    toast(`Saída de ${nome} registrada`)
  }

  const convidado = (a, idx) => {
    const g = a.convidados[idx]
    mutate(
      (d) => {
        const au = d.authorizations.find((x) => x.id === a.id)
        au.convidados[idx].entrouEm = new Date().toISOString()
        d.accessLog.unshift({ id: uid('ac'), autorizacaoId: a.id, nome: g.nome, unitId: a.unitId, tipo: 'Convidado', entrada: new Date().toISOString(), saida: null, porteiro: user.nome, placa: '' })
      },
      { acao: 'Registrou entrada de convidado', alvo: `${g.nome} · ${a.nome}` },
    )
    toast(`${g.nome} entrou`)
  }

  return { entrar, sair, convidado }
}

/* Linha de autorização com ação rápida */
export function AuthRow({ a, quick = true }) {
  const { db } = useStore()
  const { entrar, sair } = useGate()
  const st = authState(a)
  const inside = openEntry(db, a.id)
  const lista = a.tipo === 'Lista de convidados'
  const chegaram = lista ? a.convidados.filter((c) => c.entrouEm).length : 0

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap">
      <a href={`#/portaria/autorizacoes/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
        <Avatar name={a.nome} size={44} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{a.nome}</p>
          <p className="truncate text-[0.8rem] text-ink-500">
            {unitLabel(unitById(db, a.unitId))}
            {a.servico ? ` · ${a.servico}` : ''}
            {lista ? ` · ${chegaram}/${a.convidados.length} chegaram` : ''}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <TipoBadge tipo={a.tipo} />
            <span className="rounded-md bg-paper-100 px-1.5 font-mono text-[0.72rem] font-bold tracking-wider text-ink-700">{a.codigo}</span>
            {inside && <Badge tone="green" dot>Dentro desde {fmtTime(inside.entrada)}</Badge>}
            {st !== 'ativa' && <StatusBadge status={st} />}
          </div>
        </div>
      </a>
      {quick && st === 'ativa' && !lista && (
        <div className="flex w-full gap-2 sm:w-auto">
          {inside ? (
            <Button variant="outline" size="lg" icon={DoorClosed} className="flex-1 sm:flex-none" onClick={() => sair(inside.id, a.nome)}>
              Saída
            </Button>
          ) : (
            <Button variant="gold" size="lg" icon={DoorOpen} className="flex-1 sm:flex-none" onClick={() => entrar(a)}>
              Entrada
            </Button>
          )}
        </div>
      )}
      {quick && st === 'ativa' && lista && (
        <Button variant="soft" size="lg" icon={Users} to={`portaria/autorizacoes/${a.id}`} className="w-full sm:w-auto">
          Abrir lista
        </Button>
      )}
    </div>
  )
}

/* Busca por nome, unidade ou código */
export function useAuthSearch(q) {
  const { db } = useStore()
  return useMemo(() => {
    const n = normalize(q.trim())
    if (!n) return []
    return db.authorizations.filter((a) => {
      const u = unitById(db, a.unitId)
      const hay = normalize([a.nome, a.codigo, a.empresa, a.documento, u && `${u.rua} ${u.numero}`, ...(a.convidados ?? []).map((c) => c.nome)].join(' '))
      return hay.includes(n)
    })
  }, [db, q])
}

export function Consultar() {
  const [q, setQ] = useState('')
  const [code, setCode] = useState('')
  const [miss, setMiss] = useState(false)
  const { db } = useStore()
  const results = useAuthSearch(q)

  const byCode = (e) => {
    e.preventDefault()
    const a = db.authorizations.find((x) => x.codigo === code.trim().toUpperCase())
    if (a) go(`portaria/autorizacoes/${a.id}`)
    else setMiss(true)
  }

  return (
    <>
      <PageHeader overline="Portaria" title="Consultar autorização" lead="Digite o código que o visitante recebeu ou busque por nome e unidade." />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="bg-brand-600 text-white ring-brand-600">
          <form onSubmit={byCode}>
            <p className="mb-3 flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.18em] text-gold-300 uppercase">
              <KeyRound size={15} /> Código de acesso
            </p>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setMiss(false)
              }}
              maxLength={6}
              placeholder="K7M2QX"
              aria-label="Código de acesso"
              autoFocus
              className="w-full rounded-2xl border-2 border-white/20 bg-white/8 px-4 py-4 text-center font-mono text-[2rem] font-bold tracking-[0.35em] text-white uppercase outline-none placeholder:text-white/25 focus:border-gold-400"
            />
            {miss && <p className="mt-2 text-[0.84rem] font-semibold text-gold-300">Código não encontrado. Confira com o visitante.</p>}
            <Button type="submit" variant="gold" size="lg" className="mt-4 w-full" icon={ScanSearch} disabled={code.length < 6}>
              Validar código
            </Button>
          </form>
        </Card>

        <div>
          <SearchInput value={q} onChange={setQ} placeholder="Nome, empresa, rua ou número da casa…" className="[&_input]:py-4 [&_input]:text-[1.05rem]" />
          <div className="mt-4">
            {!q.trim() ? (
              <Empty icon={ScanSearch} title="Comece digitando" text="Ex.: “Cláudia”, “Noel 120” ou “Jardins”." />
            ) : results.length === 0 ? (
              <Empty icon={Ban} title="Nenhuma autorização encontrada" text="Se a pessoa não estiver autorizada, use “Visitante sem autorização” para avisar o morador." action={<Button variant="outline" to="portaria/sem-autorizacao">Visitante sem autorização</Button>} />
            ) : (
              <List>
                {results.map((a) => (
                  <AuthRow key={a.id} a={a} />
                ))}
              </List>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function Detalhe({ id }) {
  const { db } = useStore()
  const { entrar, sair, convidado } = useGate()
  const [placa, setPlaca] = useState('')
  const [confirm, setConfirm] = useState(false)
  const a = db.authorizations.find((x) => x.id === id)

  if (!a)
    return (
      <>
        <PageHeader back="portaria/autorizacoes" title="Autorização não encontrada" />
        <Empty title="Esta autorização não existe mais." />
      </>
    )

  const st = authState(a)
  const ok = st === 'ativa'
  const u = unitById(db, a.unitId)
  const autor = personById(db, a.criadoPor)
  const inside = openEntry(db, a.id)
  const lista = a.tipo === 'Lista de convidados'
  const history = db.accessLog.filter((l) => l.autorizacaoId === a.id)
  const chegaram = lista ? a.convidados.filter((c) => c.entrouEm).length : 0

  return (
    <>
      <PageHeader back="portaria/autorizacoes" overline={a.tipo} title={a.nome} />

      {!ok && (
        <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35, ease: EASE.out }}>
          <div className="mb-5 flex items-center gap-4 rounded-2xl bg-red-600 px-5 py-4 text-white shadow-lg">
            <Ban size={34} className="shrink-0" />
            <div>
              <p className="display text-[1.4rem]">Entrada não permitida</p>
              <p className="text-[0.9rem] text-white/90">
                {st === 'revogada' && 'O morador revogou esta autorização.'}
                {st === 'expirada' && `A validade terminou em ${fmtDate(a.validoAte)}.`}
                {st === 'futura' && `Esta autorização vale a partir de ${fmtDate(a.validoDe)}.`}
                {st === 'usada' && 'Esta autorização já foi utilizada.'} Contate o morador antes de liberar.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar name={a.nome} size={88} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <TipoBadge tipo={a.tipo} />
                  <StatusBadge status={st} />
                  {inside && <Badge tone="green" dot>Dentro desde {fmtTime(inside.entrada)}</Badge>}
                </div>
                <p className="mt-2 font-mono text-[1.6rem] font-bold tracking-[0.3em] text-ink-900">{a.codigo}</p>
                <p className="text-[0.85rem] text-ink-500">
                  Válida {a.validoDe === a.validoAte ? `em ${fmtDate(a.validoDe)}` : `de ${fmtDate(a.validoDe)} a ${fmtDate(a.validoAte)}`}
                  {a.recorrente ? ` · ${a.recorrente}` : ''}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-paper-200 pt-5 text-[0.9rem] sm:grid-cols-2">
              {a.documento && <Info icon={FileText} label="Documento" value={a.documento} />}
              {a.empresa && <Info icon={Wrench} label="Empresa / serviço" value={`${a.empresa}${a.servico ? ` · ${a.servico}` : ''}`} />}
              <Info icon={BadgeCheck} label="Autorizado por" value={autor?.nome ?? '—'} />
              {a.obs && <Info icon={FileText} label="Observação" value={a.obs} className="sm:col-span-2" />}
            </dl>

            {ok && !lista && (
              <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-paper-200 pt-5">
                {inside ? (
                  <Button variant="primary" size="lg" icon={DoorClosed} onClick={() => sair(inside.id, a.nome)} className="w-full sm:w-auto">
                    Registrar saída
                  </Button>
                ) : (
                  <>
                    <Field label="Placa do veículo" optional className="w-full sm:w-48">
                      <input className={cx(inputCls, 'font-mono uppercase')} value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-1D23" />
                    </Field>
                    <Button
                      variant="gold"
                      size="lg"
                      icon={DoorOpen}
                      className="w-full sm:w-auto"
                      onClick={() => {
                        entrar(a, placa)
                        setPlaca('')
                      }}
                    >
                      Registrar entrada
                    </Button>
                  </>
                )}
              </div>
            )}
            {!ok && (
              <div className="mt-5 border-t border-paper-200 pt-5">
                <Button variant="danger" icon={Phone} onClick={() => setConfirm(true)}>
                  Liberar mesmo assim (falei com o morador)
                </Button>
              </div>
            )}
          </Card>

          {lista && (
            <Card>
              <SectionTitle action={<span className="text-[0.82rem] font-bold text-ink-700">{chegaram} de {a.convidados.length}</span>}>Lista de convidados</SectionTitle>
              <Progress value={(chegaram / a.convidados.length) * 100} tone="gold" className="mb-4" />
              <ul className="divide-y divide-paper-200">
                {a.convidados.map((g, i) => (
                  <li key={g.nome + i} className="flex items-center gap-3 py-2.5">
                    <Avatar name={g.nome} size={36} />
                    <span className="flex-1 font-semibold text-ink-900">{g.nome}</span>
                    {g.entrouEm ? (
                      <Badge tone="green">
                        <CheckCircle2 size={13} /> Entrou {fmtTime(g.entrouEm)}
                      </Badge>
                    ) : (
                      <Button variant="gold" size="md" icon={DoorOpen} disabled={!ok} onClick={() => convidado(a, i)}>
                        Chegou
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <SectionTitle>Unidade de destino</SectionTitle>
            <p className="display text-[1.3rem] text-ink-900">{unitLabel(u)}</p>
            <p className="text-[0.8rem] text-ink-500">Quadra {u.quadra} · Lote {u.lote}</p>
            <ul className="mt-4 space-y-2.5">
              {residentsOf(db, u.id).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar name={p.nome} size={34} photo={p.foto} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.88rem] font-semibold text-ink-900">{p.nome}</p>
                    <p className="text-[0.75rem] text-ink-500">{p.vinculo}</p>
                  </div>
                  <a href={`tel:${p.telefone}`} aria-label={`Ligar para ${p.nome}`} className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100">
                    <Phone size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>Histórico de entradas</SectionTitle>
            {history.length === 0 ? (
              <p className="text-[0.86rem] text-ink-500">Nenhuma entrada registrada.</p>
            ) : (
              <ul className="space-y-2 text-[0.84rem]">
                {history.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-ink-700">{l.nome}</span>
                    <span className="shrink-0 text-ink-500">
                      {fmtDate(l.entrada)} {fmtTime(l.entrada)}
                      {l.saida ? `–${fmtTime(l.saida)}` : ' · dentro'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Liberar entrada"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="dangerSolid"
              icon={DoorOpen}
              onClick={() => {
                entrar({ ...a, nome: a.nome }, placa)
                setConfirm(false)
              }}
            >
              Confirmar liberação
            </Button>
          </>
        }
      >
        <Notice tone="gold">A entrada será registrada no histórico como liberação manual, com o seu nome. Confirme apenas se o morador autorizou por telefone.</Notice>
      </Modal>
    </>
  )
}

function Info({ icon: Icon, label, value, className }) {
  return (
    <div className={cx('flex gap-2.5', className)}>
      <Icon size={16} className="mt-0.5 shrink-0 text-ink-500" />
      <div>
        <dt className="text-[0.72rem] font-semibold text-ink-500">{label}</dt>
        <dd className="text-ink-900">{value}</dd>
      </div>
    </div>
  )
}

