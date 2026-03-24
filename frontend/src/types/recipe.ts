export type MatchBadgeVariant = 'high' | 'medium'

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
