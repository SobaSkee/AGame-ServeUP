import { CameraIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

export default function QuickActionCards() {
  return (
    <div className="flex w-full flex-row gap-3 md:gap-4">
      <button
        type="button"
        className="flex h-32 min-h-0 min-w-0 flex-1 flex-col justify-between rounded-xl border border-border bg-background p-5 text-left transition-colors hover:bg-surface md:h-36"
      >
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-text">
          <CameraIcon className="size-[15px]" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex flex-col gap-0">
          <span className="text-sm font-semibold leading-5 text-text">Scan Pantry</span>
          <span className="text-xs font-normal leading-4 text-text/65">AI Recognition</span>
        </div>
      </button>

      <button
        type="button"
        className="flex h-32 min-h-0 min-w-0 flex-1 flex-col justify-between rounded-xl border border-border bg-background p-5 text-left transition-colors hover:bg-surface md:h-36"
      >
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-text">
          <PencilSquareIcon className="size-[15px]" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-5 text-text">Manual Add</span>
          <span className="text-xs font-normal leading-4 text-text/65">Type ingredients</span>
        </div>
      </button>
    </div>
  )
}
