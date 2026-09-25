import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Check, Download, ImageUp, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import { simulator } from '../content.js'
import { RoadCompare } from '../sections/Solution.jsx'
import { Commitment } from '../sections/Commitment.jsx'
import { EASE } from '../lib/motion.js'

const MAX_SIDE = 1536
const TIMEOUT_MS = 150_000
const SAVED_KEY = 'ruas-novas:resultado'

/* Frases que se revezam enquanto a IA trabalha (costuma levar de 20 s a 1 min). */
const STEPS = ['Analisando a foto da rua…', 'Tirando a terra e os buracos…', 'Assentando o bloquete sextavado…', 'Aparando a grama das laterais…', 'Dando os últimos retoques…']

/* Reduz a foto no navegador antes de enviar: corrige a rotação do celular,
   limita o lado maior e manda em JPEG. Deixa o envio rápido e barato. */
async function prepare(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale)
  const h = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.88), ratio: w / h }
}

/* Carimba o logo da chapa no canto inferior direito da simulação.
   É feito aqui para que a imagem baixada já saia com o logo. */
function loadImage(src) {
  return new Promise((ok, fail) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = fail
    img.src = src
  })
}

async function withLogo(src) {
  const [photo, logo] = await Promise.all([loadImage(src), loadImage('/assets/logo-800.png')])
  const canvas = document.createElement('canvas')
  canvas.width = photo.naturalWidth
  canvas.height = photo.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(photo, 0, 0)

  const w = Math.round(Math.min(canvas.width, canvas.height) * 0.26)
  const h = Math.round((w * logo.naturalHeight) / logo.naturalWidth)
  const pad = Math.round(Math.min(canvas.width, canvas.height) * 0.035)
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = Math.round(w * 0.08)
  ctx.shadowOffsetY = Math.round(w * 0.02)
  ctx.drawImage(logo, canvas.width - w - pad, canvas.height - h - pad, w, h)
  return canvas.toDataURL('image/jpeg', 0.9)
}

/* A simulação fica guardada no aparelho: como só dá para gerar uma vez,
   a pessoa pode voltar depois para ver e baixar de novo. */
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? 'null')
  } catch {
    return null
  }
}

function save(data) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(data))
  } catch {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify({ ...data, before: null }))
    } catch {
      /* sem espaço ou bloqueado: segue sem guardar */
    }
  }
}

function Header() {
  return (
    <header className="shell relative z-10 flex items-center justify-between pt-5 sm:pt-7">
      <a href="/" className="flex items-center gap-3" aria-label="Chapa Aquarius Sem Buracos — página inicial">
        <picture>
          <source srcSet="/assets/logo-480.webp" type="image/webp" />
          <img src="/assets/logo-800.png" alt="" width="480" height="370" className="h-20 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)] sm:h-28" />
        </picture>
      </a>
      <a
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[0.8rem] font-semibold text-white/85 transition-colors hover:border-gold-400/60 hover:text-white"
      >
        <ArrowLeft size={15} strokeWidth={2.6} aria-hidden="true" />
        Voltar ao site
      </a>
    </header>
  )
}

