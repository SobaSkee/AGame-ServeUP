import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

export interface MorphedRecipe {
  id: string
  originalTitle: string
  morphedTitle: string
  styleTarget: string
  description: string
  ingredients: { name: string; amount?: string; substitutionReason?: string }[]
  instructions: { step: number; instruction: string; techniqueTip?: string }[]
  nutrition: { calories: number; protein: string; carbs: string; fats: string }
  chefTip: string
}

const MorphedRecipeSchema = z.object({
  morphedTitle: z.string(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional(),
      substitutionReason: z.string().optional(),
    })
  ),
  instructions: z.array(
    z.object({
      step: z.number(),
      instruction: z.string(),
      techniqueTip: z.string().optional(),
    })
  ),
  nutrition: z.object({
    calories: z.number(),
    protein: z.string(),
    carbs: z.string(),
    fats: z.string(),
  }),
  chefTip: z.string(),
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function morphRecipe(
  originalRecipe: {
    title: string
    description?: string
    ingredients?: { name: string; amount?: string }[]
    instructions?: { step: number; instruction: string }[]
  },
  styleTarget: string
): Promise<MorphedRecipe> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are an elite Master Chef specializing in Generative Culinary Style Transfer.

ORIGINAL RECIPE:
Title: ${originalRecipe.title}
Description: ${originalRecipe.description || ''}
Ingredients: ${JSON.stringify(originalRecipe.ingredients || [])}
Instructions: ${JSON.stringify(originalRecipe.instructions || [])}

TARGET CULINARY STYLE TRANSFER: "${styleTarget}" (e.g. Thai Street Food, Ultra-Keto Low Carb, Michelin Star Fine Dining, Tuscan Rustic, Mexican Fusion, High Protein Bodybuilding)

TASK: Generatively morph this recipe into the target style "${styleTarget}".
- Transform ingredient choices and seasonings to match the authentic flavor profile of ${styleTarget}.
- Re-write step-by-step cooking techniques suitable for ${styleTarget}.
- Provide substitution reasons for modified ingredients.
- Recalculate macro and caloric profiles for the morphed dish.

Return ONLY valid JSON matching this exact structure:
{
  "morphedTitle": "New Morphed Recipe Title",
  "description": "Appetizing summary of transformed dish",
  "ingredients": [
    {"name": "Ingredient Name", "amount": "1 tbsp", "substitutionReason": "Replaces X for authentic Thai heat"}
  ],
  "instructions": [
    {"step": 1, "instruction": "Step text", "techniqueTip": "High heat wok stir-fry"}
  ],
  "nutrition": {
    "calories": 450,
    "protein": "32g",
    "carbs": "12g",
    "fats": "18g"
  },
  "chefTip": "Pro tip on plating or technique"
}`

  try {
    if (!process.env.GEMINI_API_KEY) {
      return getMockMorphedRecipe(originalRecipe, styleTarget)
    }

    const response = await model.generateContent([{ text: prompt }])
    const text = response.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON output from Gemini')

    const parsed = JSON.parse(jsonMatch[0])
    const validated = MorphedRecipeSchema.parse(parsed)

    return {
      id: `morphed-${Date.now()}`,
      originalTitle: originalRecipe.title,
      morphedTitle: validated.morphedTitle,
      styleTarget,
      description: validated.description,
      ingredients: validated.ingredients,
      instructions: validated.instructions,
      nutrition: validated.nutrition,
      chefTip: validated.chefTip,
    }
  } catch (error) {
    console.warn('GenAI Morph fallback:', error)
    return getMockMorphedRecipe(originalRecipe, styleTarget)
  }
}

function getMockMorphedRecipe(
  originalRecipe: { title: string; ingredients?: { name: string; amount?: string }[] },
  styleTarget: string
): MorphedRecipe {
  return {
    id: `morphed-mock-${Date.now()}`,
    originalTitle: originalRecipe.title,
    morphedTitle: `${styleTarget} Style ${originalRecipe.title}`,
    styleTarget,
    description: `Generatively transformed "${originalRecipe.title}" into authentic ${styleTarget} style.`,
    ingredients: (originalRecipe.ingredients || []).map((i) => ({
      name: i.name,
      amount: i.amount || 'To taste',
      substitutionReason: `Reinterpreted for ${styleTarget} flavor balance`,
    })),
    instructions: [
      { step: 1, instruction: `Adapt cooking technique to align with traditional ${styleTarget} methods.`, techniqueTip: 'Focus on thermal control' },
      { step: 2, instruction: 'Combine transformed ingredients and let flavors fuse.', techniqueTip: 'Aromatics first' },
      { step: 3, instruction: 'Garnish according to style guidelines and serve hot.', techniqueTip: 'Fresh herbal accent' },
    ],
    nutrition: { calories: 410, protein: '26g', carbs: '20g', fats: '15g' },
    chefTip: `When cooking in ${styleTarget} style, balance acidity and heat at the very end.`,
  }
}
