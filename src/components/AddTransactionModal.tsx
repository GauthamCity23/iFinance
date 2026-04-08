'use client'

import { useMemo, useState } from 'react'
import { X, CalendarDays, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type CategoryType = {
  id: string
  name: string
  kind: string
  color: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  categories: CategoryType[]
}

export default function AddTransactionModal({
  open,
  onClose,
  categories,
}: Props) {
  const router = useRouter()

  const [type, setType] = useState('expense')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => item.kind === type)
  }, [categories, type])

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

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      setMessage('Enter a valid amount.')
      setLoading(false)
      return
    }

    const finalTitle =
      title.trim() ||
      filteredCategories.find((item) => item.id === categoryId)?.name ||
      (type === 'income' ? 'Income' : 'Expense')

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        category_id: categoryId || null,
        type,
        amount: numericAmount,
        transaction_date: transactionDate,
        title: finalTitle,
        notes: notes.trim() || null,
      },
    ])

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setType('expense')
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setCategoryId('')
    setAmount('')
    setTitle('')
    setNotes('')
    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center sm:px-4">
      <div className="panel-card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold">
              Add Transaction
            </h2>
            <p className="mt-1 text-sm text-muted">
              Record income or an expense
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary shrink-0 !px-3 !py-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <div className="field-shell">
              <select
                className="soft-input select-no-native pr-10"
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setCategoryId('')
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <ChevronDown className="field-icon h-4 w-4" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>
            <div className="field-shell">
              <input
                className="soft-input pr-10"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
              <CalendarDays className="field-icon h-4 w-4" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <div className="field-shell">
              <select
                className="soft-input select-no-native pr-10"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {filteredCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="field-icon h-4 w-4" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Amount</label>
            <input
              className="soft-input w-full"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              className="soft-input w-full"
              placeholder="Optional title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Notes</label>
            <textarea
              className="soft-input min-h-[96px] w-full resize-none"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="grid gap-3 pt-2 sm:flex">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex-1"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
