import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQueryClient, api } from '../hooks.js'
import { parseCsv, csvToObjects, objectsToCsv, downloadFile } from '../lib/csv.js'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_ROWS = 2000

const TEMPLATE_HEADER = ['nama', 'no_wa', 'kategori', 'jumlah_tamu', 'catatan']
const TEMPLATE_ROWS = [
  { nama: 'Bapak Budi & Keluarga', no_wa: '081234567890', kategori: 'keluarga', jumlah_tamu: 4, catatan: '' },
  { nama: 'Sari Wijaya', no_wa: '6281234567890', kategori: 'teman', jumlah_tamu: 1, catatan: 'sahabat kampus' },
]

function isWaValid(raw) {
  const d = (raw || '').replace(/\D+/g, '')
  if (!d) return true
  const norm = d.startsWith('0') ? '62' + d.slice(1) : d
  return /^62\d{7,13}$/.test(norm) || /^8\d{7,13}$/.test(d)
}

function validateRow(r, i) {
  const nama = (r.nama || '').trim()
  if (!nama) return { row: i + 1, reason: 'Nama kosong' }
  if (/^[=+@-]/.test(nama.trim().charAt(0))) return { row: i + 1, reason: 'Awalan sel tidak aman (=,+,-,@)' }
  if (r.no_wa && !isWaValid(r.no_wa)) return { row: i + 1, reason: 'No WA tidak valid' }
  return null
}

export default function TamuImport() {
  const nav = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [rows, setRows] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  const [result, setResult] = useState(null)
  const [importing, setImporting] = useState(false)

  function onFile(e) {
    const file = e.target.files?.[0]
    setError('')
    setResult(null)
    if (!file) return
    if (!/\.csv$/i.test(file.name)) {
      setError('File harus CSV. Simpan Excel sebagai "CSV UTF-8" dulu ya.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Ukuran file maksimal 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const objects = csvToObjects(parseCsv(String(reader.result || ''))).slice(0, MAX_ROWS)
      if (!objects.length) {
        setError('File kosong atau format tidak terbaca.')
        return
      }
      setRows(objects)
      setFileName(file.name)
    }
    reader.onerror = () => setError('Gagal membaca file.')
    reader.readAsText(file, 'utf-8')
  }

  function validData() {
    return (rows || []).filter((r) => !validateRow(r, 0))
  }

  async function startImport() {
    setImporting(true)
    setError('')
    try {
      const res = await api('/guests/import', { method: 'POST', body: { rows: validData() } })
      setResult(res)
      qc.invalidateQueries({ queryKey: ['guests'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setRows(null)
    } catch (e) {
      setError(e.message || 'Gagal mengimpor.')
    } finally {
      setImporting(false)
    }
  }

  function downloadTemplate() {
    downloadFile('template-tamu-diamora.csv', objectsToCsv(TEMPLATE_ROWS, TEMPLATE_HEADER))
  }

  if (result) {
    return (
      <div className="space-y-3">
        <header className="flex items-center gap-2">
          <button className="text-stone-400" onClick={() => { setResult(null); setRows(null); setFileName(''); fileRef.current.value = '' }} aria-label="Kembali">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Hasil Import</h1>
        </header>
        <div className="card">
          <p className="text-sm">
            <span className="font-semibold text-green-700">{result.imported} tamu</span> berhasil ditambahkan
            {result.gagal.length ? `, ${result.gagal.length} baris gagal.` : '.'}
          </p>
        </div>
        {result.gagal.length > 0 && (
          <div className="card">
            <p className="label">Baris yang gagal</p>
            <ul className="space-y-1 text-xs text-red-600">
              {result.gagal.map((g, i) => (
                <li key={i}>Baris {g.row}: {g.reason}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          <Link to="/tamu" className="btn-primary flex-1">Lihat Tamu</Link>
          <button className="btn-outline flex-1" onClick={() => setResult(null)}>Import Lagi</button>
        </div>
      </div>
    )
  }

  const rowsValidated = rows ? rows.map((r, i) => ({ r, err: validateRow(r, i) })) : []
  const gagal = rowsValidated.filter((x) => x.err).length
  const preview = rowsValidated.slice(0, 20)

  return (
    <div className="space-y-3">
      <header className="flex items-center gap-2">
        <button className="text-stone-400" onClick={() => nav(-1)} aria-label="Kembali">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Import Tamu</h1>
      </header>

      <div className="card">
        <p className="mb-2 text-sm font-medium">1. Unduh template dulu (opsional)</p>
        <p className="mb-3 text-[11px] text-stone-400">Kolom: nama, no_wa, kategori (keluarga/teman/kantor/lainnya), jumlah_tamu, catatan.</p>
        <button className="btn-outline w-full" onClick={downloadTemplate}>Unduh Template CSV</button>
      </div>

      <div className="card">
        <p className="mb-2 text-sm font-medium">2. Pilih file CSV</p>
        <input ref={fileRef} type="file" accept=".csv" className="input py-2 text-xs" onChange={onFile} />
        {fileName && rows && <p className="mt-2 text-[11px] text-stone-400">{fileName} — {rows.length} baris terbaca.</p>}
        {error && <p className="mt-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">{error}</p>}
      </div>

      {rows && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">3. Pratinjau</p>
            <span className={`text-[11px] font-medium ${gagal ? 'text-red-500' : 'text-green-600'}`}>
              {gagal ? `${gagal} baris bermasalah` : `${rows.length} baris siap`}
            </span>
          </div>
          {gagal > 0 && (
            <ul className="mb-2 space-y-0.5 text-[11px] text-red-500">
              {rowsValidated.filter((x) => x.err).slice(0, 5).map((x, i) => (
                <li key={i}>Baris {x.err.row}: {x.err.reason}</li>
              ))}
              {gagal > 5 && <li>…dan {gagal - 5} lainnya</li>}
            </ul>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-stone-400">
                  <th className="py-1 pr-2 font-medium">#</th>
                  {['nama', 'no_wa', 'kategori', 'jumlah_tamu'].map((h) => <th key={h} className="py-1 pr-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((x, i) => (
                  <tr key={i} className={x.err ? 'bg-red-50' : ''}>
                    <td className="py-1 pr-2 text-stone-400">{x.err ? x.err.row : i + 1}</td>
                    <td className="py-1 pr-2 font-medium">{x.r.nama}</td>
                    <td className="py-1 pr-2">{x.r.no_wa || '-'}</td>
                    <td className="py-1 pr-2">{x.r.kategori || 'lainnya'}</td>
                    <td className="py-1 pr-2">{x.r.pax || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 20 && <p className="mt-1 text-[11px] text-stone-400">…menampilkan 20 dari {rows.length} baris.</p>}
          <button className="btn-primary mt-3 w-full" disabled={importing || rowsValidated.every((x) => x.err)}
            onClick={startImport}>
            {importing ? 'Mengimpor…' : `Import ${validData().length} Tamu`}
          </button>
        </div>
      )}

      <p className="pb-2 text-center text-[11px] text-stone-300">Maksimal 2 MB atau 2.000 baris per import.</p>
    </div>
  )
}
