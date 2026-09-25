import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { AnimatePresence, motion } from 'framer-motion'
import { X, User, Edit3, Check, Copy, ExternalLink, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { buildAddressExplorerUrl } from '@/onchain-facts'

const spectral = 'linear-gradient(90deg, #5fbeff, #af8ff4, #f05c6b, #ffcd83, #7ef1b3)'
const springs = { sheet: { type: 'spring' as const, stiffness: 400, damping: 40 } }

const ARC_TESTNET_CHAIN_ID = 5042002

export interface ProfileData {
  displayName: string
  bio: string
  slug: string
  avatarColor: string
}

const AVATAR_COLORS = [
  '#122d45', '#1061a6', '#1a8047', '#ba2b4c',
  '#7c3aed', '#b45309', '#0891b2', '#be185d',
]

const DEFAULT_PROFILE: ProfileData = {
  displayName: '',
  bio: '',
  slug: '',
  avatarColor: '#122d45',
}

const STORAGE_KEY = 'subone_profile'

export function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ProfileData
  } catch {
    // ignore
  }
  return DEFAULT_PROFILE
}

function saveProfile(p: ProfileData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

interface Props {
  open: boolean
  onClose: () => void
  onUpdate: (p: ProfileData) => void
}

export default function ProfileSheet({ open, onClose, onUpdate }: Props) {
  const { address } = useAccount()
  const [profile, setProfile] = useState<ProfileData>(loadProfile)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileData>(profile)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const slugRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      const loaded = loadProfile()
      setProfile(loaded)
      setDraft(loaded)
      setEditing(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [open])

  const slugValue = draft.slug || (address ? address.slice(2, 10).toLowerCase() : '')
  const paymentLink = `subone.app/${slugValue}`
  const explorerUrl = address ? buildAddressExplorerUrl(ARC_TESTNET_CHAIN_ID, address) : undefined

  const initials = draft.displayName
    ? draft.displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : address?.slice(2, 4).toUpperCase() ?? '??'

  function handleSave() {
    const updated = { ...draft, slug: slugValue }
    setProfile(updated)
    saveProfile(updated)
    onUpdate(updated)
    setEditing(false)
    toast.success('Đã lưu hồ sơ')
  }

  function copyLink() {
    void navigator.clipboard.writeText(`https://${paymentLink}`).then(() => {
      setCopiedSlug(true)
      toast.success('Đã sao chép payment link')
      setTimeout(() => setCopiedSlug(false), 2000)
    })
  }

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
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  Hồ sơ của bạn
                </h2>
                <div className="flex items-center gap-2">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: 'var(--surface-muted)', color: 'var(--ink-2)' }}
                    >
                      <Edit3 className="size-3" /> Chỉnh sửa
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-80"
                      style={{ background: 'var(--success)' }}
                    >
                      <Check className="size-3" /> Lưu
                    </button>
                  )}
                  <button onClick={onClose} className="rounded-full p-1.5 hover:opacity-60 transition-opacity">
                    <X className="size-4" style={{ color: 'var(--subtle)' }} />
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <div
                    className="flex size-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
                    style={{ background: editing ? draft.avatarColor : profile.avatarColor }}
                  >
                    {initials}
                  </div>
                  {editing && (
                    <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full"
                      style={{ background: 'var(--accent)' }}>
                      <Camera className="size-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Color picker */}
                {editing && (
                  <div className="flex gap-2 mb-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setDraft((d) => ({ ...d, avatarColor: c }))}
                        className="size-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: c,
                          outline: draft.avatarColor === c ? `2px solid ${c}` : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-3 mb-5">
                <Field
                  label="Tên hiển thị"
                  value={editing ? draft.displayName : profile.displayName}
                  placeholder="Nguyễn Văn An"
                  editing={editing}
                  onChange={(v) => setDraft((d) => ({ ...d, displayName: v }))}
                />
                <Field
                  label="Giới thiệu ngắn"
                  value={editing ? draft.bio : profile.bio}
                  placeholder="Full-stack dev · React · 5 năm kinh nghiệm"
                  editing={editing}
                  onChange={(v) => setDraft((d) => ({ ...d, bio: v }))}
                />
                <div>
                  <label className="text-xs font-semibold mb-1.5 block tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
                    Link nhận tiền
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3"
                    style={
                      editing
                        ? { background: 'rgba(255,255,255,0.46)', border: '1px solid rgba(255,255,255,0.56)' }
                        : { background: 'var(--surface-muted)' }
                    }
                  >
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>subone.app/</span>
                    {editing ? (
                      <input
                        ref={slugRef}
                        value={draft.slug}
                        onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                        placeholder={address?.slice(2, 10).toLowerCase() ?? 'tên-của-bạn'}
                        className="flex-1 bg-transparent text-sm font-semibold outline-none"
                        style={{ color: 'var(--ink)' }}
                      />
                    ) : (
                      <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                        {slugValue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment link card */}
              <div
                className="rounded-2xl p-4 mb-5"
                style={{
                  background: 'rgba(255,255,255,0.64)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.68)',
                }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>
                  Link gửi cho client
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>
                    {paymentLink}
                  </p>
                  <button
                    onClick={copyLink}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {copiedSlug ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copiedSlug ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: 'var(--subtle)' }}>
                  Client mở link này để biết địa chỉ USDC và gửi tiền
                </p>
              </div>

              {/* Wallet address */}
              {address && (
                <div className="rounded-xl px-4 py-3 mb-5" style={{ background: 'var(--surface-muted)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Địa chỉ ví Arc</p>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-[10px] transition-opacity hover:opacity-70"
                        style={{ color: 'var(--accent-hover)' }}
                      >
                        ArcScan <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="mono text-xs mt-1 truncate" style={{ color: 'var(--ink-2)' }}>{address}</p>
                </div>
              )}

              {/* Identity note */}
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2"
                style={{ background: 'var(--surface-muted)' }}
              >
                <User className="size-3.5 mt-0.5 shrink-0" style={{ color: 'var(--muted)' }} />
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Hồ sơ lưu trên thiết bị của bạn. Tên hiển thị và link giúp client xác nhận
                  đúng địa chỉ ví trước khi gửi tiền — thay thế cho địa chỉ 0x dài khó nhớ.
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  label, value, placeholder, editing, onChange,
}: {
  label: string; value: string; placeholder: string;
  editing: boolean; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <div
        className="rounded-2xl px-4 py-3"
        style={
          editing
            ? { background: 'rgba(255,255,255,0.46)', border: '1px solid rgba(255,255,255,0.56)' }
            : { background: 'var(--surface-muted)' }
        }
      >
        {editing ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-300"
            style={{ color: 'var(--ink)' }}
          />
        ) : (
          <p className="text-sm font-medium" style={{ color: value ? 'var(--ink)' : 'var(--subtle)' }}>
            {value || placeholder}
          </p>
        )}
      </div>
    </div>
  )
}
