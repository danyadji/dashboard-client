export default function LogoutConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Panel */}
      <div
        className="relative w-full max-w-[430px] rounded-t-[28px] bg-surface p-5 pb-8 shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber handle */}
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />

        <div className="text-center sm:text-left mb-5">
          <div className="w-12 h-12 rounded-2xl bg-danger-tint text-danger flex items-center justify-center mx-auto sm:mx-0 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            Yakin ingin keluar?
          </h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Kamu harus login ulang dengan username dan password untuk masuk kembali ke dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-12 rounded-[14px] bg-surface-muted hover:bg-border text-text-primary font-semibold text-sm active:scale-[0.98] transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-12 rounded-[14px] bg-danger hover:bg-[#D32F2F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Keluar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
