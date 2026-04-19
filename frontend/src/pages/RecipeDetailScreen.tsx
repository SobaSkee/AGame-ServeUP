import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { SparklesIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import type { GeneratedRecipe } from '../types/recipe'

function difficultyLabel(d: GeneratedRecipe['difficulty']): string {
  const m = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const
  return m[d] ?? d
}

function timeSummary(recipe: GeneratedRecipe): string {
  const prep = recipe.prepTime?.trim()
  const cook = recipe.cookTime?.trim()
  if (prep && prep !== '—' && cook && cook !== '—') return `${prep} · ${cook}`
  if (prep && prep !== '—') return prep
  if (cook && cook !== '—') return cook
  return '—'
}

function servingsLine(recipe: GeneratedRecipe): string {
  const s = recipe.servings?.trim()
  if (s) return /serv/i.test(s) ? s : `${s} servings`
  return '—'
}

/** Split instruction into a short title + body when the text looks like a heading + steps. */
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

export default function RecipeDetailScreen() {
  const { recipeId } = useParams<{ recipeId: string }>()
  const navigate = useNavigate()
  const { recipes } = useGeneratedRecipes()

  // Save to recently viewed recipes in localStorage
  useEffect(() => {
    if (!recipe) return
    const data = localStorage.getItem('recentRecipes')
    let arr: { id: string; title: string }[] = []
    if (data) {
      try {
        arr = JSON.parse(data)
      } catch {}
    }
    // Remove if already exists
    arr = arr.filter((r) => r.id !== recipe.id)
    arr.unshift({ id: recipe.id, title: recipe.title })
    if (arr.length > 10) arr = arr.slice(0, 10)
    localStorage.setItem('recentRecipes', JSON.stringify(arr))
  }, [recipe])
  const instructionsRef = useRef<HTMLElement>(null)
  const [saved, setSaved] = useState(false)


  const recipe = useMemo(
    () => recipes.find((r) => r.id === recipeId) ?? null,
    [recipes, recipeId]
  )

  // Save to recently viewed recipes in localStorage
  useEffect(() => {
    if (!recipe) return
    const data = localStorage.getItem('recentRecipes')
    let arr: { id: string; title: string }[] = []
    if (data) {
      try {
        arr = JSON.parse(data)
      } catch {}
    }
    // Remove if already exists
    arr = arr.filter((r) => r.id !== recipe.id)
    arr.unshift({ id: recipe.id, title: recipe.title })
    if (arr.length > 10) arr = arr.slice(0, 10)
    localStorage.setItem('recentRecipes', JSON.stringify(arr))
  }, [recipe])

  const blocks = useMemo(() => (recipe ? instructionBlocks(recipe) : []), [recipe])

  const onStartCooking = useCallback(() => {
    instructionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (!recipe) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 pb-28 text-center font-[Inter,ui-sans-serif,system-ui,sans-serif]">
        <p className="text-base text-[#64748b]">Recipe not found or no longer in this session.</p>
        <button
          type="button"
          onClick={() => navigate('/generated-recipes')}
          className="rounded-lg bg-[#10b981] px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-95"
        >
          Back to recipes
        </button>
      </div>
    )
  }

  const n = recipe.ingredients?.length ?? 0
  const byline =
    recipe.cuisine?.trim() ||
    (recipe.matchedIngredients?.length
      ? `Highlights ${recipe.matchedIngredients.slice(0, 3).join(', ')}${recipe.matchedIngredients.length > 3 ? '…' : ''}`
      : 'Suggested for your pantry')

  return (
    <div className="min-h-dvh bg-white pb-36 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#0f172a] antialiased">
      {/* Hero: dish image + white top bar + gradient (matches recipe.pen) */}
      <section className="relative h-[min(419px,52vh)] w-full overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#e2e8f0] to-[#f8fafc]"
            role="img"
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#000000]/60 via-[#000000]/0 to-[#000000]/20"
          aria-hidden
        />

        <header className="relative z-10 border-b border-[#f3f4f6] bg-white">
          <div className="relative mx-auto flex h-14 max-w-lg items-center justify-between px-4 md:h-16 md:max-w-3xl md:px-6 lg:max-w-4xl">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-2 flex size-10 items-center justify-center rounded-full text-[#111827] outline-none hover:bg-[#f9fafb] focus-visible:ring-2 focus-visible:ring-[#111827]/20"
              aria-label="Back"
            >
              <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className="-mr-2 flex size-10 items-center justify-center rounded-full outline-none hover:bg-[#f9fafb] focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              aria-label={saved ? 'Remove from saved' : 'Save recipe'}
            >
              {saved ? (
                <BookmarkSolidIcon className="size-5 shrink-0 text-[#16a34a]" aria-hidden />
              ) : (
                <BookmarkIcon className="size-5 shrink-0 text-[#a1a1aa]" aria-hidden />
              )}
            </button>
          </div>
        </header>
      </section>

      <div className="relative z-[1] -mt-12 rounded-t-[40px] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]">
        <div className="mx-auto max-w-lg px-8 pb-10 pt-10 md:max-w-3xl md:px-10 lg:max-w-4xl lg:px-12">
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[30px] font-bold leading-[1.25] tracking-[-0.02em] text-[#0f172a]">
              {recipe.title}
            </h1>
            <p className="text-[14px] font-medium leading-[1.43] text-[#64748b]">{byline}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-y-4 border-b border-[#f1f5f9] px-0 py-4">
            <div className="flex min-w-[33%] flex-1 items-center gap-2">
              <ClockIcon className="size-[17px] shrink-0 text-[#475569]" strokeWidth={2} />
              <span className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[14px] font-semibold text-[#334155]">
                {timeSummary(recipe)}
              </span>
            </div>
            <div className="flex min-w-[33%] flex-1 items-center justify-center gap-2">
              <UsersIcon className="size-[17px] shrink-0 text-[#475569]" />
              <span className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[14px] font-semibold capitalize text-[#334155]">
                {servingsLine(recipe)}
              </span>
            </div>
            <div className="flex min-w-[33%] flex-1 items-center justify-end gap-2">
              <SparklesIcon className="size-[17px] shrink-0 text-[#475569]" />
              <span className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[14px] font-semibold text-[#334155]">
                {difficultyLabel(recipe.difficulty)}
              </span>
            </div>
          </div>

          <section className="mt-8 flex flex-col gap-6">
            <h2 className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[12px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
              Ingredients ({n})
            </h2>
            <ul className="flex flex-col gap-1">
              {(recipe.ingredients ?? []).map((ing, idx) => (
                <li
                  key={`${ing.name}-${idx}`}
                  className={`flex items-center gap-4 py-3 pl-0 pr-0 ${idx > 0 ? 'border-t border-[#f8fafc]' : ''}`}
                >
                  <div
                    className="size-5 shrink-0 rounded-md border-2 border-[#cbd5e1] bg-white"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
                    <span className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-base font-medium text-[#1e293b]">
                      {ing.name}
                    </span>
                    <span className="shrink-0 font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[14px] font-normal text-[#64748b]">
                      {ing.amount?.trim() || '—'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section ref={instructionsRef} id="instructions" className="mt-10 flex flex-col gap-10 scroll-mt-28">
            <h2 className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-[12px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
              Instructions
            </h2>
            <div className="relative pl-2">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-[#e2e8f0]"
                aria-hidden
              />
              <ol className="relative flex flex-col gap-10">
                {blocks.map((block, i) => (
                  <li key={i} className="relative pl-6">
                    <span
                      className={`absolute left-0 top-1.5 flex size-3.5 items-center justify-center rounded-full border-2 ${
                        i === 0
                          ? 'border-white bg-[#0f172a] shadow-[0_0_0_1px_#e2e8f0]'
                          : 'border-[#cbd5e1] bg-white'
                      }`}
                      aria-hidden
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-base font-bold leading-normal text-[#0f172a]">
                        {block.title}
                      </h3>
                      <p className="whitespace-pre-wrap font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-base font-normal leading-[1.625] text-[#475569]">
                        {block.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

        </div>
      </div>

      {/* Fixed CTA — above app BottomNav (matches recipe.pen strip) */}
      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-[#f1f5f9] bg-[#ffffffcf] px-6 pb-2 pt-4 backdrop-blur-md md:px-10">
        <div className="mx-auto max-w-lg md:max-w-3xl lg:max-w-4xl flex flex-col gap-2">
          <button
            type="button"
            onClick={onStartCooking}
            className="relative w-full overflow-hidden rounded-xl bg-[#10b981] py-4 text-center font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-base font-bold leading-normal text-white shadow-[0_4px_5.25px_-4px_rgba(16,185,129,0.2),0_10px_13.125px_-3px_rgba(16,185,129,0.2)] outline-none hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-[#10b981]/40"
          >
            Scroll to Instructions
          </button>
          {recipe.instructions && recipe.instructions.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(`/recipe/${recipe.id}/step/1`)}
              className="relative w-full overflow-hidden rounded-xl bg-[#2563eb] py-4 text-center font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-base font-bold leading-normal text-white shadow-[0_4px_5.25px_-4px_rgba(37,99,235,0.2),0_10px_13.125px_-3px_rgba(37,99,235,0.2)] outline-none hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
            >
              Step-by-step Mode
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
