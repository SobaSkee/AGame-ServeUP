import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import type { GeneratedRecipe } from '../types/recipe'

function cuisineLabel(recipe: GeneratedRecipe): string {
  if (recipe.cuisine?.trim()) return recipe.cuisine.trim().toUpperCase()
  return 'RECIPE'
}

function metaLine(recipe: GeneratedRecipe): string {
  const n = recipe.ingredients?.length ?? 0
  const ing = `${n} ingredient${n === 1 ? '' : 's'}`
  const time = recipe.prepTime?.trim()
  if (time && time !== '—') {
    return `${time} • ${ing}`
  }
  return ing
}

export default function GeneratedRecipesScreen() {
  const navigate = useNavigate()
  const { recipes } = useGeneratedRecipes()
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasRecipes = recipes.length > 0

  const sorted = useMemo(() => [...recipes], [recipes])

  return (
    <div className="min-h-dvh bg-white pb-24 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#18181b] antialiased md:pb-28">
      <header className="sticky top-0 z-10 border-b border-[#f3f4f6] bg-white">
        <div className="relative mx-auto flex h-14 max-w-lg items-center justify-between px-4 md:h-16 md:max-w-3xl md:px-6 lg:max-w-4xl">
          <button
            type="button"
            onClick={() => navigate('/ingredients')}
            className="-ml-2 flex size-10 items-center justify-center rounded-full text-[#111827] outline-none hover:bg-[#f9fafb] focus-visible:ring-2 focus-visible:ring-[#111827]/20"
            aria-label="Back to pantry"
          >
            <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
          </button>
          <p className="absolute left-1/2 -translate-x-1/2 text-[14px] font-semibold tracking-[0.35px] text-[#6b7280]">
            RECIPES
          </p>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-8 pt-10 md:max-w-3xl md:px-10 md:pt-12 lg:max-w-4xl lg:px-12">
        {!hasRecipes ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center md:py-24">
            <p className="max-w-sm text-base leading-relaxed text-[#71717a]">
              No generated recipes yet. Add ingredients and tap Generate Recipes on the pantry screen.
            </p>
            <Link
              to="/ingredients"
              className="rounded-lg bg-[#16a34a] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              Go to pantry
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10 md:gap-12 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-2">
            {sorted.map((recipe) => (
              <article
                key={recipe.id}
                className="flex cursor-pointer flex-col gap-4"
                onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.id)}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/recipe/${encodeURIComponent(recipe.id)}`)
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`Open ${recipe.title}`}
              >
                <div className="relative overflow-hidden rounded-lg bg-[#f4f4f5]">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt=""
                      className="h-[13.375rem] w-full object-cover md:h-56"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className="h-[13.375rem] w-full bg-gradient-to-br from-[#e4e4e7] to-[#f4f4f5] md:h-56"
                      role="img"
                      aria-hidden
                    />
                  )}
                  <div className="absolute right-3 top-3 rounded-sm bg-[#ffffffcf] px-2 py-1 backdrop-blur-[10.5px]">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#18181b]">
                      {cuisineLabel(recipe)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-xl font-extrabold leading-[1.4] tracking-[-0.025em] text-[#18181b] md:text-[1.25rem] font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif]">
                      {recipe.title}
                    </h2>
                    <p className="text-[14px] font-medium leading-[1.43] text-[#71717a]">{metaLine(recipe)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSave(recipe.id)
                    }}
                    className="shrink-0 p-1 text-[#16a34a] outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
                    aria-label={savedIds.has(recipe.id) ? 'Remove from saved' : 'Save recipe'}
                  >
                    {savedIds.has(recipe.id) ? (
                      <BookmarkSolidIcon className="size-[18px] text-[#16a34a]" aria-hidden />
                    ) : (
                      <BookmarkIcon className="size-[18px] text-[#d4d4d8]" aria-hidden />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
