import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import GeneratedRecipeCard from '../components/recipes/GeneratedRecipeCard'

export default function GeneratedRecipesScreen() {
  const navigate = useNavigate()
  const { recipes, savedIds, toggleSaved } = useGeneratedRecipes()

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
              <GeneratedRecipeCard
                key={recipe.id}
                recipe={recipe}
                saved={savedIds.has(recipe.id)}
                onOpen={() => navigate(`/recipe/${encodeURIComponent(recipe.id)}`)}
                onToggleSaved={toggleSaved}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
