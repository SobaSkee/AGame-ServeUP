import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import type { GeneratedRecipe } from '../../types/recipe'

function cuisineLabel(recipe: GeneratedRecipe): string {
  if (recipe.cuisine?.trim()) return recipe.cuisine.trim().toUpperCase()
  return 'RECIPE'
}

function metaLine(recipe: GeneratedRecipe): string {
  const n = recipe.ingredients?.length ?? 0
  const ing = `${n} ingredient${n === 1 ? '' : 's'}`
  const time = recipe.prepTime?.trim()
  if (time && time !== '—') {
    return `${time} • ${ing}`
  }
  return ing
}

type Props = {
  recipe: GeneratedRecipe
  saved: boolean
  onOpen: () => void
  onToggleSaved: (recipe: GeneratedRecipe) => void
}

/**
 * Card layout shared by Generated recipes and Saved recipes screens.
 */
export default function GeneratedRecipeCard({ recipe, saved, onOpen, onToggleSaved }: Props) {
  return (
    <article
      className="flex cursor-pointer flex-col gap-4"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${recipe.title}`}
    >
      <div className="relative overflow-hidden rounded-lg bg-[#f4f4f5]">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt=""
            className="h-[13.375rem] w-full object-cover md:h-56"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="h-[13.375rem] w-full bg-gradient-to-br from-[#e4e4e7] to-[#f4f4f5] md:h-56"
            role="img"
            aria-hidden
          />
        )}
        <div className="absolute right-3 top-3 rounded-sm bg-[#ffffffcf] px-2 py-1 backdrop-blur-[10.5px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#18181b]">
            {cuisineLabel(recipe)}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="font-[family-name:'Plus_Jakarta_Sans',Inter,sans-serif] text-xl font-extrabold leading-[1.4] tracking-[-0.025em] text-[#18181b] md:text-[1.25rem]">
            {recipe.title}
          </h2>
          <p className="text-[14px] font-medium leading-[1.43] text-[#71717a]">{metaLine(recipe)}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSaved(recipe)
          }}
          className="shrink-0 p-1 text-[#16a34a] outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
          aria-label={saved ? 'Remove from saved' : 'Save recipe'}
        >
          {saved ? (
            <BookmarkSolidIcon className="size-[18px] text-[#16a34a]" aria-hidden />
          ) : (
            <BookmarkIcon className="size-[18px] text-[#d4d4d8]" aria-hidden />
          )}
        </button>
      </div>
    </article>
  )
}
