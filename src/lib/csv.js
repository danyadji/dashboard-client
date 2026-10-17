export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const sample = src.split('\n')[0] || ''
  const delim = [';', ',', '\t']
    .map((d) => [d, ([...sample.matchAll(new RegExp(`\\${d}|"[^"]*"`, 'g'))] || []).length])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || ','

  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  const flushField = () => { row.push(field); field = '' }
  const flushRow = () => {
    flushField()
    if (row.length > 1 || row[0].trim() !== '') rows.push(row)
    row = []
  }

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      flushField()
    } else if (c === '\n') {
      flushRow()
    } else {
      field += c
    }
  }
  if (field !== '' || row.length > 0) flushRow()
  return rows
}

export function csvToObjects(rows) {
  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const hasHeader = header.some((h) => ['nama', 'nama tamu'].includes(h))
  const keys = hasHeader
    ? header.map((h) => (h === 'nama tamu' ? 'nama' : h === 'no. wa' || h === 'no wa' || h === 'nomor wa' ? 'no_wa' : h === 'jumlah pax' || h === 'jumlah tamu' ? 'pax' : h))
    : ['nama', 'no_wa', 'kategori', 'pax', 'catatan']
  const body = hasHeader ? rows.slice(1) : rows
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ''])))
}

export function objectsToCsv(rows, header) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  return [header.map(esc).join(';'), ...rows.map((r) => header.map((h) => esc(r[h])).join(';'))].join('\r\n')
}

export function downloadFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
