/**
 * OnboardSheet — đăng ký / đăng nhập bằng passkey (Face ID / vân tay).
 * Hiển thị khi chưa có ví.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, LogIn, Loader2, Shield, Zap, DollarSign } from 'lucide-react'
import type { SmartAccount } from 'viem/account-abstraction'
import { registerPasskey, loginPasskey } from '@/wallet'

const spectral = 'linear-gradient(90deg,#5fbeff,#af8ff4,#f05c6b,#ffcd83,#7ef1b3)'

interface Props {
  onSuccess: (account: SmartAccount) => void
}

export default function OnboardSheet({ onSuccess }: Props) {
  const [mode, setMode] = useState<'landing' | 'register' | 'login'>('landing')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!username.trim()) { setError('Vui lòng nhập tên hiển thị'); return }
    setLoading(true); setError('')
    try {
      const account = await registerPasskey(username.trim())
      localStorage.setItem('subone_display_name', username.trim())
      onSuccess(account)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[SubOne] registerPasskey error:', e)
      if (msg.includes('cancelled') || msg.includes('NotAllowed')) {
        setError('Đã huỷ đăng ký passkey.')
      } else {
        setError(`Lỗi: ${msg.slice(0, 120)}`)
      }
    } finally { setLoading(false) }
  }

  async function handleLogin() {
    setLoading(true); setError('')
    try {
      const account = await loginPasskey()
      onSuccess(account)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[SubOne] loginPasskey error:', e)
      if (msg.includes('cancelled') || msg.includes('NotAllowed')) {
        setError('Đã huỷ đăng nhập.')
      } else {
        setError(`Lỗi: ${msg.slice(0, 120)}`)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-between px-4 py-10"
      style={{ background: 'var(--bg-gradient)' }}>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full gap-8">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--accent)' }}>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Space Grotesk' }}>S1</span>
          </div>
          <div>
            <h1 className="display text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              SubOne
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Nhận thanh toán quốc tế bằng USDC
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full">
          {[
            { icon: <Zap className="size-4" />, text: 'Xác nhận dưới 1 giây trên Arc Chain' },
            { icon: <DollarSign className="size-4" />, text: 'Phí dưới 1% — phí tính bằng USDC, không cần ETH' },
            { icon: <Shield className="size-4" />, text: 'Smart contract escrow — không ai giữ tiền của bạn' },
          ].map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent)' }}>{icon}</span>
              <span className="text-sm" style={{ color: 'var(--ink-2)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth area */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Spectral strip */}
        <div className="h-0.5 rounded-full mb-1" style={{ background: spectral }} />

        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.div key="landing"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3">
              <button
                onClick={() => setMode('register')}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', fontFamily: 'DM Sans' }}>
                <Fingerprint className="size-5" />
                Tạo ví bằng Passkey
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--surface-muted)', color: 'var(--ink)', fontFamily: 'DM Sans' }}>
                <LogIn className="size-5" />
                Đã có ví — Đăng nhập
              </button>
              <p className="text-center text-xs" style={{ color: 'var(--subtle)' }}>
                Ví tự quản — khoá passkey lưu trên thiết bị của bạn
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div key="register"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
                <input
                  className="w-full px-4 py-3.5 text-sm bg-white outline-none"
                  style={{ color: 'var(--ink)', fontFamily: 'DM Sans' }}
                  placeholder="Tên hiển thị (ví dụ: Nguyễn Văn A)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') void handleRegister() }}
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{error}</p>}
              <button
                onClick={() => void handleRegister()}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)', fontFamily: 'DM Sans' }}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Fingerprint className="size-5" />}
                {loading ? 'Đang đăng ký...' : 'Tạo ví bằng Passkey'}
              </button>
              <button onClick={() => { setMode('landing'); setError('') }}
                className="text-sm text-center" style={{ color: 'var(--subtle)' }}>
                Quay lại
              </button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div key="login"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3">
              {error && <p className="text-xs text-center" style={{ color: 'var(--danger)' }}>{error}</p>}
              <button
                onClick={() => { void handleLogin() }}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)', fontFamily: 'DM Sans' }}>
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Fingerprint className="size-5" />}
                {loading ? 'Đang xác thực...' : 'Đăng nhập bằng Passkey'}
              </button>
              <button onClick={() => { setMode('landing'); setError('') }}
                className="text-sm text-center" style={{ color: 'var(--subtle)' }}>
                Quay lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
