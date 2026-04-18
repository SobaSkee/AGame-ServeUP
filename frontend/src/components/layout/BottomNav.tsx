import { NavLink } from 'react-router-dom'
import {
  BookmarkIcon,
  BuildingOffice2Icon,
  FireIcon,
  HomeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkSolidIcon,
  BuildingOffice2Icon as BuildingSolidIcon,
  FireIcon as FireSolidIcon,
  HomeIcon as HomeSolidIcon,
  UserCircleIcon as UserSolidIcon,
} from '@heroicons/react/24/solid'

const linkBase =
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[12px] font-medium leading-normal transition-colors'

function NavIcon({
  to,
  label,
  OutlineIcon,
  SolidIcon,
  end,
}: {
  to: string
  label: string
  OutlineIcon: typeof BuildingOffice2Icon
  SolidIcon: typeof BuildingSolidIcon
  /** Match path exactly (use for `/` so `/ingredients` does not highlight Home) */
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? 'text-[#16a34a]' : 'text-[#a1a1aa]'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <SolidIcon className="size-5 shrink-0" aria-hidden />
          ) : (
            <OutlineIcon className="size-5 shrink-0" aria-hidden />
          )}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#f4f4f5] bg-[#ffffffcf] shadow-[0_-1px_1.75px_rgba(0,0,0,0.05)] backdrop-blur-[10.5px]"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:gap-2 sm:px-6 md:max-w-3xl md:px-10 lg:max-w-4xl">
        <NavIcon to="/" end label="Home" OutlineIcon={HomeIcon} SolidIcon={HomeSolidIcon} />
        <NavIcon to="/ingredients" label="Pantry" OutlineIcon={BuildingOffice2Icon} SolidIcon={BuildingSolidIcon} />
        <NavIcon to="/generated-recipes" label="Recipes" OutlineIcon={FireIcon} SolidIcon={FireSolidIcon} />
        <NavIcon to="/saved" label="Saved" OutlineIcon={BookmarkIcon} SolidIcon={BookmarkSolidIcon} />
        <NavIcon to="/profile" label="Profile" OutlineIcon={UserCircleIcon} SolidIcon={UserSolidIcon} />
      </div>
    </nav>
  )
}
