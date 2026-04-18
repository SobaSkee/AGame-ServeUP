export type MatchBadgeVariant = 'high' | 'medium'

/** API shape from `/api/ingredients/suggest-recipes` */
export type GeneratedRecipe = {
  id: string
  title: string
  description: string
  ingredients: { name: string; amount?: string }[]
  instructions: { step: number; instruction: string }[]
  matchedIngredients: string[]
  prepTime: string
  cookTime?: string
  servings?: string
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  /** Spoonacular recipe image */
  imageUrl?: string
}

export type SuggestedRecipe = {
  id: string
  title: string
  imageUrl?: string
  matchPercent: number
  matchVariant: MatchBadgeVariant
  ingredients: string
  time: string
  calories: string
}
