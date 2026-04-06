'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CategoryForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [kind, setKind] = useState('expense')
  const [color, setColor] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You must be logged in.')
      return
    }

    const { error } = await supabase.from('categories').insert([
      {
        user_id: user.id,
        name: name.trim(),
        kind,
        color: color.trim() || null,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setName('')
    setKind('expense')
    setColor('')
    setMessage('Category created.')

    router.refresh()
  }

  return (
    <div className="rounded-2xl border p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create Category</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border p-3"
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="w-full rounded-lg border p-3"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          className="w-full rounded-lg border p-3"
          type="text"
          placeholder="Optional color (ex: #22c55e)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black text-white p-3"
        >
          Add Category
        </button>
      </form>

      {message ? (
        <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
      ) : null}
    </div>
  )
}
