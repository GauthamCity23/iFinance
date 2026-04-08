'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CategoryForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [kind, setKind] = useState('expense')
  const [color, setColor] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('You must be logged in.')
      setLoading(false)
      return
    }

    const cleanName = name.trim()

    if (!cleanName) {
      setMessage('Enter a category name.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('categories').insert([
      {
        user_id: user.id,
        name: cleanName,
        kind,
        color: color.trim() || null,
      },
    ])

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setName('')
    setKind('expense')
    setColor('')
    setMessage('Category created.')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="panel-card rounded-3xl p-4 sm:p-6">
      <h2 className="font-display mb-4 text-2xl font-semibold">
        Create Category
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="soft-input w-full"
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="field-shell">
          <select
            className="soft-input select-no-native pr-10"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <ChevronDown className="field-icon h-4 w-4" />
        </div>

        <input
          className="soft-input w-full"
          type="text"
          placeholder="Optional color (ex: #22c55e)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {message ? (
        <p className="mt-3 text-sm text-center text-muted">{message}</p>
      ) : null}
    </div>
  )
}
