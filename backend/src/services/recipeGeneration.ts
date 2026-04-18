import { GoogleGenerativeAI } from '@google/generative-ai'

interface RecipeIngredient {
  name: string
  amount?: string
}

interface RecipeInstruction {
  step: number
  instruction: string
}

export interface Recipe {
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
  /** Spoonacular card image when from findByIngredients */
  imageUrl?: string
}

export interface RecipeGenerationResult {
  success: boolean
  recipes: Recipe[]
  rawAnalysis: string
  error?: string
}

/** Spoonacular `findByIngredients` item (subset) */
interface SpoonacularFindItem {
  id: number
  title: string
  image: string
  imageType?: string
  usedIngredientCount?: number
  missedIngredientCount?: number
  usedIngredients?: Array<{
    name: string
    amount?: number
    unit?: string
    unitShort?: string
  }>
  missedIngredients?: Array<{
    name: string
    amount?: number
    unit?: string
    unitShort?: string
  }>
  likes?: number
}

function formatIngredientAmount(amount: unknown, unit: unknown): string | undefined {
  if (amount === undefined || amount === null) return undefined
  const n = typeof amount === 'number' ? amount : Number(amount)
  const u = unit == null || unit === '' ? '' : String(unit).trim()
  if (Number.isNaN(n)) return u || undefined
  const qty = Number.isInteger(n) ? String(n) : String(n)
  return u ? `${qty} ${u}`.trim() : qty
}

/** Time fields from Spoonacular `/recipes/informationBulk` (not in findByIngredients). */
interface SpoonacularRecipeInfo {
  readyInMinutes?: number
  cookingMinutes?: number
  preparationMinutes?: number
}

/**
 * Card subtitle time: prefer active cooking time, else total ready time.
 * findByIngredients does not include these — they come from informationBulk.
 */
function formatRecipeCardTime(info?: SpoonacularRecipeInfo | null): string {
  if (!info) return '—'
  const cook = info.cookingMinutes
  if (cook != null && cook > 0) return `${cook} min`
  const ready = info.readyInMinutes
  if (ready != null && ready > 0) return `${ready} min`
  return '—'
}

function mapSpoonItemToRecipe(item: SpoonacularFindItem, timeInfo?: SpoonacularRecipeInfo | null): Recipe {
  const used = item.usedIngredients ?? []
  const missed = item.missedIngredients ?? []

  const ingredients: RecipeIngredient[] = [
    ...used.map((u) => ({
      name: String(u.name || '').trim(),
      amount: formatIngredientAmount(u.amount, u.unitShort ?? u.unit),
    })),
    ...missed.map((m) => ({
      name: String(m.name || '').trim(),
      amount: formatIngredientAmount(m.amount, m.unitShort ?? m.unit),
    })),
  ].filter((i) => i.name)

  const matchedIngredients = used.map((u) => String(u.name || '').trim()).filter(Boolean)
  const usedN = item.usedIngredientCount ?? used.length
  const missedN = item.missedIngredientCount ?? missed.length

  let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  if (missedN > 6) difficulty = 'hard'
  else if (missedN > 3) difficulty = 'medium'

  let description =
    missedN > 0
      ? `Uses ${usedN} of your ingredients · needs ${missedN} more.`
      : `Uses ${usedN} of your ingredients.`
  if (item.likes != null && item.likes > 0) {
    description += ` ${item.likes} like${item.likes === 1 ? '' : 's'}.`
  }

  /** Shown on recipe cards (time); ingredient count is separate on the client. */
  const prepTime = formatRecipeCardTime(timeInfo)

  return {
    id: String(item.id),
    title: String(item.title || '').trim(),
    description,
    ingredients,
    instructions: [],
    matchedIngredients,
    prepTime,
    cookTime: undefined,
    servings: undefined,
    difficulty,
    cuisine: undefined,
    imageUrl: item.image?.trim() || undefined,
  }
}

async function fetchSpoonacularInformationBulk(
  ids: number[],
  apiKey: string
): Promise<Map<number, SpoonacularRecipeInfo>> {
  const map = new Map<number, SpoonacularRecipeInfo>()
  if (ids.length === 0) return map

  const params = new URLSearchParams({
    ids: ids.join(','),
    includeNutrition: 'false',
  })
  const url = `https://api.spoonacular.com/recipes/informationBulk?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': apiKey,
    },
  })

  if (!res.ok) {
    console.warn('Spoonacular informationBulk failed:', res.status, (await res.text()).slice(0, 200))
    return map
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return map
  }

  if (!Array.isArray(data)) return map

  for (const row of data) {
    const r = row as {
      id?: number
      readyInMinutes?: number
      cookingMinutes?: number
      preparationMinutes?: number
    }
    if (typeof r.id !== 'number') continue
    map.set(r.id, {
      readyInMinutes: r.readyInMinutes,
      cookingMinutes: r.cookingMinutes,
      preparationMinutes: r.preparationMinutes,
    })
  }

  return map
}

async function fetchRecipesFromSpoonacular(ingredientNames: string[]): Promise<{
  recipes: Recipe[]
  raw: string
  error?: string
}> {
  const apiKey = process.env.SPOONACULAR_API_KEY?.trim()
  if (!apiKey) {
    return { recipes: [], raw: '', error: 'SPOONACULAR_API_KEY not set' }
  }

  const names = ingredientNames.map((n) => n.trim()).filter(Boolean)
  if (names.length === 0) {
    return { recipes: [], raw: '', error: 'No ingredients after trim' }
  }

  const number = Math.min(30, Math.max(1, Number(process.env.SPOONACULAR_RECIPE_COUNT) || 10))
  const rankingRaw = Number(process.env.SPOONACULAR_RANKING)
  const ranking = rankingRaw === 2 ? 2 : 1

  const params = new URLSearchParams({
    ingredients: names.join(','),
    number: String(number),
    ranking: String(ranking),
    ignorePantry: 'false',
  })

  const url = `https://api.spoonacular.com/recipes/findByIngredients?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': apiKey,
    },
  })

  const text = await res.text()
  if (!res.ok) {
    console.error('Spoonacular findByIngredients failed:', res.status, text.slice(0, 500))
    return {
      recipes: [],
      raw: text,
      error: `Spoonacular request failed (${res.status})`,
    }
  }

  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch {
    return { recipes: [], raw: text, error: 'Invalid JSON from Spoonacular' }
  }

  if (!Array.isArray(data)) {
    return { recipes: [], raw: text, error: 'Unexpected Spoonacular response shape' }
  }

  const rows = (data as SpoonacularFindItem[]).filter(
    (row) => row && typeof row.id === 'number' && row.title
  )
  const ids = rows.map((r) => r.id)
  const timeById = await fetchSpoonacularInformationBulk(ids, apiKey)

  const recipes = rows.map((row) => mapSpoonItemToRecipe(row, timeById.get(row.id) ?? null))

  return { recipes, raw: text }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Gemini fallback when Spoonacular returns no recipes (or is unavailable).
 */
