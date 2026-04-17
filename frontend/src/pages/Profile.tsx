import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { contentShellClass } from '../layout/contentShell'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh bg-background pb-24 font-sans text-text antialiased md:pb-28">
        <Header />
        <div className={contentShellClass}>
          <main className="flex justify-center py-8 md:py-12">
            <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
              <p className="text-sm text-text/75">Loading...</p>
            </section>
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-background pb-24 font-sans text-text antialiased md:pb-28">
        <Header />
        <div className={contentShellClass}>
          <main className="flex justify-center py-8 md:py-12">
            <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-[-0.025em] text-text">Profile</h1>
                <p className="mt-2 text-sm text-text/75">
                  You are not logged in.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-text transition hover:bg-accent/50"
                >
                  Register
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-24 font-sans text-text antialiased md:pb-28">
      <Header />
      <div className={contentShellClass}>
        <main className="flex justify-center py-8 md:py-12">
          <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-[-0.025em] text-text">Profile</h1>
              <p className="mt-2 text-sm text-text/75">
                Manage your ServeUp account.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text/60">Name</p>
                <p className="mt-1 text-base text-text">{user.name}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text/60">Email</p>
                <p className="mt-1 text-base text-text">{user.email}</p>
              </div>

              <button
                onClick={logout}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}