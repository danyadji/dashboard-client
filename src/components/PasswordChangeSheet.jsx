import { useState } from 'react'

export default function PasswordChangeSheet({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  feedback,
  onClearFeedback,
}) {
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [validationError, setValidationError] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setOldPw('')
    setNewPw('')
    setConfirmPw('')
    setValidationError('')
    if (onClearFeedback) onClearFeedback()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    if (!oldPw) {
      setValidationError('Password lama harus diisi')
      return
    }
    if (newPw.length < 8) {
      setValidationError('Password baru minimal 8 karakter')
      return
    }
    if (newPw !== confirmPw) {
      setValidationError('Konfirmasi password baru tidak cocok')
      return
    }

    onSubmit({ oldPw, newPw })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/45 backdrop-blur-[2px] transition-opacity">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Sheet Panel */}
      <div
        className="relative w-full max-w-[430px] rounded-t-[28px] bg-surface p-5 pb-8 shadow-2xl transition-transform max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber handle */}
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">Ganti Password</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Perbarui kata sandi akun dashboard Anda secara aman.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center hover:bg-border/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Validation or API Error / Success Alert */}
        {validationError && (
          <div className="mb-4 rounded-xl bg-danger-tint p-3 text-xs font-medium text-danger flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {feedback?.text && (
          <div
            className={`mb-4 rounded-xl p-3 text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-success-tint text-success'
                : 'bg-danger-tint text-danger'
            }`}
          >
            {feedback.type === 'success' ? (
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Password Lama */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                className="w-full h-11 px-3.5 pr-10 rounded-[14px] bg-surface border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan password saat ini"
                value={oldPw}
                onChange={(e) => {
                  setOldPw(e.target.value)
                  if (validationError) setValidationError('')
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary p-1"
                aria-label={showOld ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showOld ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="w-full h-11 px-3.5 pr-10 rounded-[14px] bg-surface border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                placeholder="Minimal 8 karakter"
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value)
                  if (validationError) setValidationError('')
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary p-1"
                aria-label={showNew ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showNew ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="w-full h-11 px-3.5 pr-10 rounded-[14px] bg-surface border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
                placeholder="Ulangi password baru"
                value={confirmPw}
                onChange={(e) => {
                  setConfirmPw(e.target.value)
                  if (validationError) setValidationError('')
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary p-1"
                aria-label={showConfirm ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showConfirm ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 h-11 rounded-[14px] bg-surface-muted hover:bg-border text-text-primary font-semibold text-sm active:scale-[0.98] transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || oldPw.length < 1 || newPw.length < 8}
              className="flex-1 h-11 rounded-[14px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
