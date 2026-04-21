import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GeneratedRecipe } from '../types/recipe'

type Ctx = {
  recipes: GeneratedRecipe[]
  setRecipes: (recipes: GeneratedRecipe[]) => void
  mergeRecipes: (recipes: GeneratedRecipe[]) => void
  savedIds: Set<string>
  toggleSaved: (recipe: GeneratedRecipe) => Promise<void>
  initSavedIds: (ids: string[]) => void
}

const GeneratedRecipesContext = createContext<Ctx | null>(null)

export function GeneratedRecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const mergeRecipes = useCallback((incoming: GeneratedRecipe[]) => {
    setRecipes((prev) => {
      const existingIds = new Set(prev.map((r) => r.id))
      const toAdd = incoming.filter((r) => !existingIds.has(r.id))
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev
    })
  }, [])

  const initSavedIds = useCallback((ids: string[]) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }, [])

  const toggleSaved = useCallback(async (recipe: GeneratedRecipe) => {
    const isSaved = savedIds.has(recipe.id)
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(recipe.id)) next.delete(recipe.id)
      else next.add(recipe.id)
      return next
    })
    const revert = () => {
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(recipe.id)
        else next.delete(recipe.id)
        return next
      })
    }
    try {
      const res = await fetch('/api/recipes', {
        method: isSaved ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      })
      if (!res.ok) revert()
    } catch {
      revert()
    }
  }, [savedIds])

  const value = useMemo(
    () => ({ recipes, setRecipes, mergeRecipes, savedIds, toggleSaved, initSavedIds }),
    [recipes, savedIds, mergeRecipes, toggleSaved, initSavedIds]
  )

  return (
    <GeneratedRecipesContext.Provider value={value}>{children}</GeneratedRecipesContext.Provider>
  )
}

export function useGeneratedRecipes() {
  const ctx = useContext(GeneratedRecipesContext)
  if (!ctx) {
    throw new Error('useGeneratedRecipes must be used within GeneratedRecipesProvider')
  }
  return ctx
}
