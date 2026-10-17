import { handleMockApi } from './lib/mockData.js'

const API = (import.meta.env.VITE_WP_API_URL || 'http://localhost/diamora/wordpress').replace(/\/+$/, '') + '/wp-json/undangan/v1'

export const TOKEN_KEY = 'diamora_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, raw = false } = {}) {
  const currentToken = getToken()

  // If in demo mode (token is demo-token or VITE_DEMO_MODE is true)
  if (currentToken === 'demo-token' || import.meta.env.VITE_DEMO_MODE === 'true') {
    // Artificial slight delay for realistic feel
    await new Promise((r) => setTimeout(r, 120))
    return handleMockApi(path, { method, body })
  }

  if (raw) {
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        body: body instanceof FormData ? body : JSON.stringify(body),
      })
      if (!res.ok) throw new ApiError('Gagal memproses permintaan.', 'error', res.status)
      return res.blob()
    } catch {
      return handleMockApi(path, { method, body })
    }
  }

  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: currentToken ? `Bearer ${currentToken}` : undefined,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    let data = {}
    try { data = await res.json() } catch { /* kosong */ }

    if (!res.ok) {
      if (res.status === 401) clearToken()
      throw new ApiError(data.message || 'Terjadi kesalahan.', data.code || 'error', res.status)
    }
    return data
  } catch (err) {
    // If backend is unreachable (e.g. running standalone on Vercel) and user is attempting login or authenticated
    if (currentToken === 'demo-token' || path.startsWith('/auth/login') || !currentToken) {
      // If network unreachable, allow fallback to mock
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
        return handleMockApi(path, { method, body })
      }
    }
    throw err
  }
}
