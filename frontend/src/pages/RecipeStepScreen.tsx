import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import type { GeneratedRecipe } from '../types/recipe'

function instructionBlocks(recipe: GeneratedRecipe): { title: string; body: string }[] {
  const rows = [...(recipe.instructions ?? [])].sort((a, b) => a.step - b.step)
  if (rows.length === 0) {
    return [
      {
        title: 'No steps yet',
        body:
          recipe.description?.trim() ||
          'This recipe was matched from your pantry. Detailed steps may appear when the full recipe is loaded.',
      },
    ]
  }
  return rows.map((row, i) => {
    const text = String(row.instruction || '').trim()
    const nl = text.indexOf('\n')
    if (nl > 0 && nl < 48) {
      const title = text.slice(0, nl).trim()
      const body = text.slice(nl + 1).trim()
      if (body.length > 0) return { title, body }
    }
    return {
      title: `Step ${row.step || i + 1}`,
      body: text || '—',
    }
  })
}

export default function RecipeStepScreen() {
  const { recipeId, stepNum } = useParams<{ recipeId: string; stepNum: string }>()
  const navigate = useNavigate()
  const { recipes } = useGeneratedRecipes()

  const recipe = useMemo(
    () => recipes.find((r) => r.id === recipeId) ?? null,
    [recipes, recipeId]
  )

  const stepNumber = useMemo(() => {
    const num = parseInt(stepNum || '1', 10)
    return isNaN(num) ? 1 : num
  }, [stepNum])

  const allSteps = useMemo(() => {
    if (!recipe) return []
    return instructionBlocks(recipe)
  }, [recipe])

  const currentStep = useMemo(() => {
    const index = stepNumber - 1
    return allSteps[index] || null
  }, [allSteps, stepNumber])

  const totalSteps = allSteps.length
  const hasPrev = stepNumber > 1
  const hasNext = stepNumber < totalSteps

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Step not found</h1>
          <Link to={`/recipe/${recipeId}`} className="text-blue-600 hover:text-blue-800">
            View full recipe
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/recipe/${recipeId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Recipe
            </button>
            <div className="text-sm text-gray-500">
              Step {stepNumber} of {totalSteps}
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStep.title}
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {currentStep.body}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(`/recipe/${recipeId}/step/${stepNumber - 1}`)}
            disabled={!hasPrev}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              hasPrev
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Previous
          </button>

          <button
            onClick={() => navigate(`/recipe/${recipeId}/step/${stepNumber + 1}`)}
            disabled={!hasNext}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              hasNext
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
            <ChevronRightIcon className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Jump to full recipe */}
        <div className="text-center mt-4">
          <Link
            to={`/recipe/${recipeId}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View full recipe
          </Link>
        </div>
      </div>
    </div>
  )
}