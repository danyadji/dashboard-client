import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMe, useQueryClient, useMutation, api } from '../hooks.js'
import GuestForm from '../components/GuestForm.jsx'
import WaSendSheet from '../components/WaSendSheet.jsx'
import { emptyForm } from '../lib/tamu.js'

export default function TamuBaru() {
  const nav = useNavigate()
  const me = useMe()
  const qc = useQueryClient()
  const [saved, setSaved] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [formError, setFormError] = useState('')
  const [waGuest, setWaGuest] = useState(null)

  const save = useMutation({
    mutationFn: (f) => api('/guests', { method: 'POST', body: f }),
    onSuccess: (guest) => {
      qc.invalidateQueries({ queryKey: ['guests'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setSaved(guest)
      setFormError('')
    },
    onError: (e) => setFormError(e.message),
  })

  if (saved) {
    const customTemplate = me.data?.template_pesan || ''
    const mempelai = me.data?.undangan?.mempelai || ''
    return (
      <div className="space-y-4">
        <div className="card text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-2xl text-green-700">&#10003;</div>
          <h2 className="text-base font-semibold">Tamu tersimpan</h2>
          <p className="mt-1 text-sm text-stone-500">{saved.nama}</p>
          <p className="mt-4 break-all rounded-lg bg-stone-50 p-2.5 text-xs text-stone-600">{saved.link_personal}</p>
          <div className="mt-3">
            <button
              className="btn-primary w-full"
              onClick={() => setWaGuest(saved)}
            >
              Kirim sekarang
            </button>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            Membuka pratinjau pesan: pilih caption, salin teks, atau langsung ke WhatsApp.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex-1" onClick={() => { setSaved(null); setFormKey(formKey + 1); setFormError('') }}>
            Tambah Lagi
          </button>
          <Link to="/tamu" className="btn-primary flex-1">Selesai</Link>
        </div>
        {waGuest && (
          <WaSendSheet
            guest={saved}
            customTemplate={customTemplate}
            mempelai={mempelai}
            onOpened={() => {}}
            onClose={() => setWaGuest(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <header className="flex items-center gap-2">
        <button className="text-stone-400" onClick={() => nav(-1)} aria-label="Kembali">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Tambah Tamu</h1>
      </header>
      <div className="card">
        <GuestForm
          key={formKey}
          initial={emptyForm}
          saving={save.isPending}
          error={formError}
          onSubmit={(f) => save.mutate(f)}
          submitLabel="Simpan Tamu"
        />
      </div>
    </div>
  )
}
