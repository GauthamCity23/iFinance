'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Landmark, TrendingUp, PieChart, Wallet } from 'lucide-react'

export default function LoginClient() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setMessage(
        'Account created. Check your email if confirmation is enabled.',
      )
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const isSignup = mode === 'signup'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_520px] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <Landmark
                    className="h-5 w-5"
                    style={{ color: 'var(--accent)' }}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">FlowFi</p>
                  <p className="text-sm text-muted">
                    A cleaner way to track money
                  </p>
                </div>
              </div>

              <h1 className="max-w-lg text-5xl font-bold leading-tight">
                Track spending, budgets, and reports in one place.
              </h1>

              <p className="mt-5 max-w-xl text-lg text-muted">
                Stay on top of your finances with a simple dashboard, monthly
                budgets, detailed reports, and customizable views.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="panel-card rounded-2xl p-4">
                  <TrendingUp
                    className="mb-3 h-5 w-5"
                    style={{ color: 'var(--accent)' }}
                  />
                  <p className="font-semibold">Dashboard</p>
                  <p className="mt-1 text-sm text-muted">
                    See income, expenses, and trends fast.
                  </p>
                </div>

                <div className="panel-card rounded-2xl p-4">
                  <Wallet
                    className="mb-3 h-5 w-5"
                    style={{ color: 'var(--accent)' }}
                  />
                  <p className="font-semibold">Budgets</p>
                  <p className="mt-1 text-sm text-muted">
                    Set monthly limits by category.
                  </p>
                </div>

                <div className="panel-card rounded-2xl p-4">
                  <PieChart
                    className="mb-3 h-5 w-5"
                    style={{ color: 'var(--accent)' }}
                  />
                  <p className="font-semibold">Reports</p>
                  <p className="mt-1 text-sm text-muted">
                    Review where your money goes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="panel-card mx-auto w-full max-w-xl rounded-3xl p-8 shadow-xl">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3 lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    <Landmark
                      className="h-5 w-5"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <span className="text-xl font-bold">FlowFi</span>
                </div>

                <h2 className="text-3xl font-bold">
                  {isSignup ? 'Create your account' : 'Welcome back'}
                </h2>

                <p className="mt-2 text-sm text-muted">
                  {isSignup
                    ? 'Start tracking your finances in a cleaner, simpler way.'
                    : 'Log in to access your dashboard, budgets, and reports.'}
                </p>
              </div>

              <div className="mb-6 inline-flex rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setMessage('')
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    !isSignup ? 'btn-primary' : 'text-muted'
                  }`}
                >
                  Log In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setMessage('')
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isSignup ? 'btn-primary' : 'text-muted'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    className="soft-input w-full"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    className="soft-input w-full"
                    type="password"
                    placeholder={
                      isSignup ? 'Create a password' : 'Enter your password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={
                      isSignup ? 'new-password' : 'current-password'
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-base disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading
                    ? isSignup
                      ? 'Creating account...'
                      : 'Logging in...'
                    : isSignup
                      ? 'Create Account'
                      : 'Log In'}
                </button>
              </form>

              {message ? (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    message.toLowerCase().includes('created') ||
                    message.toLowerCase().includes('check your email')
                      ? 'border-green-500/30 bg-green-500/10 text-green-300'
                      : 'border-red-500/30 bg-red-500/10 text-red-300'
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <div className="mt-6 text-center text-sm text-muted">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setMessage('')
                      }}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      Log in
                    </button>
                  </>
                ) : (
                  <>
                    Need an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setMessage('')
                      }}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
