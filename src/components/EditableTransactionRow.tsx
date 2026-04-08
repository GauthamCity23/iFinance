'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Save, X, CalendarDays, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import DeleteTransactionButton from '@/components/DeleteTransactionButton'
import { useRouter } from 'next/navigation'

type CategoryType = {
  id: string
  name: string
  kind: string
  color: string | null
}

type TransactionType = {
  id: string
  title: string
  amount: number | string
  type: string
  transaction_date: string
  notes: string | null
  category_id: string | null
  categories:
    | {
        id?: string
        name?: string
        color?: string | null
      }
    | {
        id?: string
        name?: string
        color?: string | null
      }[]
    | null
}

type Props = {
  txn: TransactionType
  categories: CategoryType[]
}

export default function EditableTransactionRow({ txn, categories }: Props) {
  const router = useRouter()
  const category = Array.isArray(txn.categories)
    ? txn.categories[0]
    : txn.categories
  const badgeColor = category?.color || '#94a3b8'

  const [isEditing, setIsEditing] = useState(false)
  const [type, setType] = useState(txn.type)
  const [transactionDate, setTransactionDate] = useState(txn.transaction_date)
  const [categoryId, setCategoryId] = useState(txn.category_id || '')
  const [title, setTitle] = useState(txn.title)
  const [amount, setAmount] = useState(String(txn.amount))
  const [notes, setNotes] = useState(txn.notes || '')
  const [saving, setSaving] = useState(false)

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => item.kind === type)
  }, [categories, type])

  async function handleSave() {
    setSaving(true)

    const supabase = createClient()

    const { error } = await supabase
      .from('transactions')
      .update({
        type,
        transaction_date: transactionDate,
        category_id: categoryId || null,
        title: title.trim() || (type === 'income' ? 'Income' : 'Expense'),
        amount: Number(amount),
        notes: notes.trim() || null,
      })
      .eq('id', txn.id)

    setSaving(false)

    if (!error) {
      setIsEditing(false)
      router.refresh()
    }
  }

  if (isEditing) {
    return (
      <div className="panel-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="field-shell">
            <select
              className="soft-input select-no-native pr-10"
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setCategoryId('')
              }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <ChevronDown className="field-icon h-4 w-4" />
          </div>

          <div className="field-shell">
            <input
              className="soft-input pr-10"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
            <CalendarDays className="field-icon h-4 w-4" />
          </div>

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

          <input
            className="soft-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Amount"
          />

          <input
            className="soft-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <input
            className="soft-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:flex">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={() => setIsEditing(false)}
            className="btn-secondary flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="empty-surface flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {(category?.name || txn.title || 'T')[0]}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold">
              {category?.name || txn.title}
            </p>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                txn.type === 'income'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {txn.type === 'income' ? 'Money In' : 'Money Out'}
            </span>
          </div>

          <p className="text-sm text-muted">
            {format(new Date(txn.transaction_date), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="w-full text-left sm:w-auto sm:text-right">
          <p
            className={`text-2xl font-bold sm:text-3xl ${
              txn.type === 'income' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {txn.type === 'income' ? '+$' : '-$'}
            {Number(txn.amount).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary !px-3 !py-2"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <DeleteTransactionButton transactionId={txn.id} />
        </div>
      </div>
    </div>
  )
}
