import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Tamu from './pages/Tamu.jsx'
import TamuBaru from './pages/TamuBaru.jsx'
import TamuImport from './pages/TamuImport.jsx'
import Kirim from './pages/Kirim.jsx'
import Ucapan from './pages/Ucapan.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import { getToken, useMe } from './hooks.js'

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
  )
}
