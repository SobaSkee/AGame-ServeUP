import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { API_BASE } from '../config/api'
import { useGeneratedRecipes } from '../context/GeneratedRecipesContext'
import { usePantryScan } from '../context/PantryScanContext'
import { getUserPantry, addIngredientsToUserPantry, addIngredientToUserPantry, removeIngredientsFromUserPantry, removeIngredientFromUserPantry } from '../context/UserDataContext'
import { useAuth } from '../context/AuthContext'

const POPULAR = ['Eggs', 'Cheese', 'Milk', 'Onions'] as const

const INITIAL_PANTRY = [] as const

export default function IngredientsScreen() {
  const navigate = useNavigate()
  const { setRecipes: setGeneratedRecipes } = useGeneratedRecipes()
  const { consumePendingPantry } = usePantryScan()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<string[]>(() => [...INITIAL_PANTRY])
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const fetchPantry = async() => {
      const fromScan = consumePendingPantry()
      // // console.log("Getting user pantry")
      const fromUserPantry = await getUserPantry(user)

      // console.log(fromUserPantry)

      if (fromUserPantry === null) {
        if (fromScan?.length) setItems(fromScan);
        return;
      }
      if (!fromScan?.length) setItems(fromUserPantry);
      else {
        // console.log("Adding many to user pantry")
        const updatedPantry = await addIngredientsToUserPantry(user, fromScan); // Note: this will include the added items
        setItems(updatedPantry);
      }
    }
    fetchPantry();

    // console.log(items)

  }, [consumePendingPantry, useAuth])
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [recipeError, setRecipeError] = useState<string | null>(null)

  const count = items.length

  const handleBack = () => {
    navigate('/')
  }

  const addIngredient = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    const exists = items.some((i) => i.toLowerCase() === t.toLowerCase())
    if (exists) return

    setItems((prev) => [...prev, t])
    setQuery('')

    const updateUserPantry = async() => {
      // console.log("Adding to user pantry")
      await addIngredientToUserPantry(user, t);
    }
    updateUserPantry()
  }

  const removeAt = (index: number) => {
    const to_remove = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index))

    const updateUserPantry = async() => {
      // console.log("Removing from user pantry")
      await removeIngredientFromUserPantry(user, to_remove);
    }
    updateUserPantry();
  }

  const clearAll = () => {
    const updateUserPantry = async() => {
      // console.log("Removing all from user pantry")
      await removeIngredientsFromUserPantry(user, items)
    }
    updateUserPantry()
    setItems([])
  }

  const generateRecipes = async () => {
    if (items.length === 0) return
    setLoadingRecipes(true)
    setRecipeError(null)
    try {
      const list = items.join(',')
      const res = await fetch(
        `${API_BASE}/api/ingredients/suggest-recipes?ingredients=${encodeURIComponent(list)}`
      )
      const data = await res.json()
      if (data.success && Array.isArray(data.recipes)) {
        setGeneratedRecipes(data.recipes)
        navigate('/generated-recipes')
      } else {
        setRecipeError(data.error ?? 'Could not load recipes')
      }
    } catch {
      setRecipeError('Network error — is the backend running?')
    } finally {
      setLoadingRecipes(false)
    }
  }

  const badgeCount = useMemo(() => (count > 99 ? '99+' : String(count)), [count])

  return (
    <div className="min-h-dvh bg-[#e5e7eb] pb-24 font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#111827] antialiased md:pb-28 md:py-10">
      <div className="relative mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-[390px] flex-col overflow-hidden bg-gradient-to-b from-[#f9fafb] to-white shadow-[0_25px_44px_-12px_rgba(0,0,0,0.25)] md:min-h-[min(100dvh,56rem)] md:max-w-3xl md:rounded-2xl md:border md:border-[#f3f4f6] md:shadow-2xl lg:max-w-4xl">
        <header className="sticky top-0 z-10 border-b border-[#f3f4f6] bg-white">
          <div className="relative flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
            <div className="flex w-10 shrink-0 justify-start md:w-12">
              <button
                type="button"
                onClick={handleBack}
                className="-ml-2 flex size-10 items-center justify-center rounded-full text-[#111827] outline-none ring-offset-2 hover:bg-[#f9fafb] focus-visible:ring-2 focus-visible:ring-[#111827]/20"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="absolute left-1/2 -translate-x-1/2 text-[14px] font-semibold tracking-[0.35px] text-[#6b7280]">
              PANTRY
            </p>
            <div className="w-10 md:w-12" aria-hidden />
          </div>
        </header>

        <div className="flex flex-1 flex-col px-6 pb-44 pt-2 md:px-10 md:pb-48 lg:px-12">
          <section className="pt-2">
            <div className="flex flex-col gap-3 pb-8 md:gap-3.5 md:pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h1 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.75px] text-[#111827] md:text-4xl lg:text-[2.5rem]">
                  Add ingredients
                </h1>
                <p className="max-w-xl text-base leading-[1.625] text-[#6b7280] md:text-lg md:leading-relaxed">
                  Build your pantry list to discover recipes you can cook right now.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <div className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-[#9ca3af]">
                  <MagnifyingGlassIcon className="size-[15px]" strokeWidth={2} aria-hidden />
                </div>
                <label htmlFor="ingredient-search" className="sr-only">
                  Search or type an ingredient
                </label>
                <input
                  id="ingredient-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient(query)}
                  placeholder={"Try 'Avocado'"}
                  className="h-[54px] w-full rounded-lg border border-[#e4e4e7] bg-white py-4 pl-10 pr-4 text-base font-normal text-[#111827] placeholder:text-[#9ca3af] outline-none ring-0 transition-[box-shadow] focus:border-[#18181b]/20 focus:ring-2 focus:ring-[#18181b]/10"
                />
              </div>
              <button
                type="button"
                onClick={() => addIngredient(query)}
                className="h-[54px] shrink-0 rounded-lg bg-[#18181b] px-6 text-[14px] font-medium leading-[1.43] text-white transition-opacity hover:opacity-95 active:opacity-90 sm:w-auto sm:min-w-[5.5rem]"
              >
                Add
              </button>
            </div>
          </section>

          <section className="mt-8 md:mt-10">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#9ca3af] md:mb-5">
              Popular
            </p>
            <div className="flex flex-wrap gap-2 md:gap-2.5">
              {POPULAR.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addIngredient(label)}
                  className="rounded-md border border-[#e5e7eb] bg-white px-4 py-2 text-[14px] font-normal leading-[1.43] text-[#4b5563] transition-colors hover:border-[#d1d5db] hover:bg-[#fafafa]"
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 md:mt-10">
            <div className="flex items-end justify-between gap-3 border-b border-[#f3f4f6] pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-[18px] font-medium leading-[1.56] text-[#111827]">
                  In your pantry
                </h2>
                <span className="text-[14px] font-normal leading-[1.43] text-[#9ca3af]">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                disabled={count === 0}
                className="shrink-0 pb-0.5 text-[12px] font-medium text-[#9ca3af] transition-colors hover:text-[#6b7280] disabled:pointer-events-none disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            <ul className="divide-y divide-[#f3f4f6]" role="list">
              {items.length === 0 ? (
                <li className="py-10 text-center text-sm text-[#9ca3af] md:py-14">
                  No ingredients yet — add some above.
                </li>
              ) : (
                items.map((name, index) => (
                  <li
                    key={`${name}-${index}`}
                    className="flex items-center justify-between gap-4 py-4 pl-0 pr-0 md:py-[1.125rem]"
                  >
                    <span className="text-base font-normal leading-[1.5] text-[#374151]">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#d1d5db] transition-colors hover:bg-[#f9fafb] hover:text-[#9ca3af]"
                      aria-label={`Remove ${name}`}
                    >
                      <XMarkIcon className="size-[14px]" strokeWidth={2} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          {recipeError && (
            <p
              className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]"
              role="alert"
            >
              {recipeError}
            </p>
          )}
        </div>
      </div>

      {/* Above bottom nav (nav ~80px) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-[390px] border-t border-[#f3f4f6] bg-[#ffffffcf] px-6 py-6 backdrop-blur-[10.5px] md:max-w-3xl md:rounded-b-2xl md:border-x md:border-b md:border-[#f3f4f6] lg:max-w-4xl">
          <button
            type="button"
            disabled={count === 0 || loadingRecipes}
            onClick={generateRecipes}
            className="relative flex w-full items-center justify-center gap-3 rounded-lg bg-[#16a34a] px-4 py-4 pr-14 text-base font-medium leading-normal text-white shadow-[0_1px_1.75px_rgba(0,0,0,0.05)] transition-opacity hover:opacity-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingRecipes ? 'Generating…' : 'Generate Recipes'}
            <span className="absolute right-3 top-1/2 flex min-h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold tabular-nums">
              {badgeCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
