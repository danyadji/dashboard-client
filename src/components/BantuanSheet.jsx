import { useState } from 'react'

const guides = [
  {
    category: 'Panduan Singkat',
    items: [
      {
        q: 'Cara menambah atau mengimpor daftar tamu',
        a: 'Buka menu Tamu, lalu tekan tombol "+ Tambah Tamu" untuk menambah satu per satu, atau tekan ikon Import untuk mengunggah file CSV/Excel daftar tamu Anda sekaligus.',
      },
      {
        q: 'Cara mengirim undangan personal via WhatsApp',
        a: 'Buka menu Kirim, pilih penerima dari daftar tamu, pilih gaya pesan (Simple, Islami, Formal, atau Kustom), lalu tekan "Buka WhatsApp" atau "Salin Link Undangan" untuk dibagikan secara langsung.',
      },
      {
        q: 'Cara memantau RSVP kehadiran dan ucapan tamu',
        a: 'Pantau status kehadiran tamu langsung di ringkasan Beranda dan tab Tamu. Ucapan hangat dari tamu dapat Anda baca atau sembunyikan di tab Ucapan.',
      },
    ],
  },
  {
    category: 'Pertanyaan Umum (FAQ)',
    items: [
      {
        q: 'Mengapa nomor WhatsApp tamu ditandai belum ada?',
        a: 'Tamu yang diimpor tanpa kolom nomor HP atau tidak diisi akan ditandai "Tanpa nomor WA". Anda tetap bisa mengirim undangan dengan menekan "Salin Link" lalu membagikannya manual, atau memperbarui nomor di detail tamu.',
      },
      {
        q: 'Apa bedanya Link Umum dan Link Personal?',
        a: 'Link umum dapat dibagikan bebas di grup atau media sosial tanpa nama spesifik di sampul. Link personal secara otomatis menampilkan nama tamu yang bersangkutan pada sampul undangan digital.',
      },
      {
        q: 'Apakah ucapan yang disembunyikan akan terhapus?',
        a: 'Tidak. Ucapan yang dinonaktifkan sakelarnya hanya disembunyikan dari halaman undangan publik, namun data tetap tersimpan aman di dashboard Anda dan bisa dimunculkan kembali kapan saja.',
      },
      {
        q: 'Bagaimana cara mengubah tanggal acara atau nama mempelai?',
        a: 'Data informasi inti pernikahan dikonfigurasi melalui sistem pusat Diamora. Silakan hubungi admin kami melalui tombol WhatsApp di bawah untuk pembaruan data.',
      },
    ],
  },
]

export default function BantuanSheet({
  isOpen,
  onClose,
  adminWa,
  kontakText,
}) {
  const [openItems, setOpenItems] = useState({ '0-0': true })
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const filteredGuides = guides.map((group, gIdx) => {
    const matchingItems = group.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
    return {
      ...group,
      gIdx,
      items: matchingItems,
    }
  }).filter((group) => group.items.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Panel */}
      <div
        className="relative w-full max-w-[430px] rounded-t-[28px] bg-surface flex flex-col shadow-2xl transition-transform max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber handle */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="mx-auto h-1 w-12 rounded-full bg-border" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              Bantuan &amp; Panduan
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Panduan penggunaan dan solusi pertanyaan umum
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center hover:bg-border/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik bantuan..."
              className="w-full h-10 pl-9 pr-3.5 rounded-[12px] bg-surface-muted border border-border text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary text-xs"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Accordions List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
          {filteredGuides.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              Tidak ada topik bantuan yang cocok dengan kata kunci &quot;{search}&quot;.
            </div>
          ) : (
            filteredGuides.map((group) => (
              <div key={group.category} className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                  {group.category}
                </span>
                <div className="space-y-1.5">
                  {group.items.map((item, iIdx) => {
                    const key = `${group.gIdx}-${iIdx}`
                    const isOpen = !!openItems[key]
                    return (
                      <div
                        key={key}
                        className="rounded-[14px] border border-border bg-surface-muted/50 overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="w-full min-h-[44px] px-3.5 py-2.5 text-left flex items-center justify-between gap-3 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors"
                        >
                          <span>{item.q}</span>
                          <svg
                            className={`w-4 h-4 shrink-0 text-text-tertiary transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3 text-xs leading-relaxed text-text-secondary border-t border-border/50 pt-2">
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky WhatsApp Admin CTA at bottom */}
        <div className="p-4 border-t border-border bg-surface shrink-0">
          <a
            href={`https://wa.me/${adminWa}?text=${encodeURIComponent(kontakText)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full h-12 rounded-[14px] bg-wa-green hover:bg-[#1EBE5D] active:scale-[0.98] transition-transform text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.838 11.838 0 005.71 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span>Hubungi Admin WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  )
}
