'use client'

import { useMemo, useState } from 'react'
import { format, startOfMonth, subDays } from 'date-fns'
import { Search, ArrowUpDown } from 'lucide-react'
import AddTransactionModal from '@/components/AddTransactionModal'
import DeleteTransactionButton from '@/components/DeleteTransactionButton'

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
  categories: CategoryType[]
  transactions: TransactionType[]
}

export default function TransactionsClient({
  categories,
  transactions,
}: Props) {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [dateRange, setDateRange] = useState('all')
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)

  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const safeCategories = Array.isArray(categories) ? categories : []

  const filteredTransactions = useMemo(() => {
    let items = [...safeTransactions]

    if (dateRange !== 'all') {
      const today = new Date()
      let startDate: Date | null = null

      if (dateRange === 'thisMonth') {
        startDate = startOfMonth(today)
      } else if (dateRange === 'last10') {
        startDate = subDays(today, 10)
      } else if (dateRange === 'last30') {
        startDate = subDays(today, 30)
      } else if (dateRange === 'last90') {
        startDate = subDays(today, 90)
      }

      if (startDate) {
        items = items.filter((item) => {
          const txnDate = new Date(`${item.transaction_date}T00:00:00`)
          return txnDate >= startDate
        })
      }
    }

    if (searchText.trim()) {
      const lower = searchText.toLowerCase()
      items = items.filter((item) => {
        const category = Array.isArray(item.categories)
          ? item.categories[0]
          : item.categories

        return (
          item.title.toLowerCase().includes(lower) ||
          item.notes?.toLowerCase().includes(lower) ||
          category?.name?.toLowerCase().includes(lower)
        )
      })
    }

    if (selectedCategory !== 'all') {
      items = items.filter((item) => item.category_id === selectedCategory)
    }

    if (selectedType !== 'all') {
      items = items.filter((item) => item.type === selectedType)
    }

    items.sort((a, b) => {
      if (sortOrder === 'newest') {
        return (
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime()
        )
      }

      return (
        new Date(a.transaction_date).getTime() -
        new Date(b.transaction_date).getTime()
      )
    })

    return items
  }, [
    safeTransactions,
    searchText,
    selectedCategory,
    selectedType,
    sortOrder,
    dateRange,
  ])

  const totalTransactions = filteredTransactions.length

  const totalIncome = filteredTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const totalExpenses = filteredTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <>
      <AddTransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={safeCategories}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="page-title">All Transactions</h2>
          <p className="mt-2 text-base text-muted">
            View and manage your transaction history
          </p>
        </div>

        <button
          onClick={() => setTransactionModalOpen(true)}
          className="btn-primary"
        >
          + Add Transaction
        </button>
      </div>

      <div className="panel-card mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <h3 className="text-lg font-semibold">Filters & Search</h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
            <input
              className="soft-input pl-10"
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <select
            className="soft-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {safeCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            className="soft-input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="soft-input"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="thisMonth">This Month</option>
            <option value="last10">Last 10 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
          </select>

          <button
            onClick={() =>
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
            }
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Date: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="metric-card metric-balance">
          <p className="metric-label">Total Transactions</p>
          <p className="metric-value">{totalTransactions}</p>
        </div>

        <div className="metric-card metric-income">
          <p className="metric-label">Total Income</p>
          <p className="metric-value">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="metric-card metric-expense">
          <p className="metric-label">Total Expenses</p>
          <p className="metric-value">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="panel-card p-6">
        <h3 className="mb-1 text-2xl font-semibold">Transaction History</h3>
        <p className="mb-5 text-muted">
          Showing {filteredTransactions.length} transaction
          {filteredTransactions.length === 1 ? '' : 's'}
        </p>

        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn) => {
              const category = Array.isArray(txn.categories)
                ? txn.categories[0]
                : txn.categories

              const badgeColor = category?.color || '#94a3b8'

              return (
                <div
                  key={txn.id}
                  className="empty-surface flex items-center justify-between rounded-2xl border px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {(category?.name || txn.title || 'T')[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
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

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`text-3xl font-bold ${
                          txn.type === 'income'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {txn.type === 'income' ? '+' : '-'}$
                        {Number(txn.amount).toFixed(2)}
                      </p>
                    </div>

                    <DeleteTransactionButton transactionId={txn.id} />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="empty-surface rounded-2xl border border-dashed p-8 text-center">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
