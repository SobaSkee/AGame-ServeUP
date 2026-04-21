import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { contentShellClass } from '../layout/contentShell'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Register failed')
        return
      }

      navigate('/login')
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-24 font-sans text-text antialiased md:pb-28">
      <Header />

      <div className={contentShellClass}>
        <main className="flex justify-center py-8 md:py-12">
          <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-[-0.025em] text-text">Create account</h1>
              <p className="mt-2 text-sm text-text/75">
                Join ServeUp and start saving your cooking ideas.
              </p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-text">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-text">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-text">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary"
                />
              </div>

              {error && (
                <p
                  className="rounded-2xl border border-primary/20 bg-background px-4 py-3 text-sm text-primary"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-sm text-text/80">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}