function Dropzone({ onFile }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)

  const onDrop = (e) => {
    e.preventDefault()
    setOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`group flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500 sm:py-20 ${
          over ? 'border-brand-500 bg-brand-500/8' : 'border-paper-300 bg-paper-100 hover:border-brand-400 hover:bg-paper-50'
        }`}
      >
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gold-400 text-navy-900 shadow-[0_12px_30px_-12px_rgba(229,180,0,0.8)] transition-transform group-hover:-translate-y-1">
          <ImageUp size={28} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>
          <span className="display block text-[1.35rem] text-ink-900 sm:text-[1.6rem]">Enviar foto da rua</span>
          <span className="mt-1.5 block text-[0.92rem] text-ink-600">
            <span className="sm:hidden">Tire uma foto agora ou escolha da galeria</span>
            <span className="hidden sm:inline">Clique para escolher ou arraste a foto para cá</span>
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onFile(file)
        }}
      />
      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {simulator.tips.map((t) => (
          <li key={t} className="flex items-center gap-1.5 text-[0.82rem] text-ink-600">
            <Check size={14} strokeWidth={3} className="text-brand-600" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Working({ photo }) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => setStep(Math.min(STEPS.length - 1, Math.floor(secs / 8))), [secs])

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-3xl border border-paper-300"
      style={{ aspectRatio: photo.ratio, maxWidth: photo.ratio < 1 ? '28rem' : undefined }}
    >
      <img src={photo.dataUrl} alt="Sua foto, sendo processada" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px]" />
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center" role="status" aria-live="polite">
        <motion.span
          className="grid h-14 w-14 place-items-center rounded-full bg-gold-400 text-navy-900"
          animate={reduce ? undefined : { rotate: [0, 12, -12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <Sparkles size={24} strokeWidth={2.4} aria-hidden="true" />
        </motion.span>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE.out }}
            className="display text-[1.2rem] text-white sm:text-[1.5rem]"
          >
            {STEPS[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-[0.82rem] text-white/70">Isso leva cerca de 1 minuto. Não feche a página. · {secs}s</p>
      </div>
    </div>
  )
}

const btn =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[0.9rem] font-bold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500'

function Simulator() {
  const saved = useState(loadSaved)[0]
  const [photo, setPhoto] = useState(saved ? { dataUrl: saved.before, ratio: saved.ratio } : null) // { dataUrl, ratio }
  const [result, setResult] = useState(saved?.after ?? null)
  // idle | ready | working | done | error | used | soldOut
  const [status, setStatus] = useState(saved ? 'done' : 'idle')
  const [error, setError] = useState('')

  /* Pergunta ao servidor se este aparelho já usou a vez ou se as vagas acabaram. */
  useEffect(() => {
    if (saved) return
    fetch('/api/ruas-novas')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.used) setStatus('used')
        else if (d?.soldOut) setStatus('soldOut')
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setPhoto(null)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  const onFile = async (file) => {
    setError('')
    setResult(null)
    try {
      setPhoto(await prepare(file))
      setStatus('ready')
    } catch {
      setPhoto(null)
      setStatus('error')
      setError('Não conseguimos abrir essa foto. Tente uma foto em JPG ou PNG.')
    }
  }

  const generate = async () => {
    setStatus('working')
    setError('')
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const r = await fetch('/api/ruas-novas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo.dataUrl, ratio: photo.ratio }),
        signal: ctrl.signal,
      })
      const data = await r.json().catch(() => ({}))
      if (data.code === 'used' || data.code === 'sold-out') {
        setStatus(data.code === 'used' ? 'used' : 'soldOut')
        return
      }
      if (!r.ok || !data.image) throw new Error(data.error || 'Não conseguimos gerar a simulação agora. Tente novamente em instantes.')
      const branded = await withLogo(data.image).catch(() => data.image)
      setResult(branded)
      setStatus('done')
      save({ before: photo.dataUrl, after: branded, ratio: photo.ratio })
    } catch (e) {
      setStatus('error')
      setError(e.name === 'AbortError' ? 'Demorou mais do que o esperado. Tente novamente.' : e.message)
    } finally {
      clearTimeout(timer)
    }
  }

  return (
    <div className="rounded-[2rem] bg-paper-50 p-4 shadow-[0_40px_90px_-40px_rgba(5,13,30,0.7)] sm:p-7">
      {status === 'idle' && <Dropzone onFile={onFile} />}

      {(status === 'used' || status === 'soldOut') && (
        <div className="px-4 py-12 text-center sm:py-16">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold-400 text-navy-900">
            <Check size={30} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <p className="display mt-5 text-[1.4rem] text-ink-900 sm:text-[1.7rem]">
            {status === 'used' ? 'Você já fez a sua simulação.' : 'As simulações acabaram.'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-600">
            {status === 'used'
              ? 'Cada morador pode gerar uma imagem. Obrigado por participar!'
              : 'Todas as simulações disponíveis já foram usadas pelos moradores. Obrigado pelo interesse!'}
          </p>
          <a href="/" className={`${btn} mt-7 bg-navy-900 text-white hover:bg-navy-800`}>
            Conheça as propostas
          </a>
        </div>
      )}

      {status === 'error' && !photo && (
        <>
          <ErrorNote message={error} />
          <Dropzone onFile={onFile} />
        </>
      )}

      {photo && (status === 'ready' || status === 'error') && (
        <div>
          {status === 'error' && <ErrorNote message={error} />}
          <div
            className="mx-auto overflow-hidden rounded-3xl border border-paper-300"
            style={{ aspectRatio: photo.ratio, maxWidth: photo.ratio < 1 ? '28rem' : undefined }}
          >
            <img src={photo.dataUrl} alt="Sua foto" className="h-full w-full object-cover" />
          </div>
          <p className="mt-5 text-center text-[0.85rem] text-ink-600">
            <strong className="font-semibold text-ink-900">Cada morador pode gerar uma simulação.</strong> Confira se é a foto certa.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={reset} className={`${btn} bg-paper-100 text-ink-700 ring-1 ring-paper-300 ring-inset hover:bg-paper-200`}>
              <RotateCcw size={16} strokeWidth={2.6} aria-hidden="true" />
              Trocar foto
            </button>
            <button type="button" onClick={generate} className={`${btn} bg-gold-400 text-navy-900 hover:bg-gold-300`}>
              <Sparkles size={17} strokeWidth={2.6} aria-hidden="true" />
              {status === 'error' ? 'Tentar de novo' : 'Ver com bloquete'}
            </button>
          </div>
        </div>
      )}

      {status === 'working' && <Working photo={photo} />}

      {status === 'done' && (
        <div>
          <div className="mx-auto" style={{ maxWidth: photo.ratio < 1 ? '28rem' : undefined }}>
            {photo.dataUrl ? (
              <RoadCompare street={{ name: 'Sua rua' }} photo={{ before: photo.dataUrl, after: result }} ratio={photo.ratio} />
            ) : (
              <img src={result} alt="Sua rua com bloquete" className="w-full rounded-3xl border border-paper-300" />
            )}
          </div>
          {photo.dataUrl && <p className="mt-4 text-center text-[0.85rem] text-ink-600">Arraste a barra para comparar o antes e o depois.</p>}
          <div className="mt-5 flex justify-center">
            <a href={result} download="minha-rua-com-bloquete.jpg" className={`${btn} bg-gold-400 text-navy-900 hover:bg-gold-300`}>
              <Download size={17} strokeWidth={2.6} aria-hidden="true" />
              Baixar imagem
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function ErrorNote({ message }) {
  return (
    <p role="alert" className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-[0.9rem] text-red-800 ring-1 ring-red-200 ring-inset">
      <TriangleAlert size={18} strokeWidth={2.4} className="mt-0.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

export function RuasNovas() {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-700 via-sky-800 to-sky-950">
        <div aria-hidden="true" className="paver-grid-light absolute inset-0 opacity-60" />
        <Header />

        <main id="conteudo" className="shell relative pt-6 pb-20 sm:pt-10 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-gold-300 uppercase">{simulator.overline}</p>
            <h1 className="display mt-4 text-[clamp(2.1rem,6.4vw,4rem)] text-white">
              {simulator.title.replace(/\.$/, '')}
              <span aria-hidden="true" className="text-gold-400">
                .
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-white/85 sm:text-[1.1rem]">{simulator.lead}</p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
            <Simulator />
            <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-white/60">{simulator.disclaimer}</p>
          </div>
        </main>
      </div>

      <Commitment />

      <footer className="bg-sky-950 py-10">
        <div className="shell flex flex-col items-center gap-5 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-[0.88rem] font-bold text-navy-900 transition-colors hover:bg-gold-300"
          >
            Conheça todas as propostas
          </a>
          <p className="text-[0.76rem] leading-relaxed text-white/60">
            Material de campanha da chapa Aquarius Sem Buracos — candidata à administração do Residencial Aquarius.
            <br className="hidden sm:block" /> Conteúdo de responsabilidade da própria chapa.
          </p>
        </div>
      </footer>
    </>
  )
}
