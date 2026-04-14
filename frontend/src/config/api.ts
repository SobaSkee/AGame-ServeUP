/**
 * Empty in dev: browser hits `/api` on the Vite host (phone uses `http://YOUR_LAN_IP:5173`), and Vite proxies to the backend.
 * Set `VITE_API_BASE` for production or if you need a direct backend URL.
 */
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''
export const PANTRY_USER_ID: string = (import.meta.env.VITE_PANTRY_USER_ID as string | undefined)?.trim() ?? ''