import type { GeneratedRecipe } from '../types/recipe'

export const RECENT_RECIPES_STORAGE_KEY = 'recentRecipes'

export type RecentRecipeEntry = {
  id: string
  title: string
  imageUrl?: string
  timeDisplay: string
  ingredientCount: number
  recipe?: GeneratedRecipe
}

function normalizeEntry(item: unknown): RecentRecipeEntry | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>
  const id = String(o.id ?? '')
  const title = String(o.title ?? '')
  if (!id || !title) return null
  const imageUrl = o.imageUrl != null && o.imageUrl !== '' ? String(o.imageUrl) : undefined
  const timeDisplay = typeof o.timeDisplay === 'string' ? o.timeDisplay : '—'
  const ingredientCount =
    typeof o.ingredientCount === 'number' && Number.isFinite(o.ingredientCount)
      ? o.ingredientCount
      : 0
  const recipe =
    o.recipe && typeof o.recipe === 'object' ? (o.recipe as GeneratedRecipe) : undefined
  return { id, title, imageUrl, timeDisplay, ingredientCount, recipe }
}

export function parseRecentRecipes(raw: string | null): RecentRecipeEntry[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as unknown[]
    if (!Array.isArray(arr)) return []
    return arr.map(normalizeEntry).filter((e): e is RecentRecipeEntry => e != null)
  } catch {
    return []
  }
}

export function persistRecentRecipe(entry: RecentRecipeEntry) {
  const prev = parseRecentRecipes(localStorage.getItem(RECENT_RECIPES_STORAGE_KEY))
  const arr = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, 10)
  localStorage.setItem(RECENT_RECIPES_STORAGE_KEY, JSON.stringify(arr))
}
