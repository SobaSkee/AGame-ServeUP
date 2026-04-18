import { Link } from 'react-router-dom'
import { contentShellClass } from '../layout/contentShell'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 w-full overflow-visible border-b border-border/80 bg-background/65 backdrop-blur-[10.5px] backdrop-saturate-150">
      <div className={`${contentShellClass} relative flex h-20 items-center overflow-visible`}>
        <Link to="/" className="flex h-full items-center gap-2" aria-label="ServeUp home">
          <img src="/serve-up-logo.png" alt="" className="h-full w-auto object-contain" decoding="async" />
          <span className="text-2xl font-bold text-primary">
            Serve<span className="text-secondary">Up!</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
