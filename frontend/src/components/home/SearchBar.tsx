import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = () => {
    const t = query.trim()
    if (!t) return
    navigate(`/ingredients?add=${encodeURIComponent(t)}`)
    setQuery('')
  }

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-text md:left-5">
        <MagnifyingGlassIcon className="size-[15px] md:size-4" strokeWidth={2} aria-hidden />
      </div>
      <label htmlFor="home-search" className="sr-only">
        Search recipes or ingredients
      </label>
      <input
        id="home-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Search ingredients to generate recipes…"
        className="h-12 w-full rounded-xl border border-border bg-surface py-[15px] pl-11 pr-4 text-sm font-normal leading-normal text-text placeholder:text-text/45 shadow-none outline-none ring-0 transition-[box-shadow] focus:border-secondary/40 focus:ring-2 focus:ring-secondary/20 md:h-14 md:pl-[52px] md:pr-5 md:text-base"
      />
    </div>
  )
}
