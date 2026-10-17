import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, KeyRound, MailCheck, UserRound } from 'lucide-react'
import { ACCOUNTS } from '../lib/seed.js'
import { useStore } from '../lib/store.jsx'
import { go } from '../lib/router.js'
import { EASE } from '../lib/motion.js'
import { Logo } from '../ui/Shell.jsx'
import { Button, Field, inputCls, Notice, cx } from '../ui/kit.jsx'

const MORADOR = ACCOUNTS.find((a) => a.role === 'morador')

/* Tela de acesso: entrar, recuperar senha e primeiro acesso (convite).
   Contas fixas da demonstração aparecem como atalhos. */
export function Login() {
  const { login } = useStore()
  const [mode, setMode] = useState('entrar')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const acc = login(user, pass)
    if (!acc) return setError('Usuário ou senha incorretos. Confira e tente de novo.')
    go(acc.role)
  }

  const quick = (acc) => {
    login(acc.login, acc.senha)
    go(acc.role)
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-gradient-to-b from-sky-700 via-sky-800 to-sky-975 lg:grid-cols-[1.1fr_1fr]">
      <div className="paver-grid-light pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Lado institucional */}
      <section className="relative hidden flex-col justify-between p-12 text-white lg:flex">
        <Logo size="lg" />
        <div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-[0.7rem] font-bold tracking-[0.24em] text-gold-300 uppercase">
            Aplicativo do Residencial Aquarius
          </motion.p>
          <h1 className="display text-[clamp(2.6rem,4.6vw,4.4rem)]">
            {['Tudo do', 'Aquarius', 'num lugar só.'].map((w, i) => (
              <motion.span
                key={w}
                className={cx('block', i === 1 && 'text-gold-400')}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.7, ease: EASE.out }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-[1.02rem] text-white/85">
            Reservas, comunicados, votações, visitantes, prestação de contas e solicitações, com transparência de ponta a ponta.
          </p>
        </div>
        <p className="text-[0.75rem] text-white/60">Versão de demonstração · dados fictícios</p>
      </section>

      {/* Cartão de acesso */}
      <section className="relative flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE.out }}
          className="w-full max-w-[420px] rounded-3xl bg-white p-7 shadow-[0_40px_90px_-40px_rgba(5,13,30,0.85)] sm:p-8"
        >
          <div className="-mt-2 mb-5 flex justify-center lg:hidden">
            <Logo />
          </div>

          <AnimatePresence mode="wait">
            {mode === 'entrar' && (
              <motion.div key="entrar" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="display text-[1.8rem] text-ink-900">Bem-vindo</h2>
                <p className="mt-1.5 text-[0.88rem] text-ink-500">Veja como fica o aplicativo do Residencial Aquarius, com dados de exemplo.</p>

                <Button variant="gold" size="lg" className="mt-6 w-full" icon={UserRound} onClick={() => quick(MORADOR)}>
                  Entrar como morador
                </Button>

                <div className="mt-6 flex justify-between border-t border-paper-200 pt-4 text-[0.8rem] font-semibold">
                  <button type="button" onClick={() => setMode('convite')} className="text-brand-700 hover:underline">
                    Primeiro acesso
                  </button>
                  <button type="button" onClick={() => setMode('equipe')} className="text-ink-500 hover:text-brand-700 hover:underline">
                    Acesso da equipe
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'equipe' && (
              <motion.div key="equipe" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <Back onBack={() => setMode('entrar')} />
                <h2 className="display text-[1.8rem] text-ink-900">Acesso da equipe</h2>
                <p className="mt-1.5 text-[0.88rem] text-ink-500">Administração e portaria entram com usuário e senha.</p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Field label="Usuário">
                    <input className={inputCls} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" required autoFocus />
                  </Field>
                  <Field label="Senha">
                    <input className={inputCls} type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" required />
                  </Field>
                  {error && (
                    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[0.84rem] text-red-800">
                      {error}
                    </p>
                  )}
                  <Button type="submit" variant="primary" size="lg" className="w-full" icon={ArrowRight}>
                    Entrar
                  </Button>
                </form>
                <button type="button" onClick={() => setMode('recuperar')} className="mt-4 text-[0.8rem] font-semibold text-brand-700 hover:underline">
                  Esqueci a senha
                </button>
              </motion.div>
            )}

            {mode === 'recuperar' && <Recover key="recuperar" onBack={() => setMode('entrar')} />}
            {mode === 'convite' && <Invite key="convite" onBack={() => setMode('entrar')} />}
          </AnimatePresence>
        </motion.div>
      </section>
    </main>
  )
}

function Back({ onBack }) {
  return (
    <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-brand-700 hover:underline">
      <ArrowLeft size={15} /> Voltar
    </button>
  )
}

function Recover({ onBack }) {
  const [sent, setSent] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
      <Back onBack={onBack} />
      <h2 className="display text-[1.8rem] text-ink-900">Recuperar senha</h2>
      {sent ? (
        <Notice tone="green" icon={MailCheck} className="mt-5">
          Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha em alguns minutos.
        </Notice>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <p className="text-[0.88rem] text-ink-500">Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.</p>
          <Field label="E-mail">
            <input className={inputCls} type="email" required placeholder="voce@email.com" />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Enviar link
          </Button>
        </form>
      )}
    </motion.div>
  )
}

function Invite({ onBack }) {
  const [step, setStep] = useState(0)
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
      <Back onBack={onBack} />
      <h2 className="display text-[1.8rem] text-ink-900">Primeiro acesso</h2>
      {step === 0 && (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setStep(1)
          }}
        >
          <p className="text-[0.88rem] text-ink-500">Digite o código do convite enviado pela administração por e-mail ou WhatsApp.</p>
          <Field label="Código do convite" hint="Na demonstração, qualquer código funciona.">
            <input className={cx(inputCls, 'font-mono tracking-[0.3em] uppercase')} required maxLength={8} placeholder="AQ7K2M" />
          </Field>
          <Button type="submit" size="lg" className="w-full" icon={KeyRound}>
            Validar convite
          </Button>
        </form>
      )}
      {step === 1 && (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setStep(2)
          }}
        >
          <Notice tone="blue">
            Convite para <b>Rua Valentina Sales, 12</b> como <b>Morador</b>.
          </Notice>
          <Field label="Nome completo">
            <input className={inputCls} required />
          </Field>
          <Field label="Crie uma senha">
            <input className={inputCls} type="password" required minLength={4} />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Vincular-me à unidade
          </Button>
        </form>
      )}
      {step === 2 && (
        <div className="mt-5 space-y-4">
          <Notice tone="green">Cadastro enviado! A administração vai aprovar seu vínculo e você será avisado por e-mail.</Notice>
          <Button variant="outline" className="w-full" onClick={onBack}>
            Voltar para o login
          </Button>
        </div>
      )}
    </motion.div>
  )
}
