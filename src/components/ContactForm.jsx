import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, EyeOff, Loader2, Send, ShieldAlert, UserRound } from 'lucide-react'
import { config, whatsappLink } from '../content.js'
import { Field, inputClass } from './Field.jsx'
import { EASE, SPRING } from '../lib/motion.js'

const MAX = 1200
const MODES = [
  { id: 'anonimo', label: 'Mensagem anônima', Icon: EyeOff },
  { id: 'identificado', label: 'Quero me identificar', Icon: UserRound },
]

const emptyForm = { nome: '', rua: '', telefone: '', mensagem: '' }

export function ContactForm() {
  const reduce = useReducedMotion()
  const [mode, setMode] = useState('anonimo')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [failure, setFailure] = useState('')
  const shakeRef = useRef(null)

  const anon = mode === 'anonimo'
  const remaining = MAX - form.mensagem.length

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((v) => ({ ...v, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!anon) {
      if (form.nome.trim().length < 2) e.nome = 'Diga como podemos te chamar.'
      if (form.rua.trim().length < 3) e.rua = 'Informe sua rua.'
      if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe o telefone com DDD.'
    }
    if (form.mensagem.trim().length < 10) e.mensagem = 'Escreva um pouco mais para entendermos o caso.'
    if (form.mensagem.length > MAX) e.mensagem = 'Mensagem muito longa.'
    return e
  }

  const payload = useMemo(
    () => () => ({
      tipo: anon ? 'mensagem-anonima' : 'mensagem-identificada',
      mensagem: form.mensagem,
      ...(anon ? {} : { nome: form.nome, rua: form.rua, telefone: form.telefone }),
    }),
    [anon, form],
  )

  const shake = () => {
    const el = shakeRef.current
    if (!el || reduce) return
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
      { duration: 320, easing: 'ease-in-out' },
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length) {
      shake()
      return
    }

    setStatus('sending')
    setFailure('')
    const body = payload()

    /* 1) Endpoint próprio configurado: envia de verdade e mantém o anonimato. */
    if (config.formEndpoint) {
      try {
        const res = await fetch(config.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(String(res.status))
        setStatus('success')
        setForm(emptyForm)
        return
      } catch {
        setStatus('error')
        setFailure('Não conseguimos enviar agora. Tente novamente em instantes ou fale com a gente pelo WhatsApp.')
        shake()
        return
      }
    }

    /* 2) Sem endpoint: mensagem identificada segue pelo WhatsApp. */
    if (!anon) {
      const text = [
        '*Mensagem pelo site*',
        `Nome: ${form.nome}`,
        `Rua: ${form.rua}`,
        `Telefone: ${form.telefone}`,
        '',
        form.mensagem,
      ].join('\n')
      window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
      setStatus('success')
      setForm(emptyForm)
      return
    }

    /* 3) Sem endpoint + anônimo: o WhatsApp mostraria o número de quem envia,
          então não fingimos que o envio é anônimo. */
    setStatus('error')
    setFailure(
      'O canal de mensagem anônima ainda está sendo ativado. Se puder aguardar, tente de novo em breve — ou fale com a gente pelo WhatsApp sabendo que, por ali, seu número fica visível.',
    )
    shake()
  }

  if (status === 'success') {
    return <SuccessPanel anon={anon} onReset={() => setStatus('idle')} />
  }

  return (
    <motion.form
      ref={shakeRef}
      onSubmit={onSubmit}
      noValidate
      layout={!reduce}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm sm:p-9"
    >
      <h3 className="display text-[1.4rem] text-white sm:text-[1.7rem]">Envie sua mensagem</h3>

      {/* ------- seletor de modo ------- */}
      <div
        role="radiogroup"
        aria-label="Como você quer enviar"
        className="mt-7 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-navy-950/50 p-1"
      >
        {MODES.map((m) => {
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => {
                setMode(m.id)
                setErrors({})
                setStatus('idle')
              }}
              className={`relative isolate flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[0.83rem] font-semibold transition-colors duration-200 ${
                isActive ? 'text-navy-900' : 'text-white/55 hover:text-white/85'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-gold-400"
                  transition={SPRING.snappy}
                />
              )}
              <m.Icon size={16} strokeWidth={2.4} aria-hidden="true" />
              <span className="text-center leading-tight">{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* ------- aviso de anonimato ------- */}
      <AnimatePresence initial={false}>
        {anon && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: EASE.out }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl border border-brand-400/25 bg-brand-600/12 p-4">
              <EyeOff size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-300" />
              <p className="text-[0.86rem] leading-relaxed text-white/72">
                Só o texto chega até a chapa — nenhum nome, telefone ou dado seu. Se quiser resposta, escolha
                “Quero me identificar”.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------- campos ------- */}
      <div className="mt-6 space-y-5">
        <AnimatePresence initial={false} mode="popLayout">
          {!anon && (
            <motion.div
              key="identificacao"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE.out }}
              className="overflow-hidden"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="msg-nome" label="Nome" error={errors.nome}>
                  <input
                    id="msg-nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    value={form.nome}
                    onChange={set('nome')}
                    placeholder="Como podemos te chamar"
                    className={inputClass}
                    aria-invalid={!!errors.nome}
                  />
                </Field>

                <Field id="msg-telefone" label="Telefone" error={errors.telefone}>
                  <input
                    id="msg-telefone"
                    name="telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.telefone}
                    onChange={set('telefone')}
                    placeholder="(15) 90000-0000"
                    className={inputClass}
                    aria-invalid={!!errors.telefone}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field id="msg-rua" label="Rua" error={errors.rua}>
                    <input
                      id="msg-rua"
                      name="rua"
                      type="text"
                      autoComplete="address-line1"
                      value={form.rua}
                      onChange={set('rua')}
                      placeholder="Ex.: Rua Noel Infante"
                      className={inputClass}
                      aria-invalid={!!errors.rua}
                    />
                  </Field>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Field id="msg-mensagem" label="Mensagem" error={errors.mensagem}>
          <textarea
            id="msg-mensagem"
            name="mensagem"
            rows={5}
            maxLength={MAX}
            value={form.mensagem}
            onChange={set('mensagem')}
            placeholder={
              anon
                ? 'Escreva o que você quer contar para a chapa.'
                : 'Conte o que você gostaria que a chapa resolvesse.'
            }
            className={`${inputClass} resize-y`}
            aria-invalid={!!errors.mensagem}
          />
          <div className="mt-2 flex justify-end">
            <motion.span
              animate={{ color: remaining < 120 ? '#ffcc00' : 'rgba(252,252,252,0.35)' }}
              className="text-[0.72rem] tabular-nums"
            >
              {form.mensagem.length}/{MAX}
            </motion.span>
          </div>
        </Field>
      </div>

      {/* ------- erro de envio ------- */}
      <AnimatePresence>
        {status === 'error' && failure && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: EASE.out }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 rounded-2xl border border-gold-400/30 bg-gold-400/10 p-4" role="alert">
              <ShieldAlert size={18} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0 text-gold-400" />
              <p className="text-[0.86rem] leading-relaxed text-white/80">{failure}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------- envio ------- */}
      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.button
          type="submit"
          disabled={status === 'sending'}
          whileHover={reduce || status === 'sending' ? undefined : { scale: 1.03 }}
          whileTap={reduce || status === 'sending' ? undefined : { scale: 0.97 }}
          transition={SPRING.pop}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-gold-400 px-8 py-4 whitespace-nowrap text-[0.85rem] font-bold tracking-[0.12em] text-navy-900 uppercase shadow-[0_14px_36px_-14px_rgba(255,204,0,0.8)] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sending' ? (
              <motion.span
                key="sending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <Loader2 size={17} strokeWidth={2.8} aria-hidden="true" className="animate-spin" />
                Enviando
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <Send size={17} strokeWidth={2.6} aria-hidden="true" />
                {anon ? 'Enviar anonimamente' : 'Enviar mensagem'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <p className="text-[0.75rem] leading-snug text-white/35 sm:max-w-[16rem] sm:text-right">
          {anon
            ? 'Não pedimos e não guardamos nenhum dado que te identifique.'
            : 'Seus dados são usados apenas para responder você.'}
        </p>
      </div>
    </motion.form>
  )
}

function SuccessPanel({ anon, onReset }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE.out }}
      className="relative overflow-hidden rounded-3xl border border-gold-400/30 bg-gradient-to-b from-brand-700/30 to-navy-900/60 p-9 text-center sm:p-12"
      role="status"
    >
      <motion.span
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-400 text-navy-900"
        initial={reduce ? false : { scale: 0.4, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.08 }}
      >
        <Check size={40} strokeWidth={3} aria-hidden="true" />
      </motion.span>

      <h3 className="display mt-7 text-[1.6rem] text-white sm:text-[2rem]">Mensagem enviada</h3>

      <p className="mx-auto mt-4 max-w-md text-[0.98rem] leading-relaxed text-white/70">
        {anon
          ? 'Sua mensagem chegou até a chapa sem nenhuma identificação. Obrigado por participar.'
          : 'Recebemos sua mensagem e vamos responder no telefone que você informou. Obrigado por participar.'}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/20 px-6 py-3 text-[0.8rem] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-white/10"
        >
          Enviar outra
        </button>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white/10 px-6 py-3 text-[0.8rem] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-white/18"
        >
          Falar no WhatsApp
        </a>
      </div>
    </motion.div>
  )
}
