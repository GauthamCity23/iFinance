'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  categoryId: string
  categoryName: string
  selectedMonth: string
  initialAmount: number
}

export default function SetBudgetButton({
  categoryId,
  categoryName,
  selectedMonth,
  initialAmount,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(
    initialAmount > 0 ? String(initialAmount) : '',
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const numericAmount = Number(amount)

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      setMessage('Enter a valid budget amount.')
      setLoading(false)
      return
    }

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

    const { error } = await supabase.from('budgets').upsert(
      {
        user_id: user.id,
        category_id: categoryId,
        budget_month: `${selectedMonth}-01`,
        amount: numericAmount,
      },
      {
        onConflict: 'user_id,category_id,budget_month',
      },
    )

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  async function handleRemove() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .eq('budget_month', `${selectedMonth}-01`)

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary !px-3 !py-2 text-sm"
      >
        {initialAmount > 0 ? 'Edit Budget' : 'Set Budget'}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="panel-card w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold">
              Budget for {categoryName}
            </h2>
            <p className="mt-1 text-sm text-muted">Month: {selectedMonth}</p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Budget Amount
                </label>
                <input
                  className="soft-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
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

                {initialAmount > 0 ? (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="btn-secondary flex-1"
                  >
                    Remove
                  </button>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
