import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMe, useStats, useGuests } from '../hooks.js'
import { decodeHtml } from '../lib/decode.js'
import diamoraLogo from '../assets/logo/logo-2.png'

const INDO_MONTHS = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, ags: 7, agu: 7, aug: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9, oct: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11,
}

function parseEventDate(raw) {
  if (!raw || typeof raw !== 'string') return null
  const cleaned = raw.trim()
  if (!cleaned) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const d = new Date(`${cleaned}T08:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }

  const iso = cleaned.replace(' ', 'T')
  const dIso = new Date(iso)
  if (!Number.isNaN(dIso.getTime())) {
    return dIso
  }

  const normalized = cleaned.replace(/\*/g, '0')
  const match = normalized.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/)
  if (match) {
    const day = parseInt(match[1], 10)
    const monthKey = match[2].toLowerCase()
    const year = parseInt(match[3], 10)
    const month = INDO_MONTHS[monthKey]
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      return new Date(year, month, day, 8, 0, 0)
    }
  }

  return null
}

export default function Home() {
  const nav = useNavigate()
  const me = useMe()
  const stats = useStats()
  const guestsQuery = useGuests({ per_page: 5 })
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToastMsg(msg)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2000)
  }, [])

  const u = me.data?.undangan
  const s = stats.data || {}
  const guests = guestsQuery.data?.guests || guestsQuery.data?.items || []

  const baseInvitationUrl = (import.meta.env.VITE_INVITATION_BASE_URL || '').replace(/\/+$/, '')
  const linkUmum = u?.slug && baseInvitationUrl
    ? `${baseInvitationUrl}/${u.slug}`
    : (u?.link_umum || u?.link || '')
  const mempelaiNama = decodeHtml(u?.mempelai || u?.judul || 'Danu & Fifi')

  const slug = u?.slug
  const invitationDetailQuery = useQuery({
    queryKey: ['invitation-detail', slug],
    queryFn: async () => {
      if (!slug) return null
      const base = (import.meta.env.VITE_WP_API_URL || 'http://localhost/diamora/wordpress').replace(/\/+$/, '')
      const res = await fetch(`${base}/wp-json/wp/v2/undangan?slug=${encodeURIComponent(slug)}`)
      if (!res.ok) return null
      const list = await res.json()
      return Array.isArray(list) && list.length > 0 ? list[0] : null
    },
    enabled: Boolean(slug && !u?.event_date),
    staleTime: 5 * 60 * 1000,
  })

  const postAcf = invitationDetailQuery.data?.acf || {}
  const rawDate =
    u?.event_date ||
    u?.eventDate ||
    u?.akad_date ||
    u?.resepsi_date ||
    postAcf.event_date ||
    postAcf.akad_date ||
    postAcf.resepsi_date ||
    ''

  const parsedTargetDate = useMemo(() => parseEventDate(rawDate), [rawDate])

  const eventDateFormatted = useMemo(() => {
    if (!parsedTargetDate) return null
    return parsedTargetDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [parsedTargetDate])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  const countdownInfo = useMemo(() => {
    if (!parsedTargetDate) return { status: 'missing' }
    const totalMs = parsedTargetDate.getTime() - now
    if (totalMs <= 0) return { status: 'passed' }

    const totalSeconds = Math.floor(totalMs / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)

    return { status: 'active', days, hours }
  }, [parsedTargetDate, now])

  const rsvpObj = s.rsvp || {}
  const totalTamu = s.total_tamu ?? s.total_guests ?? guestsQuery.data?.total ?? 0
  const hadir = s.hadir ?? rsvpObj.hadir ?? 0
  const tidakHadir = s.tidak_hadir ?? rsvpObj.tidak_hadir ?? 0
  const ragu = s.ragu ?? rsvpObj.ragu ?? 0
  const belumRespon = s.belum_respon ?? rsvpObj.belum_respon ?? Math.max(0, totalTamu - hadir - tidakHadir - ragu)
  const terkirim = s.terkirim ?? s.sent_count ?? 0
  const ucapan = s.ucapan ?? s.total_wishes ?? 0
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

  const displayUrl = linkUmum ? linkUmum.replace(/^https?:\/\//, '') : 'diamora.com/undangan'

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
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg transition-all">
          {toastMsg}
        </div>
      )}

      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center">
            <img
              src={diamoraLogo}
              alt="Diamora"
              className="h-7 w-auto object-contain max-w-[120px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-[19px] font-bold text-text-primary tracking-tight">Beranda</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nav('/pengaturan')}
            className="w-9 h-9 rounded-full bg-primary-dark text-white flex items-center justify-center text-xs font-bold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            aria-label="Profil"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
            Dashboard Client
          </p>
          <h2 className="text-[22px] font-bold text-text-primary leading-tight mt-0.5">
            {mempelaiNama}
          </h2>
        </div>

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

      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-[0_6px_20px_rgba(169,121,90,0.18)]">
        <svg
          className="absolute -right-3 -top-3 w-32 h-32 pointer-events-none opacity-20"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="45" cy="45" r="28" stroke="white" strokeWidth="4" />
          <circle cx="65" cy="45" r="28" stroke="white" strokeWidth="4" />
        </svg>

        <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
          Menghitung Hari
        </div>

        <div className="mt-3">
          {countdownInfo.status === 'active' && (
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
              {countdownInfo.days > 0 && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] sm:text-[36px] font-bold leading-none tracking-tight">
                    {countdownInfo.days}
                  </span>
                  <span className="text-[14px] sm:text-base font-semibold text-white/95">
                    Hari
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[32px] sm:text-[36px] font-bold leading-none tracking-tight">
                  {countdownInfo.hours}
                </span>
                <span className="text-[14px] sm:text-base font-semibold text-white/95">
                  Jam
                </span>
                <span className="text-[13px] sm:text-[14px] font-medium text-white/85 ml-0.5">
                  lagi
                </span>
              </div>
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

        <div className="grid grid-cols-12 gap-2">
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

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/kirim"
            className="rounded-[14px] bg-[#F4ECE5]/50 hover:bg-[#F4ECE5] border border-border/80 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all"
          >
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{terkirim} Terkirim via WA</span>
          </Link>

          <Link
            to="/ucapan"
            className="rounded-[14px] bg-[#F4ECE5]/50 hover:bg-[#F4ECE5] border border-border/80 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all"
          >
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>{ucapan} Ucapan Masuk</span>
          </Link>
        </div>
      </div>

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
