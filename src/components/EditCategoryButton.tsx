'use client'

import { useState } from 'react'
import { Pencil, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  categoryId: string
  initialName: string
  initialKind: string
  initialColor: string | null
  transactionCount: number
}

export default function EditCategoryButton({
  categoryId,
  initialName,
  initialKind,
  initialColor,
  transactionCount,
}: Props) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [kind, setKind] = useState(initialKind)
  const [color, setColor] = useState(initialColor || '#7c3aed')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const cleanName = name.trim()
    if (!cleanName) {
      setMessage('Category name is required.')
      setLoading(false)
      return
    }

    if (transactionCount > 0 && kind !== initialKind) {
      setMessage(
        'You cannot change the type of a category that already has transactions.',
      )
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .update({
        name: cleanName,
        kind,
        color,
      })
      .eq('id', categoryId)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary !px-3 !py-2"
        title="Edit category"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="panel-card w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Edit Category</h2>
                <p className="mt-1 text-sm text-muted">
                  Update the category details
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="btn-secondary !px-3 !py-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category Name
                </label>
                <input
                  className="soft-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Type</label>
                <div className="field-shell">
                  <select
                    className="soft-input select-no-native pr-10"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    disabled={transactionCount > 0}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <ChevronDown className="field-icon h-4 w-4" />
                </div>

                {transactionCount > 0 ? (
                  <p className="mt-2 text-xs text-muted">
                    Type cannot be changed once transactions exist in this
                    category.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-11 w-16 cursor-pointer rounded-lg border"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <div
                    className="h-11 flex-1 rounded-xl border"
                    style={{
                      backgroundColor: color,
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>
              </div>

              {message ? (
                <p className="text-sm text-red-600">{message}</p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
