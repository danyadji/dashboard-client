import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useMe,
  useStats,
  useGuestsInfinite,
  useMutationApi,
  useQueryClient,
  useMutation,
  useBodyScrollLock,
  api,
} from '../hooks.js'
import GuestForm from '../components/GuestForm.jsx'
import GuestDetailSheet from '../components/GuestDetailSheet.jsx'
import WaSendSheet from '../components/WaSendSheet.jsx'
import { emptyForm } from '../lib/tamu.js'
import { decodeHtml } from '../lib/decode.js'

export default function Tamu() {
  const nav = useNavigate()
  const me = useMe()
  const stats = useStats()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState('semua')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [waGuest, setWaGuest] = useState(null)
  const sentinel = useRef(null)

  useBodyScrollLock(formOpen || Boolean(selectedGuest) || Boolean(waGuest))

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 250)
    return () => clearTimeout(handler)
  }, [search])

  const guests = useGuestsInfinite(debouncedSearch, rsvpFilter)

  const slug = me.data?.undangan?.slug || ''
  const baseInvitationUrl = (import.meta.env.VITE_INVITATION_BASE_URL || '').replace(/\/+$/, '')

  const items = useMemo(
    () =>
      (guests.data?.pages || [])
        .flatMap((p) => p.items || [])
        .map((g) => ({
          ...g,
          undangan_slug: g.undangan_slug || slug,
          link_personal:
            g.link_personal ||
            (slug && baseInvitationUrl && g.nama
              ? `${baseInvitationUrl}/${slug}?to=${encodeURIComponent(g.nama)}`
              : ''),
        })),
    [guests.data, slug, baseInvitationUrl]
  )

  // Infinite scroll intersection observer
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          guests.hasNextPage &&
          !guests.isFetchingNextPage
        ) {
          guests.fetchNextPage()
        }
      },
      { rootMargin: '300px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [guests.hasNextPage, guests.isFetchingNextPage, debouncedSearch])

  // Save guest mutation
  const save = useMutation({
    mutationFn: (f) =>
      f.id
        ? api(`/guests/${f.id}`, { method: 'PUT', body: f })
        : api('/guests', { method: 'POST', body: f }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests-inf'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['guests'] })
      setFormOpen(false)
      setFormError('')
      showToast('Data tamu berhasil disimpan')
    },
    onError: (e) => setFormError(e.message || 'Gagal menyimpan tamu'),
  })

  // Delete & mark as sent mutations
  const remove = useMutationApi(
    (g) => api(`/guests/${g.id}`, { method: 'DELETE' }),
    ['guests-inf', 'guests', 'stats']
  )

  const markSent = useMutationApi(
    (g) => api(`/guests/${g.id}/sent`, { method: 'PUT' }),
    ['guests-inf', 'guests', 'stats']
  )

  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToastMsg(msg)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2000)
  }, [])

  const s = stats.data || {}
  const rsvpObj = s.rsvp || {}
  const totalTamu = s.total_tamu ?? s.total_guests ?? items.length
  const totalPax = s.total_pax ?? totalTamu
  const hadir = s.hadir ?? rsvpObj.hadir ?? 0
  const tidakHadir = s.tidak_hadir ?? rsvpObj.tidak_hadir ?? 0
  const ragu = s.ragu ?? rsvpObj.ragu ?? 0
  const belumRespon = s.belum_respon ?? rsvpObj.belum_respon ?? 0
  const terkirim = s.terkirim ?? s.sent_count ?? 0
  const customTemplate = me.data?.template_pesan || ''
  const mempelai = me.data?.undangan?.mempelai || ''

  const filterChips = [
    { id: 'semua', label: 'Semua', count: totalTamu },
    { id: 'belum_respon', label: 'Belum respon', count: belumRespon },
    { id: 'hadir', label: 'Hadir', count: hadir },
    { id: 'tidak_hadir', label: 'Tidak hadir', count: tidakHadir },
    { id: 'ragu', label: 'Ragu', count: ragu },
    { id: 'terkirim', label: 'Terkirim', count: terkirim },
  ]

  function openAdd() {
    setEditing(emptyForm)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(g) {
    setEditing({ ...emptyForm, ...g })
    setFormError('')
    setFormOpen(true)
  }

  return (
    <div className="relative pb-24 antialiased">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Sticky Header Bar */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-5 px-4 sm:px-5 pt-1 pb-2 bg-bg/95 backdrop-blur-md">
        <header className="flex items-center justify-between h-14">
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <h1 className="text-[20px] font-bold text-text-primary tracking-tight truncate leading-tight">
              Tamu
            </h1>
            <p className="text-xs text-text-secondary truncate mt-0.5 font-normal">
              {totalTamu} tamu • {totalPax} orang
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Tamu Icon Button */}
            <Link
              to="/tamu/import"
              aria-label="Import Tamu"
              className="w-11 h-11 rounded-[14px] border border-border bg-white flex items-center justify-center text-text-primary hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm"
              title="Import Data Tamu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Search Field */}
        <div className="relative mt-2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="guest-search-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tamu..."
            className="w-full h-[52px] pl-12 pr-4 bg-surface-muted text-text-primary placeholder:text-text-tertiary rounded-[14px] text-[15px] outline-none transition-all focus:bg-white focus:border focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {/* Filter Chips Carousel with Subtle Fade Overflow */}
        <div className="relative -mx-4 sm:-mx-5 px-4 sm:px-5 mt-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-6">
            {filterChips.map((chip) => {
              const active = rsvpFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setRsvpFilter(chip.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-border/60 text-text-secondary'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Subtle Fade Mask on the right */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent" />
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="mt-3">
        {guests.isLoading ? (
          /* Skeleton Loader */
          <div className="rounded-[20px] bg-white border border-border shadow-card divide-y divide-surface-muted overflow-hidden animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 min-h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-muted" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-4 bg-surface-muted rounded" />
                    <div className="w-20 h-3 bg-surface-muted rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6 bg-surface-muted rounded-full" />
                  <div className="w-9 h-9 bg-surface-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[20px] border border-border shadow-card text-center my-4">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-primary mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Belum ada tamu
            </h3>
            <p className="text-xs text-text-secondary mt-1.5 max-w-[260px] leading-relaxed">
              {search || rsvpFilter !== 'semua'
                ? 'Tidak ada tamu yang cocok dengan filter atau pencarian Anda.'
                : 'Tambah tamu satu per satu atau import data sekaligus dari Excel / Spreadsheet.'}
            </p>
            <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
              <button
                type="button"
                onClick={openAdd}
                className="flex-1 h-12 rounded-[14px] bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah</span>
              </button>
              <Link
                to="/tamu/import"
                className="flex-1 h-12 rounded-[14px] bg-surface-muted text-text-primary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-border/60 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Import</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Guest Card Stack */
          <div className="bg-white rounded-[20px] border border-border shadow-[0_2px_12px_rgba(31,29,27,0.05)] overflow-hidden divide-y divide-surface-muted">
            {items.map((g) => {
              const name = decodeHtml(g.nama || 'Tamu')
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              const rsvp = g.rsvp_status || 'belum_respon'
              const pax = g.pax || 1
              const kategori = decodeHtml(g.kategori || 'Lainnya')
              const isSent = g.kirim_status === 'terkirim'
              const hasPhone = !!g.no_wa

              let rsvpBadgeText = 'Belum respon'
              let rsvpBadgeCls = 'bg-warning-tint text-warning'
              if (rsvp === 'hadir') {
                rsvpBadgeText = 'Hadir'
                rsvpBadgeCls = 'bg-success-tint text-success'
              } else if (rsvp === 'tidak_hadir') {
                rsvpBadgeText = 'Tidak hadir'
                rsvpBadgeCls = 'bg-danger-tint text-danger'
              } else if (rsvp === 'ragu') {
                rsvpBadgeText = 'Ragu'
                rsvpBadgeCls = 'bg-warning-tint text-warning'
              }

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuest(g)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-muted/40 active:bg-surface-muted transition-colors min-h-[72px]"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Initials Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary-tint text-primary font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>

                    {/* Name & Meta */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[15px] text-text-primary truncate">
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-text-secondary truncate capitalize">
                          {kategori} • {pax} pax
                        </span>
                        <span className="inline-block w-1 h-1 rounded-full bg-text-tertiary" />
                        {isSent ? (
                          <span className="text-xs text-primary font-medium flex items-center gap-0.5 flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Terkirim</span>
                          </span>
                        ) : (
                          <span className="text-xs text-text-tertiary flex-shrink-0">
                            Belum dikirim
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: RSVP Badge & WhatsApp button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rsvpBadgeCls}`}>
                      {rsvpBadgeText}
                    </span>

                    {/* Small Green WhatsApp Icon Button */}
                    <button
                      type="button"
                      disabled={!hasPhone}
                      onClick={(e) => {
                        e.stopPropagation()
                        setWaGuest(g)
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90 ${
                        hasPhone
                          ? 'bg-[#25D366] text-white hover:scale-105'
                          : 'bg-surface-muted text-text-tertiary opacity-60 cursor-not-allowed'
                      }`}
                      title={hasPhone ? `Kirim WhatsApp ke ${name}` : 'Tanpa nomor WA'}
                      aria-label={`Kirim WhatsApp ke ${name}`}
                    >
                      <svg className="w-[19px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinel} className="h-4" />
        {guests.isFetchingNextPage && (
          <p className="py-2 text-center text-xs text-text-tertiary">
            Memuat tamu lainnya...
          </p>
        )}
      </div>

      {/* 3. Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={openAdd}
        aria-label="Tambah tamu"
        className="fixed right-5 bottom-[88px] z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_20px_rgba(124,82,54,0.35)] hover:scale-105 active:scale-95 transition-all"
        title="Tambah Tamu Baru"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 4. Guest Detail Bottom Sheet */}
      {selectedGuest && (
        <GuestDetailSheet
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onEdit={openEdit}
          onWaOpen={(g) => setWaGuest(g)}
          onDelete={(g) => remove.mutate(g)}
          onShowToast={showToast}
        />
      )}

      {/* 5. Add / Edit Guest Form Bottom Sheet */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] overscroll-contain"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-8 shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto -mt-1 mb-4" />
            <h3 className="text-base font-bold text-text-primary mb-4">
              {editing.id ? 'Edit Tamu' : 'Tambah Tamu Baru'}
            </h3>
            <GuestForm
              key={editing.id || 'new'}
              initial={editing}
              saving={save.isPending}
              error={formError}
              onSubmit={(f) => save.mutate(f)}
              showCancel
              onCancel={() => setFormOpen(false)}
              submitLabel={editing.id ? 'Simpan Perubahan' : 'Tambah Tamu'}
            />
          </div>
        </div>
      )}

      {/* 6. WhatsApp Send Sheet */}
      {waGuest && (
        <WaSendSheet
          guest={waGuest}
          customTemplate={customTemplate}
          mempelai={mempelai}
          onOpened={(x) => {
            if (x.kirim_status !== 'terkirim') markSent.mutate(x)
          }}
          onClose={() => setWaGuest(null)}
        />
      )}
    </div>
  )
}
