import { useState } from 'react'
import { decodeHtml } from '../lib/decode.js'

export default function GuestDetailSheet({
  guest,
  onClose,
  onEdit,
  onWaOpen,
  onDelete,
  onShowToast,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!guest) return null

  const name = decodeHtml(guest.nama || 'Tamu')
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const rsvp = guest.rsvp_status || 'belum_respon'
  const pax = guest.pax || 1
  const kategori = decodeHtml(guest.kategori || 'Lainnya')
  const phone = guest.no_wa || ''
  const link = guest.link_personal || ''
  const isSent = guest.kirim_status === 'terkirim'

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

  async function copyText(text, label) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      onShowToast(`${label} berhasil disalin`)
    } catch {
      onShowToast(`Gagal menyalin ${label}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Panel */}
      <div
        className="relative w-full max-w-[430px] rounded-t-[28px] bg-surface p-5 shadow-2xl max-h-[90vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-4 flex-shrink-0" />

        {/* Header / Guest Identity */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-12 h-12 rounded-full bg-primary-tint text-primary font-bold text-base flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-base font-bold text-text-primary truncate">
                {name}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 capitalize">
                {kategori} • {pax} pax
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
            aria-label="Tutup"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info Block */}
        <div className="rounded-[16px] bg-surface-muted p-4 flex flex-col gap-3 my-2 border border-border/40">
          {/* Status Konfirmasi */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Status Konfirmasi</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${rsvpBadgeCls}`}>
              {rsvpBadgeText}
            </span>
          </div>

          <div className="h-[1px] bg-border/60" />

          {/* Nomor WhatsApp */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Nomor WhatsApp</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary tracking-wide">
                {phone || 'Belum diisi'}
              </span>
              {phone && (
                <button
                  type="button"
                  onClick={() => copyText(phone, 'Nomor WhatsApp')}
                  className="p-1 text-text-tertiary hover:text-primary transition-colors"
                  title="Salin nomor"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-border/60" />

          {/* Link Undangan Personal */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Link Undangan Personal</span>
            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-border/50">
              <span className="text-xs font-medium text-primary truncate max-w-[240px]">
                {link || 'Link belum tersedia'}
              </span>
              {link && (
                <button
                  type="button"
                  onClick={() => copyText(link, 'Link personal')}
                  className="p-1 text-text-tertiary hover:text-primary transition-colors flex-shrink-0"
                  title="Salin link personal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-border/60" />

          {/* Pengiriman Terakhir */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Pengiriman Terakhir</span>
            <span className="text-xs text-text-primary font-medium flex items-center gap-1.5">
              {isSent ? (
                <>
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Terkirim via WhatsApp</span>
                </>
              ) : (
                <span className="text-text-tertiary">Belum dikirim</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => {
              onClose()
              onEdit(guest)
            }}
            className="flex-1 h-[52px] rounded-button bg-surface-muted text-text-primary font-semibold text-sm hover:bg-border/60 active:scale-[0.98] transition-all"
          >
            Edit Data
          </button>

          <button
            type="button"
            onClick={() => {
              onClose()
              onWaOpen(guest)
            }}
            className="flex-[1.4] h-[52px] rounded-button bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Kirim WhatsApp</span>
          </button>
        </div>

        {/* Destructive Action: Hapus Tamu */}
        {confirmDelete ? (
          <div className="mt-4 p-3 rounded-[14px] bg-danger-tint border border-danger/20 flex flex-col gap-2 text-center animate-in fade-in duration-150">
            <p className="text-xs font-semibold text-danger">
              Yakin ingin menghapus tamu "{name}"?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-10 rounded-lg bg-white border border-border text-xs font-medium text-text-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(guest)
                  onClose()
                }}
                className="flex-1 h-10 rounded-lg bg-danger text-white text-xs font-semibold hover:opacity-90"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 mb-1 py-1 text-center text-xs font-semibold text-danger hover:underline"
          >
            Hapus tamu
          </button>
        )}
      </div>
    </div>
  )
}
