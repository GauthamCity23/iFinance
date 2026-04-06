'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="panel-card w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Add Transaction</h2>
            <p className="mt-1 text-sm text-muted">
              Record income or an expense
            </p>
          </div>

          <button onClick={onClose} className="btn-secondary !px-3 !py-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select
              className="soft-input"
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setCategoryId('')
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>
            <input
              className="soft-input"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select
              className="soft-input"
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
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Amount</label>
            <input
              className="soft-input"
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
              className="soft-input"
              placeholder="Optional title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Notes</label>
            <textarea
              className="soft-input min-h-[96px] resize-none"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
