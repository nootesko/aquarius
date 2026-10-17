import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Dog, Heart, MapPin, MessageCircle, Phone, PhoneCall, Siren } from 'lucide-react'
import { pushNotification, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { timeAgo, uid } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Avatar, Badge, Button, Card, Empty, Field, Input, List, Notice, PageHeader, SectionTitle, StatusBadge, Tabs, Textarea, cx } from '../ui/kit.jsx'

/* ---------- Denúncia (monitoramento solidário) ---------- */

const ALERT_TYPES = ['Pessoa suspeita', 'Veículo suspeito', 'Portão aberto', 'Som alto', 'Animal solto', 'Outro']

export function Seguranca() {
  const { db, user, mutate, toast } = useStore()
  const [f, setF] = useState({ tipo: ALERT_TYPES[0], local: unitLabel(unitById(db, user.unitId)), descricao: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    mutate(
      (d) => {
        d.alerts.unshift({ id: uid('al'), ...f, em: new Date().toISOString(), autor: user.nome, status: 'novo', resposta: '' })
        pushNotification(d, 'portaria', `Denúncia: ${f.tipo}`, `${f.local} · ${user.nome}`, 'portaria/alertas')
        pushNotification(d, 'admin', `Denúncia: ${f.tipo}`, f.local, 'admin/alertas')
      },
      { acao: 'Enviou denúncia', alvo: f.tipo },
    )
    setSent(true)
    toast('Denúncia enviada à portaria')
    setF({ ...f, descricao: '' })
  }

  return (
    <>
      <PageHeader overline="Monitoramento solidário" title="Denúncia" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <a href="tel:190" className="flex items-center gap-4 rounded-2xl bg-red-600 p-5 text-white shadow-[0_14px_30px_-16px_rgba(220,38,38,0.9)]">
            <PhoneCall size={26} />
            <div>
              <p className="display text-[1.4rem]">Emergência · 190</p>
              <p className="mt-1.5 text-[0.82rem] leading-snug text-white/85">Viu algo estranho? Denuncie e a portaria verifica na hora. Em caso de emergência, ligue 190 · Polícia Militar.</p>
            </div>
          </a>
          <Card>
            <form onSubmit={submit} className="space-y-4">
              <Field label="O que está acontecendo?">
                <div className="grid grid-cols-2 gap-2">
                  {ALERT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setF({ ...f, tipo: t })}
                      aria-pressed={f.tipo === t}
                      className={cx('rounded-xl px-3 py-2.5 text-[0.82rem] font-semibold ring-1 ring-inset', f.tipo === t ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-700 ring-paper-300 hover:bg-paper-100')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Onde?">
                <Input value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })} required />
              </Field>
              <Field label="Detalhes" optional>
                <Textarea rows={3} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Roupa, placa, direção…" />
              </Field>
              <Button type="submit" variant="gold" size="lg" icon={Siren} className="w-full">
                Enviar denúncia
              </Button>
              {sent && (
                <Notice tone="green" icon={CheckCircle2}>
                  A portaria recebeu sua denúncia e vai verificar. Você será avisado da resposta.
                </Notice>
              )}
            </form>
          </Card>
        </div>
        <div>
          <SectionTitle>Denúncias recentes no residencial</SectionTitle>
          <div className="space-y-3">
            {db.alerts.map((a) => (
              <Card key={a.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-ink-900">{a.tipo}</p>
                  <StatusBadge status={a.status} label={a.status === 'novo' ? 'Em verificação' : undefined} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-[0.8rem] text-ink-500">
                  <MapPin size={13} /> {a.local} · {timeAgo(a.em)}
                </p>
                {a.descricao && <p className="mt-2 text-[0.88rem] text-ink-700">{a.descricao}</p>}
                {a.resposta && <p className="mt-2 rounded-xl bg-brand-50 px-3 py-2 text-[0.84rem] text-brand-700">Portaria: {a.resposta}</p>}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- Pets e animais comunitários ---------- */

export function Pets() {
  const { db, user } = useStore()
  const [tab, setTab] = useState('comunitarios')
  const mine = db.pets.filter((p) => p.unitId === user.unitId)
  return (
    <>
      <PageHeader overline="Comunidade" title="Pets e animais" lead="Os animais comunitários do Aquarius são cuidados pela Comissão Pets, com vacinação, castração e lar temporário." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'comunitarios', label: 'Animais comunitários', count: db.communityAnimals.length },
          { id: 'meus', label: 'Meus pets', count: mine.length },
        ]}
      />
      {tab === 'comunitarios' ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {db.communityAnimals.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: EASE.out }}>
                <Card className="h-full">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-100 text-gold-ink">
                      <Dog size={22} />
                    </span>
                    <div>
                      <p className="display text-[1.2rem] text-ink-900">{a.nome}</p>
                      <p className="text-[0.8rem] text-ink-500">{a.especie}</p>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-[0.82rem] text-ink-600">
                    <MapPin size={13} /> {a.local}
                  </p>
                  <p className="mt-1 text-[0.82rem] text-ink-600">{a.situacao}</p>
                  <p className="mt-1 text-[0.75rem] text-ink-500">Cuidado por {a.cuidador}</p>
                  {a.situacao.includes('lar') && <Badge tone="red" className="mt-3">Precisa de ajuda</Badge>}
                </Card>
              </motion.div>
            ))}
          </div>
          <Notice icon={Heart} className="mt-5">
            Quer ajudar com ração, lar temporário ou transporte ao veterinário? Fale com a Comissão Pets em Contatos úteis.
          </Notice>
        </>
      ) : mine.length === 0 ? (
        <Empty icon={Dog} title="Nenhum pet cadastrado" action={<Button to="morador/unidade" variant="gold">Cadastrar em Minha unidade</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mine.map((p) => (
            <Card key={p.id} className="flex items-center gap-3">
              <Dog size={22} className="text-gold-ink" />
              <div>
                <p className="font-semibold text-ink-900">{p.nome}</p>
                <p className="text-[0.8rem] text-ink-500">
                  {p.especie} · {p.raca}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- Contatos úteis ---------- */

export function Contatos() {
  const { db } = useStore()
  const regular = db.contacts.filter((c) => !c.emergencia)
  const emerg = db.contacts.filter((c) => c.emergencia)
  return (
    <>
      <PageHeader overline="Ajuda" title="Contatos úteis" />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionTitle>Condomínio</SectionTitle>
          <List>
            {regular.map((c) => (
              <div key={c.id} className="flex items-center gap-3.5 px-4 py-3.5">
                <Avatar name={c.nome} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{c.nome}</p>
                  <p className="text-[0.8rem] text-ink-500">
                    {c.setor} · {c.horario}
                  </p>
                </div>
                {c.whatsapp && (
                  <a href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${c.nome}`} className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100">
                    <MessageCircle size={18} />
                  </a>
                )}
                <a href={`tel:${c.telefone.replace(/\D/g, '')}`} aria-label={`Ligar para ${c.nome}`} className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100">
                  <Phone size={18} />
                </a>
              </div>
            ))}
          </List>
        </div>
        <div>
          <SectionTitle>Emergência e serviços</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {emerg.map((c) => (
              <a key={c.id} href={`tel:${c.telefone.replace(/\D/g, '')}`} className={cx('rounded-2xl p-4 ring-1 ring-inset', c.setor === 'Emergência' ? 'bg-red-50 ring-red-200' : 'bg-white ring-paper-300')}>
                <p className={cx('display text-[1.6rem] whitespace-nowrap', c.setor === 'Emergência' ? 'text-red-700' : 'text-ink-900')}>{c.telefone}</p>
                <p className="text-[0.82rem] font-semibold text-ink-700">{c.nome}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

