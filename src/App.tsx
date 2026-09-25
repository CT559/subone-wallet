/**
 * SubOne — App root.
 * Landing: logo + features + ConnectKit button + lang/theme controls.
 * After connect: WalletHome.
 */
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Zap, DollarSign, Shield, Sun, Moon, Languages } from 'lucide-react'
import WalletHome from './components/WalletHome'
import { useT, useLang, useTheme, type Lang } from './i18n'

const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'

function TopBar() {
  const { lang, setLang } = useLang()
  const { dark, toggle } = useTheme()

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      {/* Language toggle */}
      <div className="flex items-center gap-1 rounded-full px-1 py-1"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
        <Languages className="size-3.5 mx-1" style={{ color: 'var(--subtle)' }} />
        {(['vi', 'en'] as Lang[]).map(l => (
          <button key={l}
            onClick={() => setLang(l)}
            className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: lang === l ? 'var(--accent)' : 'transparent',
              color: lang === l ? 'white' : 'var(--subtle)',
            }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {/* Dark/Light toggle */}
      <button
        onClick={toggle}
        className="p-2 rounded-full transition-all"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
        {dark
          ? <Sun className="size-4" style={{ color: 'var(--subtle)' }} />
          : <Moon className="size-4" style={{ color: 'var(--subtle)' }} />}
      </button>
    </div>
  )
}

function Landing() {
  const t = useT()

  const features = [
    { icon: <Zap className="size-4" />, text: t('feat1') },
    { icon: <DollarSign className="size-4" />, text: t('feat2') },
    { icon: <Shield className="size-4" />, text: t('feat3') },
  ]

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-between px-4 py-10"
      style={{ background: 'var(--bg-gradient)' }}>

      <TopBar />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full gap-8">
        <div className="flex flex-col items-center gap-3">
          {/* Logo — lớn, nổi bật */}
          <div className="w-36 h-36 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)', padding: '2px' }}>
            <div className="w-full h-full rounded-3xl overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/Logo-SubOne.png"
                alt="SubOne"
                className="w-full h-full object-contain"
                onError={e => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const fallback = el.nextElementSibling as HTMLElement | null
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <span className="hidden text-white font-bold text-3xl w-full h-full items-center justify-center"
                style={{ fontFamily: 'Space Grotesk', background: 'var(--accent-gradient)', display: 'none' }}>
                S1
              </span>
            </div>
          </div>
          <div>
            <h1 className="display text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              SubOne
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {t('tagline')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          {features.map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent)' }}>{icon}</span>
              <span className="text-sm" style={{ color: 'var(--ink-2)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connect area */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="h-0.5 rounded-full mb-1" style={{ background: spectral }} />

        <ConnectKitButton.Custom>
          {({ isConnected, show }) =>
            !isConnected ? (
              <button
                onClick={show}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'var(--accent-gradient)', fontFamily: 'DM Sans', boxShadow: '0 4px 20px rgba(26,58,143,0.35)' }}>
                {t('connectWallet')}
              </button>
            ) : null
          }
        </ConnectKitButton.Custom>

        <p className="text-center text-xs" style={{ color: 'var(--subtle)' }}>
          {t('walletSupport')}
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const { address, isConnected } = useAccount()
  if (!isConnected || !address) return <Landing />
  return <WalletHome address={address} />
}
