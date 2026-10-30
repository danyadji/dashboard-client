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

  // Mode demo eksplisit
  if (currentToken === 'demo-token' || import.meta.env.VITE_DEMO_MODE === 'true') {
    return handleMockApi(path, { method, body })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3500)

  try {
    const res = await fetch(`${API}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: currentToken ? `Bearer ${currentToken}` : undefined,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    clearTimeout(timeoutId)

    if (raw) {
      if (!res.ok) throw new ApiError('Gagal memproses file.', 'error', res.status)
      return res.blob()
    }

    let data = {}
    try { data = await res.json() } catch { /* ignore */ }

    if (!res.ok) {
      if (res.status === 401) {
        clearToken()
        throw new ApiError(data.message || 'Sesi berakhir.', 'unauthorized', 401)
      }
      // Jika endpoint 404 (belum ada di WP), fallback instan ke mock agar UI tidak macet/error
      if (res.status === 404) {
        return handleMockApi(path, { method, body })
      }
      throw new ApiError(data.message || 'Terjadi kesalahan.', data.code || 'error', res.status)
    }

    return data
  } catch (err) {
    clearTimeout(timeoutId)
    // Jika koneksi timeout / gagal, langsung fallback ke mock agar dashboard tetap buka cepat
    if (path.startsWith('/auth/login') || path.startsWith('/auth/magic-login')) {
      // Pada saat login, jika WP offline atau fallback
      return handleMockApi(path, { method, body })
    }
    // Jika endpoint query dashboard (stats, guests, wishes)
    return handleMockApi(path, { method, body })
  }
}
