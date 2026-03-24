import Header from '../components/Header'
import QuickActionCards from '../components/home/QuickActionCards'
import SearchBar from '../components/home/SearchBar'
import SuggestedRecipes from '../components/home/SuggestedRecipes'
import { homeCategoryChips } from '../data/homeCategoryChips'
import { suggestedRecipes } from '../data/suggestedRecipes'
import { contentShellClass } from '../layout/contentShell'

export default function HomeScreen() {
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
            <QuickActionCards />
          </section>

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
