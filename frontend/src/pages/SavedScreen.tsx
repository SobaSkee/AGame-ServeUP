import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import GeneratedRecipeCard from '../components/recipes/GeneratedRecipeCard'
import type { GeneratedRecipe } from '../types/recipe'
import { apiUrl, authHeaders } from '../config/api'

export default function SavedScreen() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { mergeRecipes, savedIds, toggleSaved, initSavedIds } = useGeneratedRecipes()

  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    fetch(apiUrl('/api/recipes'), { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.recipes)) {
          setRecipes(data.recipes)
          mergeRecipes(data.recipes)
          initSavedIds(data.recipes.map((r: GeneratedRecipe) => r.id))
        } else {
          setError(data.error ?? data.message ?? 'Could not load saved recipes')
        }
      })
      .catch(() => setError('Network error — is the backend running?'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  // Recipes visible = fetched list minus any that the user has toggled off via the shared context
  const visibleRecipes = recipes.filter((r) => savedIds.has(r.id))

  if (authLoading || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white font-[Inter,ui-sans-serif,system-ui,sans-serif]">
        <p className="text-sm text-[#9ca3af]">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 pb-24 text-center font-[Inter,ui-sans-serif,system-ui,sans-serif]">
        <BookmarkIcon className="size-10 text-[#d1d5db]" strokeWidth={1.5} />
        <p className="max-w-xs text-[#374151]">Sign in to view your saved recipes.</p>
        <Link
          to="/login"
          className="rounded-lg bg-[#16a34a] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pb-24 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#18181b] antialiased md:pb-28">
      <header className="sticky top-0 z-10 border-b border-[#f3f4f6] bg-white">
        <div className="relative mx-auto flex h-14 max-w-lg items-center justify-between px-4 md:h-16 md:max-w-3xl md:px-6 lg:max-w-4xl">
          <p className="text-[14px] font-semibold tracking-[0.35px] text-[#6b7280]">SAVED RECIPES</p>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-8 pt-10 md:max-w-3xl md:px-10 md:pt-12 lg:max-w-4xl lg:px-12">
        {error && (
          <p className="mb-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
            {error}
          </p>
        )}

        {!error && visibleRecipes.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <BookmarkIcon className="size-10 text-[#d1d5db]" strokeWidth={1.5} />
            <p className="max-w-sm text-[#71717a]">
              {recipes.length > 0
                ? 'All recipes unsaved. Bookmark a recipe to see it here.'
                : 'No saved recipes yet. Bookmark a recipe to see it here.'}
            </p>
            <Link
              to="/ingredients"
              className="rounded-lg bg-[#16a34a] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              Find recipes
            </Link>
          </div>
        )}

        {visibleRecipes.length > 0 && (
          <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-2">
            {visibleRecipes.map((recipe) => (
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
