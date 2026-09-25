/**
 * JobDetailSheet — Chi tiết job, các action: markComplete, release, openDispute, autoRelease.
 */
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Loader2, Shield, User, Briefcase, Calendar } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { buildTxExplorerUrl, buildAddressExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { SUBONE_ESCROW, JOB_STATUS_LABEL, JOB_STATUS_COLOR, JOB_STATUS_TEXT } from '@/contracts'
import { useT } from '@/i18n'

const ARC_CHAIN_ID = 5042002
const RENDER_TIME_SEC = Math.floor(Date.now() / 1000)
const spectral = 'linear-gradient(90deg, #5fbeff, #af8ff4, #f05c6b, #ffcd83, #7ef1b3)'

function formatAddr(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}` }
function formatAmount(raw: bigint) { return Amount.fromRaw(raw, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2) }
function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Props { jobId: bigint; open: boolean; onClose: () => void; viewerAddress: string; onAction: () => void }
type ActionKey = 'markComplete' | 'release' | 'autoRelease' | 'openDispute'
type TFn = ReturnType<typeof useT>

export default function JobDetailSheet({ jobId, open, onClose, viewerAddress, onAction }: Props) {
  const t = useT()
  const { chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const isWrongChain = chainId !== ARC_CHAIN_ID

  const { data: job, refetch: refetchJob } = useReadContract({
    address: SUBONE_ESCROW.address,
    abi: SUBONE_ESCROW.abi,
    functionName: 'getJob',
    args: [jobId],
    chainId: ARC_CHAIN_ID,
  })

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  if (isSuccess) { void refetchJob(); onAction(); reset() }

  const handleAction = (fn: ActionKey) => {
    if (isWrongChain) { switchChain({ chainId: ARC_CHAIN_ID }); return }
    writeContract({ address: SUBONE_ESCROW.address, abi: SUBONE_ESCROW.abi, functionName: fn, args: [jobId], chainId: ARC_CHAIN_ID })
  }

  if (!job) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <div className="absolute inset-0 bg-black/20" />
            <motion.section className="relative w-full max-w-md rounded-t-3xl overflow-hidden"
              style={{ background: 'white', maxHeight: '80dvh' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin" style={{ color: 'var(--muted)' }} />
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const j = job as {
    jobId: bigint; client: string; freelancer: string; amount: bigint
    createdAt: bigint; autoReleaseAt: bigint; status: number
    description: string; paymentRef: string; feeBpsAtCreation: bigint
  }

  const statusKey = JOB_STATUS_LABEL[j.status]
  const isClient = viewerAddress?.toLowerCase() === j.client.toLowerCase()
  const isFreelancer = viewerAddress?.toLowerCase() === j.freelancer.toLowerCase()
  const isAutoReleaseReady = RENDER_TIME_SEC >= Number(j.autoReleaseAt)
  const isDisputeWindowOpen = RENDER_TIME_SEC < Number(j.autoReleaseAt)
  const feeAmt = formatAmount(j.amount * j.feeBpsAtCreation / 10000n)
  const netAmt = formatAmount(j.amount - (j.amount * j.feeBpsAtCreation / 10000n))

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <motion.section
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', maxHeight: '90dvh', overflowY: 'auto' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={e => e.stopPropagation()}>
            <div className="h-1 sticky top-0" style={{ background: spectral }} />
            <div className="flex justify-center pt-3 pb-1 sticky top-1 bg-white/90 backdrop-blur-sm z-10">
              <div className="h-1 w-10 rounded-full bg-black/10" />
            </div>

            <div className="px-5 pb-10 pt-2">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-3">
                  <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
                    Job #{String(j.jobId)}
                  </p>
                  <h2 className="display text-lg font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                    {j.description || t('jobNoDesc')}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: JOB_STATUS_COLOR[statusKey], color: JOB_STATUS_TEXT[statusKey] }}>
                    {statusKey}
                  </span>
                  <button onClick={onClose} className="rounded-full p-1.5 hover:opacity-60">
                    <X className="size-4" style={{ color: 'var(--subtle)' }} />
                  </button>
                </div>
              </div>

              {/* Amount card */}
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(18,45,69,0.05), rgba(18,45,69,0.02))' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TokenUSDC variant="branded" size={20} />
                  <span className="text-3xl font-bold tabular-nums display" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    {formatAmount(j.amount)}
                    <span className="text-base font-medium ml-1.5" style={{ color: 'var(--subtle)' }}>USDC</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{t('jobFreelancerNet')}</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{netAmt} USDC</p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{t('jobPlatformFee')}</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                      {feeAmt} USDC <span className="font-normal text-[10px]">({Number(j.feeBpsAtCreation) / 100}%)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <PartyCard role="Client" addr={j.client} isMe={isClient} icon={<User className="size-3.5" />} youLabel={t('jobYou')} />
                <PartyCard role="Freelancer" addr={j.freelancer} isMe={isFreelancer} icon={<Briefcase className="size-3.5" />} youLabel={t('jobYou')} />
              </div>

              {/* Timeline */}
              <div className="rounded-2xl p-3.5 mb-4 space-y-1.5" style={{ background: 'var(--surface-muted)' }}>
                <TimeRow icon={<Calendar className="size-3.5" />} label={t('jobCreatedAt')} value={formatDate(j.createdAt)} />
                <TimeRow icon={<Clock className="size-3.5" />} label={t('jobAutoRelease')}
                  value={formatDate(j.autoReleaseAt)} readyLabel={t('jobAutoReleaseReady')}
                  highlight={isAutoReleaseReady && j.status <= 2} />
              </div>

              {/* TX confirmed link */}
              {txHash && (
                <a href={buildTxExplorerUrl(ARC_CHAIN_ID, txHash)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: 'var(--accent-hover)' }}>
                  <CheckCircle2 className="size-3.5" />
                  {t('jobTxConfirmed')}
                  <ArrowUpRight className="size-3" />
                </a>
              )}

              {/* Error */}
              {writeError && (
                <div className="rounded-2xl p-3 mb-4 flex items-start gap-2.5" style={{ background: 'rgba(200,60,40,0.08)' }}>
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" style={{ color: '#a03020' }} />
                  <p className="text-xs" style={{ color: '#a03020' }}>
                    {writeError.message.includes('user rejected') ? t('jobErrRejected')
                      : writeError.message.includes('DisputeWindowClosed') ? t('jobErrDisputeClosed')
                        : writeError.message.includes('AutoReleaseNotReady') ? t('jobErrAutoReleaseNotReady')
                          : t('jobErrGeneric')}
                  </p>
                </div>
              )}

              {/* Actions */}
              <ActionButtons
                status={j.status} isClient={isClient} isFreelancer={isFreelancer}
                isAutoReleaseReady={isAutoReleaseReady} isDisputeWindowOpen={isDisputeWindowOpen}
                isPending={isPending} isConfirming={isConfirming} isWrongChain={isWrongChain}
                onAction={handleAction} t={t}
              />

              {/* Security note */}
              <div className="rounded-2xl p-3 mt-4 flex items-start gap-2" style={{ background: 'var(--surface-muted)' }}>
                <Shield className="size-3.5 mt-0.5 shrink-0" style={{ color: 'var(--muted)' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>{t('jobSecurityNote')}</p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ActionButtons({ status, isClient, isFreelancer, isAutoReleaseReady, isDisputeWindowOpen, isPending, isConfirming, isWrongChain, onAction, t }: {
  status: number; isClient: boolean; isFreelancer: boolean
  isAutoReleaseReady: boolean; isDisputeWindowOpen: boolean
  isPending: boolean; isConfirming: boolean; isWrongChain: boolean
  onAction: (fn: ActionKey) => void; t: TFn
}) {
  const busy = isPending || isConfirming
  const busyLabel = isPending ? t('jobBusyWallet') : t('jobBusyArc')

  if (status >= 4) {
    return (
      <div className="rounded-2xl p-3.5 text-center text-sm font-semibold"
        style={{ background: status === 4 ? 'rgba(26,128,71,0.08)' : 'var(--surface-muted)', color: status === 4 ? 'var(--success)' : 'var(--muted)' }}>
        {status === 4 ? t('jobReleased') : t('jobRefunded')}
      </div>
    )
  }

  const actions: { label: string; fn: ActionKey; variant: 'primary' | 'ghost' | 'danger'; show: boolean }[] = [
    { label: t('jobActionMarkComplete'), fn: 'markComplete', variant: 'primary', show: isFreelancer && status === 1 },
    { label: t('jobActionRelease'), fn: 'release', variant: 'primary', show: isClient && (status === 1 || status === 2) },
    {
      label: `${t('jobActionAutoRelease')} ${isAutoReleaseReady ? t('jobActionAutoReleaseReady') : t('jobActionAutoReleaseNotReady')}`,
      fn: 'autoRelease', variant: 'ghost',
      show: !isClient && isAutoReleaseReady && (status === 1 || status === 2),
    },
    { label: t('jobActionDispute'), fn: 'openDispute', variant: 'danger', show: (isClient || isFreelancer) && isDisputeWindowOpen && (status === 1 || status === 2) },
  ]

  const visible = actions.filter(a => a.show)
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {busy && (
        <div className="flex items-center gap-2 rounded-2xl p-3 mb-1" style={{ background: 'rgba(18,45,69,0.05)' }}>
          <Loader2 className="size-4 animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>{busyLabel}</span>
        </div>
      )}
      {visible.map(a => (
        <button key={a.fn} onClick={() => onAction(a.fn)} disabled={busy}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
          style={a.variant === 'primary' ? { background: 'var(--accent)', color: 'white' }
            : a.variant === 'danger' ? { background: 'rgba(200,60,40,0.10)', color: '#a03020' }
              : { background: 'var(--surface-muted)', color: 'var(--ink-2)' }}>
          {a.label}
        </button>
      ))}
      {isWrongChain && (
        <p className="text-xs text-center font-medium" style={{ color: '#c47c00' }}>{t('jobWrongChain')}</p>
      )}
    </div>
  )
}

function PartyCard({ role, addr, isMe, icon, youLabel }: { role: string; addr: string; isMe: boolean; icon: React.ReactNode; youLabel: string }) {
  return (
    <div className="rounded-2xl p-3"
      style={{ background: isMe ? 'rgba(18,45,69,0.06)' : 'var(--surface-muted)', border: isMe ? '1.5px solid rgba(18,45,69,0.12)' : '1.5px solid transparent' }}>
      <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--muted)' }}>
        {icon}
        <span className="text-[10px] font-semibold tracking-wide uppercase">{role}</span>
        {isMe && (
          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: 'var(--accent)', color: 'white' }}>
            {youLabel}
          </span>
        )}
      </div>
      <a href={buildAddressExplorerUrl(ARC_CHAIN_ID, addr)} target="_blank" rel="noopener noreferrer"
        className="mono text-xs flex items-center gap-0.5 hover:opacity-70" style={{ color: 'var(--ink-2)' }}>
        {formatAddr(addr)}
        <ArrowUpRight className="size-2.5" />
      </a>
    </div>
  )
}

function TimeRow({ icon, label, value, highlight, readyLabel }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean; readyLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-semibold" style={{ color: highlight ? '#c47c00' : 'var(--ink-2)' }}>
        {value} {highlight && readyLabel}
      </span>
    </div>
  )
}
