import type { SuggestedRecipe } from '../types/recipe'

/** Demo thumbnails (Unsplash). Swap for your user uploaded images later. */
export const suggestedRecipes: SuggestedRecipe[] = [
  {
    id: '1',
    title: 'Avocado Toast Supreme',
    imageUrl:
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80',
    matchPercent: 95,
    matchVariant: 'high',
    ingredients: 'Sourdough, Eggs, Chili Flakes',
    time: '15 min',
    calories: '320 cal',
  },
  {
    id: '2',
    title: 'Zesty Shrimp Tacos',
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    matchPercent: 80,
    matchVariant: 'high',
    ingredients: 'Shrimp, Lime, Cabbage, Tortillas',
    time: '30 min',
    calories: '450 cal',
  },
  {
    id: '3',
    title: 'Roasted Tomato Soup',
    imageUrl:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    matchPercent: 60,
    matchVariant: 'medium',
    ingredients: 'Tomatoes, Garlic, Basil, Cream',
    time: '45 min',
    calories: '210 cal',
  },
]
