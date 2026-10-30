import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { getToken, useMe } from './hooks.js'

const Login = lazy(() => import('./pages/Login.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Tamu = lazy(() => import('./pages/Tamu.jsx'))
const TamuBaru = lazy(() => import('./pages/TamuBaru.jsx'))
const TamuImport = lazy(() => import('./pages/TamuImport.jsx'))
const Kirim = lazy(() => import('./pages/Kirim.jsx'))
const Ucapan = lazy(() => import('./pages/Ucapan.jsx'))
const Pengaturan = lazy(() => import('./pages/Pengaturan.jsx'))

function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )
}

function RequireAuth({ children }) {
  const nav = useNavigate()
  const hasToken = !!getToken()
  const me = useMe(hasToken)
  useEffect(() => { if (!hasToken) nav('/login', { replace: true }) }, [hasToken, nav])

  if (!hasToken) return null
  if (me.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  if (me.error) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="mb-2 font-medium">Sesi tidak valid atau undangan belum tersedia.</p>
          <p className="mb-4 text-sm text-stone-500">Hubungi admin Diamora untuk bantuan.</p>
          <button className="btn-primary" onClick={() => { localStorage.removeItem('diamora_token'); nav('/login', { replace: true }) }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/tamu" element={<RequireAuth><Tamu /></RequireAuth>} />
          <Route path="/tamu/baru" element={<RequireAuth><TamuBaru /></RequireAuth>} />
          <Route path="/tamu/import" element={<RequireAuth><TamuImport /></RequireAuth>} />
          <Route path="/kirim" element={<RequireAuth><Kirim /></RequireAuth>} />
          <Route path="/ucapan" element={<RequireAuth><Ucapan /></RequireAuth>} />
          <Route path="/pengaturan" element={<RequireAuth><Pengaturan /></RequireAuth>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
