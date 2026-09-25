/**
 * SendSheet — send USDC via wagmi ERC-20 transfer. Fully i18n.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi, isAddress } from 'viem'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { parseUsdc } from '@/onchain-money'
import { useT } from '@/i18n'

const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'
const QUICK = ['10', '50', '100', '500']
const ARC_CHAIN_ID = 5042002

interface Props {
  open: boolean
  onClose: () => void
  address: `0x${string}`
  balance: string
  onSuccess: () => void
}

export default function SendSheet({ open, onClose, balance, onSuccess }: Props) {
  const t = useT()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const usdcToken = getUsdc(ARC_CHAIN_ID)
  const { writeContract, data: txHash, isPending, reset: resetWrite } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  function reset() { setTo(''); setAmount(''); setErrMsg(''); resetWrite() }

  function handleSend() {
    if (!to.trim() || !amount || parseFloat(amount) <= 0) return
    if (!isAddress(to.trim())) { setErrMsg(t('sendInvalidAddr')); return }
    if (!usdcToken) { setErrMsg(t('sendNoUsdc')); return }
    setErrMsg('')
    writeContract({
      address: usdcToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to.trim() as `0x${string}`, parseUsdc(amount)],
      chainId: ARC_CHAIN_ID,
    }, {
      onSuccess: () => onSuccess(),
      onError: (e) => setErrMsg(e.message.slice(0, 120)),
    })
  }

  const isBusy = isPending || isConfirming
  const explorerUrl = txHash ? buildTxExplorerUrl(ARC_CHAIN_ID, txHash) : ''
  const fee = amount && parseFloat(amount) > 0
    ? `~${(parseFloat(amount) * 0.005).toFixed(4)} USDC` : '—'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { if (!isBusy) { reset(); onClose() } }} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--bg-gradient)' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="h-1 w-full" style={{ background: spectral }} />
            <div className="p-5 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>{t('sendTitle')}</h2>
                {!isBusy && (
                  <button onClick={() => { reset(); onClose() }} className="p-2 rounded-full" style={{ background: 'var(--surface-muted)' }}>
                    <X className="size-4" style={{ color: 'var(--muted)' }} />
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(26,128,71,0.1)' }}>
                      <CheckCircle2 className="size-8" style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg" style={{ color: 'var(--ink)' }}>{t('sendSuccess')}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>{t('sendSuccessHint')} {amount} USDC</p>
                    </div>
                    {explorerUrl && (
                      <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                        {t('sendViewExplorer')} <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <button onClick={() => { reset(); onClose() }}
                      className="w-full py-3.5 rounded-2xl font-semibold"
                      style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}>
                      {t('sendClose')}
                    </button>
                  </motion.div>
                ) : isBusy ? (
                  <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="size-10 animate-spin" style={{ color: 'var(--accent)' }} />
                    <div className="text-center">
                      <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                        {isPending ? t('sendPending') : t('sendConfirming')}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>{t('sendArcHint')}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3">
                    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
                          {t('sendAmountLabel')}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                          {t('sendBalanceLabel')} <span className="tabular-nums font-semibold" style={{ color: 'var(--ink)' }}>{balance}</span> USDC
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-light" style={{ color: 'var(--subtle)' }}>$</span>
                        <input type="number" placeholder="0.00" value={amount}
                          onChange={e => setAmount(e.target.value)}
                          className="flex-1 text-4xl font-bold bg-transparent outline-none tabular-nums display"
                          style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--subtle)' }}>USDC</span>
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        {QUICK.map(v => (
                          <button key={v} onClick={() => setAmount(v)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{ background: amount === v ? 'var(--accent)' : 'var(--surface-muted)', color: amount === v ? 'white' : 'var(--ink-2)' }}>
                            ${v}
                          </button>
                        ))}
                        <button onClick={() => setAmount(balance)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>
                          {t('sendMax')}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
                      <input placeholder={t('sendRecipient')} value={to} onChange={e => setTo(e.target.value)}
                        className="w-full px-4 py-3.5 text-sm mono outline-none bg-white"
                        style={{ color: 'var(--ink)' }} />
                    </div>

                    {amount && parseFloat(amount) > 0 && (
                      <div className="rounded-xl px-4 py-3 flex justify-between items-center"
                        style={{ background: 'var(--surface-muted)' }}>
                        <span className="text-xs" style={{ color: 'var(--subtle)' }}>{t('sendFeeLabel')}</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--ink-2)' }}>{fee}</span>
                      </div>
                    )}

                    {errMsg && (
                      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(186,43,76,0.08)', color: 'var(--danger)' }}>
                        {errMsg}
                      </div>
                    )}

                    <button onClick={handleSend}
                      disabled={!to.trim() || !amount || parseFloat(amount) <= 0}
                      className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'var(--accent-gradient)', fontFamily: 'DM Sans' }}>
                      <ArrowUpRight className="size-5" />
                      {t('sendButton')} {amount ? `${amount} USDC` : 'USDC'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
