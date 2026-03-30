import { GoogleGenerativeAI } from '@google/generative-ai'

interface RecipeIngredient {
  name: string
  amount?: string
}

interface RecipeInstruction {
  step: number
  instruction: string
}

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  matchedIngredients: string[]
  prepTime: string
  cookTime?: string
  servings?: string
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
}

interface RecipeGenerationResult {
  success: boolean
  recipes: Recipe[]
  rawAnalysis: string
  error?: string
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Generates recipes based on detected ingredients using Google Gemini
 * 
 * @param ingredientNames - Array of ingredient names detected from pantry
 * @returns Promise with array of generated recipes
 */
export async function generateRecipesFromIngredients(
  ingredientNames: string[]
): Promise<RecipeGenerationResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        recipes: [],
        rawAnalysis: '',
        error: 'GEMINI_API_KEY not configured. Get one from https://aistudio.google.com/apikey',
      }
    }

    if (!ingredientNames || ingredientNames.length === 0) {
      return {
        success: false,
        recipes: [],
        rawAnalysis: '',
        error: 'No ingredients provided',
      }
    }

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create a prompt for recipe generation
    const ingredientList = ingredientNames.join(', ')
    const prompt = `You are an expert chef and recipe creator. Given these available ingredients: ${ingredientList}

Generate 3 creative, practical, and delicious recipes that can be made primarily with these ingredients.

IMPORTANT: Return ONLY valid JSON (no markdown, no explanations):
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "2-3 sentence description of the dish",
      "ingredients": [
        {"name": "ingredient name", "amount": "1 cup"},
        {"name": "ingredient name", "amount": "2 tablespoons"}
      ],
      "instructions": [
        {"step": 1, "instruction": "First step"},
        {"step": 2, "instruction": "Second step"},
        {"step": 3, "instruction": "Third step"}
      ],
      "matchedIngredients": ["ingredient1", "ingredient2"],
      "prepTime": "15 min",
      "cookTime": "20 min",
      "servings": "4",
      "difficulty": "easy",
      "cuisine": "Italian"
    }
  ]
}

Requirements:
- Each recipe should use at least 3-4 of the provided ingredients
- Include matched ingredients that are from the provided list
- Keep difficulty levels realistic (easy, medium, or hard)
- Prep and cook times should be realistic
- Instructions should be clear and numbered
- Servings should be realistic (2-6 people typical)
- Cuisine type should be included when applicable

Now generate 3 recipes using the provided ingredients:`

    // Call Gemini API
    const response = await model.generateContent([{ text: prompt }])
    const content = response.response.text()

    // Parse the JSON response
    let recipeData
    try {
      // Extract JSON from response (in case there's any extra text)
      // Try to match array first, then object
      let jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        jsonMatch = content.match(/\{[\s\S]*\}/)
      }
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])
      
      // If it's an array directly, wrap it in recipes object
      if (Array.isArray(parsed)) {
        recipeData = { recipes: parsed }
      } else {
        recipeData = parsed
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content)
      return {
        success: false,
        recipes: [],
        rawAnalysis: content,
        error: 'Failed to parse recipes from Gemini response',
      }
    }

    // Validate the response structure
    if (!Array.isArray(recipeData.recipes)) {
      return {
        success: false,
        recipes: [],
        rawAnalysis: content,
        error: 'Invalid response structure from Gemini',
      }
    }

    // Validate and transform recipes
    const validatedRecipes: Recipe[] = recipeData.recipes
      .filter((recipe: any) => recipe.title && recipe.description)
      .map((recipe: any, index: number) => ({
        id: `recipe-${Date.now()}-${index}`,
        title: String(recipe.title).trim(),
        description: String(recipe.description).trim(),
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients.map((ing: any) => ({
              name: String(ing.name || '').trim(),
              amount: ing.amount ? String(ing.amount).trim() : undefined,
            }))
          : [],
        instructions: Array.isArray(recipe.instructions)
          ? recipe.instructions
              .map((inst: any) => ({
                step: parseInt(inst.step) || 0,
                instruction: String(inst.instruction || '').trim(),
              }))
              .sort((a: RecipeInstruction, b: RecipeInstruction) => a.step - b.step)
          : [],
        matchedIngredients: Array.isArray(recipe.matchedIngredients)
          ? recipe.matchedIngredients.map((ing: any) => String(ing).trim())
          : [],
        prepTime: recipe.prepTime ? String(recipe.prepTime).trim() : '15 min',
        cookTime: recipe.cookTime ? String(recipe.cookTime).trim() : undefined,
        servings: recipe.servings ? String(recipe.servings).trim() : undefined,
        difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty?.toLowerCase())
          ? (recipe.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard')
          : 'easy',
        cuisine: recipe.cuisine ? String(recipe.cuisine).trim() : undefined,
      }))

    return {
      success: true,
      recipes: validatedRecipes,
      rawAnalysis: content,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error generating recipes:', errorMessage)
    return {
      success: false,
      recipes: [],
      rawAnalysis: '',
      error: errorMessage,
    }
  }
}

export type { Recipe, RecipeIngredient, RecipeInstruction, RecipeGenerationResult }
