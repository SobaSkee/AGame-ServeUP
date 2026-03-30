import { useState } from 'react'
import Header from '../components/Header'
import QuickActionCards from '../components/home/QuickActionCards'
import SearchBar from '../components/home/SearchBar'
import SuggestedRecipes from '../components/home/SuggestedRecipes'
import { homeCategoryChips } from '../data/homeCategoryChips'
import { suggestedRecipes } from '../data/suggestedRecipes'
import { contentShellClass } from '../layout/contentShell'

type DetectedIngredient = {
  name: string
  confidence: 'high' | 'medium' | 'low'
  category?: string
}

type RecipeIngredient = {
  name: string
  amount?: string
}

type RecipeInstruction = {
  step: number
  instruction: string
}

type Recipe = {
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

export default function HomeScreen() {
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loadingRecipes, setLoadingRecipes] = useState(false)

  // Get recipes from backend based on detected ingredients
  const getRecipes = async (ingredients: DetectedIngredient[]) => {
    if (ingredients.length === 0) return

    setLoadingRecipes(true)
    try {
      // Convert ingredient names to comma-separated string
      const ingredientList = ingredients.map((ing) => ing.name).join(',')
      
      // Call backend recipe API
      const response = await fetch(
        `http://localhost:3001/api/ingredients/suggest-recipes?ingredients=${encodeURIComponent(ingredientList)}`
      )

      const data = await response.json()

      // Check if recipes were generated successfully
      if (data.success && data.recipes) {
        setRecipes(data.recipes)
      } else {
        console.error('Failed to get recipes:', data.error)
      }
    } catch (error) {
      console.error('Error getting recipes:', error)
    } finally {
      setLoadingRecipes(false)
    }
  }

  // When user detects ingredients, also get recipes
  const handleIngredientsDetected = (ingredients: DetectedIngredient[]) => {
    setDetectedIngredients(ingredients)
    getRecipes(ingredients)
  }
  return (
    <div className="min-h-screen bg-background font-sans text-text antialiased">
      <Header />

      <div className={contentShellClass}>
        <main className="flex flex-col gap-8 pb-10 md:gap-10 md:pb-16 lg:gap-12">
          <section className="flex flex-col gap-8 pt-[23px] pb-8 md:pt-8 md:pb-10 lg:max-w-3xl xl:max-w-full">
            <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-text md:text-4xl md:leading-[1.12] lg:text-5xl lg:leading-[1.1]">
              <span className="lg:hidden">
                What are you
                <br />
                cooking today?
              </span>
              <span className="hidden lg:inline">What are you cooking today?</span>
            </h1>
            <SearchBar />
            <QuickActionCards onIngredientsDetected={handleIngredientsDetected} />
          </section>

          {/* Display detected ingredients */}
          {detectedIngredients.length > 0 && (
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-text">Detected Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {detectedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                      ingredient.confidence === 'high'
                        ? 'bg-green-100 text-green-800'
                        : ingredient.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span>{ingredient.name}</span>
                    <span className="text-[10px] opacity-70">({ingredient.confidence})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI-Generated Recipes Section */}
          {loadingRecipes && (
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="text-sm text-text/65">🤖 Finding recipes for you...</span>
            </section>
          )}

          {recipes.length > 0 && !loadingRecipes && (
            <section className="flex flex-col gap-4 rounded-lg border border-accent bg-surface p-4">
              <h2 className="text-lg font-semibold text-text">✨ Recipe Ideas</h2>

              {recipes.map((recipe) => (
                <div key={recipe.id} className="border border-border rounded-lg p-4 bg-background">
                  {/* Recipe title and difficulty */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-text">{recipe.title}</h3>
                      <p className="text-sm text-text/65 mt-1">{recipe.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        recipe.difficulty === 'easy'
                          ? 'bg-green-100 text-green-800'
                          : recipe.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Recipe info: time, servings, cuisine */}
                  <div className="flex flex-wrap gap-3 text-xs text-text/65 mb-4 pb-4 border-b border-border/30">
                    <span>⏱️ {recipe.prepTime}</span>
                    {recipe.cookTime && <span>🔥 {recipe.cookTime}</span>}
                    {recipe.servings && <span>🍽️ Serves {recipe.servings}</span>}
                    {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
                  </div>

                  {/* Ingredients list */}
                  <div className="mb-4">
                    <h4 className="font-medium text-text mb-2 text-sm">Ingredients:</h4>
                    <ul className="space-y-1 text-sm text-text/80">
                      {recipe.ingredients.map((ing, idx) => {
                        // Check if ingredient was detected
                        const wasDetected = recipe.matchedIngredients.some(
                          (m) => m.toLowerCase() === ing.name.toLowerCase()
                        )
                        
                        return (
                          <li key={idx} className="flex items-start gap-2">
                            <span className={wasDetected ? 'text-green-600' : 'text-text/40'}>
                              {wasDetected ? '✓' : '○'}
                            </span>
                            <span>
                              {ing.name}
                              {ing.amount && <span className="text-text/60"> - {ing.amount}</span>}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Cooking instructions */}
                  <div>
                    <h4 className="font-medium text-text mb-2 text-sm">Steps:</h4>
                    <ol className="space-y-2 text-sm text-text/80">
                      {recipe.instructions.map((inst) => (
                        <li key={inst.step} className="flex gap-3">
                          <span className="font-medium text-text/50 flex-shrink-0">{inst.step}.</span>
                          <span>{inst.instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-2.5" aria-label="Recipe categories">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-0 md:max-w-3xl lg:max-w-none">
              {homeCategoryChips.map(({ id, label, iconSrc }) => (
                <button
                  key={id}
                  type="button"
                  className="flex min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-background py-2.5 pl-4 pr-4 text-sm font-medium text-text transition-colors hover:bg-accent/70"
                >
                  <img src={iconSrc} alt="" className="size-4 shrink-0 object-contain" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <SuggestedRecipes recipes={suggestedRecipes} />
        </main>
      </div>
    </div>
  )
}
