/**
 * Invoice export — generates a printable HTML invoice and triggers browser print/save-as-PDF.
 * Also renders an in-app invoice preview card.
 */
import { useState } from 'react'
import { FileText, X, Printer } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { buildTxExplorerUrl } from '@/onchain-facts'

const ARC_CHAIN_ID = 5042002
const springs = { sheet: { type: 'spring' as const, stiffness: 400, damping: 40 } }
const spectral = 'linear-gradient(90deg, #5fbeff, #af8ff4, #f05c6b, #ffcd83, #7ef1b3)'

export interface InvoiceData {
  invoiceNumber: string
  date: string
  senderName: string
  senderAddress: string
  recipientName: string
  recipientAddress: string
  description: string
  amountUsdc: string
  txHash?: string
  /** Optional: estimated VND value at time of transaction */
  estimatedVnd?: string
}

interface Props {
  open: boolean
  onClose: () => void
  invoice: InvoiceData | null
}

export default function InvoiceExport({ open, onClose, invoice }: Props) {
  const [generating, setGenerating] = useState(false)

  function handlePrint() {
    if (!invoice) return
    setGenerating(true)
    const html = buildInvoiceHtml(invoice)
    const win = window.open('', '_blank')
    if (!win) {
      setGenerating(false)
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      setGenerating(false)
    }, 400)
  }

  if (!invoice) return null

  const explorerUrl = invoice.txHash
    ? buildTxExplorerUrl(ARC_CHAIN_ID, invoice.txHash)
    : undefined

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <motion.section
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl"
            style={{
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              maxHeight: '88dvh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.sheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 sticky top-0" style={{ background: spectral }} />
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-black/10" />
            </div>

            <div className="px-5 pb-8 pt-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  Xuất hóa đơn
                </h2>
                <button onClick={onClose} className="rounded-full p-1.5 hover:opacity-60 transition-opacity">
                  <X className="size-4" style={{ color: 'var(--subtle)' }} />
                </button>
              </div>

              {/* Invoice preview */}
              <div
                className="rounded-2xl p-5 mb-5"
                style={{
                  background: 'rgba(255,255,255,0.64)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.68)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="display text-base font-bold" style={{ color: 'var(--ink)' }}>
                      INVOICE
                    </p>
                    <p className="text-xs mono" style={{ color: 'var(--muted)' }}>
                      #{invoice.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Ngày</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>{invoice.date}</p>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-muted)' }}>
                    <p className="text-[10px] mb-1 font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>Từ</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{invoice.senderName || 'Chưa đặt tên'}</p>
                    <p className="mono text-[9px] truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                      {invoice.senderAddress.slice(0, 10)}...
                    </p>
                  </div>
                  <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-muted)' }}>
                    <p className="text-[10px] mb-1 font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>Đến</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{invoice.recipientName || 'Client'}</p>
                    <p className="mono text-[9px] truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                      {invoice.recipientAddress.slice(0, 10)}...
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl px-3 py-2.5 mb-4" style={{ background: 'var(--surface-muted)' }}>
                  <p className="text-[10px] mb-1 font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                    Mô tả dịch vụ
                  </p>
                  <p className="text-xs" style={{ color: 'var(--ink-2)' }}>{invoice.description || 'Dịch vụ freelance'}</p>
                </div>

                {/* Amount */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                  style={{ background: 'rgba(26,128,71,0.08)', border: '1px solid rgba(26,128,71,0.2)' }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Tổng thanh toán</span>
                  <div className="text-right">
                    <p className="display text-lg font-bold tabular-nums" style={{ color: 'var(--success)' }}>
                      {invoice.amountUsdc} USDC
                    </p>
                    {invoice.estimatedVnd && (
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        ≈ {invoice.estimatedVnd} VND
                      </p>
                    )}
                  </div>
                </div>

                {/* Tx hash */}
                {invoice.txHash && explorerUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: 'var(--subtle)' }}>Tx Hash (Arc)</span>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mono text-[10px] transition-opacity hover:opacity-70"
                      style={{ color: 'var(--accent-hover)' }}
                    >
                      {invoice.txHash.slice(0, 10)}...{invoice.txHash.slice(-8)}
                    </a>
                  </div>
                )}
              </div>

              {/* Tax notice */}
              <div
                className="rounded-xl px-3 py-2.5 mb-5 flex items-start gap-2"
                style={{ background: 'var(--surface-muted)' }}
              >
                <FileText className="size-3.5 mt-0.5 shrink-0" style={{ color: 'var(--muted)' }} />
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Lưu hóa đơn để khai thuế TNCN. Theo Nghị quyết 05/2025/NQ-CP, thuế 0.1%
                  áp dụng trên giá trị giao dịch crypto. Hóa đơn có thể dùng làm chứng từ
                  giải trình nguồn thu nhập.
                </p>
              </div>

              {/* Actions */}
              <button
                onClick={handlePrint}
                disabled={generating}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)' }}
              >
                <Printer className="size-4" />
                {generating ? 'Đang tạo PDF...' : 'In / Lưu PDF'}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---- Invoice builder ----

function buildInvoiceHtml(inv: InvoiceData): string {
  const explorerUrl = inv.txHash
    ? `https://explorer.testnet.arc.io/tx/${inv.txHash}`
    : null

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; padding: 48px; color: #122d45; background: #fff; max-width: 680px; margin: auto; }
  .display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.03em; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f5f5f8; }
  .logo { display: flex; flex-direction: column; }
  .logo-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; color: #122d45; }
  .logo-tag { font-size: 11px; color: #8a849c; margin-top: 2px; }
  .invoice-meta { text-align: right; }
  .invoice-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; color: #122d45; }
  .invoice-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6b6580; margin-top: 4px; }
  .section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8a849c; margin-bottom: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .party-box { background: #f5f5f8; border-radius: 12px; padding: 16px; }
  .party-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
  .party-addr { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b6580; word-break: break-all; }
  .desc-box { background: #f5f5f8; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
  .desc-text { font-size: 14px; color: #334155; }
  .amount-box { background: rgba(26,128,71,0.08); border: 1px solid rgba(26,128,71,0.25); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .amount-label { font-size: 13px; color: #6b6580; }
  .amount-value { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; color: #1a8047; }
  .amount-vnd { font-size: 12px; color: #6b6580; text-align: right; margin-top: 2px; }
  .tx-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid #f5f5f8; font-size: 12px; }
  .tx-hash { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #1061a6; text-decoration: none; }
  .tax-note { background: #f5f5f8; border-radius: 10px; padding: 14px; margin-top: 24px; font-size: 11px; color: #6b6580; line-height: 1.6; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f5f5f8; text-align: center; font-size: 10px; color: #8a849c; }
  @media print { body { padding: 32px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">
    <span class="logo-name">SubOne</span>
    <span class="logo-tag">Thanh toán quốc tế qua USDC · Arc Chain</span>
  </div>
  <div class="invoice-meta">
    <div class="invoice-title display">INVOICE</div>
    <div class="invoice-num">#${inv.invoiceNumber}</div>
    <div style="font-size:12px;color:#6b6580;margin-top:8px;">Ngày: ${inv.date}</div>
  </div>
</div>

<div class="parties">
  <div class="party-box">
    <div class="section-label">Bên gửi (Freelancer)</div>
    <div class="party-name">${inv.senderName || 'SubOne User'}</div>
    <div class="party-addr">${inv.senderAddress}</div>
  </div>
  <div class="party-box">
    <div class="section-label">Bên nhận thanh toán / Client</div>
    <div class="party-name">${inv.recipientName || 'Client'}</div>
    <div class="party-addr">${inv.recipientAddress}</div>
  </div>
</div>

<div class="desc-box">
  <div class="section-label">Mô tả dịch vụ</div>
  <div class="desc-text">${inv.description || 'Dịch vụ freelance'}</div>
</div>

<div class="amount-box">
  <span class="amount-label">Tổng thanh toán</span>
  <div>
    <div class="amount-value">${inv.amountUsdc} USDC</div>
    ${inv.estimatedVnd ? `<div class="amount-vnd">≈ ${inv.estimatedVnd} VND</div>` : ''}
  </div>
</div>

${inv.txHash ? `
<div class="tx-row">
  <span style="color:#6b6580;">Mạng lưới</span>
  <span>Arc Testnet (Chain ID: 5042002)</span>
</div>
<div class="tx-row">
  <span style="color:#6b6580;">Transaction Hash</span>
  ${explorerUrl
    ? `<a href="${explorerUrl}" class="tx-hash">${inv.txHash}</a>`
    : `<span class="tx-hash">${inv.txHash}</span>`
  }
</div>` : ''}

<div class="tax-note">
  <strong>Ghi chú thuế:</strong> Theo Nghị quyết 05/2025/NQ-CP (hiệu lực 09/09/2025),
  thuế suất 0.1% áp dụng trên giá trị giao dịch chuyển nhượng crypto (cá nhân).
  Không có VAT trên giao dịch crypto. Hóa đơn này có thể dùng làm chứng từ
  giải trình nguồn thu nhập ngoại tệ từ hoạt động freelance quốc tế.
</div>

<div class="footer">
  Tạo bởi SubOne · Chạy trên Arc Chain · USDC by Circle ·
  Hóa đơn này không phải hóa đơn VAT điện tử theo Thông tư 78/2021/TT-BTC.
  Sau khi dùng MIMO để đổi VND, lưu thêm hóa đơn VAT từ Dragon Lab – MIMO.
</div>
</body>
</html>`
}

// ---- Hook: generate invoice from a tx ----
export function buildInvoiceFromTx(opts: {
  txHash: string
  amountUsdc: string
  senderAddress: string
  senderName: string
  recipientAddress: string
  recipientName?: string
  description?: string
}): InvoiceData {
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const invoiceNumber = `LP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${opts.txHash.slice(2, 8).toUpperCase()}`

  return {
    invoiceNumber,
    date: dateStr,
    senderName: opts.senderName,
    senderAddress: opts.senderAddress,
    recipientName: opts.recipientName ?? 'Client',
    recipientAddress: opts.recipientAddress,
    description: opts.description ?? 'Dịch vụ freelance quốc tế',
    amountUsdc: opts.amountUsdc,
    txHash: opts.txHash,
  }
}

// ---- Notification badge (shows in WalletView) ----
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span
      className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: 'var(--danger)' }}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}

// ---- Incoming payment notification hook ----
export function useIncomingNotification(
  address: string | undefined,
  onReceive: (amount: string, fromAddr: string, txHash: string) => void
) {
  // This hook is intentionally a stub: in production it would poll Arc chain
  // Transfer events via useWatchContractEvent. For now it exports the type
  // so WalletView can wire a real notification system later.
  // Keeping it as a placeholder avoids the need to import wagmi hooks here
  // and keeps the component tree clean.
  void address
  void onReceive
}
