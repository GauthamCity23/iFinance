'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
}

export default function AddCategoryModal({ open, onClose }: Props) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [kind, setKind] = useState('expense')
  const [selectedColor, setSelectedColor] = useState('#7c3aed')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

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
        color: selectedColor,
      },
    ])

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setName('')
    setKind('expense')
    setSelectedColor('#7c3aed')
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="panel-card w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Create Category</h2>
            <p className="mt-1 text-sm text-muted">
              Add a new category for income or expenses
            </p>
          </div>

          <button onClick={onClose} className="btn-secondary !px-3 !py-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category Name
            </label>
            <input
              className="soft-input"
              placeholder="e.g. Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
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
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="h-11 w-16 cursor-pointer rounded-lg border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              />
              <div
                className="h-11 flex-1 rounded-xl border"
                style={{
                  backgroundColor: selectedColor,
                  borderColor: 'var(--border)',
                }}
              />
            </div>
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
