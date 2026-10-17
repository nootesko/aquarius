import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Eye, EyeOff, FileDown, Lock, Vote } from 'lucide-react'
import { personById, tally, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, fmtDateTime } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Badge, Button, Card, Empty, Modal, Notice, PageHeader, SectionTitle, StatusBadge, Table, Tabs, Td, cx } from '../ui/kit.jsx'

export function Votacoes({ parts }) {
  if (parts[0]) return <Detail id={parts[0]} />
  return <ListView />
}

/* Selo do tipo: formal em azul cheio, enquete em azul-claro; sempre em caixa alta */
export const VoteTypeBadge = ({ tipo }) => (
  <Badge tone={tipo === 'formal' ? 'solid' : 'blue'} className="h-[19px] py-0! text-[0.62rem]! font-medium! leading-none tracking-[0.1em] uppercase [&>span]:[text-box:trim-both_cap_alphabetic]">
    <span>{tipo === 'formal' ? 'Votação formal' : 'Enquete'}</span>
  </Badge>
)

const myVote = (v, user) => v.votos.find((x) => (v.votoPor === 'unidade' ? x.unitId === user.unitId : x.personId === user.id))

function ListView() {
  const { db, user } = useStore()
  const [tab, setTab] = useState('aberta')
  const items = db.votes.filter((v) => v.status === tab)
  return (
    <>
      <PageHeader overline="Participação" title="Votações e enquetes" lead="Decisões importantes passam pelos proprietários. Enquetes ajudam a ouvir a opinião de todos." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'aberta', label: 'Abertas', count: db.votes.filter((v) => v.status === 'aberta').length },
          { id: 'futura', label: 'Em breve' },
          { id: 'encerrada', label: 'Encerradas' },
        ]}
      />
      {items.length === 0 && <Empty icon={Vote} title="Nada por aqui" />}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((v, i) => {
          const mine = myVote(v, user)
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: EASE.out }}>
              <Card to={`morador/votacoes/${v.id}`} className="flex h-full flex-col">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex-1">
                    <VoteTypeBadge tipo={v.tipo} />
                  </div>
                  <span className="text-[0.75rem] whitespace-nowrap text-ink-500">
                    {v.status === 'futura' ? `abre em ${fmtDate(v.inicio)}` : v.status === 'aberta' ? `até ${fmtDate(v.fim)}` : `encerrada em ${fmtDate(v.fim)}`}
                  </span>
                </div>
                <p className="flex-1 text-[1.02rem] font-bold text-ink-900">{v.titulo}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.8rem]">
                  <Badge tone="gray">{v.modalidade === 'nominal' ? 'Nominal' : 'Secreta'}</Badge>
                  <Badge tone="gray">Voto por {v.votoPor}</Badge>
                  <span className="flex-1" />
                  {v.status === 'aberta' && mine && <Badge tone="green">Você votou</Badge>}
                  {v.status === 'encerrada' && <span className="font-semibold text-ink-700">{v.votos.length} votos</span>}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

