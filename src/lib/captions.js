export const CAPTIONS = [
  {
    id: 'simple',
    label: 'Simple',
    text: 'Halo {nama}!\n\nUndangan pernikahan {mempelai}:\n{link}\n\nSampai jumpa di hari bahagia!',
  },
  {
    id: 'islami',
    label: 'Islami',
    text: "Assalamu'alaikum {nama}.\n\nDengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan {mempelai}.\n\n{link}\n\nSemoga Allah memudahkan langkah kita untuk hadir. Atas kehadiran dan doanya, kami ucapkan terima kasih.",
  },
  {
    id: 'formal',
    label: 'Formal',
    text: 'Kepada Yth. {nama},\n\nDengan hormat, kami mengundang Anda beserta keluarga untuk menghadiri pernikahan {mempelai}.\n\n{link}\n\nHadir dan doa restunya sangat kami harapkan.',
  },
  { id: 'kustom', label: 'Kustom', text: '' },
]

const KEY = 'diamora_caption'

export function getSavedCaptionId() {
  const v = localStorage.getItem(KEY)
  return v && CAPTIONS.some((c) => c.id === v) ? v : 'kustom'
}

export function setSavedCaptionId(id) {
  localStorage.setItem(KEY, id)
}

export function resolveCaptionText(id, customTemplate) {
  if (id !== 'kustom') {
    const c = CAPTIONS.find((x) => x.id === id)
    return c ? c.text : ''
  }
  return customTemplate
}
