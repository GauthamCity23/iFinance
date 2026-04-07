'use client'

import { useEffect, useMemo, useState } from 'react'
import { Trash2, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type CategoryType = {
  id: string
  name: string
  kind: string
  color: string | null
}

type Props = {
  categoryId: string
  categoryName: string
  categoryKind: string
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  categoryKind,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [replacementCategoryId, setReplacementCategoryId] = useState('')
  const [replacementCategories, setReplacementCategories] = useState<
    CategoryType[]
  >([])
  const [transactionCount, setTransactionCount] = useState(0)
  const [message, setMessage] = useState('')

  const hasReplacementOptions = useMemo(() => {
    return replacementCategories.length > 0
  }, [replacementCategories])

  useEffect(() => {
    if (!showReassignModal) return

    async function loadReplacementCategories() {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, kind, color')
        .eq('kind', categoryKind)
        .neq('id', categoryId)
        .order('name', { ascending: true })

      if (!error) {
        const safeData = Array.isArray(data) ? data : []
        setReplacementCategories(safeData)
        setReplacementCategoryId(safeData[0]?.id || '')
      }
    }

    loadReplacementCategories()
  }, [showReassignModal, categoryKind, categoryId])

  async function handleDeleteClick() {
    const confirmed = window.confirm(
      `Delete category "${categoryName}"? If it still has transactions, you will be asked to reassign them first.`,
    )

    if (!confirmed) return

    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    if (countError) {
      alert('Could not check category usage.')
      setLoading(false)
      return
    }

    const safeCount = count || 0
    setTransactionCount(safeCount)

    if (safeCount > 0) {
      setShowReassignModal(true)
      setLoading(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) {
      alert(deleteError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  async function handleReassignAndDelete() {
    if (!replacementCategoryId) {
      setMessage('Choose a replacement category first.')
      return
    }

    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('transactions')
      .update({ category_id: replacementCategoryId })
      .eq('category_id', categoryId)

    if (updateError) {
      setMessage(updateError.message)
      setLoading(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (deleteError) {
      setMessage(deleteError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setShowReassignModal(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={loading}
        className="btn-secondary !px-3 !py-2 disabled:opacity-60"
        title="Delete category"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showReassignModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="panel-card w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Reassign Transactions
                </h2>
                <p className="mt-1 text-sm text-muted">
                  &quot;{categoryName}&quot; has {transactionCount} transaction
                  {transactionCount === 1 ? '' : 's'}.
                </p>
              </div>

              <button
                onClick={() => setShowReassignModal(false)}
                className="btn-secondary !px-3 !py-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted">
                Choose another{' '}
                <span className="font-medium">{categoryKind}</span> category to
                move those transactions into before deleting this one.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Replacement Category
                </label>

                {hasReplacementOptions ? (
                  <div className="field-shell">
                    <select
                      className="soft-input select-no-native pr-10"
                      value={replacementCategoryId}
                      onChange={(e) => setReplacementCategoryId(e.target.value)}
                    >
                      {replacementCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="field-icon h-4 w-4" />
                  </div>
                ) : (
                  <div className="empty-surface rounded-2xl border border-dashed p-4 text-sm">
                    No other {categoryKind} categories exist yet. Create another
                    one first.
                  </div>
                )}
              </div>

              {message ? (
                <p className="text-sm text-red-600">{message}</p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReassignAndDelete}
                  disabled={
                    loading || !hasReplacementOptions || !replacementCategoryId
                  }
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Reassign & Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
