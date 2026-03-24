import { useEffect, useId, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export default function PantryCameraModal({ open, onClose, onCapture }: Props) {
  const titleId = useId()
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) {
      onCapture(f)
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-text">
            Scan pantry
          </h2>
          <p className="mt-1 text-sm text-text/65">
            Take a photo or choose an image from your device.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => cameraRef.current?.click()}
          >
            Take photo
          </button>
          <button
            type="button"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text hover:bg-surface"
            onClick={() => uploadRef.current?.click()}
          >
            Choose from library
          </button>

          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={onFile}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            onChange={onFile}
          />
        </div>

        <div className="flex justify-end border-t border-border px-4 py-3">
          <button
            type="button"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-text hover:bg-surface"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
