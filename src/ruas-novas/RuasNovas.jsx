import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Camera, Check, Download, ImageUp, RotateCcw, Share2, Sparkles, TriangleAlert, X } from 'lucide-react'
import { config, simulator } from '../content.js'
import { RoadCompare } from '../sections/Solution.jsx'
import { Commitment } from '../sections/Commitment.jsx'
import { SubpageFooter, SubpageHeader } from '../components/Subpage.jsx'
import { WhatsAppIcon } from '../components/WhatsAppIcon.jsx'

const MAX_SIDE = 1536
const TIMEOUT_MS = 150_000
const SAVED_KEY = 'ruas-novas:resultado'

/* Frases que se revezam enquanto a IA trabalha (costuma levar de 20 s a 1 min). */

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

/* Compartilhar: no celular abre a folha de compartilhamento com a imagem (WhatsApp, Instagram...).
   Onde não dá para mandar arquivo, compartilha o link do simulador; no último caso, abre o WhatsApp. */
const SHARE_TEXT = 'Olha como a minha rua ficaria com bloquete! Simule a sua também:'

async function shareResult(dataUrl) {
  const url = `${window.location.origin}/ruas-novas/`
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'minha-rua-com-bloquete.jpg', { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: `${SHARE_TEXT} ${url}` })
      return
    }
    if (navigator.share) {
      await navigator.share({ text: SHARE_TEXT, url })
      return
    }
  } catch (e) {
    if (e?.name === 'AbortError') return // a pessoa fechou a folha de compartilhamento
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`, '_blank', 'noopener')
}

/* Câmera pelo navegador, para onde o input com capture não abre a câmera (computador com webcam). */
function CameraModal({ onShot, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let stream
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        videoRef.current.srcObject = s
      })
      .catch(() => setError('Não foi possível abrir a câmera. Verifique a permissão do navegador ou envie uma foto.'))
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const shoot = () => {
    const v = videoRef.current
    if (!v?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d').drawImage(v, 0, 0)
    canvas.toBlob((blob) => blob && onShot(new File([blob], 'foto-da-rua.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Tirar foto da rua" className="fixed inset-0 z-50 grid place-items-center bg-navy-900/85 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-paper-50 shadow-2xl">
        <div className="relative bg-black">
          {error ? (
            <p className="px-6 py-16 text-center text-[0.95rem] text-white/90">{error}</p>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="block aspect-video w-full object-cover" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar câmera"
            className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
        {!error && (
          <div className="flex justify-center p-4">
            <button
              type="button"
              onClick={shoot}
              className="inline-flex items-center gap-2.5 rounded-full bg-gold-400 px-6 py-3.5 text-[0.95rem] font-semibold text-navy-900 transition-colors hover:bg-gold-300"
            >
              <Camera size={18} strokeWidth={2.4} aria-hidden="true" />
              Capturar foto
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const hasTouch = () => window.matchMedia('(pointer: coarse)').matches

function Dropzone({ onFile }) {
  const inputRef = useRef(null)
  const cameraRef = useRef(null)
  const [over, setOver] = useState(false)
  const [webcam, setWebcam] = useState(false)
  const closeWebcam = useCallback(() => setWebcam(false), [])

  /* No celular, o input com capture abre a câmera nativa; no computador, abre a webcam numa janela. */
  const openCamera = () => {
    if (hasTouch() || !navigator.mediaDevices?.getUserMedia) cameraRef.current?.click()
    else setWebcam(true)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={`group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-3 py-9 text-center transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-500 sm:gap-4 sm:px-6 sm:py-16 ${
            over ? 'border-brand-500 bg-brand-500/8' : 'border-paper-300 bg-paper-100 hover:border-brand-400 hover:bg-paper-50'
          }`}
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-400 text-navy-900 shadow-[0_12px_30px_-12px_rgba(229,180,0,0.8)] transition-transform group-hover:-translate-y-1 sm:h-16 sm:w-16">
            <ImageUp size={26} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span>
            <span className="display block text-[1.1rem] text-ink-900 sm:text-[1.5rem]">Enviar foto</span>
            <span className="mt-1.5 block text-[0.8rem] leading-snug text-ink-600 sm:text-[0.92rem]">
              <span className="pointer-fine:hidden">Escolha da galeria</span>
              <span className="hidden pointer-fine:inline">Clique para escolher ou arraste a foto para cá</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={openCamera}
          className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-navy-900 px-3 py-9 text-center shadow-[0_14px_30px_-16px_rgba(10,23,48,0.8)] transition-colors outline-none hover:bg-navy-800 focus-visible:ring-4 focus-visible:ring-brand-500 sm:gap-4 sm:px-6 sm:py-16"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-400 text-navy-900 shadow-[0_12px_30px_-12px_rgba(229,180,0,0.8)] transition-transform group-hover:-translate-y-1 sm:h-16 sm:w-16">
            <Camera size={26} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span>
            <span className="display block text-[1.1rem] text-white sm:text-[1.5rem]">Tirar foto</span>
            <span className="mt-1.5 block text-[0.8rem] leading-snug text-white/75 sm:text-[0.92rem]">
              <span className="pointer-fine:hidden">Abre a câmera agora</span>
              <span className="hidden pointer-fine:inline">Use a câmera do computador</span>
            </span>
          </span>
        </button>
      </div>
      {webcam && (
        <CameraModal
          onClose={closeWebcam}
          onShot={(file) => {
            setWebcam(false)
            onFile(file)
          }}
        />
      )}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onFile(file)
        }}
      />
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
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

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
        <p className="display text-[1.3rem] text-white sm:text-[1.6rem]">Gerando imagem…</p>
        <p className="max-w-sm text-[0.95rem] leading-snug text-white/90">Ajude-nos na causa entrando em nosso grupo:</p>
        <a
          href={config.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} ${whatsBtn}`}
        >
          <WhatsAppIcon size={18} />
          Entrar no grupo do WhatsApp
        </a>
        <p className="text-[0.82rem] text-white/70">Isso leva cerca de 1 minuto. Não feche a página. · {secs}s</p>
      </div>
    </div>
  )
}

/* Verde do WhatsApp, escuro o bastante para o texto branco ter contraste. */
const whatsBtn = 'bg-green-600 text-white shadow-[0_14px_30px_-16px_rgba(22,163,74,0.9)] hover:bg-green-700'

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
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => shareResult(result)} className={`${btn} bg-navy-900 text-white hover:bg-navy-800`}>
              <Share2 size={17} strokeWidth={2.6} aria-hidden="true" />
              Compartilhar
            </button>
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
        <SubpageHeader />

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
            <a
              href={config.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} ${whatsBtn} group mt-7`}
            >
              <WhatsAppIcon size={18} />
              Entre no WhatsApp e faça parte dessa mudança
              <ArrowRight size={16} strokeWidth={2.6} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>

          <div className="mx-auto mt-10 max-w-4xl sm:mt-14">
            <Simulator />
            <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-white/60">{simulator.disclaimer}</p>
          </div>
        </main>
      </div>

      <Commitment />

      <SubpageFooter />
    </>
  )
}
