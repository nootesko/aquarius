import { useState } from 'react'
import { Barcode, Camera, Car, Dog, Pencil, Plus, Trash2, UserMinus, UserRoundCheck } from 'lucide-react'
import { personById, unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, uid } from '../lib/format.js'
import { brl, proximoBoleto, valorAtual } from './Boletos.jsx'
import { Avatar, Button, Field, Input, List, Modal, Notice, Select, StatusBadge, Tabs, Textarea, cx } from '../ui/kit.jsx'

const VINCULOS = ['Morador', 'Dependente', 'Cônjuge', 'Funcionária', 'Funcionário', 'Cuidador(a)']
const TIPOS = [
  { value: 'permanente', label: 'Morador permanente' },
  { value: 'prestador', label: 'Prestador fixo (diarista, jardineiro…)' },
]

const pickPhoto = (cb) => {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' })
  input.onchange = () => {
    const f = input.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => cb(r.result)
    r.readAsDataURL(f)
  }
  input.click()
}

export function MinhaUnidade() {
  const { db, user, mutate, toast } = useStore()
  const [tab, setTab] = useState('pessoas')
  const [edit, setEdit] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [pet, setPet] = useState(null)
  const unit = unitById(db, user.unitId)
  const owners = db.ownership.filter((o) => o.unitId === unit.id).map((o) => ({ ...o, p: personById(db, o.personId) }))
  const people = db.persons.filter((p) => p.unitId === unit.id)
  const vehicles = db.vehicles.filter((v) => v.unitId === unit.id)
  const pets = db.pets.filter((p) => p.unitId === unit.id)
  const isOwner = owners.some((o) => o.personId === user.id)

  const savePerson = (form) => {
    mutate(
      (d) => {
        if (form.id) Object.assign(d.persons.find((p) => p.id === form.id), form)
        else d.persons.push({ ...form, id: uid('p'), unitId: unit.id, status: 'pendente' })
      },
      { acao: form.id ? 'Editou cadastro' : 'Cadastrou pessoa', alvo: form.nome },
    )
    toast(form.id ? 'Cadastro atualizado' : 'Cadastro enviado para aprovação')
    setEdit(null)
  }

  const toggleActive = (p) => {
    mutate((d) => (d.persons.find((x) => x.id === p.id).status = p.status === 'inativo' ? 'ativo' : 'inativo'), {
      acao: p.status === 'inativo' ? 'Reativou cadastro' : 'Desativou cadastro',
      alvo: p.nome,
    })
    toast(p.status === 'inativo' ? 'Cadastro reativado' : 'Cadastro desativado')
  }

  const boleto = proximoBoleto(db, unit.id)
  const ativos = people.filter((p) => p.status !== 'inativo')
  const iconBtn = 'grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-200 hover:text-brand-700'

  return (
    <>
      {/* Faixa da casa: dados principais + próximo boleto */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-950 p-5 text-white sm:p-7">
        <div className="paver-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <p className="text-[0.64rem] font-bold tracking-[0.22em] text-gold-300 uppercase">Minha casa</p>
            <h1 className="display mt-2 text-[clamp(1.7rem,4vw,2.4rem)]">{unitLabel(unit)}</h1>
            <p className="mt-1 text-[0.88rem] text-white/75">
              Quadra {unit.quadra} · Lote {unit.lote} · {unit.area} m²
            </p>
            <p className="mt-3 text-[0.82rem] text-white/85">
              {owners.map((o) => `${o.papel}: ${o.p.nome}`).join(' · ')}
            </p>
            <dl className="mt-4 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/15">
              {[
                ['Situação', unit.status[0].toUpperCase() + unit.status.slice(1)],
                ['Pessoas', ativos.length],
                ['Veículos', vehicles.length],
              ].map(([k, v]) => (
                <div key={k} className="bg-sky-900/60 px-3 py-2.5">
                  <dt className="text-[0.58rem] font-bold tracking-[0.16em] text-gold-300 uppercase">{k}</dt>
                  <dd className="mt-0.5 text-[0.95rem] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-white p-4 text-ink-900 shadow-[0_20px_40px_-24px_rgba(5,13,30,0.8)]">
            {boleto ? (
              <>
                <p className="text-[0.64rem] font-bold tracking-[0.18em] text-brand-700 uppercase">Próximo boleto · {boleto.competencia}</p>
                <p className="display mt-1.5 text-[1.7rem]">{brl(valorAtual(boleto))}</p>
                <p className="text-[0.8rem] text-ink-500">
                  {boleto.status === 'vencido' ? 'Venceu' : 'Vence'} em {fmtDate(boleto.vencimento)}
                </p>
                <Button variant="gold" className="mt-3 w-full" icon={Barcode} to="morador/boletos">
                  Gerar boleto
                </Button>
              </>
            ) : (
              <>
                <p className="text-[0.64rem] font-bold tracking-[0.18em] text-brand-700 uppercase">Boletos</p>
                <p className="mt-1.5 font-semibold">Tudo em dia</p>
                <Button variant="outline" className="mt-3 w-full" to="morador/boletos">
                  Ver boletos pagos
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'pessoas', label: 'Pessoas', count: people.length },
          { id: 'veiculos', label: 'Veículos', count: vehicles.length },
          { id: 'pets', label: 'Pets', count: pets.length },
        ]}
      />

      {tab === 'pessoas' && (
        <>
          {unit.status === 'alugada' && isOwner && <Notice className="mb-3">Casa alugada: o inquilino gerencia os moradores.</Notice>}
          <List>
            {people.map((p) => (
              <div key={p.id} className={cx('flex items-center gap-3 px-4 py-3', p.status === 'inativo' && 'opacity-55')}>
                <Avatar name={p.nome} size={42} photo={p.foto} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.92rem] font-semibold text-ink-900">{p.nome}</p>
                  <p className="text-[0.78rem] text-ink-500">
                    {p.vinculo}
                    {p.tipo === 'prestador' && ' · prestador fixo'}
                  </p>
                  {p.obs && <p className="text-[0.78rem] text-ink-500">{p.obs}</p>}
                </div>
                {p.status !== 'ativo' && <StatusBadge status={p.status} label={p.status === 'pendente' ? 'Em aprovação' : undefined} />}
                <button type="button" aria-label={`Editar ${p.nome}`} title="Editar" className={iconBtn} onClick={() => setEdit({ ...p })}>
                  <Pencil size={16} />
                </button>
                {p.id !== user.id && (
                  <button type="button" aria-label={p.status === 'inativo' ? `Reativar ${p.nome}` : `Desativar ${p.nome}`} title={p.status === 'inativo' ? 'Reativar' : 'Desativar'} className={iconBtn} onClick={() => toggleActive(p)}>
                    {p.status === 'inativo' ? <UserRoundCheck size={16} /> : <UserMinus size={16} />}
                  </button>
                )}
              </div>
            ))}
          </List>
          <Button variant="gold" icon={Plus} className="mt-4 w-full sm:w-auto" onClick={() => setEdit({ nome: '', vinculo: 'Morador', tipo: 'permanente', telefone: '', email: '', obs: '' })}>
            Cadastrar pessoa
          </Button>
          <p className="mt-3 text-[0.78rem] text-ink-500">
            Visitas e prestadores eventuais são liberados em <a href="#/morador/autorizacoes" className="font-semibold text-brand-700 underline">Visitantes e acessos</a>.
          </p>
        </>
      )}

      {tab === 'veiculos' && (
        <>
          <List>
            {vehicles.length === 0 && <p className="p-4 text-[0.86rem] text-ink-500">Nenhum veículo cadastrado.</p>}
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
                  <Car size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.95rem] font-bold tracking-wider text-ink-900">{v.placa}</p>
                  <p className="text-[0.78rem] text-ink-500">
                    {v.modelo} · {v.cor}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${v.placa}`}
                  title="Remover"
                  className={iconBtn}
                  onClick={() => {
                    mutate((d) => (d.vehicles = d.vehicles.filter((x) => x.id !== v.id)), { acao: 'Removeu veículo', alvo: v.placa })
                    toast('Veículo removido')
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </List>
          <Button variant="gold" icon={Plus} className="mt-4 w-full sm:w-auto" onClick={() => setVehicle({ placa: '', modelo: '', cor: '' })}>
            Cadastrar veículo
          </Button>
          <p className="mt-3 text-[0.78rem] text-ink-500">As placas cadastradas são liberadas automaticamente na portaria.</p>
        </>
      )}

      {tab === 'pets' && (
        <>
          <List>
            {pets.length === 0 && <p className="p-4 text-[0.86rem] text-ink-500">Nenhum pet cadastrado.</p>}
            {pets.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                  <Dog size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.92rem] font-semibold text-ink-900">{p.nome}</p>
                  <p className="text-[0.78rem] text-ink-500">
                    {p.especie} · {p.raca}
                    {p.obs && ` · ${p.obs}`}
                  </p>
                </div>
              </div>
            ))}
          </List>
          <Button variant="gold" icon={Plus} className="mt-4 w-full sm:w-auto" onClick={() => setPet({ nome: '', especie: 'Cachorro', raca: '', obs: '' })}>
            Cadastrar pet
          </Button>
        </>
      )}

      <PersonModal key={edit ? edit.id ?? 'novo' : 'fechado'} value={edit} onClose={() => setEdit(null)} onSave={savePerson} />

      <Modal
        open={!!vehicle}
        onClose={() => setVehicle(null)}
        title="Cadastrar veículo"
        footer={
          <Button
            variant="gold"
            onClick={() => {
              if (!vehicle.placa) return
              mutate((d) => d.vehicles.push({ ...vehicle, placa: vehicle.placa.toUpperCase(), id: uid('v'), unitId: unit.id }), { acao: 'Cadastrou veículo', alvo: vehicle.placa })
              toast('Veículo cadastrado')
              setVehicle(null)
            }}
          >
            Salvar
          </Button>
        }
      >
        {vehicle && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Placa">
              <Input value={vehicle.placa} onChange={(e) => setVehicle({ ...vehicle, placa: e.target.value })} placeholder="ABC-1D23" />
            </Field>
            <Field label="Modelo">
              <Input value={vehicle.modelo} onChange={(e) => setVehicle({ ...vehicle, modelo: e.target.value })} />
            </Field>
            <Field label="Cor">
              <Input value={vehicle.cor} onChange={(e) => setVehicle({ ...vehicle, cor: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={!!pet}
        onClose={() => setPet(null)}
        title="Cadastrar pet"
        footer={
          <Button
            variant="gold"
            onClick={() => {
              if (!pet.nome) return
              mutate((d) => d.pets.push({ ...pet, id: uid('pet'), unitId: unit.id }), { acao: 'Cadastrou pet', alvo: pet.nome })
              toast('Pet cadastrado')
              setPet(null)
            }}
          >
            Salvar
          </Button>
        }
      >
        {pet && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <Input value={pet.nome} onChange={(e) => setPet({ ...pet, nome: e.target.value })} />
            </Field>
            <Field label="Espécie">
              <Select value={pet.especie} onChange={(e) => setPet({ ...pet, especie: e.target.value })} options={['Cachorro', 'Gato', 'Ave', 'Outro']} />
            </Field>
            <Field label="Raça">
              <Input value={pet.raca} onChange={(e) => setPet({ ...pet, raca: e.target.value })} />
            </Field>
            <Field label="Observações" optional>
              <Input value={pet.obs} onChange={(e) => setPet({ ...pet, obs: e.target.value })} placeholder="Vacinas, castração…" />
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}

function PersonModal({ value, onClose, onSave }) {
  const [f, setForm] = useState(value)
  const set = (k) => (e) => setForm({ ...f, [k]: e.target.value })

  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value?.id ? 'Editar cadastro' : 'Cadastrar pessoa'}
      footer={
        <Button
          variant="gold"
          onClick={() => {
            if (!f.nome) return
            onSave(f)
          }}
        >
          {value?.id ? 'Salvar' : 'Enviar para aprovação'}
        </Button>
      }
    >
      {f && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Avatar name={f.nome || '?'} size={64} photo={f.foto} />
            <Button size="sm" variant="outline" icon={Camera} onClick={() => pickPhoto((foto) => setForm({ ...f, foto }))}>
              {f.foto ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
          </div>
          <Field label="Nome completo" className="sm:col-span-2">
            <Input value={f.nome} onChange={set('nome')} required />
          </Field>
          <Field label="Vínculo com a unidade">
            <Select value={f.vinculo} onChange={set('vinculo')} options={f.vinculo && !VINCULOS.includes(f.vinculo) ? [f.vinculo, ...VINCULOS] : VINCULOS} />
          </Field>
          <Field label="Categoria">
            <Select value={f.tipo} onChange={set('tipo')} options={TIPOS} />
          </Field>
          <Field label="Telefone">
            <Input value={f.telefone} onChange={set('telefone')} />
          </Field>
          <Field label="E-mail" optional>
            <Input value={f.email} onChange={set('email')} />
          </Field>
          <Field label="Observações" optional className="sm:col-span-2">
            <Textarea rows={2} value={f.obs ?? ''} onChange={set('obs')} placeholder="Ex.: diarista às segundas e quintas" />
          </Field>
          {!value?.id && <Notice className="sm:col-span-2">A foto ajuda a portaria a identificar a pessoa. Novos cadastros passam pela aprovação da administração.</Notice>}
        </div>
      )}
    </Modal>
  )
}
