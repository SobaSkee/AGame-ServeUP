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
