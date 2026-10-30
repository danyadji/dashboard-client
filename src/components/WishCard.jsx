import { useState } from 'react'
import { decodeHtml } from '../lib/decode.js'

function formatWishDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr

  const day = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
  return `${day}, ${time}`
}

export default function WishCard({ wish, onToggle, isToggling }) {
  const [expanded, setExpanded] = useState(false)

  const senderName = decodeHtml(wish.nama || 'Anonim')
  const message = decodeHtml(wish.isi || wish.pesan || '')
  const isHidden = !!wish.tersembunyi
  const timeFormatted = formatWishDate(wish.time || wish.created_at || wish.waktu)
  const isLong = message.length > 180

  return (
    <div
      className={`rounded-[16px] p-4 border transition-all duration-150 ${
        isHidden
          ? 'bg-[#F9F7F5] border-border/70 opacity-70'
          : 'bg-white border-border shadow-[0_1px_4px_rgba(31,29,27,0.03)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-baseline gap-2">
          <h3 className="text-[14px] font-bold text-text-primary truncate">
            {senderName}
          </h3>
          {timeFormatted && (
            <span className="text-[11px] text-text-tertiary shrink-0">
              {timeFormatted}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isToggling}
          onClick={() => onToggle(wish)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer ${
            isHidden
              ? 'bg-border/60 text-text-secondary hover:bg-border'
              : 'bg-primary-tint text-primary hover:bg-primary/20'
          }`}
          title={isHidden ? 'Tampilkan di undangan' : 'Sembunyikan dari undangan'}
        >
          {isToggling ? '...' : isHidden ? 'Tampilkan' : 'Sembunyikan'}
        </button>
      </div>

      <div className="mt-2 text-[13px] leading-relaxed text-text-secondary">
        <p className={`whitespace-pre-wrap break-words ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
          {message}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-primary hover:underline mt-1 cursor-pointer"
          >
            {expanded ? 'Lebih sedikit' : 'Selengkapnya'}
          </button>
        )}
      </div>
    </div>
  )
}
