import { useState } from 'react'

const CATEGORIES = [
  { id: 'keluarga', label: 'Keluarga' },
  { id: 'teman', label: 'Teman' },
  { id: 'kantor', label: 'Kantor' },
  { id: 'lainnya', label: 'Lainnya' },
]

export default function GuestForm({
  initial,
  saving,
  error,
  onSubmit,
  showCancel = false,
  onCancel,
  submitLabel = 'Simpan Tamu',
}) {
  const [f, setF] = useState(initial)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const setVal = (k, v) => setF({ ...f, [k]: v })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(f)
      }}
    >
      {/* Nama Tamu */}
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">
          Nama Tamu *
        </label>
        <input
          className="w-full h-[52px] rounded-input border border-border bg-white px-4 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={f.nama || ''}
          onChange={set('nama')}
          placeholder="Bapak Budi & Keluarga"
          required
          autoFocus
        />
      </div>

      {/* Nomor WhatsApp */}
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">
          Nomor WhatsApp (Opsional)
        </label>
        <input
          className="w-full h-[52px] rounded-input border border-border bg-white px-4 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          inputMode="tel"
          value={f.no_wa || ''}
          onChange={set('no_wa')}
          placeholder="081234567890"
        />
      </div>

      {/* Kategori Chips */}
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">
          Kategori
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = (f.kategori || 'lainnya') === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setVal('kategori', cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Catatan Internal */}
      <div>
        <label className="block text-[13px] font-medium text-text-primary mb-1.5">
          Catatan Internal (Opsional)
        </label>
        <textarea
          rows={2}
          className="w-full rounded-input border border-border bg-white p-3 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
          value={f.catatan || ''}
          onChange={set('catatan')}
          placeholder="Misal: Meja VIP, teman SMA, titip souvenir"
        />
      </div>

      {/* Error helper */}
      {error && (
        <div className="rounded-[10px] bg-danger-tint border border-danger/20 p-3 text-xs text-danger font-medium">
          {error}
        </div>
      )}

      {/* Submit / Cancel Buttons */}
      <div className="flex gap-2 pt-2">
        {showCancel && (
          <button
            type="button"
            className="flex-1 h-[52px] rounded-button border border-border bg-white text-text-secondary font-semibold text-sm hover:bg-surface-muted active:scale-[0.98] transition-all"
            onClick={onCancel}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className={`h-[52px] rounded-button bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            showCancel ? 'flex-[1.5]' : 'w-full'
          }`}
          disabled={!f.nama || saving}
        >
          {saving ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
