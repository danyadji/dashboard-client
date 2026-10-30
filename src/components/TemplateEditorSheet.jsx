import { useEffect, useState } from 'react'
import { useMe, useMutationApi, api } from '../hooks.js'

export default function TemplateEditorSheet({ onClose }) {
  const me = useMe()
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (me.data && !ready) {
      setText(me.data.template_pesan || '')
      setReady(true)
    }
  }, [me.data, ready])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = useMutationApi(
    () => api('/me/message-template', { method: 'PUT', body: { template: text } }),
    ['me', 'guests']
  )

  const insertPlaceholder = (tag) => {
    setText((prev) => `${prev} ${tag}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] overscroll-contain"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-8 shadow-2xl overscroll-contain animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 mb-4" />
        <h3 className="text-base font-bold text-text-primary">
          Teks Caption Kustom
        </h3>
        <p className="mt-1 text-xs text-text-secondary leading-relaxed">
          Gunakan placeholder di bawah agar teks personalisasi terisi otomatis sesuai nama tamu dan link undangan:
        </p>

        {/* Quick Insert Chips */}
        <div className="flex flex-wrap gap-2 my-3">
          {['{nama}', '{link}', '{mempelai}'].map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => insertPlaceholder(ph)}
              className="px-2.5 py-1 rounded-full bg-primary-tint text-primary font-mono text-xs font-semibold hover:bg-primary/20 active:scale-95 transition-all"
            >
              + {ph}
            </button>
          ))}
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setMsg('')
          }}
          placeholder="Halo {nama}, kami mengundang Anda ke pernikahan {mempelai}: {link}"
          className="w-full rounded-input border border-border bg-white p-3.5 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none font-sans leading-relaxed"
          autoFocus
        />

        {msg && (
          <p className="mt-2.5 rounded-[10px] bg-success-tint border border-success/20 p-2.5 text-xs text-success font-medium">
            {msg}
          </p>
        )}
        {save.error && (
          <p className="mt-2.5 rounded-[10px] bg-danger-tint border border-danger/20 p-2.5 text-xs text-danger font-medium">
            {save.error.message}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 h-[48px] rounded-button border border-border bg-white text-text-secondary font-semibold text-xs sm:text-sm hover:bg-surface-muted active:scale-[0.98] transition-all"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={save.isPending || text === (me.data?.template_pesan || '')}
            onClick={() =>
              save.mutate(undefined, {
                onSuccess: () => {
                  setMsg('Template berhasil disimpan.')
                  setTimeout(() => onClose(), 800)
                },
              })
            }
            className="flex-1 h-[48px] rounded-button bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {save.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
