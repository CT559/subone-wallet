/**
 * TxHistory — on-chain USDC Transfer history. Fully i18n.
 */
import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { createPublicClient, http } from 'viem'
import { arcTestnet } from 'viem/chains'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { useT } from '@/i18n'

const ARC_RPC = 'https://rpc.testnet.arc.io'
const client = createPublicClient({ chain: arcTestnet, transport: http(ARC_RPC) })

interface TxEntry { hash: string; from: string; to: string; value: string; dir: 'in' | 'out' }
interface Props { address: `0x${string}`; chainId: number }

export default function TxHistory({ address, chainId }: Props) {
  const t = useT()
  const [txList, setTxList] = useState<TxEntry[]>([])

  useEffect(() => {
    const usdcToken = getUsdc(chainId)
    if (!usdcToken) return
    const usdcAddr = usdcToken.address as `0x${string}`
    const addr = address.toLowerCase() as `0x${string}`
    const transferEvent = {
      type: 'event' as const,
      name: 'Transfer',
      inputs: [
        { name: 'from',  type: 'address' as const, indexed: true },
        { name: 'to',    type: 'address' as const, indexed: true },
        { name: 'value', type: 'uint256' as const, indexed: false },
      ],
    }
    async function load() {
      try {
        const [inLogs, outLogs] = await Promise.all([
          client.getLogs({ address: usdcAddr, event: transferEvent, args: { to: addr },   fromBlock: 'earliest', toBlock: 'latest' }),
          client.getLogs({ address: usdcAddr, event: transferEvent, args: { from: addr }, fromBlock: 'earliest', toBlock: 'latest' }),
        ])
        const toEntry = (dir: 'in' | 'out') => (l: typeof inLogs[0]): TxEntry => ({
          hash:  l.transactionHash ?? '',
          from:  (l.args as { from?: string }).from  ?? '',
          to:    (l.args as { to?: string }).to      ?? '',
          value: Amount.fromRaw((l.args as { value?: bigint }).value ?? 0n, usdcDecimalsFor(chainId)).toFixed(2),
          dir,
        })
        setTxList([...inLogs.map(toEntry('in')), ...outLogs.map(toEntry('out'))].slice(0, 20))
      } catch { /* ignore */ }
    }
    void load()
  }, [address, chainId])

  if (txList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{ background: 'var(--surface-muted)' }}>
          <ArrowDownLeft className="size-5" style={{ color: 'var(--subtle)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{t('noTx')}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>{t('noTxHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {txList.map(tx => (
        <a key={tx.hash}
          href={`https://explorer.testnet.arc.io/tx/${tx.hash}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 no-underline block"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: tx.dir === 'in' ? 'rgba(0,180,148,0.12)' : 'rgba(186,43,76,0.1)' }}>
            {tx.dir === 'in'
              ? <ArrowDownLeft className="size-4" style={{ color: 'var(--success)' }} />
              : <ArrowUpRight  className="size-4" style={{ color: 'var(--danger)' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              {tx.dir === 'in' ? t('txIn') : t('txOut')}
            </p>
            <p className="mono text-xs truncate" style={{ color: 'var(--subtle)' }}>
              {tx.dir === 'in'
                ? `${tx.from.slice(0, 6)}…${tx.from.slice(-4)}`
                : `${tx.to.slice(0, 6)}…${tx.to.slice(-4)}`}
            </p>
          </div>
          <span className="tabular-nums text-sm font-bold"
            style={{ color: tx.dir === 'in' ? 'var(--success)' : 'var(--danger)' }}>
            {tx.dir === 'in' ? '+' : '-'}{tx.value} USDC
          </span>
        </a>
      ))}
    </div>
  )
}
