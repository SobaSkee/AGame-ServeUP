
import { useParams, useNavigate } from 'react-router-dom'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import { ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function RecipeStepScreen() {
  const { recipeId, stepNum } = useParams<{ recipeId: string; stepNum: string }>()
  const { recipes } = useGeneratedRecipes()
  const navigate = useNavigate()
  const recipe = recipes.find((r) => r.id === recipeId)
  const sortedSteps = recipe?.instructions
    ? [...recipe.instructions].sort((a, b) => a.step - b.step)
    : []
  const stepIndex = Number(stepNum) - 1

  if (!recipe || sortedSteps.length === 0 || !sortedSteps[stepIndex]) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 pb-24 text-center font-[Inter,ui-sans-serif,system-ui,sans-serif] md:pb-28">
        <p className="text-base text-[#64748b]">
          {!recipe ? 'Recipe not found — it may have been cleared from your session.' : 'Step not found.'}
        </p>
        <button
          onClick={() => navigate(recipe ? `/recipe/${recipeId}` : '/generated-recipes')}
          className="rounded-xl bg-[#10b981] px-5 py-3 text-sm font-bold text-white"
        >
          {recipe ? 'Back to recipe' : 'Browse recipes'}
        </button>
      </div>
    )
  }

  const step = sortedSteps[stepIndex]
  const totalSteps = sortedSteps.length
  const isLast = stepIndex === totalSteps - 1
  const progressPct = Math.round(((stepIndex + 1) / totalSteps) * 100)

  return (
    <div className="flex min-h-dvh flex-col bg-white pb-24 font-[Inter,ui-sans-serif,system-ui,sans-serif] md:pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#f1f5f9] bg-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/recipe/${recipeId}`)}
          className="flex size-9 items-center justify-center rounded-full hover:bg-[#f9fafb] text-[#111827]"
          aria-label="Back to recipe"
        >
          <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
            {recipe.title}
          </p>
        </div>
        <span className="text-xs font-semibold text-[#64748b]">
          {stepIndex + 1} / {totalSteps}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[#f1f5f9]">
        <div
          className="h-1 bg-[#10b981] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step content */}
      <main className="flex-1 flex flex-col justify-center px-6 py-10 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#10b981] tracking-wider uppercase">
            Step {step.step}
          </span>
        </div>
        <p className="text-[1.2rem] font-medium leading-[1.75] text-[#1e293b] whitespace-pre-line">
          {step.instruction}
        </p>
      </main>

      {/* Navigation footer */}
      <footer className="border-t border-[#f1f5f9] bg-white px-6 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            disabled={stepIndex === 0}
            onClick={() => navigate(`/recipe/${recipeId}/step/${stepIndex}`)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] disabled:opacity-30 hover:bg-[#f8fafc] transition-colors"
            aria-label="Previous step"
          >
            <ChevronLeftIcon className="size-5" strokeWidth={2} />
          </button>

          {isLast ? (
            <button
              onClick={() => navigate(`/recipe/${recipeId}`)}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#10b981] text-base font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              <CheckCircleIcon className="size-5" />
              Done!
            </button>
          ) : (
            <button
              onClick={() => navigate(`/recipe/${recipeId}/step/${stepIndex + 2}`)}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f172a] text-base font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
              aria-label="Next step"
            >
              Next step
              <ChevronRightIcon className="size-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