function Detail({ id }) {
  const { db, user, mutate, toast } = useStore()
  const v = db.votes.find((x) => x.id === id)
  const mine = v && myVote(v, user)
  const [choice, setChoice] = useState(mine?.opcaoId ?? null)
  const [confirming, setConfirming] = useState(false)
  if (!v) return <Empty title="Votação não encontrada" />

  const canVote = v.status === 'aberta' && (!mine || v.permiteAlterar)
  const showResults = v.status === 'encerrada' || v.parcialVisivel
  const results = tally(v)
  const unit = unitById(db, user.unitId)
  const winner = v.status === 'encerrada' ? results.reduce((a, b) => (b.n > a.n ? b : a)) : null

  const submit = () => {
    mutate(
      (d) => {
        const vote = d.votes.find((x) => x.id === id)
        vote.votos = vote.votos.filter((x) => (v.votoPor === 'unidade' ? x.unitId !== user.unitId : x.personId !== user.id))
        vote.votos.push({ unitId: user.unitId, personId: user.id, opcaoId: choice, em: new Date().toISOString() })
      },
      { acao: mine ? 'Alterou voto' : 'Votou', alvo: v.titulo },
    )
    toast(mine ? 'Voto alterado' : 'Voto registrado!')
    setConfirming(false)
  }

  return (
    <>
      <PageHeader back="morador/votacoes" overline={v.tipo === 'formal' ? 'Votação formal' : 'Enquete'} title={v.titulo} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-3 text-[0.95rem] leading-relaxed text-ink-700">
              {v.descricao.split('\n\n').map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {v.anexos.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-paper-200 pt-4">
                {v.anexos.map((a) => (
                  <Button key={a} variant="outline" size="sm" icon={FileDown} onClick={() => toast(`Download de ${a} (demonstração)`)}>
                    {a}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          {v.status !== 'futura' && (
            <Card>
              <SectionTitle>{canVote ? (mine ? 'Alterar meu voto' : 'Escolha sua opção') : showResults ? 'Resultado' : 'Seu voto'}</SectionTitle>

              {canVote && v.votoPor === 'unidade' && (
                <Notice className="mb-4">
                  Você está votando pela unidade <b>{unitLabel(unit)}</b>.{user.unitIds.length > 1 && ' Para votar pela outra casa, troque a unidade no topo da tela.'}
                </Notice>
              )}

              <div className="space-y-2.5">
                {results.map((o) => {
                  const selected = choice === o.id
                  const isMine = mine?.opcaoId === o.id
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={!canVote}
                      onClick={() => setChoice(o.id)}
                      aria-pressed={selected}
                      className={cx(
                        'relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-left ring-1 transition-colors ring-inset',
                        canVote ? (selected ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-paper-300 hover:bg-paper-100') : 'bg-paper-100 ring-paper-200',
                      )}
                    >
                      {showResults && !canVote && (
                        <motion.span initial={{ width: 0 }} animate={{ width: `${o.pct}%` }} transition={{ duration: 0.9, ease: EASE.out }} className={cx('absolute inset-y-0 left-0', winner?.id === o.id ? 'bg-gold-300/50' : 'bg-brand-100/70')} />
                      )}
                      <span className="relative flex items-center gap-3">
                        {canVote && (
                          <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full ring-2', selected ? 'bg-brand-600 ring-brand-600' : 'ring-paper-300')}>
                            {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                        )}
                        <span className="flex-1">
                          <span className="block text-[0.92rem] font-semibold text-ink-900">{o.texto}</span>
                          {o.detalhe && <span className="mt-0.5 block text-[0.78rem] font-normal text-ink-500">{o.detalhe}</span>}
                        </span>
                        {isMine && <Badge tone="green">Seu voto</Badge>}
                        {showResults && !canVote && (
                          <span className="text-[0.85rem] font-bold text-ink-900">
                            {o.pct}% <span className="font-normal text-ink-500">({o.n})</span>
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>

              {canVote && (
                <Button variant="gold" size="lg" className="mt-5 w-full sm:w-auto" disabled={!choice || choice === mine?.opcaoId} onClick={() => setConfirming(true)} icon={Vote}>
                  {mine ? 'Alterar voto' : 'Votar'}
                </Button>
              )}
              {mine && !canVote && v.status === 'aberta' && (
                <Notice tone="green" icon={CheckCircle2} className="mt-4">
                  Voto registrado em {fmtDateTime(mine.em)}. Esta votação não permite alteração.
                </Notice>
              )}
              {v.status === 'aberta' && !showResults && <p className="mt-4 text-[0.8rem] text-ink-500">O resultado será divulgado após o encerramento, em {fmtDate(v.fim)}.</p>}
              {winner && (
                <Notice tone="gold" className="mt-4">
                  Resultado: <b>{winner.texto}</b>, com {winner.n} de {v.votos.length} votos. {v.quorum && `Critério: ${v.quorum.toLowerCase()}.`}
                </Notice>
              )}
            </Card>
          )}

          {/* Registro nominal dos votos */}
          {v.modalidade === 'nominal' && showResults && v.votos.length > 0 && (
            <section>
              <SectionTitle>Registro dos votos</SectionTitle>
              <Table head={['Unidade', 'Votante', 'Opção', 'Data do voto']}>
                {[...v.votos]
                  .sort((a, b) => a.em.localeCompare(b.em))
                  .map((x) => (
                    <tr key={x.unitId + x.personId}>
                      <Td className="font-semibold whitespace-nowrap text-ink-900">{unitLabel(unitById(db, x.unitId))}</Td>
                      <Td className="whitespace-nowrap">{personById(db, x.personId)?.nome}</Td>
                      <Td className="min-w-[200px]">{v.opcoes.find((o) => o.id === x.opcaoId)?.texto}</Td>
                      <Td className="whitespace-nowrap text-ink-500">{fmtDateTime(x.em)}</Td>
                    </tr>
                  ))}
              </Table>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle>Como funciona</SectionTitle>
            <dl className="space-y-3 text-[0.86rem]">
              <Info k="Situação" v={<StatusBadge status={v.status} />} />
              <Info k="Período" v={`${fmtDate(v.inicio)} a ${fmtDate(v.fim)}`} />
              <Info k="Voto" v={v.votoPor === 'unidade' ? 'Um voto por unidade' : 'Um voto por pessoa'} />
              <Info k="Alterar voto" v={v.permiteAlterar ? 'Permitido até o prazo' : 'Não permitido'} />
              <Info k="Parcial" v={v.parcialVisivel ? 'Visível durante a votação' : 'Só após o encerramento'} />
              <Info k="Participação" v={`${v.votos.length} ${v.votoPor === 'unidade' ? 'unidades' : 'pessoas'}`} />
            </dl>
          </Card>
          {v.modalidade === 'nominal' ? (
            <Notice tone="gold" icon={Eye}>
              <b>Votação nominal.</b> Unidade, votante, opção escolhida e data do voto ficarão visíveis para todos os moradores
              {v.parcialVisivel ? '.' : ' após o encerramento.'}
            </Notice>
          ) : (
            <Notice tone="blue" icon={EyeOff}>
              <b>Votação secreta.</b> Ninguém, nem a administração, vê como cada pessoa votou. Só os totais são divulgados.
            </Notice>
          )}
        </div>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirmar voto"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Revisar
            </Button>
            <Button variant="gold" icon={Lock} onClick={submit}>
              Confirmar voto
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-paper-100 p-4">
            <p className="text-[0.75rem] font-semibold text-ink-500">Sua escolha</p>
            <p className="mt-1 text-[1.02rem] font-bold text-ink-900">{v.opcoes.find((o) => o.id === choice)?.texto}</p>
            {v.votoPor === 'unidade' && <p className="mt-1 text-[0.82rem] text-ink-600">Pela unidade {unitLabel(unit)}</p>}
          </div>
          {v.modalidade === 'nominal' ? (
            <Notice tone="gold" icon={Eye}>
              Este voto é nominal: seu nome, a unidade, a opção e a data ficarão visíveis para todos os moradores.
            </Notice>
          ) : (
            <Notice icon={EyeOff}>Este voto é secreto.</Notice>
          )}
          {!v.permiteAlterar && <Notice tone="red">Depois de confirmado, o voto não poderá ser alterado.</Notice>}
        </div>
      </Modal>
    </>
  )
}

const Info = ({ k, v }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-ink-500">{k}</dt>
    <dd className="text-right font-semibold text-ink-900">{v}</dd>
  </div>
)
