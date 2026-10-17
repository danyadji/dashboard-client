export const emptyForm = { id: 0, nama: '', no_wa: '', kategori: 'lainnya', pax: 1, catatan: '', rsvp_status: 'belum_respon' }

export const RSVP_LABEL = {
  belum_respon: { t: 'Belum respon', c: 'bg-stone-100 text-stone-500' },
  hadir: { t: 'Hadir', c: 'bg-green-100 text-green-700' },
  tidak_hadir: { t: 'Tidak hadir', c: 'bg-red-100 text-red-600' },
  ragu: { t: 'Ragu', c: 'bg-amber-100 text-amber-700' },
}

export function composeWaMessage(template, guest, mempelai, link) {
  return (template || '')
    .replaceAll('\\n', '\n')
    .replaceAll('{nama}', guest.nama)
    .replaceAll('{link}', link)
    .replaceAll('{mempelai}', mempelai)
}

export function normalizePhone(raw) {
  if (!raw) return ''
  let d = raw.replace(/\D+/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  return d
}

export function waLink(template, guest, mempelai, link) {
  const msg = composeWaMessage(template, guest, mempelai, link)
  const no = normalizePhone(guest.no_wa || '')
  return no ? `https://wa.me/${no}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`
}

