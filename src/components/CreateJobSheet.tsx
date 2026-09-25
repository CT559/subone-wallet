/**
 * CreateJobSheet — Client tạo job mới, approve USDC + gọi createJob.
 */
import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { parseAmount, Amount, usdcDecimalsFor } from '@/onchain-money'
import { SUBONE_ESCROW } from '@/contracts'
import { useT } from '@/i18n'

const ARC_CHAIN_ID = 5042002
const spectral = 'linear-gradient(90deg, #5fbeff, #af8ff4, #f05c6b, #ffcd83, #7ef1b3)'

type Step = 'form' | 'approve' | 'create' | 'done'

interface Props {
  open: boolean
  onClose: () => void
  address: string
  onSuccess: () => void
}

export default function CreateJobSheet({ open, onClose, address, onSuccess }: Props) {
  const t = useT()
  const { chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const usdcFact = getUsdc(ARC_CHAIN_ID)!

  const [freelancerAddr, setFreelancerAddr] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [description, setDescription] = useState('')
  const [autoReleaseDays, setAutoReleaseDays] = useState('30')
  const [step, setStep] = useState<Step>('form')
  const [, setTxHash] = useState<`0x${string}` | undefined>()
  const [createTxHash, setCreateTxHash] = useState<`0x${string}` | undefined>()

  const { data: usdcRaw } = useReadContract({
    address: usdcFact.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: ARC_CHAIN_ID,
  })
  const usdcBalance = usdcRaw != null
    ? Amount.fromRaw(usdcRaw, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2)
    : '0'

  const { writeContract: approve, data: approveTxHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { writeContract: createJob, data: createJobTxHash, isPending: isCreatePending } = useWriteContract()
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: createJobTxHash })

  const [approveTriggered, setApproveTriggered] = useState(false)
  if (isApproveSuccess && !approveTriggered && step === 'approve') {
    setApproveTriggered(true)
    setStep('create')
    const parsedAmt = parseAmount(ARC_CHAIN_ID, amountStr)
    const days = Math.max(1, Math.min(365, parseInt(autoReleaseDays, 10) || 30))
    createJob({
      address: SUBONE_ESCROW.address,
      abi: SUBONE_ESCROW.abi,
      functionName: 'createJob',
      args: [
        freelancerAddr as `0x${string}`,
        parsedAmt.raw,
        description,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        BigInt(days),
      ],
      chainId: ARC_CHAIN_ID,
    })
  }

  if (isCreateSuccess && step === 'create') {
    setStep('done')
    setCreateTxHash(createJobTxHash)
  }

  const isWrongChain = chainId !== ARC_CHAIN_ID

  const handleSubmit = useCallback(() => {
    if (!address) return
    if (isWrongChain) { switchChain({ chainId: ARC_CHAIN_ID }); return }
    let parsedAmt: ReturnType<typeof parseAmount>
    try { parsedAmt = parseAmount(ARC_CHAIN_ID, amountStr) } catch { return }
    if (!freelancerAddr.startsWith('0x') || freelancerAddr.length !== 42) return
    setStep('approve')
    setApproveTriggered(false)
    approve({
      address: usdcFact.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [SUBONE_ESCROW.address, parsedAmt.raw],
      chainId: ARC_CHAIN_ID,
    })
  }, [address, isWrongChain, amountStr, freelancerAddr, switchChain, approve, usdcFact.address])

  const handleClose = () => {
    if (step === 'done') onSuccess()
    else onClose()
    setTimeout(() => {
      setStep('form'); setFreelancerAddr(''); setAmountStr('')
      setDescription(''); setAutoReleaseDays('30')
      setApproveTriggered(false); setTxHash(undefined); setCreateTxHash(undefined)
    }, 300)
  }

  const amountNum = parseFloat(amountStr) || 0
  const feeAmt = (amountNum * 0.5 / 100).toFixed(2)
  const freelancerNet = (amountNum * 0.995).toFixed(2)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <motion.section
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', maxHeight: '92dvh', overflowY: 'auto' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="h-1 sticky top-0" style={{ background: spectral }} />
            <div className="flex justify-center pt-3 pb-1 sticky top-1 bg-white/90 backdrop-blur-sm z-10">
              <div className="h-1 w-10 rounded-full bg-black/10" />
            </div>
            <div className="px-5 pb-10 pt-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>{t('createJobTitle')}</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('createJobSubtitle')}</p>
                </div>
                <button onClick={handleClose} className="rounded-full p-1.5 hover:opacity-60">
                  <X className="size-4" style={{ color: 'var(--subtle)' }} />
                </button>
              </div>

              {step === 'done' ? (
                <SuccessState txHash={createTxHash} onClose={handleClose} t={t} />
              ) : step === 'approve' || step === 'create' ? (
                <ProgressState
                  step={step}
                  isApprovePending={isApprovePending} isApproveConfirming={isApproveConfirming} isApproveSuccess={isApproveSuccess}
                  isCreatePending={isCreatePending} isCreateConfirming={isCreateConfirming}
                  amount={amountStr} t={t}
                />
              ) : (
                <FormState
                  freelancerAddr={freelancerAddr} setFreelancerAddr={setFreelancerAddr}
                  amountStr={amountStr} setAmountStr={setAmountStr}
                  description={description} setDescription={setDescription}
                  autoReleaseDays={autoReleaseDays} setAutoReleaseDays={setAutoReleaseDays}
                  usdcBalance={usdcBalance}
                  amountNum={amountNum} feeAmt={feeAmt} freelancerNet={freelancerNet}
                  isWrongChain={isWrongChain}
                  onSubmit={handleSubmit}
                  disabled={!address || !freelancerAddr || !amountStr || parseFloat(amountStr) <= 0}
                  t={t}
                />
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type TFn = (key: Parameters<ReturnType<typeof useT>>[0]) => string

function FormState({
  freelancerAddr, setFreelancerAddr, amountStr, setAmountStr,
  description, setDescription, autoReleaseDays, setAutoReleaseDays,
  usdcBalance, amountNum, feeAmt, freelancerNet, isWrongChain, onSubmit, disabled, t,
}: {
  freelancerAddr: string; setFreelancerAddr: (v: string) => void
  amountStr: string; setAmountStr: (v: string) => void
  description: string; setDescription: (v: string) => void
  autoReleaseDays: string; setAutoReleaseDays: (v: string) => void
  usdcBalance: string; amountNum: number; feeAmt: string; freelancerNet: string
  isWrongChain: boolean; onSubmit: () => void; disabled: boolean; t: TFn
}) {
  return (
    <div className="space-y-4">
      <Field label={t('createJobFieldFreelancer')}>
        <input value={freelancerAddr} onChange={e => setFreelancerAddr(e.target.value.trim())}
          placeholder="0x..." className="mono w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
          style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }} />
      </Field>

      <Field label={t('createJobFieldAmount')}>
        <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: 'var(--surface-muted)' }}>
          <TokenUSDC variant="branded" size={20} />
          <input type="number" value={amountStr} onChange={e => setAmountStr(e.target.value)}
            placeholder="0.00" min="0" step="0.01"
            className="flex-1 py-3.5 text-lg font-bold tabular-nums bg-transparent outline-none"
            style={{ color: 'var(--ink)' }} />
          <button onClick={() => setAmountStr(usdcBalance)} className="text-xs font-semibold" style={{ color: 'var(--accent-hover)' }}>Max</button>
        </div>
        <p className="text-[11px] mt-1 ml-1" style={{ color: 'var(--muted)' }}>{t('createJobBalance')} {usdcBalance} USDC</p>
      </Field>

      <div className="flex gap-2">
        {['50', '100', '200', '500', '1000'].map(v => (
          <button key={v} onClick={() => setAmountStr(v)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={amountStr === v ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>
            ${v}
          </button>
        ))}
      </div>

      <Field label={t('createJobFieldDesc')}>
        <input value={description} onChange={e => setDescription(e.target.value.slice(0, 200))}
          placeholder={t('createJobDescPlaceholder')}
          className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
          style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }} />
        <p className="text-[10px] mt-1 ml-1 text-right" style={{ color: 'var(--muted)' }}>{description.length}/200</p>
      </Field>

      <Field label={t('createJobFieldAutoRelease')}>
        <div className="flex gap-2">
          {['7', '14', '30', '60'].map(d => (
            <button key={d} onClick={() => setAutoReleaseDays(d)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={autoReleaseDays === d ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>
              {d}d
            </button>
          ))}
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
          {t('createJobAutoReleaseHint').replace('{n}', autoReleaseDays)}
        </p>
      </Field>

      {amountNum > 0 && (
        <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--surface-muted)' }}>
          <PreviewRow label={t('createJobPreviewEscrow')} value={`${amountStr} USDC`} />
          <PreviewRow label={t('createJobPreviewFee')} value={`${feeAmt} USDC`} muted />
          <div className="h-px my-1" style={{ background: 'var(--border)' }} />
          <PreviewRow label={t('createJobPreviewNet')} value={`${freelancerNet} USDC`} bold />
        </div>
      )}

      {isWrongChain && (
        <div className="rounded-2xl p-3 text-xs text-center font-medium"
          style={{ background: 'rgba(255,149,0,0.10)', color: '#7a4d00' }}>
          {t('createJobWrongChain')}
        </div>
      )}

      <button onClick={onSubmit} disabled={disabled}
        className="w-full rounded-2xl py-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
        style={{ background: 'var(--accent)' }}>
        {isWrongChain ? t('createJobSwitchChain') : t('createJobSubmit')}
        <ChevronRight className="inline ml-1 size-4" />
      </button>
      <p className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>{t('createJobTxNote')}</p>
    </div>
  )
}

