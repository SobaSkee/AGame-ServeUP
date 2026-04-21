/**
 * Empty in dev: browser hits `/api` on the Vite host (phone uses `http://YOUR_LAN_IP:5173`), and Vite proxies to the backend.
 * Set `VITE_API_BASE` for production
 */
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '').trim() ?? ''

export const PANTRY_USER_ID: string = (import.meta.env.VITE_PANTRY_USER_ID as string | undefined)?.trim() ?? ''
export const AUTH_TOKEN_STORAGE_KEY = 'serveup_auth_token'

export function apiUrl(apiPath: string): string {
  const p = apiPath.startsWith('/') ? apiPath : `/${apiPath}`
  return API_BASE ? `${API_BASE}${p}` : p
}

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() ?? ''
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getAuthToken()
  if (!token) return extra
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  }
}
