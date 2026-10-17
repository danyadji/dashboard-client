import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMe, useStats, useGuests } from '../hooks.js'
import { decodeHtml } from '../lib/decode.js'

export default function Home() {
  const nav = useNavigate()
  const me = useMe()
  const stats = useStats()
  const guestsQuery = useGuests({ per_page: 5 })
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2000)
  }

  const u = me.data?.undangan
  const s = stats.data || {}
  const guests = guestsQuery.data?.guests || guestsQuery.data?.items || []

  const linkUmum = u?.link_umum || ''
  const mempelaiNama = decodeHtml(u?.mempelai || u?.judul || 'Danu & Fifi')

  // Format date helper
  const eventDateFormatted = useMemo(() => {
    if (!u?.event_date) return null
    const target = new Date(u.event_date.replace(' ', 'T'))
    if (Number.isNaN(target.getTime())) return null
    return target.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [u?.event_date])

  // Countdown calculation
  const countdownInfo = useMemo(() => {
    if (!u?.event_date) return { status: 'missing' }
    const target = new Date(u.event_date.replace(' ', 'T'))
    if (Number.isNaN(target.getTime())) return { status: 'missing' }
    const diff = Math.ceil((target - Date.now()) / 86_400_000)
    if (diff < 0) return { status: 'passed' }
    return { status: 'active', days: diff }
  }, [u?.event_date])

  // RSVP Calculation
  const totalTamu = s.total_tamu ?? 0
  const hadir = s.hadir ?? 0
  const tidakHadir = s.tidak_hadir ?? 0
  const ragu = s.ragu ?? 0
  const belumRespon = s.belum_respon ?? Math.max(0, totalTamu - hadir - tidakHadir - ragu)
  const totalRespon = hadir + tidakHadir + ragu

  const totalPercent = totalTamu > 0 ? Math.round((totalRespon / totalTamu) * 100) : 0
  const hadirPercent = totalTamu > 0 ? Math.round((hadir / totalTamu) * 100) : 0
  const belumPercent = totalTamu > 0 ? Math.round((belumRespon / totalTamu) * 100) : 0
  const tidakHadirPercent = totalTamu > 0 ? Math.round((tidakHadir / totalTamu) * 100) : 0

  async function copyLink() {
    if (!linkUmum) return
    try {
      await navigator.clipboard.writeText(linkUmum)
      showToast('Link undangan berhasil disalin')
    } catch {
      showToast('Gagal menyalin link')
    }
  }

  function shareWa() {
    if (!linkUmum) return
    const text = `Undangan Pernikahan ${mempelaiNama}:\n\n${linkUmum}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function openLink() {
    if (!linkUmum) return
    window.open(linkUmum, '_blank')
  }

  // Display URL without protocol for cleaner UI
  const displayUrl = linkUmum ? linkUmum.replace(/^https?:\/\//, '') : 'diamora.com/undangan'

  // Loading skeleton state
  if (me.isLoading || stats.isLoading) {
    return (
      <div className="space-y-4 pt-2 animate-pulse">
        <div className="flex justify-between items-center h-12">
          <div className="h-6 w-32 bg-surface-muted rounded-md" />
          <div className="h-9 w-9 bg-surface-muted rounded-full" />
        </div>
        <div className="h-32 bg-surface-muted rounded-[24px]" />
        <div className="h-36 bg-surface-muted rounded-[20px]" />
        <div className="h-44 bg-surface-muted rounded-[20px]" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6 antialiased">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg transition-all">
          {toastMsg}
        </div>
      )}

      {/* 1. App Bar Header */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Subtle flower/mandala icon */}
          <div className="w-7 h-7 rounded-full bg-primary-tint flex items-center justify-center text-primary">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 4.7 13.6 5.3 13 5.7V8.1C14.8 8.5 16.3 9.7 17 11.3C18.6 10.6 20.6 11.3 21.4 12.9C22.1 14.5 21.4 16.5 19.8 17.3C19.3 17.5 18.7 17.5 18.2 17.3C17.3 18.9 15.5 20 13.5 20H13V20.3C13.6 20.7 14 21.3 14 22C14 23.1 13.1 24 12 24C10.9 24 10 23.1 10 22C10 21.3 10.4 20.7 11 20.3V20H10.5C8.5 20 6.7 18.9 5.8 17.3C5.3 17.5 4.7 17.5 4.2 17.3C2.6 16.5 1.9 14.5 2.6 12.9C3.4 11.3 5.4 10.6 7 11.3C7.7 9.7 9.2 8.5 11 8.1V5.7C10.4 5.3 10 4.7 10 4C10 2.9 10.9 2 12 2Z" />
            </svg>
          </div>
          <h1 className="text-[19px] font-bold text-text-primary tracking-tight">Beranda</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell icon button */}
          <button
            type="button"
            onClick={() => showToast('Belum ada notifikasi baru')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-muted transition-colors relative"
            aria-label="Notifikasi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* User profile avatar icon */}
          <button
            type="button"
            onClick={() => nav('/pengaturan')}
            className="w-9 h-9 rounded-full bg-primary-dark text-white flex items-center justify-center text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
            aria-label="Profil"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Client Greeting & Event Date Pill */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
            Dashboard Client
          </p>
          <h2 className="text-[22px] font-bold text-text-primary leading-tight mt-0.5">
            {mempelaiNama}
          </h2>
        </div>

        {/* Date pill */}
        <div className="flex-shrink-0">
          {eventDateFormatted ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border shadow-[0_1px_4px_rgba(31,29,27,0.03)] text-xs font-medium text-text-primary">
              <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{eventDateFormatted}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border text-xs text-text-tertiary">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span>Tanggal belum diatur</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Hero Countdown Card */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-[0_6px_20px_rgba(169,121,90,0.18)]">
        {/* Subtle decorative wedding rings watermark */}
        <svg
          className="absolute -right-3 -top-3 w-32 h-32 pointer-events-none opacity-20"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="45" cy="45" r="28" stroke="white" strokeWidth="4" />
          <circle cx="65" cy="45" r="28" stroke="white" strokeWidth="4" />
        </svg>

        {/* Top pill badge */}
        <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
          Menghitung Hari
        </div>

        {/* Big countdown display */}
        <div className="mt-3">
          {countdownInfo.status === 'active' && (
            <div className="flex items-baseline">
              <span className="text-[34px] font-bold leading-none tracking-tight">
                {countdownInfo.days}
              </span>
              <span className="text-base font-semibold ml-2 text-white/95">
                hari lagi
              </span>
            </div>
          )}
          {countdownInfo.status === 'passed' && (
            <div className="text-xl font-bold text-white">
              Acara sudah berlangsung
            </div>
          )}
          {countdownInfo.status === 'missing' && (
            <div className="text-lg font-bold text-white">
              Tanggal acara belum diatur
            </div>
          )}
          <p className="text-xs text-white/85 mt-2 leading-relaxed font-normal">
            menuju hari bahagia pernikahan {mempelaiNama}
          </p>
        </div>
      </div>

      {/* 4. Link Undangan Umum Card */}
      <div className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.05)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Link undangan umum</span>
          </div>
          <span className="rounded-full bg-success-tint px-2.5 py-0.5 text-[11px] font-semibold text-success">
            Aktif
          </span>
        </div>

        {/* URL Box */}
        <div className="mt-2.5 mb-3 flex items-center justify-between rounded-[14px] bg-surface-muted px-3.5 py-2.5 border border-border/50">
          <span className="text-xs font-medium text-text-primary truncate select-all pr-2">
            {displayUrl}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="text-text-secondary hover:text-text-primary flex-shrink-0 transition-colors p-1"
            title="Salin link"
            aria-label="Salin URL"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-12 gap-2">
          {/* Bagikan WA */}
          <button
            type="button"
            onClick={shareWa}
            className="col-span-6 h-[42px] rounded-[12px] bg-primary hover:bg-primary-dark active:scale-[0.98] text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Bagikan WA</span>
          </button>

          {/* Salin */}
          <button
            type="button"
            onClick={copyLink}
            className="col-span-3 h-[42px] rounded-[12px] bg-white border border-border hover:bg-surface-muted active:scale-[0.98] text-text-primary flex items-center justify-center gap-1 text-xs font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>Salin</span>
          </button>

          {/* Lihat */}
          <button
            type="button"
            onClick={openLink}
            className="col-span-3 h-[42px] rounded-[12px] bg-white border border-border hover:bg-surface-muted active:scale-[0.98] text-text-primary flex items-center justify-center gap-1 text-xs font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Lihat</span>
          </button>
        </div>
      </div>

      {/* 5. Progres RSVP Card */}
      <div className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.05)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Progres RSVP</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {totalRespon} dari {totalTamu} tamu sudah merespon
            </p>
          </div>
          <span className="rounded-full bg-[#FDF3DC] px-2 py-0.5 text-xs font-semibold text-primary">
            {totalPercent}% Total
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden flex my-3">
          {totalTamu > 0 ? (
            <>
              {hadir > 0 && (
                <div
                  style={{ width: `${(hadir / totalTamu) * 100}%` }}
                  className="bg-success h-full transition-all duration-300"
                  title={`Hadir: ${hadir}`}
                />
              )}
              {tidakHadir > 0 && (
                <div
                  style={{ width: `${(tidakHadir / totalTamu) * 100}%` }}
                  className="bg-danger h-full transition-all duration-300"
                  title={`Tidak Hadir: ${tidakHadir}`}
                />
              )}
              {ragu > 0 && (
                <div
                  style={{ width: `${(ragu / totalTamu) * 100}%` }}
                  className="bg-warning h-full transition-all duration-300"
                  title={`Ragu: ${ragu}`}
                />
              )}
              {belumRespon > 0 && (
                <div
                  style={{ width: `${(belumRespon / totalTamu) * 100}%` }}
                  className="bg-border h-full transition-all duration-300"
                  title={`Belum: ${belumRespon}`}
                />
              )}
            </>
          ) : (
            <div className="w-full bg-border h-full" />
          )}
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Hadir ({hadir})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span>Tidak Hadir ({tidakHadir})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>Ragu ({ragu})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-border" />
            <span>Belum ({belumRespon})</span>
          </div>
        </div>
      </div>

      {/* 6. Quick Stats Grid */}
      <div className="space-y-3">
        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Tamu Diundang */}
          <Link
            to="/tamu"
            className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.04)] p-3.5 hover:border-primary/40 transition-all block"
          >
            <p className="text-xs font-medium text-text-secondary">Tamu Diundang</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {totalTamu}
              </span>
              <span className="text-xs text-text-tertiary">
                {s.total_pax ?? totalTamu} pax
              </span>
            </div>
          </Link>

          {/* Card 2: Konfirmasi Hadir */}
          <Link
            to="/tamu"
            className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.04)] p-3.5 hover:border-success/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Konfirmasi Hadir</p>
              <span className="rounded-full bg-success-tint px-1.5 py-0.5 text-[10px] font-bold text-success">
                {hadirPercent}%
              </span>
            </div>
            <p className="text-2xl font-bold text-success tracking-tight mt-1">
              {hadir}
            </p>
          </Link>

          {/* Card 3: Belum Respon */}
          <Link
            to="/tamu"
            className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.04)] p-3.5 hover:border-warning/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Belum Respon</p>
              <span className="rounded-full bg-warning-tint px-1.5 py-0.5 text-[10px] font-bold text-warning">
                {belumPercent}%
              </span>
            </div>
            <p className="text-2xl font-bold text-warning tracking-tight mt-1">
              {belumRespon}
            </p>
          </Link>

          {/* Card 4: Tidak Hadir */}
          <Link
            to="/tamu"
            className="rounded-[20px] bg-white border border-border shadow-[0_2px_12px_rgba(31,29,27,0.04)] p-3.5 hover:border-danger/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Tidak Hadir</p>
              <span className="rounded-full bg-danger-tint px-1.5 py-0.5 text-[10px] font-bold text-danger">
                {tidakHadirPercent}%
              </span>
            </div>
            <p className="text-2xl font-bold text-danger tracking-tight mt-1">
              {tidakHadir}
            </p>
          </Link>
        </div>

        {/* 2 Bottom Pills: Terkirim via WA + Ucapan Masuk */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/kirim"
            className="rounded-[14px] bg-[#F4ECE5]/50 hover:bg-[#F4ECE5] border border-border/80 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all"
          >
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{s.terkirim ?? 0} Terkirim via WA</span>
          </Link>

          <Link
            to="/ucapan"
            className="rounded-[14px] bg-[#F4ECE5]/50 hover:bg-[#F4ECE5] border border-border/80 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all"
          >
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>{s.ucapan ?? 0} Ucapan Masuk</span>
          </Link>
        </div>
      </div>

      {/* 7. Primary Action Button */}
      <div>
        <Link
          to="/tamu"
          className="w-full h-[52px] rounded-button bg-primary-dark hover:bg-[#785139] active:scale-[0.98] text-white flex items-center justify-center gap-2 font-semibold text-[15px] shadow-[0_2px_10px_rgba(140,98,71,0.25)] transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Kelola Daftar Tamu</span>
          <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* 8. Aktivitas Terbaru Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">Aktivitas Terbaru</h3>
          <Link
            to="/tamu"
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Lihat semua
          </Link>
        </div>

        {/* Activity Rows */}
        <div className="space-y-2">
          {guests.length > 0 ? (
            guests.slice(0, 3).map((g, idx) => {
              const name = decodeHtml(g.nama || 'Tamu')
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              const rsvp = g.rsvp_status || 'belum_respon'
              const pax = g.pax || 1
              const kategori = decodeHtml(g.kategori || 'Tamu')

              let badgeText = 'Belum respon'
              let badgeCls = 'bg-surface-muted text-text-secondary'
              if (rsvp === 'hadir') {
                badgeText = 'Hadir'
                badgeCls = 'bg-success-tint text-success'
              } else if (rsvp === 'tidak_hadir') {
                badgeText = 'Tidak hadir'
                badgeCls = 'bg-danger-tint text-danger'
              } else if (rsvp === 'ragu') {
                badgeText = 'Ragu'
                badgeCls = 'bg-warning-tint text-warning'
              } else if (g.status_kirim === 'terkirim') {
                badgeText = 'Terkirim'
                badgeCls = 'bg-primary-tint text-primary'
              }

              return (
                <Link
                  key={g.id || idx}
                  to="/tamu"
                  className="flex items-center justify-between p-3 rounded-[16px] bg-white border border-border shadow-[0_1px_6px_rgba(31,29,27,0.03)] hover:border-primary/40 transition-all block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-tint text-primary-dark font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {name} {rsvp === 'hadir' ? 'konfirmasi hadir' : ''}
                      </p>
                      <p className="text-xs text-text-tertiary truncate">
                        {kategori} • {pax} pax
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0 ml-2 ${badgeCls}`}>
                    {badgeText}
                  </span>
                </Link>
              )
            })
          ) : (
            /* Fallback mock activity matching screenshot if no guests yet */
            <>
              <Link
                to="/tamu"
                className="flex items-center justify-between p-3 rounded-[16px] bg-white border border-border shadow-[0_1px_6px_rgba(31,29,27,0.03)] hover:border-primary/40 transition-all block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-tint text-primary-dark font-bold text-xs flex items-center justify-center flex-shrink-0">
                    BS
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      Budi Santoso konfirmasi hadir
                    </p>
                    <p className="text-xs text-text-tertiary">Keluarga • 2 pax • 10m lalu</p>
                  </div>
                </div>
                <span className="rounded-full bg-success-tint px-2.5 py-0.5 text-[11px] font-semibold text-success flex-shrink-0 ml-2">
                  Hadir
                </span>
              </Link>

              <Link
                to="/tamu"
                className="flex items-center justify-between p-3 rounded-[16px] bg-white border border-border shadow-[0_1px_6px_rgba(31,29,27,0.03)] hover:border-primary/40 transition-all block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-tint text-primary-dark font-bold text-xs flex items-center justify-center flex-shrink-0">
                    SR
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      Siti Rahayu melihat undangan
                    </p>
                    <p className="text-xs text-text-tertiary">Teman • 1 pax • 1j lalu</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary flex-shrink-0 ml-2">
                  Terkirim
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
