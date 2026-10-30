import { useState, useMemo } from 'react'
import { decodeHtml } from '../lib/decode.js'

export default function RecipientSelectSheet({
  guests,
  selectedId,
  onSelect,
  onClose,
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('belum_dikirim') // 'belum_dikirim' | 'terkirim' | 'semua'
  const [tempSelectedId, setTempSelectedId] = useState(selectedId || 0)

  // Filter & Search logic
  const filteredGuests = useMemo(() => {
    let list = guests || []

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter((g) => (g.nama || '').toLowerCase().includes(q))
    }

    if (filter === 'belum_dikirim') {
      list = list.filter((g) => g.kirim_status !== 'terkirim')
    } else if (filter === 'terkirim') {
      list = list.filter((g) => g.kirim_status === 'terkirim')
    }

    // Sort order according to DESIGN.md Section 7.3:
    // 1. Unsent with phone
    // 2. Unsent without phone
    // 3. Sent
    return [...list].sort((a, b) => {
      const aSent = a.kirim_status === 'terkirim'
      const bSent = b.kirim_status === 'terkirim'
      if (aSent !== bSent) return aSent ? 1 : -1

      const aHasPhone = !!a.no_wa
      const bHasPhone = !!b.no_wa
      if (aHasPhone !== bHasPhone) return aHasPhone ? -1 : 1

      return (a.nama || '').localeCompare(b.nama || '')
    })
  }, [guests, search, filter])

  const counts = useMemo(() => {
    const total = (guests || []).length
    const terkirim = (guests || []).filter((g) => g.kirim_status === 'terkirim').length
    const belum = total - terkirim
    return { total, terkirim, belum }
  }, [guests])

  function handleConfirm() {
    onSelect(tempSelectedId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] overscroll-contain">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Panel */}
      <div
        className="relative w-full max-w-[430px] rounded-t-[28px] bg-surface p-5 shadow-2xl h-[90vh] flex flex-col overflow-hidden overscroll-contain animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-4 flex-shrink-0" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Pilih Penerima
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {counts.total} tamu terdaftar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 flex-shrink-0">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tamu..."
            className="w-full h-11 pl-10 pr-4 bg-surface-muted rounded-[12px] text-xs font-medium text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:bg-white focus:border focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pb-3 flex-shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('belum_dikirim')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              filter === 'belum_dikirim'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Belum dikirim</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === 'belum_dikirim' ? 'bg-white/25 text-white' : 'bg-border/60 text-text-secondary'
              }`}
            >
              {counts.belum}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('terkirim')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              filter === 'terkirim'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Terkirim</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === 'terkirim' ? 'bg-white/25 text-white' : 'bg-border/60 text-text-secondary'
              }`}
            >
              {counts.terkirim}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('semua')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              filter === 'semua'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === 'semua' ? 'bg-white/25 text-white' : 'bg-border/60 text-text-secondary'
              }`}
            >
              {counts.total}
            </span>
          </button>
        </div>

        {/* Guest List Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-surface-muted -mx-5 px-5">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-tertiary">
              Tidak ada tamu yang cocok.
            </div>
          ) : (
            filteredGuests.map((g) => {
              const name = decodeHtml(g.nama || 'Tamu')
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              const isSelected = tempSelectedId === g.id
              const hasPhone = !!g.no_wa
              const isSent = g.kirim_status === 'terkirim'

              return (
                <div
                  key={g.id}
                  onClick={() => setTempSelectedId(g.id)}
                  className={`flex items-center justify-between py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-tint/30' : 'hover:bg-surface-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-full bg-primary-tint text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {!hasPhone ? (
                          <span className="bg-warning-tint text-warning text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                            <span>Tanpa nomor WA</span>
                          </span>
                        ) : isSent ? (
                          <span className="text-[11px] text-success font-medium flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Terkirim</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-tertiary truncate">
                            {g.no_wa} • {g.pax || 1} pax
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="flex-shrink-0 pl-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-border bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sticky Submit Button */}
        <div className="pt-3 border-t border-border/50 flex-shrink-0">
          <button
            type="button"
            disabled={!tempSelectedId}
            onClick={handleConfirm}
            className="w-full h-[50px] rounded-button bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Pilih Tamu
          </button>
        </div>
      </div>
    </div>
  )
}
