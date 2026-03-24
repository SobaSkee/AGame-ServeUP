import { UserCircleIcon } from '@heroicons/react/24/solid'
import { contentShellClass } from '../layout/contentShell'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 w-full overflow-visible border-b border-border/80 bg-background/65 backdrop-blur-[10.5px] backdrop-saturate-150">
      <div
        className={`${contentShellClass} relative flex h-20 items-center justify-between overflow-visible`}
      >
        <a href="/" className="flex h-full items-center gap-2" aria-label="ServeUp home">
          <img src="/serve-up-logo.png" alt="" className="h-full w-auto object-contain" decoding="async" />
          <span className="text-2xl font-bold text-primary">Serve<span className="text-secondary">Up!</span></span>
        </a>

        <button
          type="button"
          className="box-border grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface p-0 text-text/55 outline-none transition-opacity hover:text-text focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Open profile"
        >
          <UserCircleIcon className="block size-6 shrink-0 text-current" aria-hidden />
        </button>
      </div>
    </header>
  )
}
