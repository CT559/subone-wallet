/**
 * OffRampSheet — cash out USDC to VND via MIMO sandbox. Fully i18n.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ExternalLink, Info, Clock, Receipt } from 'lucide-react'
import { useT } from '@/i18n'

const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'

const BANKS = [
  { name: 'Vietcombank', color: '#006633' },
  { name: 'BIDV',        color: '#005baa' },
  { name: 'Techcombank', color: '#cc0000' },
  { name: 'MB Bank',     color: '#003087' },
  { name: 'ACB',         color: '#003087' },
  { name: 'TPBank',      color: '#9b1c2e' },
  { name: 'VPBank',      color: '#007a33' },
  { name: 'Sacombank',   color: '#c41230' },
]

interface Props { open: boolean; onClose: () => void }

export default function OffRampSheet({ open, onClose }: Props) {
  const t = useT()

  const steps = [
    t('offRampStep1'),
    t('offRampStep2'),
    t('offRampStep3'),
  ]

  const locations = [
    t('offRampLoc1'),
    t('offRampLoc2'),
    t('offRampLoc3'),
  ]

  const stats = [
    { icon: <Receipt className="size-3.5" />, label: t('offRampFeeLabel'),    value: '~0.3%' },
    { icon: <Clock   className="size-3.5" />, label: t('offRampTimeLabel'),   value: t('offRampTimeValue') },
    { icon: <Info    className="size-3.5" />, label: t('offRampInvoiceLabel'), value: t('offRampInvoiceValue') },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-y-auto"
            style={{ background: 'var(--bg-gradient)', maxHeight: '90dvh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="h-1 w-full flex-shrink-0" style={{ background: spectral }} />
            <div className="p-5 max-w-md mx-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>{t('offRampTitle')}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{t('offRampSubtitle')}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'var(--surface-muted)' }}>
                  <X className="size-4" style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              {/* Steps */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
                  {t('offRampStepsLabel')}
                </p>
                {steps.map((text, i) => (
                  <div key={i} className="flex gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: 'var(--accent)' }}>{i + 1}</div>
                    <p className="text-sm" style={{ color: 'var(--ink-2)' }}>{text}</p>
                  </div>
                ))}
                <div className="flex gap-2 mt-3">
                  {[
                    { label: 'Binance', href: 'https://www.binance.com', bg: '#f0b90b', color: '#000' },
                    { label: 'OKX',     href: 'https://www.okx.com',     bg: 'var(--ink)', color: 'white' },
                    { label: 'MIMO',    href: 'https://mimo.dragonlab.com.vn', bg: 'rgba(59,95,192,0.1)', color: '#2a4a9e' },
                  ].map(({ label, href, bg, color }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1"
                      style={{ background: bg, color }}>
                      {label} <ExternalLink className="size-3" />
                    </a>
                  ))}
                </div>
              </div>

              {/* MIMO info */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--accent)' }}>DL</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Dragon Lab – MIMO</p>
                    <p className="text-xs" style={{ color: 'var(--subtle)' }}>{t('offRampMimoSandbox')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {stats.map(({ icon, label, value }) => (
                    <div key={label} className="rounded-xl p-2.5 flex flex-col gap-0.5"
                      style={{ background: 'var(--surface-muted)' }}>
                      <div className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                        {icon}
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-2.5 text-xs" style={{ background: 'rgba(0,180,130,0.08)', color: '#007a5e' }}>
                  {t('offRampLicense')}
                </div>
              </div>

              {/* GPS */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="size-4" style={{ color: '#c47c00' }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{t('offRampGpsTitle')}</p>
                </div>
                {locations.map(loc => (
                  <p key={loc} className="text-xs mb-1.5 last:mb-0 pl-6" style={{ color: 'var(--ink-2)' }}>{loc}</p>
                ))}
              </div>

              {/* Banks */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
                  {t('offRampBanksLabel')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {BANKS.map(b => (
                    <div key={b.name} className="rounded-xl py-2 px-1.5 flex flex-col items-center gap-1"
                      style={{ background: 'var(--surface-muted)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: b.color }}>{b.name.slice(0, 2)}</div>
                      <span className="text-[10px] text-center" style={{ color: 'var(--muted)' }}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
