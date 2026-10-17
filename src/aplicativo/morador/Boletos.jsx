import { useState } from 'react'
import { motion } from 'motion/react'
import { Barcode, CheckCircle2, Copy, FileDown, QrCode, Receipt } from 'lucide-react'
import { unitById, unitLabel, useStore } from '../lib/store.jsx'
import { fmtDate, today } from '../lib/format.js'
import { EASE } from '../lib/motion.js'
import { Badge, Button, Card, Empty, List, Modal, Notice, PageHeader, SectionTitle, cx } from '../ui/kit.jsx'

/* Boletos do condomínio da casa selecionada: gerar, copiar a linha digitável ou o Pix. */

/* Na demonstração os valores do condomínio não aparecem (para não sugerir reajuste) */
export const VALOR_OCULTO = 'R$ —'
export const brl = () => VALOR_OCULTO

const STATUS = {
  pago: { tone: 'green', label: 'Pago' },
  aberto: { tone: 'gold', label: 'Em aberto' },
  vencido: { tone: 'red', label: 'Vencido' },
}

/* Vencido: 2% de multa + 1% de juros ao mês (proporcional), como no boleto real */
export const valorAtual = (b) => {
  if (b.status !== 'vencido') return b.valor
  const dias = Math.max(0, Math.round((new Date(today()) - new Date(b.vencimento)) / 864e5))
  return Math.round((b.valor * 1.02 + b.valor * 0.01 * (dias / 30)) * 100) / 100
}

export const proximoBoleto = (db, unitId) =>
  db.boletos.filter((b) => b.unitId === unitId && b.status !== 'pago').sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0]

export function Boletos() {
  const { db, user } = useStore()
  const [open, setOpen] = useState(null)
  const unit = unitById(db, user.unitId)
  const list = db.boletos.filter((b) => b.unitId === user.unitId).sort((a, b) => b.vencimento.localeCompare(a.vencimento))
  const pendentes = list.filter((b) => b.status !== 'pago')
  const pagos = list.filter((b) => b.status === 'pago')

  return (
    <>
      <PageHeader overline="Minha casa" title="Boletos" lead={`Condomínio da casa ${unitLabel(unit)}.`} />

      {pendentes.length === 0 ? (
        <Notice tone="green" icon={CheckCircle2} className="mb-6">
          Tudo em dia. Nenhum boleto em aberto.
        </Notice>
      ) : (
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {pendentes.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: EASE.out }}>
              <div className={cx('relative overflow-hidden rounded-2xl p-5 text-white', b.status === 'vencido' ? 'bg-gradient-to-br from-sky-800 to-sky-975' : 'bg-gradient-to-br from-sky-700 to-sky-950')}>
                <div className="paver-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.64rem] font-bold tracking-[0.2em] text-gold-300 uppercase">{b.competencia}</p>
                    <Badge tone={STATUS[b.status].tone}>{STATUS[b.status].label}</Badge>
                  </div>
                  <p className="display mt-2 text-[2rem]">{brl(valorAtual(b))}</p>
                  <p className="text-[0.82rem] text-white/75">
                    Vence em {fmtDate(b.vencimento)}
                    
                  </p>
                  <Button variant="gold" className="mt-4 w-full sm:w-auto" icon={Barcode} onClick={() => setOpen(b)}>
                    Gerar boleto
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SectionTitle>Pagos</SectionTitle>
      {pagos.length === 0 ? (
        <Empty icon={Receipt} title="Nenhum pagamento ainda" />
      ) : (
        <List>
          {pagos.map((b) => (
            <button key={b.id} type="button" onClick={() => setOpen(b)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-100">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
                <Receipt size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9rem] font-semibold text-ink-900">{b.competencia}</span>
                <span className="block text-[0.78rem] text-ink-500">Pago em {fmtDate(b.pagoEm)}</span>
              </span>
              <span className="text-[0.88rem] font-semibold text-ink-900 tabular-nums">{brl(b.valor)}</span>
            </button>
          ))}
        </List>
      )}

      {open && <BoletoModal boleto={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function BoletoModal({ boleto: b, onClose }) {
  const { db, toast } = useStore()
  const unit = unitById(db, b.unitId)
  const valor = valorAtual(b)
  const pix = `00020126580014BR.GOV.BCB.PIX0136aquarius-${b.id}52040000530398654060.005802BR5925RESIDENCIAL AQUARIUS6009SOROCABA`
  const copy = (text, msg) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    toast(msg)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={b.status === 'pago' ? 'Comprovante' : 'Boleto do condomínio'}
      footer={
        b.status === 'pago' ? (
          <Button variant="outline" icon={FileDown} onClick={() => toast('Comprovante baixado (demonstração)')}>
            Baixar comprovante
          </Button>
        ) : (
          <Button variant="gold" icon={FileDown} onClick={() => toast('Boleto em PDF baixado (demonstração)')}>
            Baixar PDF
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-paper-100 p-4">
          <p className="text-[0.75rem] font-semibold text-ink-500">
            {b.competencia} · {unitLabel(unit)}
          </p>
          <p className="display mt-1 text-[1.8rem] text-ink-900">{brl(valor)}</p>
          <p className="text-[0.8rem] text-ink-600">{b.status === 'pago' ? `Pago em ${fmtDate(b.pagoEm)}` : `Vencimento ${fmtDate(b.vencimento)}`}</p>
        </div>

        <ul className="divide-y divide-paper-200 text-[0.85rem]">
          {b.itens.map((it) => (
            <li key={it.item} className="flex justify-between gap-3 py-2">
              <span className="text-ink-700">{it.item}</span>
              <span className="text-ink-900 tabular-nums">{brl(it.valor)}</span>
            </li>
          ))}
        </ul>

        {b.status !== 'pago' && (
          <>
            <div>
              <p className="mb-1.5 text-[0.75rem] font-semibold text-ink-500">Linha digitável</p>
              <p className="rounded-xl bg-paper-100 px-3 py-2.5 font-mono text-[0.78rem] break-all text-ink-900">{b.linha}</p>
              <Button variant="soft" size="sm" icon={Copy} className="mt-2" onClick={() => copy(b.linha.replace(/\D/g, ''), 'Código de barras copiado')}>
                Copiar código
              </Button>
            </div>
            <div>
              <p className="mb-1.5 text-[0.75rem] font-semibold text-ink-500">Pix copia e cola</p>
              <Button variant="soft" size="sm" icon={QrCode} onClick={() => copy(pix, 'Código Pix copiado')}>
                Copiar Pix
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
