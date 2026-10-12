export interface AgentThought {
  agent: 'auditor' | 'architect' | 'scientist' | 'guard'
  agentName: string
  avatar: string
  color: string
  action: string
  message: string
  timestamp: string
}

export interface RecipeIngredient {
  name: string
  amount?: string
}

export interface RecipeInstruction {
  step: number
  instruction: string
}

export interface AgentRecipe {
  id: string
  title: string
  description: string
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  matchedIngredients: string[]
  prepTime: string
  cookTime: string
  servings: string
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fats: string
  }
  safetyScore: number
  wasteReductionScore: number
}
