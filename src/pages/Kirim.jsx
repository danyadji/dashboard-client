import { useMemo, useState } from 'react'
import {
  useMe,
  useGuests,
  useStats,
  useMutationApi,
  api,
} from '../hooks.js'
import CaptionCards from '../components/CaptionCards.jsx'
import TemplateEditorSheet from '../components/TemplateEditorSheet.jsx'
import RecipientSelectSheet from '../components/RecipientSelectSheet.jsx'
import { composeWaMessage, waLink, normalizePhone } from '../lib/tamu.js'
import {
  getSavedCaptionId,
  setSavedCaptionId,
  resolveCaptionText,
} from '../lib/captions.js'
import { decodeHtml } from '../lib/decode.js'

export default function Kirim() {
  const me = useMe()
  const stats = useStats()
  const [mode, setMode] = useState('pilih_tamu') // 'pilih_tamu' | 'custom'
  const [selectedId, setSelectedId] = useState(0)
  const [customNama, setCustomNama] = useState('')
  const [captionId, setCaptionId] = useState(getSavedCaptionId())
  const [editorOpen, setEditorOpen] = useState(false)
  const [recipientSheetOpen, setRecipientSheetOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Fetch all guests for recipient picker
  const guestsQuery = useGuests({ per_page: 200 })
  const allGuests = guestsQuery.data?.items || []

  const s = stats.data || {}
  const totalTamu = s.total_tamu ?? allGuests.length
  const terkirimCount = s.terkirim ?? 0
  const progressPercent = totalTamu > 0 ? (terkirimCount / totalTamu) * 100 : 0

  const customTemplate = me.data?.template_pesan || ''
  const mempelai = decodeHtml(me.data?.undangan?.mempelai || '')
  const linkUmum = me.data?.undangan?.link_umum || ''

  // Selected guest entity
  const selected = useMemo(() => {
    if (selectedId) {
      return allGuests.find((g) => g.id === selectedId) || null
    }
    // Default: first unsent guest with phone, or first guest
    return (
      allGuests.find((g) => g.kirim_status !== 'terkirim' && !!g.no_wa) ||
      allGuests[0] ||
      null
    )
  }, [allGuests, selectedId])

  const markSent = useMutationApi(
    (g) => api(`/guests/${g.id}/sent`, { method: 'PUT' }),
    ['guests', 'stats']
  )

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  const penerimaNama =
    mode === 'pilih_tamu' ? decodeHtml(selected?.nama || '') : customNama.trim()
  const penerimaWa = mode === 'pilih_tamu' ? selected?.no_wa || '' : ''
  const hasPhone = !!penerimaWa
  const isAlreadySent = mode === 'pilih_tamu' && selected?.kirim_status === 'terkirim'

  const linkPersonal =
    mode === 'pilih_tamu' && selected
      ? selected.link_personal
      : penerimaNama
      ? `${linkUmum}?to=${encodeURIComponent(penerimaNama)}`
      : ''

  const template =
    resolveCaptionText(captionId, customTemplate) ||
    customTemplate ||
    'Halo {nama}!\n\nUndangan pernikahan {mempelai}:\n{link}\n\nSampai jumpa di hari bahagia!'

  const pesan =
    penerimaNama && linkPersonal
      ? composeWaMessage(
          template,
          { nama: penerimaNama, no_wa: penerimaWa },
          mempelai,
          linkPersonal
        )
      : ''

  const waUrl = pesan
    ? waLink(
        template,
        { nama: penerimaNama, no_wa: penerimaWa },
        mempelai,
        linkPersonal
      )
    : '#'

  const siap = !!pesan

  // Copy actions
  async function copyText() {
    if (!pesan) return
    try {
      await navigator.clipboard.writeText(pesan)
      showToast('Teks pesan berhasil disalin')
    } catch {
      showToast('Gagal menyalin teks')
    }
  }

  async function copyLink() {
    if (!linkPersonal) return
    try {
      await navigator.clipboard.writeText(linkPersonal)
      showToast('Link undangan berhasil disalin')
    } catch {
      showToast('Gagal menyalin link')
    }
  }

  function handleOpenWa() {
    if (!siap || !hasPhone) return
    window.open(waUrl, '_blank')

    if (mode === 'pilih_tamu' && selected && !isAlreadySent) {
      markSent.mutate(selected, {
        onSuccess: () => {
          showToast('Ditandai terkirim via WhatsApp')
        },
      })
    }
  }

  // Initials for avatar
  const initials = penerimaNama
    ? penerimaNama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  if (me.isLoading) {
    return (
      <div className="space-y-4 pt-4 animate-pulse">
        <div className="h-10 bg-surface-muted rounded-xl" />
        <div className="h-32 bg-surface-muted rounded-[20px]" />
        <div className="h-36 bg-surface-muted rounded-[20px]" />
        <div className="h-40 bg-surface-muted rounded-[20px]" />
      </div>
    )
  }

  return (
    <div className="pb-36 antialiased relative -mx-4 sm:-mx-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header with Thin Progress Bar */}
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur-md border-b border-border">
        <div className="h-14 px-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-[21px] font-bold tracking-tight text-text-primary leading-none">
              Kirim
            </h1>
            <span className="text-xs text-text-secondary mt-1 font-medium">
              Terkirim {terkirimCount} dari {totalTamu} tamu
            </span>
          </div>

          {/* Right Action Button: Settings / Gear */}
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            aria-label="Pengaturan caption kustom"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-primary hover:border-primary active:bg-surface-muted transition-colors shadow-xs"
            title="Ubah template caption kustom"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Thin Progress Bar */}
        <div className="w-full bg-surface-muted h-1 overflow-hidden" role="progressbar">
          <div
            className="bg-primary h-1 rounded-r-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
          />
        </div>
      </header>

      {/* Main Form Content */}
      <main className="px-4 sm:px-5 pt-4 flex flex-col gap-4">
        {/* STEP 1: Penerima */}
        <section className="bg-white rounded-[20px] border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="font-bold text-sm text-text-primary tracking-tight">
              Penerima
            </h2>
          </div>

          {/* Segmented Control */}
          <div className="flex bg-surface-muted p-1 rounded-xl mb-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('pilih_tamu')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                mode === 'pilih_tamu'
                  ? 'bg-primary-tint text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tamu terdaftar
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
                mode === 'custom'
                  ? 'bg-primary-tint text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Nama lain
            </button>
          </div>

          {/* Tamu terdaftar: Selected Guest Selector Card */}
          {mode === 'pilih_tamu' ? (
            <div
              onClick={() => setRecipientSheetOpen(true)}
              className="border border-border rounded-2xl p-3 flex items-center justify-between bg-bg/60 cursor-pointer hover:bg-surface-muted/60 active:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-full bg-primary-tint text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col items-start gap-1 min-w-0">
                  <span className="font-semibold text-sm text-text-primary leading-tight truncate">
                    {penerimaNama || 'Pilih penerima...'}
                  </span>
                  {!hasPhone ? (
                    <span className="bg-warning-tint text-warning text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      <span>Tanpa nomor WA</span>
                    </span>
                  ) : isAlreadySent ? (
                    <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Sudah pernah dikirim</span>
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary truncate">
                      {penerimaWa} • {selected?.pax || 1} pax
                    </span>
                  )}
                </div>
              </div>

              {/* Selector Chevron */}
              <div className="text-text-secondary pl-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : (
            /* Nama lain Input */
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Nama penerima (ditulis di cover undangan)
              </label>
              <input
                type="text"
                value={customNama}
                onChange={(e) => setCustomNama(e.target.value)}
                placeholder="mis. Bapak Hendra (kantor ayah)"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-white text-xs font-medium text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-[11px] text-text-tertiary">
                Untuk tamu yang tidak terdaftar. Link memakai link umum + parameter nama.
              </p>
            </div>
          )}
        </section>

        {/* STEP 2: Gaya Pesan */}
        <section className="bg-white rounded-[20px] border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <h2 className="font-bold text-sm text-text-primary tracking-tight">
              Gaya pesan
            </h2>
          </div>

          <CaptionCards
            value={captionId}
            onChange={(id) => {
              setCaptionId(id)
              setSavedCaptionId(id)
            }}
            penerimaNama={penerimaNama}
            linkPersonal={linkPersonal}
            customTemplate={customTemplate}
            mempelai={mempelai}
            onEditKustom={() => setEditorOpen(true)}
          />
        </section>

        {/* STEP 3: Pratinjau Pesan */}
        <section className="bg-white rounded-[20px] border border-border p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <h2 className="font-bold text-sm text-text-primary tracking-tight">
              Pratinjau pesan
            </h2>
          </div>

          {/* WhatsApp Style Chat Bubble Container */}
          <div className="bg-[#F8F5F1] rounded-2xl p-3 border border-border">
            {siap ? (
              <div className="bg-white rounded-xl rounded-tl-sm p-3.5 shadow-xs border border-[#EBE6E0] text-xs leading-relaxed text-text-primary space-y-2">
                <p>
                  Yth. <span className="font-bold">{penerimaNama}</span>,
                </p>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {pesan
                    .replace(/^Halo.*?\n+/i, '')
                    .replace(/^Assalamu.*?\n+/i, '')
                    .replace(/^Kepada.*?\n+/i, '')}
                </p>

                {/* Invitation Link Preview Box */}
                <div className="bg-bg rounded-lg p-2.5 border border-border mt-1 text-[11px]">
                  <p className="font-bold text-primary text-xs">
                    Pernikahan {mempelai || 'Mempelai'}
                  </p>
                  <p className="text-text-secondary text-[10px] mt-0.5">
                    Buka tautan undangan resmi berikut:
                  </p>
                  <p className="text-primary underline font-medium mt-1 truncate">
                    {linkPersonal.replace(/^https?:\/\//, '')}
                  </p>
                </div>

                {/* Chat bubble timestamp & double checkmarks */}
                <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-text-tertiary">
                  <span>10:42</span>
                  <svg className="w-3.5 h-3.5 text-[#53bdeb]" fill="currentColor" viewBox="0 0 16 15">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.055a.366.366 0 0 0-.064-.51z" />
                    <path d="M10.875 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.53 9.879a.32.32 0 0 1-.484.033l-2.07-1.879a.418.418 0 0 0-.542.036l-.378.483a.418.418 0 0 0 .036.541l3.032 2.75a.36.36 0 0 0 .484-.033l6.272-8.055a.366.366 0 0 0-.065-.51z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-tertiary">
                Pilih tamu atau tulis nama penerima untuk melihat pratinjau pesan.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Workflow Area */}
      <aside className="fixed bottom-[65px] left-0 right-0 z-30 bg-bg/95 backdrop-blur-md px-4 pt-2.5 pb-2 border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-[430px] mx-auto">
          {/* Warning Helper Card for missing number (Matching Screenshot!) */}
          {!hasPhone && mode === 'pilih_tamu' && selected && (
            <div className="bg-[#FFF9EE] border border-[#F6DEB2] rounded-[14px] p-3 mb-2.5 flex items-start gap-2.5 shadow-xs">
              <svg className="w-4 h-4 text-warning shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs text-[#8A5800] leading-snug">
                Tamu ini belum punya nomor WhatsApp. Salin link lalu kirim manual.
              </p>
            </div>
          )}

          {/* Already Sent Helper Card */}
          {isAlreadySent && hasPhone && (
            <div className="bg-[#FDF3DC] border border-warning/30 rounded-[14px] p-2.5 mb-2.5 flex items-center justify-between text-xs text-[#8A5800]">
              <span>Undangan ini sudah pernah ditandai terkirim.</span>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5">
            {/* Salin Teks Button */}
            <button
              type="button"
              disabled={!siap}
              onClick={copyText}
              className="w-[35%] h-[48px] rounded-[14px] bg-surface-muted hover:bg-border/60 active:scale-[0.98] transition-all text-text-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Salin Teks</span>
            </button>

            {/* Primary Action Button */}
            {!hasPhone ? (
              /* Case 1: Without phone -> Salin Link Undangan (Primary Brown - 65%) */
              <button
                type="button"
                disabled={!siap}
                onClick={copyLink}
                className="w-[65%] h-[48px] rounded-[14px] bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Salin Link Undangan</span>
              </button>
            ) : (
              /* Case 2: With phone -> Buka WhatsApp (Green WhatsApp - 65%) */
              <button
                type="button"
                disabled={!siap}
                onClick={handleOpenWa}
                className="w-[65%] h-[48px] rounded-[14px] bg-[#25D366] hover:opacity-95 active:scale-[0.98] transition-all text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{isAlreadySent ? 'Kirim Ulang WA' : 'Buka WhatsApp'}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Recipient Selection 90% Bottom Sheet */}
      {recipientSheetOpen && (
        <RecipientSelectSheet
          guests={allGuests}
          selectedId={selected?.id || 0}
          onSelect={(id) => {
            setSelectedId(id)
            setMode('pilih_tamu')
          }}
          onClose={() => setRecipientSheetOpen(false)}
        />
      )}

      {/* Custom Caption Template Editor Bottom Sheet */}
      {editorOpen && (
        <TemplateEditorSheet onClose={() => setEditorOpen(false)} />
      )}
    </div>
  )
}
