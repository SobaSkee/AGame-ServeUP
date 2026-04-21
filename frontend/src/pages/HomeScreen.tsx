import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import QuickActionCards from '../components/home/QuickActionCards'
import SearchBar from '../components/home/SearchBar'
import RecentlyViewedRecipes from '../components/home/RecentlyViewedRecipes'
import { homeCategoryChips } from '../data/homeCategoryChips'
import { contentShellClass } from '../layout/contentShell'
import {
  parseRecentRecipes,
  RECENT_RECIPES_STORAGE_KEY,
  type RecentRecipeEntry,
} from '../utils/recentRecipes'
import { API_BASE } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { usePantryScan } from '../context/PantryScanContext'

function greetingFirstName(user: { name: string; email: string } | null): string | null {
  if (!user) return null
  const n = user.name?.trim()
  if (n) return n.split(/\s+/)[0]
  const local = user.email?.split('@')[0]?.trim()
  return local || null
}

type DetectedIngredient = {
  name: string
  confidence: 'high' | 'medium' | 'low'
  category?: string
}

export default function HomeScreen() {
  const [recentRecipes, setRecentRecipes] = useState<RecentRecipeEntry[]>([])
  const { user, loading: authLoading } = useAuth()
  const greetName = !authLoading ? greetingFirstName(user) : null

  useEffect(() => {
    setRecentRecipes(parseRecentRecipes(localStorage.getItem(RECENT_RECIPES_STORAGE_KEY)))
  }, [])

  const recentWithImagesTop3 = useMemo(
    () =>
      recentRecipes
        .filter((e) => Boolean(e.imageUrl?.trim()))
        .slice(0, 3),
    [recentRecipes]
  )
  const navigate = useNavigate()
  const { queuePantryFromScan } = usePantryScan()
  const [pantryScanning, setPantryScanning] = useState(false)
  const [detectError, setDetectError] = useState<string | null>(null)

  const handlePantryImage = async (file: File) => {
    setPantryScanning(true)
    setDetectError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/api/pantry/detect`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      let data: {
        success?: boolean
        ingredients?: DetectedIngredient[]
        error?: string
        persisted?: boolean
        scanId?: string
        imageUrl?: string
      }
      try {
        data = await res.json()
      } catch {
        setDetectError('Invalid response from server')
        return
      }

      if (data.success && Array.isArray(data.ingredients)) {
        const names = data.ingredients.map((i) => i.name.trim()).filter(Boolean)
        queuePantryFromScan(names)
        navigate('/ingredients')
      } else {
        setDetectError(data.error ?? (res.ok ? 'Could not detect ingredients' : `Request failed (${res.status})`))
      }
    } catch {
      setDetectError('Network error — is the backend running?')
    } finally {
      setPantryScanning(false)
    }
  }
  return (
    <div className="min-h-dvh bg-background pb-24 font-sans text-text antialiased md:pb-28">
      <Header />

      <div className={`${contentShellClass} pt-2`}>
        <Link
          to="/ingredients"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          My pantry
        </Link>
      </div>

      <div className={contentShellClass}>
        <main className="flex flex-col gap-8 pb-10 md:gap-10 md:pb-16 lg:gap-12">
          <section className="flex flex-col gap-8 pt-[23px] pb-8 md:pt-8 md:pb-10 lg:max-w-3xl xl:max-w-full">
            <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-text md:text-4xl md:leading-[1.12] lg:text-5xl lg:leading-[1.1]">
              {greetName ? (
                <>
                  <span className="lg:hidden">
                    What are you
                    <br />
                    cooking today {greetName}?
                  </span>
                  <span className="hidden lg:inline">What are you cooking today {greetName}?</span>
                </>
              ) : (
                <>
                  <span className="lg:hidden">
                    What are you
                    <br />
                    cooking today?
                  </span>
                  <span className="hidden lg:inline">What are you cooking today?</span>
                </>
              )}
            </h1>
            <SearchBar />
            <QuickActionCards
              onPantryImage={handlePantryImage}
              isPantryScanning={pantryScanning}
              onManualAdd={() => navigate('/ingredients')}
            />
            {detectError && (
              <p className="rounded-lg border border-primary/30 bg-surface px-3 py-2 text-sm text-text" role="alert">
                {detectError}
              </p>
            )}
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

          <RecentlyViewedRecipes entries={recentWithImagesTop3} />
        </main>
      </div>
    </div>
  )
}
