/**
 * WalletHome — màn hình chính sau khi kết nối ví.
 * Dùng wagmi useBalance + useDisconnect + i18n + theme toggle.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDisconnect, useBalance, useBlockNumber } from 'wagmi'
import {
  ArrowDownLeft, ArrowUpRight, Landmark, Shield,
  RefreshCw, LogOut, Copy, Check, ExternalLink,
  Sun, Moon, Languages,
} from 'lucide-react'
import { buildAddressExplorerUrl, getUsdc } from '@/onchain-facts'
import { formatUsdc } from '@/onchain-money'
import { useT, useLang, useTheme, type Lang } from '@/i18n'

import SendSheet from './SendSheet'
import ReceiveSheet from './ReceiveSheet'
import OffRampSheet from './OffRampSheet'
import EscrowDashboard from './EscrowDashboard'
import TxHistory from './TxHistory'

const ARC_CHAIN_ID = 5042002
const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'

interface Props {
  address: `0x${string}`
}

type Tab = 'wallet' | 'escrow'

export default function WalletHome({ address }: Props) {
  const { disconnect } = useDisconnect()
  const t = useT()
  const { lang, setLang } = useLang()
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState<Tab>('wallet')
  const [copied, setCopied] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)
  const [showOffRamp, setShowOffRamp] = useState(false)

  const usdcToken = getUsdc(ARC_CHAIN_ID)
  const { data: balData, refetch } = useBalance({
    address,
    token: usdcToken?.address as `0x${string}` | undefined,
    chainId: ARC_CHAIN_ID,
  })
  const { data: blockNum } = useBlockNumber({ watch: true, chainId: ARC_CHAIN_ID })
  useEffect(() => { void refetch() }, [blockNum, refetch])

  const balance = balData ? formatUsdc(balData.value) : '—'
  const displayName = localStorage.getItem('subone_display_name') ?? ''
  const explorerUrl = buildAddressExplorerUrl(ARC_CHAIN_ID, address)

  async function copyAddress() {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const actions = [
    { icon: <ArrowDownLeft className="size-5" />, label: t('receive'), action: () => setShowReceive(true), primary: true },
    { icon: <ArrowUpRight className="size-5" />, label: t('send'), action: () => setShowSend(true), primary: false },
    { icon: <Landmark className="size-5" />, label: t('offRamp'), action: () => setShowOffRamp(true), primary: false },
    { icon: <Shield className="size-5" />, label: t('escrow'), action: () => setTab('escrow'), primary: false },
  ]

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-2 flex items-center justify-between max-w-md mx-auto w-full">
        {/* Left: logo + address */}
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 shadow-md"
            style={{ background: 'var(--accent-gradient)', padding: '1.5px' }}>
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center">
              <img src="/Logo-SubOne.png" alt="SubOne"
                className="w-full h-full object-contain"
                onError={e => { (e.currentTarget).style.display = 'none' }} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {displayName || t('myWallet')}
            </p>
            <button onClick={() => void copyAddress()} className="flex items-center gap-1">
              <span className="mono text-xs" style={{ color: 'var(--subtle)' }}>
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
              {copied
                ? <Check className="size-3" style={{ color: 'var(--success)' }} />
                : <Copy className="size-3" style={{ color: 'var(--subtle)' }} />}
            </button>
          </div>
        </div>

        {/* Right: lang + theme + explorer + disconnect */}
        <div className="flex items-center gap-1.5">
          {/* Lang toggle */}
          <div className="flex items-center gap-0.5 rounded-full px-1 py-0.5"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
            <Languages className="size-3 mx-0.5" style={{ color: 'var(--subtle)' }} />
            {(['vi', 'en'] as Lang[]).map(l => (
              <button key={l}
                onClick={() => setLang(l)}
                className="px-2 py-0.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: lang === l ? 'var(--accent)' : 'transparent',
                  color: lang === l ? 'white' : 'var(--subtle)',
                }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Dark/light */}
          <button onClick={toggle} className="p-1.5 rounded-full"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
            {dark
              ? <Sun className="size-3.5" style={{ color: 'var(--subtle)' }} />
              : <Moon className="size-3.5" style={{ color: 'var(--subtle)' }} />}
          </button>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-full" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
            <ExternalLink className="size-3.5" style={{ color: 'var(--muted)' }} />
          </a>
          <button onClick={() => disconnect()} className="p-1.5 rounded-full"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
            <LogOut className="size-3.5" style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      {/* Hero balance card */}
      <div className="px-4 mt-3 max-w-md mx-auto w-full">
        <div className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'var(--accent-gradient)', boxShadow: '0 8px 40px rgba(13,45,107,0.30)' }}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: 'white' }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10" style={{ background: 'white' }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-widest opacity-70 text-white">{t('balance')}</span>
              <button onClick={() => { void refetch() }} className="p-1.5 rounded-full opacity-70 hover:opacity-100"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <RefreshCw className="size-3.5 text-white" />
              </button>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="display text-5xl font-bold text-white tabular-nums" style={{ letterSpacing: '-0.04em' }}>
                {balance}
              </span>
              <span className="text-lg font-medium text-white opacity-70">USDC</span>
            </div>
            <div className="h-0.5 rounded-full mt-3 opacity-30" style={{ background: spectral }} />
            <p className="text-xs mt-2 text-white opacity-60">{t('arcInfo')}</p>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="px-4 mt-4 max-w-md mx-auto w-full">
        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ icon, label, action, primary }) => (
            <motion.button key={label}
              whileTap={{ scale: 0.95 }}
              onClick={action}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{
                background: primary ? 'var(--accent-gradient)' : 'var(--surface)',
                border: primary ? 'none' : '1.5px solid var(--border)',
                color: primary ? 'white' : 'var(--ink-2)',
                boxShadow: primary ? '0 4px 16px rgba(13,45,107,0.30)' : 'none',
              }}>
              {icon}
              <span className="text-xs font-semibold">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="px-4 mt-5 max-w-md mx-auto w-full">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-muted)' }}>
          {([['wallet', t('history')], ['escrow', t('escrow')]] as [Tab, string][]).map(([tabKey, label]) => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === tabKey ? 'var(--surface-strong)' : 'transparent',
                color: tab === tabKey ? 'var(--ink)' : 'var(--muted)',
                boxShadow: tab === tabKey ? '0 1px 4px rgba(18,45,69,0.08)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 mt-3 pb-8 max-w-md mx-auto w-full">
        {tab === 'wallet' && <TxHistory address={address} chainId={ARC_CHAIN_ID} />}
        {tab === 'escrow' && <EscrowDashboard address={address} />}
      </div>

      {/* Sheets */}
      <SendSheet
        open={showSend}
        onClose={() => setShowSend(false)}
        address={address}
        balance={balance}
        onSuccess={() => { void refetch() }}
      />
      <ReceiveSheet
        open={showReceive}
        onClose={() => setShowReceive(false)}
        address={address}
        displayName={displayName}
      />
      <OffRampSheet open={showOffRamp} onClose={() => setShowOffRamp(false)} />
    </div>
  )
}
