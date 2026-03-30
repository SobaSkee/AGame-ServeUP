import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

interface DetectedIngredient {
  name: string
  confidence: 'high' | 'medium' | 'low'
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'other'
}

interface IngredientDetectionResult {
  success: boolean
  ingredients: DetectedIngredient[]
  rawAnalysis: string
  error?: string
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Analyzes an image file to detect ingredients using Google Gemini 2.5 Flash
 * Fast, accurate, and cost-effective for ingredient detection
 */
export async function detectIngredientsFromImage(
  imagePath: string
): Promise<IngredientDetectionResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        ingredients: [],
        rawAnalysis: '',
        error: 'GEMINI_API_KEY not configured. Get one from https://aistudio.google.com/apikey',
      }
    }

    // Verify image file exists
    if (!fs.existsSync(imagePath)) {
      return {
        success: false,
        ingredients: [],
        rawAnalysis: '',
        error: `Image file not found: ${imagePath}`,
      }
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = getMimeType(imagePath)

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Prepare the prompt
    const prompt = `You are an expert food and ingredient identifier. Analyze this image of a pantry, kitchen, or food scene.

TASK: Identify ALL visible food ingredients and items. Be thorough - include:
- Fresh produce (vegetables, fruits)
- Dairy products
- Meats and proteins
- Pantry staples (oils, spices, grains, canned goods)
- Condiments and sauces
- Beverages

For each ingredient, assess your confidence level:
- "high": Clearly visible, easily identifiable
- "medium": Partially visible or reasonable assumption
- "low": Blurry, partially hidden, or uncertain

IMPORTANT: Return ONLY valid JSON (no markdown, no explanations, no code blocks):
{
  "ingredients": [
    {
      "name": "ingredient name",
      "confidence": "high" or "medium" or "low",
      "category": "produce" or "dairy" or "meat" or "pantry" or "other"
    }
  ]
}

Example response format:
{
  "ingredients": [
    {"name": "Tomatoes", "confidence": "high", "category": "produce"},
    {"name": "Olive Oil", "confidence": "high", "category": "pantry"},
    {"name": "Basil", "confidence": "medium", "category": "produce"}
  ]
}

Now analyze this image and return only the JSON response:`

    // Call the Gemini API with vision
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ])

    const content = response.response.text()

    // Parse the JSON response
    let analysisData
    try {
      // Extract JSON from response (in case there's any extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      analysisData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content)
      return {
        success: false,
        ingredients: [],
        rawAnalysis: content,
        error: 'Failed to parse ingredients from Gemini response',
      }
    }

    // Validate the response structure
    if (!Array.isArray(analysisData.ingredients)) {
      return {
        success: false,
        ingredients: [],
        rawAnalysis: content,
        error: 'Invalid response structure from Gemini',
      }
    }

    // Ensure all ingredients have the correct type structure
    const validatedIngredients: DetectedIngredient[] = analysisData.ingredients
      .filter(
        (ing: any) =>
          ing.name && ing.confidence && ['high', 'medium', 'low'].includes(ing.confidence),
      )
      .map((ing: any) => ({
        name: String(ing.name).trim(),
        confidence: ing.confidence as 'high' | 'medium' | 'low',
        category: (ing.category || 'other') as
          | 'produce'
          | 'dairy'
          | 'meat'
          | 'pantry'
          | 'other',
      }))

    return {
      success: true,
      ingredients: validatedIngredients,
      rawAnalysis: content,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error detecting ingredients:', errorMessage)
    return {
      success: false,
      ingredients: [],
      rawAnalysis: '',
      error: errorMessage,
    }
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }
  return mimeTypes[ext] || 'image/jpeg'
}

export type { DetectedIngredient, IngredientDetectionResult }
