import { useState } from 'react'
import { Camera, KeyRound, Save } from 'lucide-react'
import { useStore, unitById, unitLabel } from '../lib/store.jsx'
import { Avatar, Button, Card, Field, Input, PageHeader, SectionTitle, Toggle } from '../ui/kit.jsx'

/* Meu perfil — comum aos três painéis */
export function Profile() {
  const { db, user, mutate, toast } = useStore()
  const [form, setForm] = useState({ nome: user.nome, telefone: user.telefone, email: user.email })
  const [prefs, setPrefs] = useState({ reservas: true, visitantes: true, votacoes: true, comunicados: true, email: false })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    mutate((d) => Object.assign(d.persons.find((p) => p.id === user.id), form), { acao: 'Atualizou o perfil', alvo: form.nome })
    toast('Perfil atualizado')
  }

  const photo = () => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' })
    input.onchange = () => {
      const f = input.files?.[0]
      if (!f) return
      const r = new FileReader()
      r.onload = () => {
        mutate((d) => (d.persons.find((p) => p.id === user.id).foto = r.result))
        toast('Foto atualizada')
      }
      r.readAsDataURL(f)
    }
    input.click()
  }

  return (
    <>
      <PageHeader overline="Conta" title="Meu perfil" />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              <Avatar name={user.nome} size={76} photo={user.foto} />
              <button type="button" onClick={photo} aria-label="Trocar foto" className="absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full bg-gold-400 text-navy-900 ring-4 ring-white">
                <Camera size={15} />
              </button>
            </div>
            <div>
              <p className="display text-[1.4rem] text-ink-900">{user.nome}</p>
              <p className="text-[0.85rem] text-ink-500">
                {user.vinculo}
                {user.unitIds.length > 0 && ` · ${user.unitIds.map((id) => unitLabel(unitById(db, id))).join(' e ')}`}
              </p>
            </div>
          </div>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <Input value={form.nome} onChange={set('nome')} required />
            </Field>
            <Field label="Telefone">
              <Input value={form.telefone} onChange={set('telefone')} />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={form.email} onChange={set('email')} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" icon={Save}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle>Notificações</SectionTitle>
            <ul className="space-y-3">
              {[
                ['reservas', 'Reservas'],
                ['visitantes', 'Visitantes e entradas'],
                ['votacoes', 'Novas votações'],
                ['comunicados', 'Comunicados'],
                ['email', 'Receber também por e-mail'],
              ].map(([k, l]) => (
                <li key={k} className="flex items-center justify-between gap-3 text-[0.88rem] text-ink-700">
                  {l}
                  <Toggle checked={prefs[k]} label={l} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle>Senha</SectionTitle>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                e.target.reset()
                toast('Senha alterada (demonstração)')
              }}
            >
              <Field label="Senha atual">
                <Input type="password" required />
              </Field>
              <Field label="Nova senha">
                <Input type="password" required minLength={4} />
              </Field>
              <Button type="submit" variant="outline" icon={KeyRound}>
                Alterar senha
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
