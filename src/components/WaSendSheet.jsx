import { useEffect, useState } from 'react'
import { composeWaMessage, waLink } from '../lib/tamu.js'
import { getSavedCaptionId, setSavedCaptionId, resolveCaptionText } from '../lib/captions.js'
import CaptionCards from './CaptionCards.jsx'
import TemplateEditorSheet from './TemplateEditorSheet.jsx'

export default function WaSendSheet({ guest, customTemplate, mempelai, onOpened, onClose }) {
  const [captionId, setCaptionId] = useState(getSavedCaptionId())
  const [copied, setCopied] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const template = resolveCaptionText(captionId, customTemplate) || customTemplate || 'Halo {nama}!\n\n{link}'
  const pesan = composeWaMessage(template, guest, mempelai, guest.link_personal)
  const waUrl = waLink(template, guest, mempelai, guest.link_personal)

  function pick(id) {
    setCaptionId(id)
    setSavedCaptionId(id)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 overscroll-contain" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 pb-8 overscroll-contain" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-200" />
        <h3 className="text-base font-semibold">Kirim WhatsApp</h3>
        <p className="mb-3 text-xs text-stone-500">Kepada: {guest.nama}</p>

        <label className="label">Pilih caption</label>
        <CaptionCards
          value={captionId}
          onChange={pick}
          penerimaNama={guest.nama}
          linkPersonal={guest.link_personal}
          customTemplate={customTemplate}
          mempelai={mempelai}
          onEditKustom={() => setEditorOpen(true)}
        />

        <label className="label mt-3">Pratinjau pesan</label>
        <div className="whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-xs text-stone-700">{pesan}</div>

        <div className="mt-4 flex gap-2">
          <button
            className="btn-outline flex-1"
            onClick={async () => { await navigator.clipboard.writeText(pesan); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          >
            {copied ? 'Tersalin' : 'Salin Teks'}
          </button>
          <a className="btn-primary flex-1" href={waUrl} onClick={() => onOpened(guest)}>
            Buka WhatsApp
          </a>
        </div>
        {!guest.no_wa && <p className="mt-2 text-[11px] text-stone-400">No. WA belum diisi, pesan dibuka tanpa penerima, ganti di WhatsApp.</p>}

        {editorOpen && <TemplateEditorSheet onClose={() => setEditorOpen(false)} />}
      </div>
    </div>
  )
}