async function generateRecipesWithGemini(ingredientNames: string[]): Promise<RecipeGenerationResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        recipes: [],
        rawAnalysis: '',
        error: 'GEMINI_API_KEY not configured',
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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

    const response = await model.generateContent([{ text: prompt }])
    const content = response.response.text()

    let recipeData: { recipes?: unknown[] }
    try {
      let jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        jsonMatch = content.match(/\{[\s\S]*\}/)
      }
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) {
        recipeData = { recipes: parsed }
      } else {
        recipeData = parsed as { recipes?: unknown[] }
      }
    } catch {
      console.error('Failed to parse Gemini response:', content)
      return {
        success: false,
        recipes: [],
        rawAnalysis: content,
        error: 'Failed to parse recipes from Gemini response',
      }
    }

    if (!Array.isArray(recipeData.recipes)) {
      return {
        success: false,
        recipes: [],
        rawAnalysis: content,
        error: 'Invalid response structure from Gemini',
      }
    }

    const validatedRecipes: Recipe[] = recipeData.recipes
      .filter((recipe: unknown) => {
        const r = recipe as { title?: string; description?: string }
        return r.title && r.description
      })
      .map((recipe: unknown, index: number) => {
        const r = recipe as Record<string, unknown>
        return {
          id: `recipe-${Date.now()}-${index}`,
          title: String(r.title).trim(),
          description: String(r.description).trim(),
          ingredients: Array.isArray(r.ingredients)
            ? (r.ingredients as { name?: string; amount?: string }[]).map((ing) => ({
                name: String(ing.name || '').trim(),
                amount: ing.amount ? String(ing.amount).trim() : undefined,
              }))
            : [],
          instructions: Array.isArray(r.instructions)
            ? (r.instructions as { step?: number; instruction?: string }[])
                .map((inst) => ({
                  step: parseInt(String(inst.step), 10) || 0,
                  instruction: String(inst.instruction || '').trim(),
                }))
                .sort((a, b) => a.step - b.step)
            : [],
          matchedIngredients: Array.isArray(r.matchedIngredients)
            ? (r.matchedIngredients as unknown[]).map((ing) => String(ing).trim())
            : [],
          prepTime: r.prepTime ? String(r.prepTime).trim() : '15 min',
          cookTime: r.cookTime ? String(r.cookTime).trim() : undefined,
          servings: r.servings ? String(r.servings).trim() : undefined,
          difficulty: ['easy', 'medium', 'hard'].includes(String(r.difficulty || '').toLowerCase())
            ? (String(r.difficulty).toLowerCase() as 'easy' | 'medium' | 'hard')
            : 'easy',
          cuisine: r.cuisine ? String(r.cuisine).trim() : undefined,
        }
      })

    return {
      success: true,
      recipes: validatedRecipes,
      rawAnalysis: content,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Gemini recipe generation error:', errorMessage)
    return {
      success: false,
      recipes: [],
      rawAnalysis: '',
      error: errorMessage,
    }
  }
}

/**
 * Resolves recipes: Spoonacular `findByIngredients` first; Gemini only if no recipes returned.
 */
export async function generateRecipesFromIngredients(
  ingredientNames: string[]
): Promise<RecipeGenerationResult> {
  if (!ingredientNames || ingredientNames.length === 0) {
    return {
      success: false,
      recipes: [],
      rawAnalysis: '',
      error: 'No ingredients provided',
    }
  }

  const spoon = await fetchRecipesFromSpoonacular(ingredientNames)

  if (spoon.recipes.length > 0) {
    return {
      success: true,
      recipes: spoon.recipes,
      rawAnalysis: spoon.raw.slice(0, 8000),
    }
  }

  if (process.env.GEMINI_API_KEY) {
    const gemini = await generateRecipesWithGemini(ingredientNames)
    if (gemini.success && gemini.recipes.length > 0) {
      return gemini
    }
    const combinedError = [spoon.error, gemini.error].filter(Boolean).join(' · ')
    return {
      success: false,
      recipes: [],
      rawAnalysis: gemini.rawAnalysis || spoon.raw,
      error: combinedError || 'No recipes found from Spoonacular or Gemini',
    }
  }

  return {
    success: false,
    recipes: [],
    rawAnalysis: spoon.raw,
    error: spoon.error || 'No recipes returned. Set SPOONACULAR_API_KEY (and optionally GEMINI_API_KEY as fallback).',
  }
}
