import { useState, useMemo } from 'react'
import { useWishes, useMutationApi, api } from '../hooks.js'
import WishCard from '../components/WishCard.jsx'

export default function Ucapan() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('semua') // 'semua' | 'tampil' | 'disembunyikan'
  const [toastMsg, setToastMsg] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const wishes = useWishes(page)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2200)
  }

  const items = wishes.data?.items || []
  const totalWishes = wishes.data?.total ?? items.length

  // Optimistic Toggle Mutation
  const toggleMutation = useMutationApi(
    (w) =>
      api(`/wishes/${w.id}`, {
        method: 'PUT',
        body: { tersembunyi: !w.tersembunyi },
      }),
    ['wishes', 'stats']
  )

  const handleToggle = (w) => {
    setTogglingId(w.id)
    const nextState = !w.tersembunyi

    toggleMutation.mutate(w, {
      onSuccess: () => {
        setTogglingId(null)
        showToast(
          nextState
            ? 'Ucapan disembunyikan dari undangan'
            : 'Ucapan ditampilkan di undangan'
        )
      },
      onError: (err) => {
        setTogglingId(null)
        showToast(err.message || 'Gagal mengubah status ucapan')
      },
    })
  }

  // Filtered items based on active chip
  const filteredItems = useMemo(() => {
    if (filter === 'tampil') {
      return items.filter((w) => !w.tersembunyi)
    }
    if (filter === 'disembunyikan') {
      return items.filter((w) => !!w.tersembunyi)
    }
    return items
  }, [items, filter])

  // Count calculations
  const counts = useMemo(() => {
    const tampil = items.filter((w) => !w.tersembunyi).length
    const disembunyikan = items.filter((w) => !!w.tersembunyi).length
    return {
      semua: totalWishes,
      tampil,
      disembunyikan,
    }
  }, [items, totalWishes])

  return (
    <div className="pb-24 antialiased relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. App Bar Header */}
      <header className="sticky top-0 z-20 -mx-4 sm:-mx-5 px-4 sm:px-5 pt-1 pb-2 bg-bg/95 backdrop-blur-md border-b border-border/50">
        <div className="h-14 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-bold leading-tight text-text-primary tracking-tight">
              Ucapan
            </h1>
            <p className="text-[12px] text-text-secondary font-medium leading-none mt-0.5">
              {totalWishes} ucapan masuk
            </p>
          </div>

          {/* Filter icon button */}
          <button
            type="button"
            onClick={() =>
              setFilter((prev) =>
                prev === 'semua'
                  ? 'tampil'
                  : prev === 'tampil'
                  ? 'disembunyikan'
                  : 'semua'
              )
            }
            aria-label="Filter Ucapan"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-white text-text-secondary hover:bg-surface-muted transition-colors active:scale-95 shadow-xs"
            title="Ganti filter ucapan"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </button>
        </div>

        {/* 2. Filter Chips Carousel */}
        <div className="relative -mx-4 sm:-mx-5 px-4 sm:px-5 mt-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 pr-6">
            {/* Chip: Semua */}
            <button
              type="button"
              onClick={() => setFilter('semua')}
              className={`inline-flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[13px] tracking-tight shrink-0 transition-all active:scale-95 ${
                filter === 'semua'
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-white text-text-secondary font-medium border border-border hover:bg-surface-muted'
              }`}
            >
              <span>Semua</span>
              <span className={`text-[12px] font-medium ${filter === 'semua' ? 'opacity-90' : 'text-text-tertiary'}`}>
                {counts.semua}
              </span>
            </button>

            {/* Chip: Tampil */}
            <button
              type="button"
              onClick={() => setFilter('tampil')}
              className={`inline-flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[13px] tracking-tight shrink-0 transition-all active:scale-95 ${
                filter === 'tampil'
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-white text-text-secondary font-medium border border-border hover:bg-surface-muted'
              }`}
            >
              <span>Tampil</span>
              <span className={`text-[12px] font-medium ${filter === 'tampil' ? 'opacity-90' : 'text-text-tertiary'}`}>
                {counts.tampil}
              </span>
            </button>

            {/* Chip: Disembunyikan */}
            <button
              type="button"
              onClick={() => setFilter('disembunyikan')}
              className={`inline-flex items-center gap-1.5 px-4 h-[38px] rounded-full text-[13px] tracking-tight shrink-0 transition-all active:scale-95 ${
                filter === 'disembunyikan'
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-white text-text-secondary font-medium border border-border hover:bg-surface-muted'
              }`}
            >
              <span>Disembunyikan</span>
              <span className={`text-[12px] font-medium ${filter === 'disembunyikan' ? 'opacity-90' : 'text-text-tertiary'}`}>
                {counts.disembunyikan}
              </span>
            </button>
          </div>

          {/* Right subtle fade mask */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
        </div>
      </header>

      {/* 3. Main Wish List Area */}
      <main className="pt-3">
        {wishes.isLoading ? (
          /* Skeleton Loader */
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[20px] p-[18px] border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-muted" />
                    <div className="space-y-1">
                      <div className="w-28 h-4 bg-surface-muted rounded" />
                      <div className="w-16 h-3 bg-surface-muted rounded" />
                    </div>
                  </div>
                  <div className="w-14 h-5 bg-surface-muted rounded-full" />
                </div>
                <div className="w-full h-12 bg-surface-muted rounded" />
                <div className="pt-3 border-t border-border/70 flex justify-between items-center">
                  <div className="w-28 h-3 bg-surface-muted rounded" />
                  <div className="w-11 h-6 bg-surface-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[20px] border border-border shadow-card text-center my-6">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-primary mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Belum ada ucapan
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-[240px] leading-relaxed">
              {filter !== 'semua'
                ? 'Tidak ada ucapan pada filter ini.'
                : 'Ucapan dan doa dari para tamu undangan akan tampil di sini.'}
            </p>
          </div>
        ) : (
          /* Wish Cards Stack */
          <div className="flex flex-col gap-4">
            {filteredItems.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                onToggle={handleToggle}
                isToggling={togglingId === wish.id}
              />
            ))}
          </div>
        )}

        {/* 4. Pagination */}
        {(wishes.data?.pages || 0) > 1 && (
          <div className="flex items-center justify-between pt-5 pb-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-10 px-4 rounded-button border border-border bg-white text-xs font-semibold text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnya
            </button>
            <span className="text-xs font-medium text-text-tertiary">
              Halaman {page} dari {wishes.data.pages}
            </span>
            <button
              type="button"
              disabled={page >= wishes.data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 px-4 rounded-button border border-border bg-white text-xs font-semibold text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
