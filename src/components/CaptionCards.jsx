import { CAPTIONS, resolveCaptionText } from '../lib/captions.js'
import { composeWaMessage } from '../lib/tamu.js'

function getExcerpt(c, penerimaNama, linkPersonal, mempelai, customTemplate) {
  if (c.id === 'kustom') {
    const kustomText = resolveCaptionText('kustom', customTemplate)
    return kustomText
      ? composeWaMessage(kustomText, { nama: penerimaNama || 'Tamu', no_wa: '' }, mempelai, linkPersonal || '(link)')
          .replace(/\s+/g, ' ')
          .trim()
      : 'Pesan personal kustom pengantin...'
  }

  return composeWaMessage(c.text, { nama: penerimaNama || 'Tamu', no_wa: '' }, mempelai, linkPersonal || '(link)')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function CaptionCards({
  value,
  onChange,
  penerimaNama,
  linkPersonal,
  customTemplate,
  mempelai,
  onEditKustom,
}) {
  return (
    <div>
      {/* Horizontal Template Cards */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {CAPTIONS.map((c) => {
          const active = value === c.id
          const excerpt = getExcerpt(c, penerimaNama, linkPersonal, mempelai, customTemplate)

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`w-[128px] shrink-0 rounded-xl p-2.5 text-left flex flex-col justify-between h-[88px] transition-all relative ${
                active
                  ? 'border-2 border-primary bg-primary-tint/40 shadow-xs'
                  : 'border border-border bg-bg/40 hover:bg-surface-muted/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs ${
                    active ? 'font-bold text-primary' : 'font-semibold text-text-primary'
                  }`}
                >
                  {c.label}
                </span>

                {active && (
                  <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            </button>
          )
        })}
      </div>

      {/* Customization Link */}
      <div className="mt-2.5 pt-2 border-t border-surface-muted flex justify-end">
        <button
          type="button"
          onClick={onEditKustom}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Ubah teks caption kustom</span>
        </button>
      </div>
    </div>
  )
}
