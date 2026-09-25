/**
 * ReceiveSheet — payment request link + QR. Fully i18n.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, QrCode, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'
import { buildAddressExplorerUrl } from '@/onchain-facts'
import { useT } from '@/i18n'

const ARC_CHAIN_ID = 5042002
const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'

interface Props {
  open: boolean
  onClose: () => void
  address: string
  displayName: string
}

export default function ReceiveSheet({ open, onClose, address, displayName }: Props) {
  const t = useT()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState<'addr' | 'link' | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const paymentLink = `subone://pay?to=${address}&amount=${amount || ''}&note=${encodeURIComponent(note)}&name=${encodeURIComponent(displayName)}`
  const shortPayLink = `subone.app/pay/${address.slice(0, 8)}`
  const explorerUrl = buildAddressExplorerUrl(ARC_CHAIN_ID, address)

  useEffect(() => {
    if (!open || !address) return
    const target = amount ? paymentLink : address
    QRCode.toDataURL(target, {
      width: 200, margin: 2,
      color: { dark: '#0d2d6b', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(''))
  }, [open, address, amount, note, paymentLink])

  async function copy(text: string, which: 'addr' | 'link') {
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--bg-gradient)', maxHeight: '90dvh', overflowY: 'auto' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="h-1 w-full" style={{ background: spectral }} />
            <div className="p-5 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>{t('receiveTitle')}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{t('receiveSubtitle')}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'var(--surface-muted)' }}>
                  <X className="size-4" style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              {qrDataUrl && (
                <div className="flex justify-center mb-5">
                  <div className="p-3 rounded-2xl shadow-sm" style={{ background: 'white', border: '1.5px solid var(--border)' }}>
                    <img src={qrDataUrl} alt="QR Code" className="w-44 h-44" />
                  </div>
                </div>
              )}

              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
                    {t('receiveAddrLabel')}
                  </span>
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    ArcScan <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mono text-xs flex-1 truncate" style={{ color: 'var(--ink-2)' }}>{address}</span>
                  <button onClick={() => { void copy(address, 'addr') }}
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ background: copied === 'addr' ? 'rgba(26,128,71,0.1)' : 'var(--surface-muted)' }}>
                    {copied === 'addr'
                      ? <Check className="size-3.5" style={{ color: 'var(--success)' }} />
                      : <Copy className="size-3.5" style={{ color: 'var(--muted)' }} />}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
                  {t('receiveRequestLabel')}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--subtle)' }}>$</span>
                    <input type="number" placeholder={t('receiveAmountPlaceholder')} value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none tabular-nums"
                      style={{ color: 'var(--ink)', fontFamily: 'DM Sans' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>USDC</span>
                  </div>
                  <input placeholder={t('receiveNotePlaceholder')} value={note}
                    onChange={e => setNote(e.target.value)}
                    className="rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)', fontFamily: 'DM Sans' }} />
                </div>
              </div>

              <button onClick={() => void copy(paymentLink, 'link')}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold"
                style={{ background: 'var(--accent-gradient)', color: 'white', fontFamily: 'DM Sans' }}>
                {copied === 'link'
                  ? <><Check className="size-4" /> {t('receiveCopied')}</>
                  : <><QrCode className="size-4" /> {t('receiveCopyLink')}</>}
              </button>
              <p className="text-center text-xs mt-2" style={{ color: 'var(--subtle)' }}>{shortPayLink}</p>
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
