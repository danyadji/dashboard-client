import { useState } from 'react'
import { useMe, useMutationApiNoInvalidate, useLogout, api } from '../hooks.js'
import { ADMIN_WA } from '../lib/kontak.js'
import { decodeHtml } from '../lib/decode.js'
import PasswordChangeSheet from '../components/PasswordChangeSheet.jsx'
import BantuanSheet from '../components/BantuanSheet.jsx'
import LogoutConfirmSheet from '../components/LogoutConfirmSheet.jsx'

function formatTanggal(v) {
  if (!v) return null
  const d = new Date(v)
  if (isNaN(d)) return v
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function getInitials(name) {
  if (!name) return 'CD'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Pengaturan() {
  const me = useMe()
  const logout = useLogout()

  // Sheet states
  const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  const [showPwSheet, setShowPwSheet] = useState(false)
  const [showBantuanSheet, setShowBantuanSheet] = useState(false)
  const [pwFeedback, setPwFeedback] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Password mutation handler
  const savePw = useMutationApiNoInvalidate(
    ({ oldPw, newPw }) =>
      api('/me/password', {
        method: 'PUT',
        body: { old_password: oldPw, new_password: newPw },
      }),
    {
      onSuccess: () => {
        setPwFeedback({
          type: 'success',
          text: 'Password berhasil diperbarui. Mengalihkan ke login...',
        })
        setTimeout(() => {
          setShowPwSheet(false)
          logout.logout()
        }, 1500)
      },
      onError: (e) => {
        setPwFeedback({
          type: 'danger',
          text: e.message || 'Gagal mengubah password. Cek kembali password lama Anda.',
        })
      },
    }
  )

  const handlePasswordSubmit = ({ oldPw, newPw }) => {
    setPwFeedback(null)
    savePw.mutate({ oldPw, newPw })
  }

  // Loading skeleton state
  if (me.isLoading) {
    return (
      <div className="space-y-4 pb-6">
        {/* Header Skeleton */}
        <div className="py-2">
          <div className="h-6 w-24 bg-border/60 rounded-md animate-pulse mb-1.5" />
          <div className="h-4 w-44 bg-border/40 rounded-md animate-pulse" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="bg-surface rounded-[20px] border border-border p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-border/60 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-border/60 rounded-md animate-pulse" />
            <div className="h-3.5 w-48 bg-border/40 rounded-md animate-pulse" />
            <div className="h-5 w-24 bg-border/40 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Info Akun Skeleton */}
        <div className="bg-surface rounded-[20px] border border-border p-4 shadow-sm space-y-3">
          <div className="h-4 w-24 bg-border/60 rounded-md animate-pulse mb-3" />
          <div className="h-4 w-full bg-border/40 rounded-md animate-pulse" />
          <div className="h-4 w-full bg-border/40 rounded-md animate-pulse" />
          <div className="h-4 w-full bg-border/40 rounded-md animate-pulse" />
        </div>

        {/* Menu Skeleton */}
        <div className="bg-surface rounded-[20px] border border-border p-4 shadow-sm space-y-3">
          <div className="h-4 w-36 bg-border/60 rounded-md animate-pulse mb-3" />
          <div className="h-12 w-full bg-border/30 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-border/30 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-border/30 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const u = me.data?.undangan
  const user = me.data?.user

  // Formatted data
  const displayName = decodeHtml(user?.display_name || 'Client Demo')
  const emailOrLogin = user?.user_email || user?.user_login || 'client_demo@diamora.test'
  const coupleName = decodeHtml(u?.judul || u?.mempelai || 'Danu & Fifi')
  const eventDateFormatted = formatTanggal(u?.event_date)
  const initials = getInitials(displayName)

  const kontakPrefill = `Halo Diamora, saya client atas nama ${displayName} (undangan ${coupleName}). Saya butuh bantuan soal: `
  const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(kontakPrefill)}`

  return (
    <div className="space-y-4 pb-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-text-primary px-4 py-2 text-xs font-medium text-white shadow-lg transition-all">
          {toastMsg}
        </div>
      )}

      {/* Header (Matching Reference: Profil, Subtitle: Client Demo • Danu & Fifi) */}
      <header className="pt-1 pb-1">
        <h1 className="text-[21px] font-bold tracking-tight text-text-primary leading-tight">
          Profil
        </h1>
        <p className="text-xs text-text-secondary mt-0.5 font-medium">
          {displayName} • {coupleName}
        </p>
      </header>

      {/* 1. Profile Summary Card */}
      <div className="bg-surface rounded-[20px] border border-border p-4 flex items-center gap-3.5 shadow-sm">
        {/* Circular Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary-tint text-primary font-bold text-lg flex items-center justify-center shrink-0 tracking-wider">
          {initials}
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-text-primary leading-tight truncate">
            {displayName}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 truncate">
            {emailOrLogin}
          </p>

          {/* Couple Pill with Heart Icon */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-tint text-primary text-[11px] font-semibold">
            <svg className="w-3 h-3 fill-primary shrink-0" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="truncate">{coupleName}</span>
          </div>
        </div>
      </div>

      {/* 2. "INFO AKUN" Card */}
      <div className="bg-surface rounded-[20px] border border-border p-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary tracking-wider uppercase mb-3">
          INFO AKUN
        </h3>
        <dl className="divide-y divide-border/60 text-sm">
          {/* Row: Nama undangan */}
          <div className="flex items-center justify-between py-2.5 first:pt-0">
            <dt className="text-text-secondary text-sm">Nama undangan</dt>
            <dd className="font-semibold text-text-primary text-right max-w-[60%] truncate">
              {coupleName}
            </dd>
          </div>

          {/* Row: Tanggal acara */}
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-secondary text-sm">Tanggal acara</dt>
            <dd className="text-right">
              {eventDateFormatted ? (
                <span className="font-semibold text-text-primary">
                  {eventDateFormatted}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-text-secondary text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  Belum diatur
                </span>
              )}
            </dd>
          </div>

          {/* Row: Email */}
          <div className="flex items-center justify-between py-2.5 last:pb-0">
            <dt className="text-text-secondary text-sm">Email</dt>
            <dd className="font-semibold text-text-primary text-right break-all max-w-[65%]">
              {emailOrLogin}
            </dd>
          </div>
        </dl>
      </div>

      {/* 3. "PENGATURAN & LAYANAN" Card */}
      <div className="bg-surface rounded-[20px] border border-border p-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary tracking-wider uppercase mb-1">
          PENGATURAN &amp; LAYANAN
        </h3>

        <div className="divide-y divide-border/60">
          {/* Menu Item 1: Ganti Password */}
          <button
            type="button"
            onClick={() => {
              setPwFeedback(null)
              setShowPwSheet(true)
            }}
            className="w-full min-h-[56px] py-2.5 flex items-center justify-between text-left group active:bg-surface-muted/50 rounded-xl px-1 -mx-1 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  Ganti Password
                </p>
                <p className="text-xs text-text-secondary truncate">
                  Perbarui password akun Anda
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Menu Item 2: Bantuan & Panduan */}
          <button
            type="button"
            onClick={() => setShowBantuanSheet(true)}
            className="w-full min-h-[56px] py-2.5 flex items-center justify-between text-left group active:bg-surface-muted/50 rounded-xl px-1 -mx-1 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  Bantuan &amp; Panduan
                </p>
                <p className="text-xs text-text-secondary truncate">
                  Cara kirim undangan, RSVP, dan FAQ
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Menu Item 3: Hubungi Admin */}
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full min-h-[56px] py-2.5 flex items-center justify-between text-left group active:bg-surface-muted/50 rounded-xl px-1 -mx-1 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#E7F8ED] text-wa-green flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.838 11.838 0 005.71 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  Hubungi Admin
                </p>
                <p className="text-xs text-text-secondary truncate">
                  Tanya lewat WhatsApp
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* 4. "Keluar" Outline Button */}
      <button
        type="button"
        onClick={() => setShowLogoutSheet(true)}
        className="w-full h-[52px] rounded-[16px] bg-surface border border-border flex items-center justify-center gap-2 text-danger font-semibold text-sm shadow-xs hover:bg-danger-tint/40 active:scale-[0.99] transition-all"
      >
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Keluar</span>
      </button>

      {/* 5. Footer Caption */}
      <p className="pt-2 pb-4 text-center text-xs text-text-tertiary">
        Diamora Invitation • Dashboard Client v1
      </p>

      {/* Bottom Sheet Modals */}
      <PasswordChangeSheet
        isOpen={showPwSheet}
        onClose={() => setShowPwSheet(false)}
        onSubmit={handlePasswordSubmit}
        isPending={savePw.isPending}
        feedback={pwFeedback}
        onClearFeedback={() => setPwFeedback(null)}
      />

      <BantuanSheet
        isOpen={showBantuanSheet}
        onClose={() => setShowBantuanSheet(false)}
        adminWa={ADMIN_WA}
        kontakText={kontakPrefill}
      />

      <LogoutConfirmSheet
        isOpen={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
        onConfirm={logout.logout}
      />
    </div>
  )
}
