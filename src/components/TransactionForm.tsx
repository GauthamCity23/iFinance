'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type CategoryType = {
  id: string
  name: string
  kind: string
}

type Props = {
  categories: CategoryType[]
}

export default function TransactionForm({ categories }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  const filteredCategories = categories.filter((item) => item.kind === type)

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

    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount < 0) {
      setMessage('Enter a valid amount.')
      return
    }

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        category_id: categoryId || null,
        type,
        amount: numericAmount,
        transaction_date: transactionDate,
        title: title.trim(),
        notes: notes.trim() || null,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setTitle('')
    setAmount('')
    setTransactionDate(new Date().toISOString().slice(0, 10))
    setType('expense')
    setCategoryId('')
    setNotes('')
    setMessage('Transaction added.')

    router.refresh()
  }

  return (
    <div className="rounded-2xl border p-5 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border p-3"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
        />

        <select
          className="w-full rounded-lg border p-3"
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setCategoryId('')
          }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select
          className="w-full rounded-lg border p-3"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">No category</option>
          {filteredCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <textarea
          className="w-full rounded-lg border p-3"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black text-white p-3"
        >
          Add Transaction
        </button>
      </form>

      {message ? (
        <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
      ) : null}
    </div>
  )
}