function ProgressState({ step, isApprovePending, isApproveConfirming, isApproveSuccess, isCreatePending, isCreateConfirming, amount, t }: {
  step: string; isApprovePending: boolean; isApproveConfirming: boolean; isApproveSuccess: boolean
  isCreatePending: boolean; isCreateConfirming: boolean; amount: string; t: TFn
}) {
  const steps = [
    { label: t('createJobStep1Label'), desc: t('createJobStep1Desc').replace('{n}', amount), done: isApproveSuccess, active: step === 'approve' },
    { label: t('createJobStep2Label'), desc: t('createJobStep2Desc'), done: false, active: step === 'create' },
  ]
  return (
    <div className="py-4 space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: s.active || s.done ? 'rgba(18,45,69,0.05)' : 'var(--surface-muted)' }}>
          <div className="mt-0.5">
            {s.done
              ? <CheckCircle2 className="size-5" style={{ color: 'var(--success)' }} />
              : s.active
                ? <Loader2 className="size-5 animate-spin" style={{ color: 'var(--accent)' }} />
                : <div className="size-5 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: s.active ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.desc}</p>
            {s.active && (
              <p className="text-[11px] mt-1 font-medium" style={{ color: 'var(--accent-hover)' }}>
                {isApprovePending || isCreatePending ? t('createJobWalletConfirm')
                  : isApproveConfirming || isCreateConfirming ? t('createJobArcConfirm') : ''}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function SuccessState({ txHash, onClose, t }: { txHash: `0x${string}` | undefined; onClose: () => void; t: TFn }) {
  const explorerUrl = txHash ? buildTxExplorerUrl(ARC_CHAIN_ID, txHash) : undefined
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl mb-4" style={{ background: 'rgba(26,128,71,0.10)' }}>
        <CheckCircle2 className="size-8" style={{ color: 'var(--success)' }} />
      </div>
      <h3 className="display text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>{t('createJobSuccessTitle')}</h3>
      <p className="text-sm leading-relaxed mb-6 max-w-[240px]" style={{ color: 'var(--ink-2)' }}>{t('createJobSuccessDesc')}</p>
      {explorerUrl && (
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold mb-5" style={{ color: 'var(--accent-hover)' }}>
          {t('createJobViewTx')} <ChevronRight className="size-3.5" />
        </a>
      )}
      <button onClick={onClose} className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
        {t('createJobViewJob')}
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--muted)' }}>{label}</p>
      {children}
    </div>
  )
}

function PreviewRow({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: muted ? 'var(--muted)' : 'var(--ink-2)' }}>{label}</span>
      <span className="text-xs tabular-nums" style={{ color: bold ? 'var(--ink)' : muted ? 'var(--muted)' : 'var(--ink-2)', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}
