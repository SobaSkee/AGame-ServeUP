import { useState } from 'react'
import { SparklesIcon, ArrowPathIcon, FireIcon } from '@heroicons/react/24/outline'
import { apiUrl } from '../../config/api'
import type { GeneratedRecipe } from '../../types/recipe'

interface MorphedRecipeData {
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

const PRESET_STYLES = [
  '🌶️ Thai Street Food',
  '🥑 Ultra-Keto Low Carb',
  '✨ Michelin Star Fine Dining',
  '🌿 Tuscan Rustic',
  '🌮 Mexican Fusion',
  '💪 High Protein Bodybuilding',
]

export default function GenAIMorphCanvas({ recipe }: { recipe: GeneratedRecipe }) {
  const [selectedStyle, setSelectedStyle] = useState<string>(PRESET_STYLES[0])
  const [customStyle, setCustomStyle] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [morphed, setMorphed] = useState<MorphedRecipeData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMorph = async (styleToUse?: string) => {
    const target = styleToUse || customStyle.trim() || selectedStyle
    if (!target) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(apiUrl('/api/agent/morph'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: {
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          },
          styleTarget: target.replace(/^[\p{Emoji}\s]+/u, ''),
        }),
      })

      const data = await res.json()
      if (data.success && data.morphed) {
        setMorphed(data.morphed)
      } else {
        setError(data.error || 'Failed to morph recipe')
      }
    } catch {
      setError('Network error — check backend connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6 text-[#111827] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#fef2f2] text-[#ff5a3c] ring-1 ring-[#ff5a3c]/20">
            <SparklesIcon className="size-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#111827] flex items-center gap-2">
              GenAI Recipe Morphing Canvas
              <span className="rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-xs font-semibold text-[#ff5a3c] border border-[#fecaca]">
                Zero-Shot Style Transfer
              </span>
            </h3>
            <p className="text-xs text-[#6b7280]">
              Transform ingredients, techniques, and macros into any culinary style in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Style Chips */}
      <div className="mt-5 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          Select Culinary Style Transfer:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => {
                setSelectedStyle(style)
                handleMorph(style)
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedStyle === style
                  ? 'bg-[#18181b] text-white shadow-sm ring-1 ring-black'
                  : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] hover:text-[#111827]'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Custom input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={customStyle}
          onChange={(e) => setCustomStyle(e.target.value)}
          placeholder="Or type custom style (e.g. 'Jamaican Jerk', 'French Bistro')"
          className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-xs text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#18181b]"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => handleMorph()}
          className="flex items-center gap-2 rounded-lg bg-[#18181b] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black disabled:opacity-50"
        >
          {loading ? <ArrowPathIcon className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
          Morph Recipe
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3 text-xs text-[#991b1b]">
          ⚠️ {error}
        </div>
      )}

      {/* Morphed Output Canvas */}
      {morphed && (
        <div className="mt-6 space-y-6 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-5 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-[#111827]">{morphed.morphedTitle}</h4>
              <span className="rounded-md bg-[#fef2f2] px-2.5 py-1 text-[11px] font-semibold text-[#ff5a3c] border border-[#fecaca]">
                {morphed.styleTarget}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#4b5563] leading-relaxed">{morphed.description}</p>
          </div>

          {/* Macros Bar */}
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-white p-3 text-center border border-[#e5e7eb]">
            <div>
              <p className="text-[10px] uppercase text-[#6b7280]">Calories</p>
              <p className="text-sm font-bold text-[#16a34a]">{morphed.nutrition.calories} kcal</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#6b7280]">Protein</p>
              <p className="text-sm font-bold text-[#2563eb]">{morphed.nutrition.protein}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#6b7280]">Carbs</p>
              <p className="text-sm font-bold text-[#d97706]">{morphed.nutrition.carbs}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#6b7280]">Fats</p>
              <p className="text-sm font-bold text-[#9333ea]">{morphed.nutrition.fats}</p>
            </div>
          </div>

          {/* Ingredients with Substitution Rationale */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-2">
              Transformed Ingredients ({morphed.ingredients.length})
            </h5>
            <ul className="space-y-2">
              {morphed.ingredients.map((ing, idx) => (
                <li key={idx} className="flex flex-col gap-0.5 rounded-md bg-white p-2.5 text-xs border border-[#e5e7eb]">
                  <div className="flex justify-between font-medium text-[#111827]">
                    <span>{ing.name}</span>
                    <span className="text-[#6b7280] font-semibold">{ing.amount || '—'}</span>
                  </div>
                  {ing.substitutionReason && (
                    <span className="text-[11px] text-[#6b7280] italic">💡 {ing.substitutionReason}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Step Instructions */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-2">
              Transformed Techniques & Steps
            </h5>
            <ol className="space-y-3">
              {morphed.instructions.map((inst) => (
                <li key={inst.step} className="flex gap-3 text-xs">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#18181b] text-[11px] font-bold text-white">
                    {inst.step}
                  </span>
                  <div className="space-y-1">
                    <p className="text-[#374151]">{inst.instruction}</p>
                    {inst.techniqueTip && (
                      <span className="inline-block rounded bg-[#fef2f2] px-2 py-0.5 text-[10px] font-semibold text-[#ff5a3c] border border-[#fecaca]">
                        🔥 Technique Tip: {inst.techniqueTip}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Chef Tip */}
          {morphed.chefTip && (
            <div className="rounded-lg bg-[#fffbeb] border border-[#fef3c7] p-3 text-xs text-[#92400e] flex items-start gap-2">
              <FireIcon className="size-4 shrink-0 mt-0.5 text-[#d97706]" />
              <div>
                <span className="font-bold">Master Chef Tip: </span>
                {morphed.chefTip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
