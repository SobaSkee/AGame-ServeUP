import { ClockIcon, FireIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import type { SuggestedRecipe } from '../../types/recipe'
import { useGeneratedRecipes } from '../../context/GeneratedRecipesContext'

type Props = {
  recipes: SuggestedRecipe[]
}

export default function SuggestedRecipes({ recipes }: Props) {
  const navigate = useNavigate()
  const { recipes: generatedRecipes } = useGeneratedRecipes()

  return (
    <section className="flex flex-col gap-6 pt-10 md:gap-8 lg:pt-12">
      <div className="flex items-end justify-between gap-4 md:items-center">
        <h2 className="text-lg font-semibold leading-7 text-text md:text-xl md:leading-7">
          Suggested for you
        </h2>
        <button
          type="button"
          onClick={() => navigate(generatedRecipes.length > 0 ? '/generated-recipes' : '/ingredients')}
          className="shrink-0 pb-0.5 text-sm font-medium leading-5 text-text/65 transition-colors hover:text-primary md:text-base"
        >
          View all
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="min-w-0">
            <RecipeRow recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function RecipeRow({ recipe }: { recipe: SuggestedRecipe }) {
  const badgeStyles =
    recipe.matchVariant === 'high'
      ? 'bg-secondary/18 text-dark-green'
      : 'bg-accent text-text'

  return (
    <article className="flex gap-4 border-b border-border py-4 last:border-b-0 max-md:last:pb-0 md:h-full md:flex-col md:gap-0 md:rounded-xl md:border md:border-border md:py-0 md:shadow-none lg:gap-0">
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface md:h-44 md:w-full md:max-h-48 md:min-h-[10rem] md:rounded-b-none md:rounded-t-xl"
        aria-hidden
      >
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 md:px-4 md:pb-4 md:pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-base font-semibold leading-6 text-text md:text-[17px]">
            {recipe.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${badgeStyles}`}
          >
            {recipe.matchPercent}%
          </span>
        </div>

        <p className="line-clamp-2 text-sm font-normal leading-5 text-text/65">
          {recipe.ingredients}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-normal leading-4 text-text/65 md:pt-3">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
            {recipe.time}
          </span>
          <span className="inline-flex items-center gap-1">
            <FireIcon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
            {recipe.calories}
          </span>
        </div>
      </div>
    </article>
  )
}
