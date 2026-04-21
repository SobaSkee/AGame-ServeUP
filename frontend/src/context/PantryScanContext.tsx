import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type Ctx = {
  queuePantryFromScan: (names: string[]) => void
  consumePendingPantry: () => string[] | null
}

const PantryScanContext = createContext<Ctx | null>(null)

export function PantryScanProvider({ children }: { children: ReactNode }) {
  const pendingRef = useRef<string[] | null>(null)

  const queuePantryFromScan = useCallback((names: string[]) => {
    pendingRef.current = names.length > 0 ? [...names] : null
  }, [])

  const consumePendingPantry = useCallback(() => {
    const next = pendingRef.current
    pendingRef.current = null
    return next
  }, [])

  const value = useMemo(
    () => ({
      queuePantryFromScan,
      consumePendingPantry,
    }),
    [queuePantryFromScan, consumePendingPantry],
  )

  return <PantryScanContext.Provider value={value}>{children}</PantryScanContext.Provider>
}

export function usePantryScan() {
  const ctx = useContext(PantryScanContext)
  if (!ctx) {
    throw new Error('usePantryScan must be used within PantryScanProvider')
  }
  return ctx
}
