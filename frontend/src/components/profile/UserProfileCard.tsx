import { UserCircleIcon } from '@heroicons/react/24/solid'

type UserProfileCardProps = {
  name: string
  email: string
  onLogout: () => void | Promise<void>
  loggingOut?: boolean
}

/** Signed-in profile summary with logout (used on Profile screen). */
export default function UserProfileCard({ name, email, onLogout, loggingOut }: UserProfileCardProps) {
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() || email?.trim()?.charAt(0)?.toUpperCase() || '?'

  return (
    <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary"
          aria-hidden
        >
          {initial}
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-text md:text-3xl">Your profile</h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-text/75">
          <UserCircleIcon className="size-4 shrink-0 text-secondary" aria-hidden />
          Signed in to ServeUp
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text/60">Name</p>
          <p className="mt-1 text-base font-medium text-text">{name}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text/60">Email</p>
          <p className="mt-1 break-all text-base text-text">{email}</p>
        </div>

        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void onLogout()}
          className="mt-2 rounded-full border-2 border-border bg-background px-5 py-3 text-sm font-semibold text-text transition hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </section>
  )
}
