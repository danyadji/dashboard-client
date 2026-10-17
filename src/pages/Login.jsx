import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { api, setToken, getToken, clearToken } from '../hooks.js'

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successName, setSuccessName] = useState('')
  const [shakeKey, setShakeKey] = useState(0)

  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (getToken()) {
      nav('/dashboard', { replace: true })
    }
  }, [nav])

  async function submit(e) {
    e.preventDefault()
    if (loading) return
    if (!username.trim() || !password) {
      setError('Masukkan username dan password Anda.')
      setShakeKey((prev) => prev + 1)
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: { username, password },
      })

      clearToken()
      setToken(res.token)

      // Ambil nama client jika tersedia dari response
      const clientName =
        res.user?.display_name ||
        res.user?.name ||
        res.client_name ||
        res.user?.user_display_name ||
        username.split('@')[0] ||
        'Mempelai'

      setSuccessName(clientName)

      // Transisi singkat menyapa pengguna sebelum redirect
      setTimeout(() => {
        nav('/dashboard', { replace: true })
      }, 1000)
    } catch (err) {
      setError(err.message || 'Email atau password salah')
      setShakeKey((prev) => prev + 1)
      setLoading(false)
    }
  }

  function handleDemoLogin() {
    clearToken()
    setToken('demo-token')
    setSuccessName('Client Demo')
    setTimeout(() => {
      nav('/dashboard', { replace: true })
    }, 600)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: shouldReduceMotion ? 0 : [-8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    },
  }

  const adminWa = import.meta.env.VITE_ADMIN_WA || '6281234567890'
  const waContactUrl = `https://wa.me/${adminWa}?text=${encodeURIComponent(
    'Halo Admin Diamora, saya ingin bertanya tentang akun Dashboard Client.'
  )}`

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between items-center px-5 py-6 sm:py-8 font-sans antialiased selection:bg-primary-tint selection:text-primary-dark">
      {/* Shell Container: Mobile 390px - 430px centered */}
      <div className="w-full max-w-[390px] flex-1 flex flex-col justify-between">
        
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 pt-1"
        >
          {/* Logo Avatar [D] */}
          <div className="w-11 h-11 rounded-[14px] bg-primary flex items-center justify-center text-white font-bold text-xl shadow-[0_2px_8px_rgba(169,121,90,0.25)] flex-shrink-0">
            D
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-text-primary leading-tight">
              Diamora Invitation
            </h1>
            <p className="text-xs text-text-secondary leading-tight mt-0.5">
              Dashboard Client
            </p>
          </div>
        </motion.div>

        {/* Center Section: Illustration + Heading + Form */}
        <div className="my-auto py-3">
          {/* SVG Illustration with Floating Elements */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-7 relative"
          >
            {/* Outer Subtle Dashed Ring Container */}
            <div className="relative w-[210px] h-[210px] rounded-full flex items-center justify-center">
              {/* Dotted/Dashed outer decorative circle */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#D2B8A6]/70 bg-gradient-to-b from-[#F4ECE5]/60 via-[#F4ECE5]/20 to-transparent" />

              {/* Inner White Badge with Soft Shadow */}
              <div className="relative w-[172px] h-[172px] rounded-full bg-white shadow-[0_6px_28px_rgba(169,121,90,0.08)] border border-[#F4ECE5] flex items-center justify-center overflow-visible">
                {/* SVG Illustration */}
                <svg
                  width="158"
                  height="158"
                  viewBox="0 0 158 158"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ringGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E3BD70" />
                      <stop offset="50%" stopColor="#C89736" />
                      <stop offset="100%" stopColor="#AE7C22" />
                    </linearGradient>
                  </defs>

                  {/* Gentle Floating Group for Rings and Stars */}
                  <motion.g
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: [0, -3.5, 0],
                          }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 3.5,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Sparkle Stars */}
                    <path
                      d="M44 48 L45.5 44 L47 48 L51 49.5 L47 51 L45.5 55 L44 51 L40 49.5 Z"
                      fill="#C89736"
                      opacity="0.85"
                    />
                    <path
                      d="M111 47 L112.5 43 L114 47 L118 48.5 L114 50 L112.5 54 L111 50 L107 48.5 Z"
                      fill="#C89736"
                      opacity="0.85"
                    />

                    {/* Wedding Ring Left */}
                    <circle
                      cx="71"
                      cy="51"
                      r="14.5"
                      stroke="url(#ringGoldGrad)"
                      strokeWidth="3.2"
                      fill="none"
                    />

                    {/* Wedding Ring Right (Interlocked) */}
                    <circle
                      cx="87"
                      cy="51"
                      r="14.5"
                      stroke="url(#ringGoldGrad)"
                      strokeWidth="3.2"
                      fill="none"
                    />

                    {/* Highlight arc */}
                    <circle
                      cx="71"
                      cy="51"
                      r="13"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="5 18"
                      fill="none"
                      opacity="0.75"
                    />
                  </motion.g>

                  {/* Botanical Laurel Branches */}
                  <motion.g
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: [0, -2, 0],
                          }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 3.8,
                      ease: 'easeInOut',
                    }}
                    stroke="#C2A68C"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  >
                    {/* Left Laurel Branch */}
                    <path d="M47 88 C43 78 43 65 48 54" />
                    <path d="M48 56 C44 53 43 50 45 50 C47 50 48 53 48 56 Z" fill="#D6C0AB" />
                    <path d="M46 64 C41 62 40 59 42 59 C44 59 46 61 46 64 Z" fill="#D6C0AB" />
                    <path d="M45 73 C40 72 39 69 41 69 C43 69 45 71 45 73 Z" fill="#D6C0AB" />
                    <path d="M47 82 C43 82 42 79 44 79 C46 79 47 80 47 82 Z" fill="#D6C0AB" />

                    {/* Right Laurel Branch */}
                    <path d="M111 88 C115 78 115 65 110 54" />
                    <path d="M110 56 C114 53 115 50 113 50 C111 50 110 53 110 56 Z" fill="#D6C0AB" />
                    <path d="M112 64 C117 62 118 59 116 59 C114 59 112 61 112 64 Z" fill="#D6C0AB" />
                    <path d="M113 73 C118 72 119 69 117 69 C115 69 113 71 113 73 Z" fill="#D6C0AB" />
                    <path d="M111 82 C115 82 116 79 114 79 C112 79 111 80 111 82 Z" fill="#D6C0AB" />
                  </motion.g>

                  {/* Wedding Envelope */}
                  <g filter="drop-shadow(0px 3px 6px rgba(169,121,90,0.09))">
                    {/* Envelope Body */}
                    <rect
                      x="46"
                      y="54"
                      width="66"
                      height="44"
                      rx="4"
                      fill="#FFFFFF"
                      stroke="#E7E2DC"
                      strokeWidth="1.3"
                    />

                    {/* Envelope Inner Side Folds */}
                    <path
                      d="M46 98 L70 76"
                      stroke="#EFE8E1"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M112 98 L88 76"
                      stroke="#EFE8E1"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Envelope Bottom Triangle Fold */}
                    <path
                      d="M46 98 L79 74 L112 98"
                      fill="#FAF9F7"
                      stroke="#E7E2DC"
                      strokeWidth="1.1"
                    />

                    {/* Envelope Flap Fold Down */}
                    <path
                      d="M46 54 L79 80 L112 54 Z"
                      fill="#FFFFFF"
                      stroke="#E3DDD5"
                      strokeWidth="1.3"
                    />

                    {/* Circular Wax Seal / Emblem */}
                    <circle cx="79" cy="78" r="8.5" fill="#8C6247" />
                    {/* Wax Seal Inner Heart / Chevron */}
                    <path
                      d="M76 76.5 L79 79.5 L82 76.5"
                      stroke="#FAF9F7"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Heading and Tagline */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-6"
          >
            <motion.h2
              variants={itemVariants}
              className="text-[26px] font-bold text-text-primary tracking-tight leading-tight"
            >
              {successName ? `Halo, ${successName}` : 'Selamat Datang'}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-text-secondary mt-1.5 leading-normal"
            >
              {successName
                ? 'Membuka dashboard Anda...'
                : 'Kelola tamu undangan Anda dengan mudah'}
            </motion.p>
          </motion.div>

          {/* Login Form with Shake Animation on Error */}
          <motion.form
            key={shakeKey}
            variants={shakeVariants}
            animate={shakeKey > 0 ? 'shake' : 'idle'}
            onSubmit={submit}
            className="space-y-4"
          >
            {/* Field: Username / Email */}
            <div>
              <label
                htmlFor="username"
                className="block text-[13px] font-medium text-text-primary mb-1.5"
              >
                Username / Email
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="client_demo@diamora.test"
                disabled={loading || !!successName}
                className="w-full h-[52px] px-4 rounded-[14px] bg-white border border-border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-muted disabled:opacity-60"
              />
            </div>

            {/* Field: Password with Show/Hide Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-text-primary mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading || !!successName}
                  className="w-full h-[52px] pl-4 pr-12 rounded-[14px] bg-white border border-border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-muted disabled:opacity-60 tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-[52px] w-12 flex items-center justify-center text-text-tertiary hover:text-text-secondary focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    /* Eye Off Icon */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    /* Eye Icon */
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[10px] bg-danger-tint border border-danger/20 p-3 text-xs text-danger font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading || !!successName}
                className="w-full h-[52px] rounded-button bg-primary text-white font-semibold text-[15px] shadow-[0_2px_8px_rgba(169,121,90,0.18)] hover:bg-primary-dark active:scale-[0.98] transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full h-11 rounded-button bg-primary-tint/60 hover:bg-primary-tint text-primary font-semibold text-xs border border-primary/20 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4 fill-primary" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>Coba Mode Demo (1-Klik Masuk)</span>
              </button>
            </div>
          </motion.form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="pb-2 text-center text-xs text-text-tertiary"
        >
          <span>Belum punya akun? </span>
          <a
            href={waContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Hubungi admin Diamora.
          </a>
        </motion.div>
      </div>
    </div>
  )
}
