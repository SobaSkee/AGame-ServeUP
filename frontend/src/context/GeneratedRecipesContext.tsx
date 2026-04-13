import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GeneratedRecipe } from '../types/recipe'

type Ctx = {
  recipes: GeneratedRecipe[]
  setRecipes: (recipes: GeneratedRecipe[]) => void
}

const GeneratedRecipesContext = createContext<Ctx | null>(null)

export function GeneratedRecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])

  const value = useMemo(() => ({ recipes, setRecipes }), [recipes])

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
