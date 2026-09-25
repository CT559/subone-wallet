/**
 * EscrowDashboard — jobs escrow của freelancer và client.
 */
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { SUBONE_ESCROW, JOB_STATUS_LABEL, JOB_STATUS_COLOR, JOB_STATUS_TEXT } from '@/contracts'
import { useT } from '@/i18n'
import CreateJobSheet from './CreateJobSheet'
import JobDetailSheet from './JobDetailSheet'

const ARC_CHAIN_ID = 5042002
const RENDER_TIME_SEC = Math.floor(Date.now() / 1000)

function formatAddr(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}` }
function formatAmount(raw: bigint) { return Amount.fromRaw(raw, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2) }

interface Props { address: string }

export default function EscrowDashboard({ address }: Props) {
  const t = useT()
  const [tab, setTab] = useState<'freelancer' | 'client'>('freelancer')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const usdcFact = getUsdc(ARC_CHAIN_ID)!

  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: usdcFact.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: ARC_CHAIN_ID,
  })

  const { data: freelancerJobIds, refetch: refetchFreelancer } = useReadContract({
    address: SUBONE_ESCROW.address,
    abi: SUBONE_ESCROW.abi,
    functionName: 'getJobsByFreelancer',
    args: [address as `0x${string}`],
    chainId: ARC_CHAIN_ID,
  })

  const { data: clientJobIds, refetch: refetchClient } = useReadContract({
    address: SUBONE_ESCROW.address,
    abi: SUBONE_ESCROW.abi,
    functionName: 'getJobsByClient',
    args: [address as `0x${string}`],
    chainId: ARC_CHAIN_ID,
  })

  function refresh() {
    setRefreshKey(k => k + 1)
    void refetchBalance()
    void refetchFreelancer()
    void refetchClient()
  }

  const balanceFormatted = usdcBalance
    ? Amount.fromRaw(usdcBalance, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2)
    : '—'

  const activeJobIds = (tab === 'freelancer'
    ? (freelancerJobIds as bigint[] | undefined)
    : (clientJobIds as bigint[] | undefined)) ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>ESCROW USDC</p>
          <p className="tabular-nums text-sm font-bold" style={{ color: 'var(--ink)' }}>
            {balanceFormatted} <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>{t('escrowAvailable')}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="p-2 rounded-xl" style={{ background: 'var(--surface-muted)' }}>
            <RefreshCw className="size-4" style={{ color: 'var(--muted)' }} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}>
            <Plus className="size-4" />
            {t('escrowCreateJob')}
          </button>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: 'var(--surface-muted)' }}>
        {(['freelancer', 'client'] as const).map((tabKey) => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === tabKey ? 'white' : 'transparent',
              color: tab === tabKey ? 'var(--ink)' : 'var(--muted)',
              boxShadow: tab === tabKey ? '0 1px 4px rgba(18,45,69,0.08)' : 'none',
            }}>
            {tabKey === 'freelancer' ? t('escrowTabReceive') : t('escrowTabPay')}
          </button>
        ))}
      </div>

      {/* Job list */}
      {activeJobIds.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            {tab === 'freelancer' ? t('escrowEmptyFreelancer') : t('escrowEmptyClient')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
            {tab === 'freelancer' ? t('escrowEmptyHintFreelancer') : t('escrowEmptyHintClient')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...activeJobIds].reverse().map((jobId) => (
            <JobCard
              key={`${String(jobId)}-${refreshKey}`}
              jobId={jobId}
              tab={tab}
              onSelect={() => setSelectedJobId(jobId)}
            />
          ))}
        </div>
      )}

      {/* Sheets */}
      <CreateJobSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        address={address}
        onSuccess={() => { setShowCreate(false); refresh() }}
      />
      {selectedJobId !== null && (
        <JobDetailSheet
          open={selectedJobId !== null}
          onClose={() => setSelectedJobId(null)}
          jobId={selectedJobId}
          viewerAddress={address}
          onAction={() => { setSelectedJobId(null); refresh() }}
        />
      )}
    </div>
  )
}

function JobCard({ jobId, tab, onSelect }: { jobId: bigint; tab: 'freelancer' | 'client'; onSelect: () => void }) {
  const t = useT()
  const { data: job } = useReadContract({
    address: SUBONE_ESCROW.address,
    abi: SUBONE_ESCROW.abi,
    functionName: 'getJob',
    args: [jobId],
    chainId: ARC_CHAIN_ID,
  })

  if (!job) {
    return <div className="rounded-2xl px-4 py-3.5 animate-pulse" style={{ background: 'var(--surface-muted)', height: 72 }} />
  }

  const j = job as {
    jobId: bigint; client: string; freelancer: string
    amount: bigint; createdAt: bigint; autoReleaseAt: bigint
    status: number; description: string; paymentRef: string; feeBpsAtCreation: bigint
  }

  const statusKey = JOB_STATUS_LABEL[j.status]
  const amountFormatted = formatAmount(j.amount)
  const counterparty = tab === 'freelancer' ? j.client : j.freelancer
  const isAutoReleaseReady = RENDER_TIME_SEC >= Number(j.autoReleaseAt)

  return (
    <motion.button
      onClick={onSelect}
      className="w-full rounded-2xl px-4 py-3.5 text-left transition-all hover:shadow-md active:scale-[0.99]"
      style={{
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.80)',
        boxShadow: '0 2px 8px rgba(18,45,69,0.05)',
      }}
      whileTap={{ scale: 0.98 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
            {j.description || `Job #${String(j.jobId)}`}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] mono" style={{ color: 'var(--muted)' }}>
              {formatAddr(counterparty)}
            </span>
            {isAutoReleaseReady && j.status <= 2 && (
              <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#c47c00' }}>
                <Clock className="size-2.5" /> Auto-release
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="tabular-nums text-sm font-bold" style={{ color: 'var(--ink)' }}>
            {amountFormatted} <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>USDC</span>
          </span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: JOB_STATUS_COLOR[statusKey], color: JOB_STATUS_TEXT[statusKey] }}>
            {statusKey}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(18,45,69,0.06)' }}>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--subtle)' }}>
          {tab === 'freelancer' ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
          {tab === 'freelancer' ? t('escrowDirIn') : t('escrowDirOut')}
        </div>
        <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>Job #{String(j.jobId)}</span>
      </div>
    </motion.button>
  )
}
