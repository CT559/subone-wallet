import { useEffect, useState } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { arcTestnet } from 'viem/chains'
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'

const CHAIN_ID = arcTestnet.id
const usdcFact = getUsdc(CHAIN_ID)!

interface TxEvent {
  type: 'in' | 'out'
  from: string
  to: string
  value: bigint
  hash: string
  blockNumber: bigint
}

const glass = {
  inner: {
    background: 'rgba(255,255,255,0.46)',
    border: '1px solid rgba(255,255,255,0.56)',
  } as React.CSSProperties,
}

function formatAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatAmt(value: bigint): string {
  return Amount.fromRaw(value, usdcDecimalsFor(CHAIN_ID)).toFixed(2)
}

export default function HistoryList({ address }: { address: string | undefined }) {
  const [events, setEvents] = useState<TxEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    let cancelled = false
    // Reset state before starting fetch
    const timer = setTimeout(() => {
      if (!cancelled) {
        setLoading(true)
        setEvents([])
      }
    }, 0)

    const client = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    async function fetchLogs() {
      try {
        // Fetch sent (Transfer from address)
        const [sent, received] = await Promise.all([
          client.getLogs({
            address: usdcFact.address as `0x${string}`,
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            args: { from: address as `0x${string}` },
            fromBlock: 'earliest',
            toBlock: 'latest',
          }),
          client.getLogs({
            address: usdcFact.address as `0x${string}`,
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            args: { to: address as `0x${string}` },
            fromBlock: 'earliest',
            toBlock: 'latest',
          }),
        ])

        if (cancelled) return

        const combined: TxEvent[] = [
          ...sent
            .filter((log) => log.args.from && log.args.to && log.args.value !== undefined)
            .map((log) => ({
              type: 'out' as const,
              from: log.args.from!,
              to: log.args.to!,
              value: log.args.value!,
              hash: log.transactionHash ?? '',
              blockNumber: log.blockNumber ?? 0n,
            })),
          ...received
            .filter((log) => log.args.from && log.args.to && log.args.value !== undefined)
            .map((log) => ({
              type: 'in' as const,
              from: log.args.from!,
              to: log.args.to!,
              value: log.args.value!,
              hash: log.transactionHash ?? '',
              blockNumber: log.blockNumber ?? 0n,
            })),
        ]
          .filter((e) => e.from.toLowerCase() !== e.to.toLowerCase()) // exclude self-transfers
          .sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))
          .slice(0, 20)

        setEvents(combined)
      } catch {
        // Network or RPC issue — silent fail, show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchLogs()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [address])

  if (!address) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>Lịch sử giao dịch</h3>
        {loading && (
          <div className="size-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--subtle)', borderTopColor: 'transparent' }} />
        )}
      </div>

      {!loading && events.length === 0 && (
        <div className="rounded-2xl p-6 text-center" style={glass.inner}>
          <ArrowDownLeft className="size-8 mx-auto mb-2" style={{ color: 'var(--subtle)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink-2)' }}>Chưa có giao dịch</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Nhận USDC đầu tiên từ client của bạn
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={glass.inner}>
          {events.map((ev, i) => (
            <div
              key={`${ev.hash}-${ev.type}-${i}`}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderTop: i > 0 ? '1px solid rgba(18,45,69,0.06)' : 'none',
              }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: ev.type === 'in' ? 'rgba(26,128,71,0.12)' : 'rgba(186,43,76,0.10)',
                }}
              >
                {ev.type === 'in'
                  ? <ArrowDownLeft className="size-4" style={{ color: 'var(--success)' }} />
                  : <ArrowUpRight className="size-4" style={{ color: 'var(--danger)' }} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                  {ev.type === 'in' ? 'Nhận từ' : 'Gửi đến'}
                </p>
                <p className="mono text-[11px] truncate" style={{ color: 'var(--subtle)' }}>
                  {ev.type === 'in' ? formatAddr(ev.from) : formatAddr(ev.to)}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: ev.type === 'in' ? 'var(--success)' : 'var(--ink)' }}
                >
                  {ev.type === 'in' ? '+' : '-'}${formatAmt(ev.value)}
                </p>
                <a
                  href={buildTxExplorerUrl(CHAIN_ID, ev.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] transition-opacity hover:opacity-70"
                  style={{ color: 'var(--subtle)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
