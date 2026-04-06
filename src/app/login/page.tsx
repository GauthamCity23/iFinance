'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage(
        'Signup successful. Check your email if confirmation is enabled.',
      )
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Finance Tracker</h1>
        <p className="text-sm text-gray-600 mb-6">
          {mode === 'login' ? 'Log into your account' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-lg border p-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black text-white p-3"
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-red-600">{message}</p>
        )}

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-4 w-full text-sm underline"
        >
          {mode === 'login'
            ? 'Need an account? Sign up'
            : 'Already have an account? Log in'}
        </button>
      </div>
    </main>
  )
}
