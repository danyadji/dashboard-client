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
  const message = decodeHtml(wish.isi || '')
  const isHidden = !!wish.tersembunyi
  const timeFormatted = formatWishDate(wish.time || wish.created_at || wish.waktu)

  const initials = senderName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isLong = message.length > 150

  return (
    <div
      className={`bg-white rounded-[20px] p-[18px] border border-border shadow-card flex flex-col transition-all duration-200 ${
        isHidden ? 'opacity-70 border-border/80' : 'opacity-100'
      }`}
    >
      {/* Top Row: Avatar + Sender Info + Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/* Avatar Initials */}
          <div
            className={`w-10 h-10 rounded-full font-bold text-[14px] flex items-center justify-center flex-shrink-0 tracking-tight transition-colors ${
              isHidden
                ? 'bg-surface-muted text-text-secondary'
                : 'bg-primary-tint text-primary'
            }`}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-text-primary leading-tight truncate">
              {senderName}
            </h3>
            <span className="text-[12px] text-text-tertiary mt-0.5 block">
              {timeFormatted || 'Baru saja'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold flex-shrink-0 transition-colors ${
            isHidden
              ? 'bg-surface-muted text-text-secondary'
              : 'bg-success-tint text-success'
          }`}
        >
          {isHidden ? 'Disembunyikan' : 'Tampil'}
        </span>
      </div>

      {/* Message Body (Plain Text only, decoded from WordPress) */}
      <div className="mb-3.5">
        <p
          className={`text-[15px] text-text-secondary leading-[22px] whitespace-pre-wrap break-words ${
            !expanded && isLong ? 'line-clamp-3' : ''
          }`}
        >
          {message}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-primary hover:underline mt-1"
          >
            {expanded ? 'Lebih sedikit' : 'Selengkapnya'}
          </button>
        )}
      </div>

      {/* Bottom Row: Toggle Switch for Visibility */}
      <div className="pt-3 border-t border-border/70 flex items-center justify-between">
        <span
          className={`text-[13px] transition-colors ${
            isHidden ? 'text-text-tertiary' : 'text-text-secondary'
          }`}
        >
          {isHidden ? 'Tersembunyi dari undangan' : 'Tampil di undangan'}
        </span>

        {/* Accessible Switch Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={!isHidden}
          disabled={isToggling}
          onClick={() => onToggle(wish)}
          className={`w-11 h-6 rounded-full p-0.5 transition-colors shadow-inner flex items-center outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${
            !isHidden ? 'bg-primary justify-end' : 'bg-border justify-start'
          }`}
          title={isHidden ? 'Tampilkan di undangan' : 'Sembunyikan dari undangan'}
          aria-label={isHidden ? 'Tampilkan di undangan' : 'Sembunyikan dari undangan'}
        >
          <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
        </button>
      </div>
    </div>
  )
}
